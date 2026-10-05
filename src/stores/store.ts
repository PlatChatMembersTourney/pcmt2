import type { BracketLayout, Event, Match, PlayerStats, Standing, TeamInfo, TeamMapStats } from '../types/types.ts';
import { fromJson } from '../utils/json.ts';
import eventsRaw from '../data/events.json';

// Each event's files are loaded from src/data/<event.path>/, so adding an event to events.json is enough here.
// Globbed files have no types of their own - add the new event's files to src/data/check.ts so they're type-checked.
// To override an event (e.g. one with a missing file), add its id below the spread in that record.

const events = fromJson<Event[]>(eventsRaw);

// Each event's file from a glob, keyed by event id - `fallback` if the event doesn't have that file
const byEvent = <T>(files: Record<string, T>, file: string, fallback: T): Record<string, T> =>
	Object.fromEntries(events.map((event) => [event.id, files[`../data/${event.path}/${file}`] ?? fallback]));

export const matches: Record<string, Match[]> = {
	...byEvent(
		import.meta.glob<Match[]>('../data/*/*/matches/matches.json', { eager: true, import: 'default' }),
		'matches/matches.json',
		[]
	),
};

export const standings: Record<string, Record<string, Standing[]>> = {
	...byEvent(
		import.meta.glob<Record<string, Standing[]>>('../data/*/*/standings.json', { eager: true, import: 'default' }),
		'standings.json',
		{}
	),
};

// export this so i can load static paths for each team
export const teams: Record<string, Record<string, TeamInfo>> = {
	...byEvent(
		import.meta.glob<Record<string, TeamInfo>>('../data/*/*/teams.json', { eager: true, import: 'default' }),
		'teams.json',
		{}
	),
};

export const playerStats: Record<string, Record<string, PlayerStats[]>> = {
	...byEvent(
		import.meta.glob<Record<string, PlayerStats[]>>('../data/*/*/player-stats.json', {
			eager: true,
			import: 'default',
		}),
		'player-stats.json',
		{}
	),
};

export const teamMapStats: Record<string, Record<string, TeamMapStats>> = {
	...byEvent(
		import.meta.glob<Record<string, TeamMapStats>>('../data/*/*/team-map-stats.json', {
			eager: true,
			import: 'default',
		}),
		'team-map-stats.json',
		{}
	),
};

// one layout per stage name
export const brackets: Record<string, Record<string, BracketLayout>> = {
	...byEvent(
		import.meta.glob<Record<string, BracketLayout>>('../data/*/*/brackets.json', {
			eager: true,
			import: 'default',
		}),
		'brackets.json',
		{}
	),
};

// flatten player stats

export const allPlayerStats: Record<string, PlayerStats[]> = Object.fromEntries(
	Object.entries(playerStats).map(([region, stats]) => {
		return [region, 'Overall' in stats ? stats['Overall'] : []];
	})
);
