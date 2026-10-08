import type { Match } from '../types/types.ts';
import { byEvent } from './events.ts';

export const matches: Record<string, Match[]> = {
	...byEvent(
		import.meta.glob<Match[]>('../data/*/*/matches/matches.json', { eager: true, import: 'default' }),
		'matches/matches.json',
		[]
	),
};

// Contingency: a completed match must have its veto, maps and stats. src/data/check.ts can't catch this, since
// imported JSON types only say `completed: boolean` - so the build checks the values instead (not shipped to browsers).
if (import.meta.env.SSR) {
	for (const [eventId, list] of Object.entries(matches)) {
		for (const match of list) {
			const missing = (['veto', 'maps', 'combinedStats', 'mapDetails'] as const).filter((key) => !(key in match));
			if (match.completed && missing.length > 0) {
				throw new Error(`${eventId}: ${match.id} is completed but has no ${missing.join(', ')}`);
			}
		}
	}
}
