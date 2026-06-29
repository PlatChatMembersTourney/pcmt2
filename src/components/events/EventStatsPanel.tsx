import { useState } from 'react'
import type { Event } from '../../types/types.ts'

const EventStatsPanel: React.FC<Event> = (props: Event) => {
	const { name, shortName, season, region, path, status, desc, dates } = props

	return (
		<div className="flex flex-col">
			<div className="h-30 bg-vlr-gray-300 dark:bg-vlr-gray-800 px-6 pt-6 text-black dark:text-vlr-text-white">
				Stats Information
			</div>
		</div>
	)
}

export default EventStatsPanel
