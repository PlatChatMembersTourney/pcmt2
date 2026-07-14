import { useState } from 'react';
import type { Event, Match } from '../../types/types.ts';

import EventOverviewPanel from './EventOverviewPanel.tsx';
import EventStatsPanel from './EventStatsPanel.tsx';
import EventMatchesPanel from './EventMatchesPanel.tsx';
import EventAgentsPanel from './EventAgentsPanel.tsx';

import { $matches } from '../../stores/store.ts';
import { useStore } from '@nanostores/react';

const Teams: React.FC<{ event: Event }> = (props: { event: Event }) => {
	const event = props.event;
	const pages = ['Overview', 'Matches', 'Stats', 'Agents'];
	const [active, setActive] = useState<string>('Overview');

	const matches: Match[] = useStore($matches)[event.id];

	return (
		<div className="flex flex-col">
			<div className="bg-vlr-gray-100 dark:bg-vlr-gray-600 vlr-box-shadow vlr-border flex flex-row border-t border-b pl-4 sm:pl-6 dark:border-b-0">
				{pages.map((label) => {
					return (
						<button
							className={
								(active === label ? 'text-black dark:text-white ' : 'text-pb ') +
								'vlr-border border-r px-5 py-5 text-xs font-bold first:border-l ' +
								'dark:hover:bg-vlr-gray-500 hover:bg-vlr-gray-300 relative cursor-pointer'
							}
							onClick={() => setActive(label)}
							key={label}
						>
							{label}
							{label === 'Matches' && (
								<sup className="text-vlr-text-gray font-normal"> ({matches.length})</sup>
							)}
							{active === label && (
								<>
									<svg
										height="8"
										width="16"
										className={
											'absolute -bottom-px left-1/2 -translate-x-1/2 ' +
											(['Overview', 'Matches'].includes(active)
												? 'dark:fill-vlr-gray-700 fill-vlr-gray-200'
												: 'dark:fill-vlr-gray-800 fill-vlr-gray-300')
										}
									>
										<path d="M0 8 L16 8 L8 0 Z" />
									</svg>
									<svg
										height="8"
										width="16"
										className="stroke-vlr-border-light absolute -bottom-px left-1/2 -translate-x-1/2 dark:hidden"
									>
										<path d="M0 8 L8 0 L16 8" fill="none" />
									</svg>
								</>
							)}
						</button>
					);
				})}
			</div>

			{active === 'Overview' && <EventOverviewPanel event={event} />}
			{active === 'Matches' && <EventMatchesPanel event={event} />}
			{active === 'Stats' && <EventStatsPanel event={event} />}
			{active === 'Agents' && <EventAgentsPanel event={event} />}
		</div>
	);
};

export default Teams;
