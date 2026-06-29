import { useState } from 'react'
import type { Event, Match } from '../../types/types.ts'

import EventOverviewPanel from './EventOverviewPanel.tsx'
import EventStatsPanel from './EventStatsPanel.tsx'
import EventMatchesPanel from './EventMatchesPanel.tsx'
import EventAgentsPanel from './EventAgentsPanel.tsx'

import { $matches } from '../../stores/store.ts'
import { useStore } from '@nanostores/react'

const Teams: React.FC<{ event: Event }> = (props: { event: Event }) => {
	const event = props.event
	const pages = ['Overview', 'Matches', 'Stats', 'Agents']
	const [active, setActive] = useState<string>('Overview')

	const matches: Match[] = useStore($matches)[event.id]

	return (
		<div className="flex flex-col">
			<div className="bg-vlr-gray-100 dark:bg-vlr-gray-600 border-t border-b dark:border-b-0 vlr-box-shadow vlr-border pl-6 flex flex-row">
				{pages.map((label) => {
					return (
						<button
							className={
								(active === label
									? 'text-black dark:text-white '
									: 'text-pb ') +
								'px-5 py-5 text-xs font-bold first:border-l border-r vlr-border ' +
								'dark:hover:bg-vlr-gray-500 hover:bg-vlr-gray-300 cursor-pointer relative'
							}
							onClick={() => setActive(label)}
							key={label}
						>
							{label}
							{label === 'Matches' && (
								<sup className="font-normal text-vlr-text-gray">
									{' '}
									({matches.length})
								</sup>
							)}
							{active === label && (
								<svg
									height="8"
									width="16"
									className={
										'absolute bottom-0 left-1/2 -translate-x-1/2 ' +
										(['Overview', 'Matches'].includes(
											active
										)
											? 'dark:fill-vlr-gray-700 fill-vlr-gray-200'
											: 'dark:fill-vlr-gray-800 fill-vlr-gray-300')
									}
								>
									<path d="M0 8 L16 8 L8 0 Z" />
								</svg>
							)}
						</button>
					)
				})}
			</div>

			{active === 'Overview' && <EventOverviewPanel event={event} />}
			{active === 'Matches' && <EventMatchesPanel event={event} />}
			{active === 'Stats' && <EventStatsPanel event={event} />}
			{active === 'Agents' && <EventAgentsPanel event={event} />}
		</div>
	)
}

export default Teams
