import { useState } from 'react'
import type { Event } from '../../types/types.ts'

const EventAgentsPanel: React.FC<{ event: Event }> = (props: {
	event: Event
}) => {
	const event = props.event;

	return (
		<div className="flex flex-col">
			<div className="h-30 bg-vlr-gray-300 dark:bg-vlr-gray-800 px-6 pt-6 text-black dark:text-vlr-text-white">
				Agents Information
			</div>
		</div>
	)
}

export default EventAgentsPanel
