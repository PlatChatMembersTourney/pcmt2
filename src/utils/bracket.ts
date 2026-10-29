import type { BracketLayout, BracketSlot, Match } from '../types/types.ts';

// A bracket slot with its teams and result worked out - null for a bye / spacer, like in brackets.json
export type PlayedSlot = {
	slot: NonNullable<BracketSlot>;
	teams: [string | null, string | null]; // top then bottom - null while TBD
	refTexts: [string | null, string | null]; // e.g. "Upper QF #1 Winner" for a "W:Upper QF #1" team, while TBD
	match?: Match; // the slot's match, once it's in the data (it may still be upcoming)
	winner: string | null; // null until the match is completed
	loser: string | null;
} | null;

// "W:<slot id>" or "L:<slot id>"
const REF = /^([WL]):(.+)$/;

// Plays through a brackets.json layout with the stage's matches: resolves each "W:"/"L:" team to that earlier slot's
// winner/loser and finds each slot's match. Used by both the bracket and the placements, so they always agree
export const playBracket = (layout: BracketLayout, matches: Match[]) => {
	// Oldest first, so when two teams meet twice (an upper final and a grand final) the earlier slot gets the earlier match
	const byDate = [...matches].sort((a, b) => a.date.localeCompare(b.date));
	const used = new Set<string>();
	const results = new Map<string, { W: string; L: string }>(); // by slot id

	const resolve = (entry: string | null) => {
		const ref = entry?.match(REF);
		if (!ref) return { abbr: entry, refText: null };
		const [, side, slotId] = ref;
		return {
			abbr: results.get(slotId)?.[side as 'W' | 'L'] ?? null,
			refText: `${slotId} ${side === 'W' ? 'Winner' : 'Loser'}`,
		};
	};

	const findMatch = (slot: NonNullable<BracketSlot>, a: string | null, b: string | null) => {
		if (slot.match) return byDate.find((m) => m.id === slot.match);
		if (!a || !b) return undefined;
		return byDate.find(
			(m) => !used.has(m.id) && ((m.team1 === a && m.team2 === b) || (m.team1 === b && m.team2 === a))
		);
	};

	const play = (slot: BracketSlot): PlayedSlot => {
		if (!slot) return null;
		const [top, bottom] = (slot.teams ?? [null, null]).map(resolve);
		const match = findMatch(slot, top.abbr, bottom.abbr);
		if (match) used.add(match.id);
		// a slot without teams takes them from its match
		const teams: [string | null, string | null] = slot.teams
			? [top.abbr, bottom.abbr]
			: [match?.team1 ?? null, match?.team2 ?? null];
		const played = {
			slot,
			teams,
			refTexts: [top.refText, bottom.refText] as [string | null, string | null],
			match,
		};
		if (!match?.completed) return { ...played, winner: null, loser: null };

		const topWon = match.score1 > match.score2;
		const [winner, loser] = topWon ? [match.team1, match.team2] : [match.team2, match.team1];
		if (slot.id) results.set(slot.id, { W: winner, L: loser });
		return { ...played, winner, loser };
	};

	// In the order the bracket is drawn, so refs always point back to slots already played
	return {
		upper: layout.upper.map((round) => round.map(play)),
		lower: layout.lower?.map((round) => round.map(play)),
		final: (layout.final ?? []).map(play),
	};
};
