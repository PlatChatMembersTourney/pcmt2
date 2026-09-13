import { useEffect } from 'react';
import slugify from 'slugify';
import type { Match as ViewerMatch, Participant, Stage } from 'brackets-model';
import type { BracketsViewer, RoundNameInfo } from 'brackets-viewer';
import 'brackets-viewer/dist/brackets-viewer.min.css';
import type { BracketLayout, BracketSlot, Event, Match, TeamInfo } from '../../types/types.ts';

interface BracketProps {
	event: Event;
	stage: string; // stage name, e.g. "Playoffs"
	layout: BracketLayout;
	matches: Match[]; // matches from this stage only
	teams: Record<string, TeamInfo>;
}

// values from brackets-model's Status enum (the package only ships a CJS build, so no runtime import)
const LOCKED = 0;
const READY = 2;
const COMPLETED = 4;

// shown in the logo spot of any row without a team yet (public/icons/vlr_team.png)
const EMPTY_TEAM_ICON = '/icons/vlr_team.png';

// converts our bracket.json layout + played matches into the format brackets-viewer renders
const toViewerData = (
	stageName: string,
	layout: BracketLayout,
	matches: Match[],
	teams: Record<string, TeamInfo>
) => {
	const abbrs = Object.keys(teams);
	const byDate = [...matches].sort((a, b) => a.date.localeCompare(b.date));
	const used = new Set<string>();
	const pcmtMatches = new Map<number, Match>(); // viewer match id -> our match
	const hiddenIds = new Set<number>(); // invisible matches for empty slots

	// placeholder texts
	const placeholders: string[] = [];
	const placeholderId = (text: string) => {
		if (!placeholders.includes(text)) placeholders.push(text);
		return abbrs.length + placeholders.indexOf(text);
	};

	// upper round 1 lines up 1:1 with round 2 (straight lines) instead of feeding it in pairs
	const straightFirstRound = layout.upper.length > 1 && layout.upper[0].length === layout.upper[1].length;

	// a slot's match is found by its two teams (earliest unused one, so rematches line up in order)
	const findMatch = (slot: NonNullable<BracketSlot>) => {
		if (slot.match) return byDate.find((m) => m.id === slot.match);
		const [a, b] = slot.teams ?? [null, null];
		if (!a || !b) return undefined;
		return byDate.find(
			(m) => !used.has(m.id) && ((m.team1 === a && m.team2 === b) || (m.team1 === b && m.team2 === a))
		);
	};

	const groups = layout.lower ? [layout.upper, layout.lower, [layout.final ?? []]] : [layout.upper];
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
					if (!(straightFirstRound && groupId === 0 && roundIdx === 0)) return; // bye, the viewer hides it
					// keeps the other round 1 matches level with their round 2 match
					hiddenIds.add(id);
					viewerMatches.push({ ...base, status: LOCKED, opponent1: null, opponent2: null });
					return;
				}

				const match = findMatch(slot);
				if (match) used.add(match.id);
				const [top, bottom] = slot.teams ?? [match!.team1, match!.team2];

				// upper round 2 says which round 1 slot each team came from, so the viewer can place byes
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
		straightFirstRound,
		finalRoundId: layout.lower ? roundId - 1 : null,
	};
};

type ViewerData = ReturnType<typeof toViewerData>;
// Round names
const roundName = (names: BracketLayout['names']) => (info: RoundNameInfo) => {
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
	return names?.upper?.[idx] || ''; // single elimination - '' falls back to the viewer's own name
};

// "6:00 pm EDT, Aug 26" like vlr's line under each match
const timeFormat = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', timeZoneName: 'short' });
const dayFormat = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' });
const matchTime = (date: string) => {
	const d = new Date(date);
	return `${timeFormat.format(d).replace('AM', 'am').replace('PM', 'pm')}, ${dayFormat.format(d)}`;
};

// the viewer puts the grand final at the end of the upper bracket row - move it into its own column
// after both brackets, level between the two finals. returns a function that draws its lines
const placeGrandFinal = (root: HTMLElement, finalRoundId: number) => {
	const [upper, lower] = root.querySelectorAll<HTMLElement>('.bracket');
	const final = upper.querySelector<HTMLElement>(`.round[data-round-id="${finalRoundId}"]`)!;
	final.classList.add('pcmt-bracket-final');

	const container = document.createElement('div');
	container.className = 'pcmt-bracket-layout';
	upper.before(container);
	const columns = document.createElement('div');
	columns.append(upper, lower);
	const lines = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
	lines.classList.add('pcmt-bracket-lines');
	const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
	lines.append(path);
	container.append(columns, final, lines);

	const upperFinal = upper.querySelector('.rounds')!.lastElementChild!.querySelector<HTMLElement>('.match')!;
	const lowerFinal = lower.querySelector('.rounds')!.lastElementChild!.querySelector<HTMLElement>('.match')!;
	const finalMatch = final.querySelector<HTMLElement>('.match')!;

	// the viewer's own stub lines, replaced by the ones drawn below
	upperFinal.classList.remove('connect-next', 'straight');
	finalMatch.querySelector('.opponents')!.classList.remove('connect-previous', 'straight');

	return () => {
		const box = container.getBoundingClientRect();
		const rectOf = (match: HTMLElement) => match.querySelector('.opponents')!.getBoundingClientRect();
		const centerY = (rect: DOMRect) => rect.top + rect.height / 2 - box.top;

		finalMatch.style.marginTop = '0px';
		const up = rectOf(upperFinal);
		const low = rectOf(lowerFinal);
		const midY = (centerY(up) + centerY(low)) / 2;
		finalMatch.style.marginTop = `${midY - centerY(rectOf(finalMatch))}px`;

		const finalX = rectOf(finalMatch).left - box.left;
		const lowX = low.right - box.left;
		const joinX = (lowX + finalX) / 2;
		path.setAttribute(
			'd',
			`M${up.right - box.left} ${centerY(up)}H${joinX}V${centerY(low)}` +
				`M${lowX} ${centerY(low)}H${joinX}M${joinX} ${midY}H${finalX}`
		);
	};
};

// bits of vlr's layout the viewer has no option for, added once it has rendered. returns a cleanup function
const decorate = (root: HTMLElement, { pcmtMatches, hiddenIds, placeholderIds, finalRoundId }: ViewerData) => {
	// date line under each match that has one
	for (const [id, match] of pcmtMatches) {
		const container = root.querySelector<HTMLElement>(`.match[data-match-id="${id}"]`);
		if (!container) continue;
		const status = document.createElement('div');
		status.className = 'pcmt-bracket-status';
		status.textContent = matchTime(match.date);
		container.querySelector('.opponents')!.append(status);
		container.classList.add('pcmt-bracket-link');
	}

	for (const id of hiddenIds) {
		const match = root.querySelector<HTMLElement>(`.match[data-match-id="${id}"]`);
		if (match) match.style.visibility = 'hidden';
	}

	// placeholder rows get vlr's italic placeholder style
	for (const id of placeholderIds) {
		root.querySelectorAll(`.participant[data-participant-id="${id}"]`).forEach((row) => {
			row.classList.add('pcmt-bracket-placeholder');
		});
	}

	// rows with no team yet (blank or placeholder text) get the generic team icon
	root.querySelectorAll('.match:not([style*="hidden"]) .participant').forEach((row) => {
		const id = row.getAttribute('data-participant-id');
		if (id !== null && !placeholderIds.includes(Number(id))) return;
		const icon = document.createElement('img');
		icon.src = EMPTY_TEAM_ICON;
		row.querySelector('.name')!.prepend(icon);
	});

	const drawFinal = finalRoundId !== null ? placeGrandFinal(root, finalRoundId) : () => {};

	// lines between rounds, from how many matches each round actually has: straight into a round with the
	// same count, joined in pairs into a round with fewer
	for (const bracket of root.querySelectorAll('.bracket')) {
		const rounds = [...bracket.querySelectorAll('.rounds > .round')]; // grand final already moved out
		rounds.forEach((round, idx) => {
			const next = rounds[idx + 1];
			const matches = round.querySelectorAll<HTMLElement>('.match');
			const straight = !!next && next.querySelectorAll('.match').length === matches.length;

			matches.forEach((match) => {
				match.classList.toggle('connect-next', !!next && match.style.visibility !== 'hidden');
				match.classList.toggle('straight', straight);
			});
			next?.querySelectorAll('.opponents').forEach((opponents) => {
				opponents.classList.toggle('connect-previous', !straight); // straight lines reach on their own
				opponents.classList.remove('straight');
			});
		});
	}

	// each round's label sits just above its first match, instead of in a row across the top
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
		drawFinal();
		placeLabels();
	};
	layout();
	const observer = new ResizeObserver(layout); // e.g. the site font loading in after the first layout
	observer.observe(root);
	return () => observer.disconnect();
};

const Bracket: React.FC<BracketProps> = ({ event, stage, layout, matches, teams }) => {
	const elementId = `bracket-${event.id}-${slugify(stage, { lower: true })}`;

	useEffect(() => {
		let cancelled = false;
		let cleanup = () => {};

		// the viewer touches `window` as soon as it loads, so it can only be imported in the browser
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
				customRoundName: roundName(layout.names),
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

	return <div id={elementId} className="brackets-viewer pcmt-bracket" />;
};

export default Bracket;
