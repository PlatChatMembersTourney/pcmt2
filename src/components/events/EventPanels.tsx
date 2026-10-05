import { useUrlTab } from '../../utils/urlTab.ts';
import type { Event, Match } from '../../types/types.ts';

import EventOverviewPanel from './EventOverviewPanel.tsx';
import EventStatsPanel from './EventStatsPanel.tsx';
import EventMatchesPanel from './EventMatchesPanel.tsx';
import EventAgentsPanel from './EventAgentsPanel.tsx';

import { matches as allMatches } from '../../stores/store.ts';
import { cx } from '../../utils/cx.ts';

const Teams: React.FC<{ event: Event }> = (props: { event: Event }) => {
	const event = props.event;
	const pages = ['Overview', 'Matches', 'Stats', 'Agents'];
	const [activeIdx, setActive] = useUrlTab('tab', pages);
	const active = pages[activeIdx];

	const matches: Match[] = allMatches[event.id];

	return (
		<div className="flex flex-col">
			<div className="bg-shade-100 vlr-box-shadow border-line flex flex-row border-t border-b pl-4 sm:pl-6 dark:border-b-0">
				{pages.map((label, idx) => {
					return (
						<button
							className={cx(
								'border-line hover:bg-vlr-gray-300 dark:hover:bg-vlr-gray-500 relative cursor-pointer border-r px-5 py-5 text-xs font-bold first:border-l',
								active === label ? 'text-bright' : 'text-pb'
							)}
							onClick={() => setActive(idx)}
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
										className={cx(
											'absolute -bottom-px left-1/2 -translate-x-1/2',
											['Overview', 'Matches'].includes(active)
												? 'fill-shade-200'
												: 'fill-shade-300'
										)}
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
