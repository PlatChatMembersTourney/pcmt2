import type { BracketLayout } from '../types/types.ts';
import { byEvent } from './events.ts';

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
