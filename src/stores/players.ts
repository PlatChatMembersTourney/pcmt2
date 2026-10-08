import type { Event } from '../types/types.ts';
import { events } from './events.ts';
import { matches } from './matches.ts';
import { teams } from './teams.ts';
import { playerSlug } from '../utils/playerSlug.ts';

// Derived from the matches and teams stores (not loaded from a file).
// Used at build time by the player pages and the search index.

export interface PlayerInfo {
	slug: string; // /players/<slug>, and how the same player is matched across events
	name: string; // the spelling used most often
	spellings: string[]; // every spelling of their name in the data
	events: Event[]; // every event they were on a roster or played a match in
	rosterEvents: Event[]; // the events they were on a roster for (not just subbing), without showmatches
}

// Everyone on a roster or in a match's stats, with how often each spelling of their name is used
const found = new Map<string, { events: Event[]; spellings: Map<string, number> }>();
const add = (name: string, event: Event) => {
	const slug = playerSlug(name);
	const player = found.get(slug) ?? { events: [] as Event[], spellings: new Map<string, number>() };
	if (!player.events.includes(event)) player.events.push(event);
	player.spellings.set(name, (player.spellings.get(name) ?? 0) + 1);
	found.set(slug, player);
};
for (const event of events) {
	for (const team of Object.values(teams[event.id])) team.players.forEach((name) => add(name, event));
	for (const match of matches[event.id]) {
		if (!match.completed) continue; // upcoming matches have no stats yet
		for (const team of match.combinedStats) team.players.forEach((player) => add(player.Player, event));
	}
}

export const players: PlayerInfo[] = [...found].map(([slug, { events, spellings }]) => ({
	slug,
	name: [...spellings].sort(([, a], [, b]) => b - a)[0][0],
	spellings: [...spellings.keys()],
	events,
	rosterEvents: events.filter(
		(event) =>
			!event.showmatch &&
			Object.values(teams[event.id]).some((team) => team.players.some((p) => playerSlug(p) === slug))
	),
}));
