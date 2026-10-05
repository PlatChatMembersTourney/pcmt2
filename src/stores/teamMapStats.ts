import type { TeamMapStats } from '../types/types.ts';
import { byEvent } from './events.ts';

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
