import type { Match } from '../types/types.ts';
import { byEvent } from './events.ts';

export const matches: Record<string, Match[]> = {
	...byEvent(
		import.meta.glob<Match[]>('../data/*/*/matches/matches.json', { eager: true, import: 'default' }),
		'matches/matches.json',
		[]
	),
};
