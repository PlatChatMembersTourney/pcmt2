import { useState } from 'react'
import type { Event } from '../../types/types.ts';

import EventOverviewPanel from './EventOverviewPanel.tsx'
import EventStatsPanel from './EventStatsPanel.tsx'
import EventMatchesPanel from './EventMatchesPanel.tsx'
import EventAgentsPanel from './EventAgentsPanel.tsx'


const Teams: React.FC<Event> = (props: Event) => {
	const {
		 name, shortName, season, region, path, status, desc, dates
	} = props;

	const pages = [
		'Overview',
		'Matches',
		'Stats',
		'Agents'
	]
	const [active, setActive] = useState<string>('Overview');

	return (
		<div className="flex flex-col">
			<div className="bg-vlr-gray-300 dark:bg-vlr-gray-600 border-t vlr-border pl-6">
				{pages.map((label) => {
					return (
						<button
							className={
								(active === label
									? 'text-black dark:text-white '
									: 'text-pb ') +
								'px-5 py-5 text-xs font-bold first:border-l border-r vlr-border ' +
								'dark:hover:bg-vlr-gray-500 hover:bg-vlr-gray-300 cursor-pointer'
							}
							onClick={() => setActive(label)}
						>
							{label}
							{label === 'Matches' && (
								<sup className="font-normal text-vlr-text-gray">
									{' '}
									(30)
								</sup>
							)}
						</button>
					)
				})}
			</div>

			{active === 'Overview' && (
				<EventOverviewPanel {...props} />
			)}
			{active === 'Matches' && (
				<EventMatchesPanel {...props} />
			)}
			{active === 'Stats' && (
				<EventStatsPanel {...props} />
			)}
			{active === 'Agents' && (
				<EventAgentsPanel {...props} />
			)}
		</div>
	)
}

export default Teams