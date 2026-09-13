import { useEffect } from 'react';
import slugify from 'slugify';
import type { Match as ViewerMatch, Participant, Stage } from 'brackets-model';
import type { BracketsViewer, RoundNameInfo } from 'brackets-viewer';
import type { BracketLayout, BracketSlot, Event, Match, TeamInfo } from '../../types/types.ts';

interface BracketProps {
	event: Event;
	stage: string;
	layout: BracketLayout;
	matches: Match[];
	teams: Record<string, TeamInfo>;
}

// Values from brackets-model's Status enum
const LOCKED = 0;
const READY = 2;
const COMPLETED = 4;

const EMPTY_TEAM_ICON = '/icons/vlr_team.png'; // Icon for rows without a team
const ROUND_GAP = 24; // Space between rounds in px
const STRAIGHT_DROP = 50; // How much lower a round sits than the round it feeds straight into
const FIRST_MATCH_TOP = 42; // Top of a bracket's first match (label space + match margin)
const DATE_LINE_SPACE = 22; // Space for the date line under a match
const CORNER_RADIUS = 2; // Max radius of a feed line's corners

const SVG_NS = 'http://www.w3.org/2000/svg';

const DATE_LINE_CLASSES =
	"absolute top-[calc(100%+6px)] left-0 pl-2 leading-[15px] whitespace-nowrap before:absolute before:left-0 before:content-['-']";

const bracketClasses = [
	// Palette: light values, then the dark overrides, declared once each
	'[--font-color:#444] [--line-color:#aaa] [--row-border:#ccc] [--hover-color:#666] [--win-background:#cee9d3] [--win-font-color:#444]',
	'dark:[--font-color:#d4d4d4] dark:[--line-color:#acaeaf] dark:[--row-border:#929496] dark:[--hover-color:#85b6e0] dark:[--win-background:#9ec7a6] dark:[--win-font-color:#333]',
	// brackets-viewer's own variables, fed from the palette above
	'[--primary-background:transparent] [--secondary-background:transparent] [--match-background:transparent]',
	'[--connector-color:var(--line-color)] [--border-color:var(--line-color)]',
	'[--border-hover-color:var(--hover-color)] [--border-selected-color:var(--hover-color)]',
	'[--text-size:11px] [--round-margin:24px] [--match-width:144px] [--participant-image-size:20px]',
	'[--match-horizontal-padding:0px] [--match-vertical-padding:0px]',
	'[--connector-border-width:2px] [--match-border-width:2px] [--match-border-radius:3px]',
	// Frame
	'm-0 px-5 pt-[15px] pb-[25px] [font-family:inherit] [&_h1]:hidden [&_.bracket>h2]:hidden',
	// Rounds, with a plain bold label above the first match
	'[&_.round]:relative [&_.round]:pt-[26px] [&_.match]:my-4 [&_.bracket+.bracket]:mt-6',
	'[&_h3]:absolute [&_h3]:top-0 [&_h3]:left-0 [&_h3]:m-0 [&_h3]:p-0 [&_h3]:bg-transparent [&_h3]:text-[11px] [&_h3]:leading-[11px] [&_h3]:font-bold',
	// Team rows: logo + name, then score
	'[&_.opponents:hover]:border-2 [&_.participant]:h-[33px] [&_.participant]:items-center [&_.participant]:p-0',
	'[&_.participant:nth-of-type(1)]:border-b [&_.participant:nth-of-type(1)]:border-[color:var(--row-border)]',
	'[&_.name]:w-auto [&_.name]:min-w-0 [&_.name]:flex-1 [&_.name]:leading-8',
	'[&_.name>img]:inline-block [&_.name>img]:mx-[5px] [&_.name>img]:bottom-0 [&_.name>img]:rounded-none [&_.name>img]:object-contain',
	'[&_.result]:m-0 [&_.result]:h-full [&_.result]:w-8 [&_.result]:flex-none [&_.result]:leading-8 [&_.result]:text-inherit',
	'[&_.result]:border-l [&_.result]:border-[color:var(--row-border)]',
	'[&_.participant.win]:bg-[color:var(--win-background)] [&_.participant.win]:text-[color:var(--win-font-color)] [&_.participant.win]:font-bold',
].join(' ');

const rect = (el: Element) => el.getBoundingClientRect();
const centerY = (el: Element) => rect(el).top + rect(el).height / 2;
const matchesIn = (el: Element) => [...el.querySelectorAll<HTMLElement>('.match')];
const isHidden = (match: HTMLElement) => match.style.visibility === 'hidden';
const svgEl = <K extends keyof SVGElementTagNameMap>(tag: K, className: string) => {
	const el = document.createElementNS(SVG_NS, tag);
	el.setAttribute('class', className);
	return el;
};

// Convert bracket.json to brackets-viewer data
const toViewerData = (stageName: string, layout: BracketLayout, matches: Match[], teams: Record<string, TeamInfo>) => {
	const abbrs = Object.keys(teams);
	const byDate = [...matches].sort((a, b) => a.date.localeCompare(b.date));
	const used = new Set<string>();
	const pcmtMatches = new Map<number, Match>();
	const hiddenIds = new Set<number>();

	// Placeholder texts
	const placeholders: string[] = [];
	const placeholderId = (text: string) => {
		if (!placeholders.includes(text)) placeholders.push(text);
		return abbrs.length + placeholders.indexOf(text);
	};

	// A stage can end without a grand final (an LCQ, where both brackets qualify a team)
	const finalRound = layout.final?.length ? layout.final : null;

	// Single elim final is the last upper round
	const upperRounds = !layout.lower && finalRound ? [...layout.upper, finalRound] : layout.upper;

	// Round 1 same size as round 2
	const straightFirstRound = upperRounds.length > 1 && upperRounds[0].length === upperRounds[1].length;

	// Find a slot's match by its teams
	const findMatch = (slot: NonNullable<BracketSlot>) => {
		if (slot.match) return byDate.find((m) => m.id === slot.match);
		const [a, b] = slot.teams ?? [null, null];
		if (!a || !b) return undefined;
		return byDate.find(
			(m) => !used.has(m.id) && ((m.team1 === a && m.team2 === b) || (m.team1 === b && m.team2 === a))
		);
	};

	const groups = layout.lower ? [upperRounds, layout.lower, ...(finalRound ? [[finalRound]] : [])] : [upperRounds];
	const viewerMatches: ViewerMatch[] = [];
	let roundId = 0;

	groups.forEach((rounds, groupId) => {
		rounds.forEach((slots, roundIdx) => {
			slots.forEach((slot, slotIdx) => {
				const id = viewerMatches.length;
				const base = {
					id,
					stage_id: 0,
					group_id: groupId,
					round_id: roundId + roundIdx,
					number: slotIdx + 1,
					child_count: 0,
				};

				if (!slot) {
					if (!(straightFirstRound && groupId === 0 && roundIdx === 0)) return; // Bye
					// Hidden spacer
					hiddenIds.add(id);
					viewerMatches.push({ ...base, status: LOCKED, opponent1: null, opponent2: null });
					return;
				}

				const match = findMatch(slot);
				if (match) {
					used.add(match.id);
					pcmtMatches.set(id, match);
				}
				const [top, bottom] = slot.teams ?? [match!.team1, match!.team2];

				// Round 2 positions place the byes
				const fromSlot = !straightFirstRound && groupId === 0 && roundIdx === 1;

				const opponent = (abbr: string | null, other: string | null, side: number) => {
					const position = fromSlot ? slotIdx * 2 + side : undefined;
					if (!abbr) {
						const placeholder = slot.placeholders?.[side - 1];
						return { id: placeholder ? placeholderId(placeholder) : null, position };
					}
					if (!match) return { id: abbrs.indexOf(abbr), position };

					const score = match.team1 === abbr ? match.score1 : match.score2;
					const otherScore = match.team1 === other ? match.score1 : match.score2;
					return {
						id: abbrs.indexOf(abbr),
						position,
						score,
						result: match.completed ? (score > otherScore ? 'win' : 'loss') : undefined,
					} as const;
				};

				viewerMatches.push({
					...base,
					status: match?.completed ? COMPLETED : top && bottom ? READY : LOCKED,
					opponent1: opponent(top, bottom, 1),
					opponent2: opponent(bottom, top, 2),
				});
			});
		});
		roundId += rounds.length;
	});

	const stage: Stage = {
		id: 0,
		tournament_id: 0,
		name: stageName,
		type: layout.lower ? 'double_elimination' : 'single_elimination',
		number: 1,
		settings: { grandFinal: finalRound ? 'simple' : 'none' },
	};

	const participants: Participant[] = [...abbrs, ...placeholders].map((name, idx) => ({
		id: idx,
		tournament_id: 0,
		name,
	}));

	return {
		data: { stages: [stage], matches: viewerMatches, matchGames: [], participants },
		pcmtMatches,
		hiddenIds,
		placeholderIds: placeholders.map((_, idx) => abbrs.length + idx),
		// Only set when a grand final round was actually rendered
		finalRoundId: layout.lower && finalRound ? roundId - 1 : null,
		singleFinal: !layout.lower && !!finalRound,
	};
};

type ViewerData = ReturnType<typeof toViewerData>;

// Round names
const roundName =
	({ names, upper, lower, final }: BracketLayout) =>
	(info: RoundNameInfo) => {
		const idx = info.roundNumber - 1;
		const fromEnd = info.roundCount - info.roundNumber;
		const grandFinal = names?.final || 'Grand Final';

		switch (info.groupType) {
			case 'final-group':
				return grandFinal;
			case 'winner-bracket':
				return (
					names?.upper?.[idx] ||
					['Upper Final', 'Upper Semifinals', 'Upper Quarterfinals'][fromEnd] ||
					`Upper Round ${info.roundNumber}`
				);
			case 'loser-bracket':
				return names?.lower?.[idx] || (fromEnd === 0 ? 'Lower Final' : `Lower Round ${info.roundNumber}`);
			default:
				// Single elim final
				if (!lower && final?.length && idx === upper.length) return grandFinal;
				return names?.upper?.[idx] || '';
		}
	};

const timeFormat = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', timeZoneName: 'short' });
const dayFormat = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' });
const matchTime = (date: string) => {
	const d = new Date(date);
	return `${timeFormat.format(d).replace('AM', 'am').replace('PM', 'pm')}, ${dayFormat.format(d)}`;
};

// Grand final in the lower final's column, level with the upper final
const placeGrandFinal = (root: HTMLElement, container: HTMLElement, finalRoundId: number | null) => {
	const [upper, lower] = root.querySelectorAll<HTMLElement>('.bracket');
	const final =
		finalRoundId === null ? null : upper?.querySelector<HTMLElement>(`.round[data-round-id="${finalRoundId}"]`);
	if (!final || !lower) return () => {};

	final.style.position = 'absolute';
	container.append(final);

	const lastBox = (bracket: HTMLElement) =>
		bracket.querySelector('.rounds')!.lastElementChild!.querySelector('.opponents')!;
	const upperFinal = lastBox(upper);
	const finalBox = final.querySelector('.opponents')!;

	return () => {
		const box = rect(container);
		final.style.left = `${rect(upperFinal).right + ROUND_GAP - box.left}px`;
		final.style.top = '0px';
		const boxOffset = centerY(finalBox) - rect(final).top;
		final.style.top = `${centerY(upperFinal) - box.top - boxOffset}px`;
	};
};

// Layout added after the viewer renders
const decorate = (
	root: HTMLElement,
	{ pcmtMatches, hiddenIds, placeholderIds, finalRoundId, singleFinal }: ViewerData
) => {
	// Spacers keep a straight first round aligned, but shouldn't be seen
	for (const id of hiddenIds) {
		const match = root.querySelector<HTMLElement>(`.match[data-match-id="${id}"]`);
		if (match) match.style.visibility = 'hidden';
	}

	// Date lines
	for (const [id, match] of pcmtMatches) {
		const opponents = root.querySelector(`.match[data-match-id="${id}"] .opponents`);
		if (!opponents) continue;
		const date = document.createElement('div');
		date.className = DATE_LINE_CLASSES;
		date.textContent = matchTime(match.date);
		opponents.append(date);
		opponents.classList.add('cursor-pointer');
	}

	// Empty team icon
	for (const row of root.querySelectorAll('.match:not([style*="hidden"]) .participant')) {
		const id = row.getAttribute('data-participant-id');
		if (id !== null && !placeholderIds.includes(Number(id))) continue;
		const icon = document.createElement('img');
		icon.src = EMPTY_TEAM_ICON;
		row.querySelector('.name')!.prepend(icon);
	}

	// Wrapper for the grand final and lines
	const brackets = [...root.querySelectorAll<HTMLElement>('.bracket')];
	const container = document.createElement('div');
	container.className = 'relative flex items-start';
	brackets[0].before(container);
	const columns = document.createElement('div');
	columns.append(...brackets);
	const svg = svgEl('svg', 'pointer-events-none absolute inset-0 size-full overflow-visible');
	const path = svgEl('path', 'fill-none stroke-2 stroke-[color:var(--connector-color)]');
	svg.append(path);
	container.append(columns, svg);

	// Moves the grand final out of the upper bracket, so it draws no feed line
	const placeFinal = placeGrandFinal(root, container, finalRoundId);

	// Shorter bracket moves in so the lower final is under the grand final
	if (finalRoundId !== null && brackets.length > 1) {
		const [upper, lower] = brackets;
		const upperColumns = upper.querySelectorAll('.rounds > .round').length + 1;
		const lowerColumns = lower.querySelectorAll('.rounds > .round').length;
		const columnWidth = rect(upper.querySelector('.round')!).width + ROUND_GAP;
		const shorter = upperColumns < lowerColumns ? upper : lower;
		shorter.style.paddingLeft = `${Math.abs(lowerColumns - upperColumns) * columnWidth}px`;
	}

	// Remove the viewer's lines
	root.querySelectorAll('.connect-next, .connect-previous, .straight').forEach((el) =>
		el.classList.remove('connect-next', 'connect-previous', 'straight')
	);

	// Lines follow the winner into the next match
	const lines: { from: Element; to: Element }[] = [];
	const shifted: { bracket: HTMLElement; matches: { match: HTMLElement; offset: number }[] }[] = [];

	for (const bracket of brackets) {
		const allRounds = [...bracket.querySelectorAll<HTMLElement>('.rounds > .round')];
		// A single elim final is placed like a grand final, so it takes no line either
		const rounds = singleFinal ? allRounds.slice(0, -1) : allRounds;
		const feedsStraight = (idx: number) =>
			!!rounds[idx + 1] && matchesIn(rounds[idx]).length === matchesIn(rounds[idx + 1]).length;

		// Rounds that feed straight across sit lower
		const offsets = [0];
		rounds.forEach((_, idx) => {
			if (idx < rounds.length - 1) offsets.push(offsets[idx] - (feedsStraight(idx) ? STRAIGHT_DROP : 0));
		});
		shifted.push({
			bracket,
			matches: allRounds.flatMap((round, idx) =>
				matchesIn(round).map((match) => ({ match, offset: offsets[Math.min(idx, offsets.length - 1)] }))
			),
		});

		rounds.forEach((round, idx) => {
			const next = rounds[idx + 1];
			if (!next) return;
			const straight = feedsStraight(idx);
			const nextMatches = matchesIn(next);

			matchesIn(round).forEach((match, k) => {
				const target = nextMatches[straight ? k : Math.floor(k / 2)];
				if (!target || isHidden(match)) return;

				const winnerId = match.querySelector('.participant.win')?.getAttribute('data-participant-id');
				const rows = [...target.querySelectorAll('.participant')];
				const to =
					(winnerId && target.querySelector(`.participant[data-participant-id="${winnerId}"]`)) ||
					rows[straight ? 1 : k % 2] ||
					target.querySelector('.opponents')!;

				lines.push({ from: match.querySelector('.opponents')!, to });
			});
		});
	}

	const drawLines = () => {
		const box = rect(container);

		path.setAttribute(
			'd',
			lines
				.map(({ from, to }) => {
					const x1 = rect(from).right - box.left;
					const x2 = rect(to.closest('.opponents') ?? to).left - box.left;
					const y1 = centerY(from) - box.top;
					const y2 = centerY(to) - box.top;
					if (y1 === y2) return `M${x1} ${y1}H${x2}`;

					const midX = (x1 + x2) / 2;
					const dx = Math.sign(x2 - x1) || 1;
					const dy = Math.sign(y2 - y1);
					// Never let the radius exceed half of any segment it touches
					const r = Math.min(CORNER_RADIUS, Math.abs(x2 - x1) / 2, Math.abs(y2 - y1) / 2);

					return (
						`M${x1} ${y1}` +
						`H${midX - r * dx}` +
						`Q${midX} ${y1} ${midX} ${y1 + r * dy}` +
						`V${y2 - r * dy}` +
						`Q${midX} ${y2} ${midX + r * dx} ${y2}` +
						`H${x2}`
					);
				})
				.join('')
		);
	};

	// Shift rounds so the highest match starts at the top, with room below
	const shiftRounds = () => {
		for (const { bracket, matches } of shifted) {
			const move = (extra: number) => {
				for (const { match, offset } of matches) match.style.transform = `translateY(${offset + extra}px)`;
			};
			move(0);
			bracket.style.paddingBottom = '0px';

			const top = rect(bracket).top;
			const boxes = matches
				.filter(({ match }) => !isHidden(match))
				.map(({ match }) => rect(match.querySelector('.opponents')!));
			const extra = FIRST_MATCH_TOP - (Math.min(...boxes.map((b) => b.top)) - top);
			move(extra);

			const bottom = Math.max(...boxes.map((b) => b.bottom)) - top + extra + DATE_LINE_SPACE;
			bracket.style.paddingBottom = `${Math.max(0, bottom - bracket.offsetHeight)}px`;
		}
	};

	// Labels above each round's first match
	const placeLabels = () => {
		for (const round of root.querySelectorAll<HTMLElement>('.round')) {
			const label = round.querySelector('h3');
			const firstMatch = matchesIn(round)
				.find((match) => !isHidden(match))
				?.querySelector('.opponents');
			if (!label || !firstMatch) continue;
			label.style.top = `${rect(firstMatch).top - rect(round).top - label.offsetHeight - 15}px`;
		}
	};

	const layout = () => {
		shiftRounds();
		placeFinal();
		placeLabels();
		drawLines();
	};
	layout();

	const observer = new ResizeObserver(layout);
	observer.observe(root);
	return () => observer.disconnect();
};

const Bracket: React.FC<BracketProps> = ({ event, stage, layout, matches, teams }) => {
	const elementId = `bracket-${event.id}-${slugify(stage, { lower: true })}`;

	useEffect(() => {
		let cancelled = false;
		let cleanup = () => {};

		// Browser only
		import('brackets-viewer/dist/brackets-viewer.min.js').then(async () => {
			if (cancelled) return;
			const viewer = (window as unknown as { bracketsViewer: BracketsViewer }).bracketsViewer;
			const viewerData = toViewerData(stage, layout, matches, teams);

			viewer.setParticipantImages(
				Object.values(teams).map((team, idx) => ({ participantId: idx, imageUrl: encodeURI(team.logo) }))
			);
			await viewer.render(viewerData.data, {
				selector: `#${elementId}`,
				clear: true,
				participantOriginPlacement: 'none',
				showSlotsOrigin: false,
				highlightParticipantOnHover: false,
				customRoundName: roundName(layout),
				onMatchClick: (match) => {
					const pcmtMatch = viewerData.pcmtMatches.get(match.id as number);
					if (pcmtMatch) window.location.href = `/events/${event.id}/${slugify(pcmtMatch.id)}`;
				},
			});

			if (!cancelled) cleanup = decorate(document.getElementById(elementId)!, viewerData);
		});

		return () => {
			cancelled = true;
			cleanup();
		};
	}, [elementId, stage, layout, matches, teams, event.id]);

	return <div id={elementId} className={`brackets-viewer ${bracketClasses}`} />;
};

export default Bracket;
