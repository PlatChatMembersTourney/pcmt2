import type { MapAgentStats } from '../types/types.ts';
import { byEvent } from './events.ts';

export const agentStats: Record<string, Record<string, MapAgentStats>> = {
	...byEvent(
		import.meta.glob<Record<string, MapAgentStats>>('../data/*/*/agent-stats.json', {
			eager: true,
			import: 'default',
		}),
		'agent-stats.json',
		{}
	),
};
