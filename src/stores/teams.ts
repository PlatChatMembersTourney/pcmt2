import type { TeamInfo } from '../types/types.ts';
import { byEvent } from './events.ts';

export const teams: Record<string, Record<string, TeamInfo>> = {
	...byEvent(
		import.meta.glob<Record<string, TeamInfo>>('../data/*/*/teams.json', { eager: true, import: 'default' }),
		'teams.json',
		{}
	),
};
