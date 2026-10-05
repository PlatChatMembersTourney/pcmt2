import { useState } from 'react';
import type { Event } from '../../types/types.ts';

const EventAgentsPanel: React.FC<{ event: Event }> = (props: { event: Event }) => {
	const event = props.event;

	return (
		<div className="flex flex-col">
			<div className="bg-shade-300 h-30 px-6 pt-6 text-main">
				WIP
			</div>
		</div>
	);
};

export default EventAgentsPanel;
