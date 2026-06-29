import { useState } from 'react'
import type { Event } from '../../types/types.ts'

const EventMatchesPanel: React.FC<{event: Event}> = (props: {event: Event}) => {
	const event = props.event;

	return (
		<div className="flex flex-col">
			<div className="h-15 flex items-center bg-vlr-gray-200 dark:bg-vlr-gray-700  text-black dark:text-vlr-text-white pl-11 gap-6 vlr-box-shadow">
				Test
			</div>
			<div className="h-30 bg-vlr-gray-300 dark:bg-vlr-gray-800 px-6 pt-6 text-black dark:text-vlr-text-white">
				Matches Information
			</div>
		</div>
	)
}

export default EventMatchesPanel
