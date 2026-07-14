import { useState } from 'react';
import type { Event } from '../../types/types.ts';

const EventAgentsPanel: React.FC<{ event: Event }> = (props: { event: Event }) => {
	const event = props.event;

	return (
		<div className="flex flex-col">
			<div className="bg-vlr-gray-300 dark:bg-vlr-gray-800 dark:text-vlr-text-white h-30 px-6 pt-6 text-black">
				WIP
			</div>
		</div>
	);
};

export default EventAgentsPanel;
