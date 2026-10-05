import type { Event } from '../../types/types.ts';

const EventAgentsPanel: React.FC<{ event: Event }> = (props: { event: Event }) => {
	const event = props.event;

	return (
		<div className="flex flex-col">
			<div className="bg-shade-300 text-main h-30 px-6 pt-6">WIP</div>
		</div>
	);
};

export default EventAgentsPanel;
