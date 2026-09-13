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

// Icon for rows without a team
const EMPTY_TEAM_ICON = '/icons/vlr_team.png';

// Space between rounds in px
const ROUND_GAP = 24;

// How much lower a round sits than the round it feeds straight into
const STRAIGHT_DROP = 50;

// Top of a bracket's first match (label space + match margin)
const FIRST_MATCH_TOP = 42;

// Space for the date line under a match
const DATE_LINE_SPACE = 22;

const bracketClasses = [
	'[--primary-background:transparent] [--secondary-background:transparent] [--match-background:transparent]',
	'[--font-color:#444] dark:[--font-color:#d4d4d4]',
	'[--connector-color:#aaa] [--border-color:#aaa] [--border-hover-color:#666] [--border-selected-color:#666]',
	'dark:[--connector-color:#acaeaf] dark:[--border-color:#acaeaf]',
	'dark:[--border-hover-color:#85b6e0] dark:[--border-selected-color:#85b6e0]',
	'[--text-size:11px] [--round-margin:24px] [--match-width:144px] [--participant-image-size:20px]',
	'[--match-horizontal-padding:0px] [--match-vertical-padding:0px]',
	'[--connector-border-width:2px] [--match-border-width:2px] [--match-border-radius:3px]',
	'm-0 px-5 pt-[15px] pb-[25px] [font-family:inherit]',

	'[&_h1]:hidden [&_.bracket>h2]:hidden',
	// Round labels: plain bold text
	'[&_.round]:relative [&_.round]:pt-[26px]',
	'[&_h3]:absolute [&_h3]:top-0 [&_h3]:left-0 [&_h3]:m-0 [&_h3]:p-0 [&_h3]:bg-transparent',
	'[&_h3]:text-[11px] [&_h3]:leading-[11px] [&_h3]:font-bold',
	// Match spacing
	'[&_.match]:my-4 [&_.bracket+.bracket]:mt-6',
	'[&_.opponents:hover]:border-2',
	// Team rows: logo + name, score
	'[&_.participant]:h-[33px] [&_.participant]:items-center [&_.participant]:p-0',
	'[&_.participant:nth-of-type(1)]:border-b [&_.participant:nth-of-type(1)]:border-[#ccc]',
	'dark:[&_.participant:nth-of-type(1)]:border-[#929496]',
	'[&_.name]:w-auto [&_.name]:min-w-0 [&_.name]:flex-1 [&_.name]:leading-8',
	'[&_.name>img]:inline-block [&_.name>img]:mx-[5px] [&_.name>img]:bottom-0',
	'[&_.name>img]:rounded-none [&_.name>img]:object-contain',
	'[&_.result]:m-0 [&_.result]:h-full [&_.result]:w-8 [&_.result]:flex-none [&_.result]:leading-8',
	'[&_.result]:border-l [&_.result]:border-[#ccc] dark:[&_.result]:border-[#929496] [&_.result]:text-inherit',
	'[&_.participant.win]:bg-[#cee9d3] [&_.participant.win]:font-bold [&_.participant.win]:text-[#444]',
	'dark:[&_.participant.win]:bg-[#9ec7a6] dark:[&_.participant.win]:text-[#333]',
].join(' ');

// Convert bracket.json to brackets-viewer data
const toViewerData = (
	stageName: string,
	layout: BracketLayout,
	matches: Match[],
	teams: Record<string, TeamInfo>
) => {
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

	// Single elim final is the last upper round
	const upperRounds = !layout.lower && layout.final ? [...layout.upper, layout.final] : layout.upper;

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

	const groups = layout.lower ? [upperRounds, layout.lower, [layout.final ?? []]] : [upperRounds];
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
				if (match) used.add(match.id);
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

				if (match) pcmtMatches.set(id, match);

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
		settings: { grandFinal: 'simple' },
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
		finalRoundId: layout.lower ? roundId - 1 : null,
		singleFinal: !layout.lower && !!layout.final,
	};
};

type ViewerData = ReturnType<typeof toViewerData>;
// Round names
const roundName = ({ names, upper, lower, final }: BracketLayout) => (info: RoundNameInfo) => {
	if (info.groupType === 'final-group') return names?.final || 'Grand Final';
	const idx = info.roundNumber - 1;
	const fromEnd = info.roundCount - info.roundNumber;
	if (info.groupType === 'winner-bracket') {
		return (
			names?.upper?.[idx] ||
			(['Upper Final', 'Upper Semifinals', 'Upper Quarterfinals'][fromEnd] ?? `Upper Round ${info.roundNumber}`)
		);
	}
	if (info.groupType === 'loser-bracket') {
		return names?.lower?.[idx] || (fromEnd === 0 ? 'Lower Final' : `Lower Round ${info.roundNumber}`);
	}
	// Single elim final
	if (!lower && final && idx === upper.length) return names?.final || 'Grand Final';
	return names?.upper?.[idx] || '';
};

const timeFormat = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', timeZoneName: 'short' });
const dayFormat = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' });
const matchTime = (date: string) => {
	const d = new Date(date);
	return `${timeFormat.format(d).replace('AM', 'am').replace('PM', 'pm')}, ${dayFormat.format(d)}`;
};

// Grand final in the lower final's column, level with the upper final
const placeGrandFinal = (root: HTMLElement, container: HTMLElement, finalRoundId: number) => {
	const [upper] = root.querySelectorAll<HTMLElement>('.bracket');
	const final = upper.querySelector<HTMLElement>(`.round[data-round-id="${finalRoundId}"]`)!;
	final.style.position = 'absolute';
	container.append(final);

	const upperFinal = upper.querySelector('.rounds')!.lastElementChild!.querySelector('.opponents')!;
	const finalBox = final.querySelector('.opponents')!;

	return () => {
		const box = container.getBoundingClientRect();
		const rect = (el: Element) => el.getBoundingClientRect();
		const centerY = (el: Element) => rect(el).top + rect(el).height / 2;

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
	// Date lines
	for (const [id, match] of pcmtMatches) {
		const opponents = root.querySelector<HTMLElement>(`.match[data-match-id="${id}"] .opponents`);
		if (!opponents) continue;
		const status = document.createElement('div');
		status.className =
			"absolute top-[calc(100%+5px)] left-0 pl-2 leading-[15px] whitespace-nowrap before:absolute before:left-0 before:content-['-']";
		status.textContent = matchTime(match.date);
		opponents.append(status);
		opponents.classList.add('cursor-pointer');
	}

	for (const id of hiddenIds) {
		const match = root.querySelector<HTMLElement>(`.match[data-match-id="${id}"]`);
		if (match) match.style.visibility = 'hidden';
	}

	// Empty team icon
	root.querySelectorAll('.match:not([style*="hidden"]) .participant').forEach((row) => {
		const id = row.getAttribute('data-participant-id');
		if (id !== null && !placeholderIds.includes(Number(id))) return;
		const icon = document.createElement('img');
		icon.src = EMPTY_TEAM_ICON;
		row.querySelector('.name')!.prepend(icon);
	});

	// Wrapper for the grand final and lines
	const brackets = [...root.querySelectorAll<HTMLElement>('.bracket')];
	const container = document.createElement('div');
	container.className = 'relative flex items-start';
	brackets[0].before(container);
	const columns = document.createElement('div');
	columns.append(...brackets);
	const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
	svg.setAttribute('class', 'pointer-events-none absolute inset-0 size-full overflow-visible');
	const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
	path.setAttribute('class', 'fill-none stroke-[#aaa] stroke-2 dark:stroke-[#acaeaf]');
	svg.append(path);
	container.append(columns, svg);

	const placeFinal = finalRoundId !== null ? placeGrandFinal(root, container, finalRoundId) : () => {};

	// Shorter bracket moves in so the lower final is under the grand final
	if (finalRoundId !== null) {
		const [upper, lower] = brackets;
		const upperColumns = upper.querySelectorAll('.rounds > .round').length + 1;
		const lowerColumns = lower.querySelectorAll('.rounds > .round').length;
		const columnWidth = upper.querySelector('.round')!.getBoundingClientRect().width + ROUND_GAP;
		const shorter = upperColumns < lowerColumns ? upper : lower;
		shorter.style.paddingLeft = `${Math.abs(lowerColumns - upperColumns) * columnWidth}px`;
	}

	// Remove the viewer's lines
	root.querySelectorAll('.connect-next, .connect-previous, .straight').forEach((el) => {
		el.classList.remove('connect-next', 'connect-previous', 'straight');
	});

	// Lines follow the winner into the next match
	const lines: { from: Element; toRow: Element }[] = [];
	const roundOffsets: { bracket: HTMLElement; rounds: { round: HTMLElement; offset: number }[] }[] = [];
	for (const bracket of brackets) {
		const allRounds = [...bracket.querySelectorAll<HTMLElement>('.rounds > .round')];
		const rounds = singleFinal ? allRounds.slice(0, -1) : allRounds;

		// Rounds that feed straight across sit lower
		const offsets = [0];
		rounds.forEach((round, idx) => {
			const next = rounds[idx + 1];
			if (!next) return;
			const straight = round.querySelectorAll('.match').length === next.querySelectorAll('.match').length;
			offsets.push(offsets[idx] - (straight ? STRAIGHT_DROP : 0));
		});
		roundOffsets.push({
			bracket,
			rounds: allRounds.map((round, idx) => ({ round, offset: offsets[Math.min(idx, offsets.length - 1)] })),
		});

		rounds.forEach((round, idx) => {
			const next = rounds[idx + 1];
			if (!next) return;
			const matches = [...round.querySelectorAll<HTMLElement>('.match')];
			const nextMatches = [...next.querySelectorAll<HTMLElement>('.match')];
			const straight = matches.length === nextMatches.length;

			matches.forEach((match, k) => {
				const target = nextMatches[straight ? k : Math.floor(k / 2)];
				if (match.style.visibility === 'hidden' || !target) return;

				const winner = match.querySelector('.participant.win');
				const winnerId = winner?.getAttribute('data-participant-id');
				const targetRows = [...target.querySelectorAll('.participant')];
				const toRow =
					(winnerId && target.querySelector(`.participant[data-participant-id="${winnerId}"]`)) ||
					targetRows[straight ? 1 : k % 2];

				lines.push({
					from: match.querySelector('.opponents')!,
					toRow: toRow ?? target.querySelector('.opponents')!,
				});
			});
		});
	}

	const drawLines = () => {
		const box = container.getBoundingClientRect();
		const rect = (el: Element) => el.getBoundingClientRect();
		path.setAttribute(
			'd',
			lines
				.map(({ from, toRow }) => {
					const x1 = rect(from).right - box.left;
					const x2 = rect(toRow.closest('.opponents')!).left - box.left;
					const y1 = rect(from).top + rect(from).height / 2 - box.top;
					const y2 = rect(toRow).top + rect(toRow).height / 2 - box.top;
					const midX = (x1 + x2) / 2;
					return `M${x1} ${y1}H${midX}V${y2}H${x2}`;
				})
				.join('')
		);
	};

	// Shift rounds so the highest match starts at the top, with room below
	const shiftRounds = () => {
		for (const { bracket, rounds } of roundOffsets) {
			const move = (extra: number) => {
				for (const { round, offset } of rounds) {
					round.querySelectorAll<HTMLElement>('.match').forEach((match) => {
						match.style.transform = `translateY(${offset + extra}px)`;
					});
				}
			};
			move(0);
			bracket.style.paddingBottom = '0px';

			const top = bracket.getBoundingClientRect().top;
			const boxes = [...bracket.querySelectorAll('.opponents')]
				.filter((el) => el.closest<HTMLElement>('.match')!.style.visibility !== 'hidden')
				.map((el) => el.getBoundingClientRect());
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
			const firstMatch = [...round.querySelectorAll<HTMLElement>('.match')]
				.find((match) => match.style.visibility !== 'hidden')
				?.querySelector('.opponents');
			if (!label || !firstMatch) continue;
			const gap = firstMatch.getBoundingClientRect().top - round.getBoundingClientRect().top;
			label.style.top = `${gap - label.offsetHeight - 15}px`;
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
