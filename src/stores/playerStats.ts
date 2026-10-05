import type { PlayerStats } from '../types/types.ts';
import { byEvent } from './events.ts';

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

// each event's "Overall" stats
export const allPlayerStats: Record<string, PlayerStats[]> = Object.fromEntries(
	Object.entries(playerStats).map(([eventId, stats]) => [eventId, stats['Overall'] ?? []])
);
