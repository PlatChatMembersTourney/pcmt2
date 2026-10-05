import type { Standing } from '../types/types.ts';
import { byEvent } from './events.ts';

export const standings: Record<string, Record<string, Standing[]>> = {
	...byEvent(
		import.meta.glob<Record<string, Standing[]>>('../data/*/*/standings.json', { eager: true, import: 'default' }),
		'standings.json',
		{}
	),
};
