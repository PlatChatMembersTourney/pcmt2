import { useState } from 'react';
import FilterToggle from '../FilterToggle.tsx';
import type { Event } from '../../types/types.ts';

import { events } from '../../stores/events.ts';

import EventCard from './EventCard.tsx';

const EventsPage: React.FC = () => {
	const [region, setRegion] = useState('All');

	const filteredEvents = events
		.filter((event: Event) => {
			return region === 'All' || region.toLowerCase() === event.region;
		})
		.reverse();

	return (
		<div className="bg-shade-300 mx-4 mt-4 flex flex-col font-[roboto] sm:mx-6 sm:mt-6">
			<FilterToggle
				label="Region"
				ariaLabel="NA or EMEA"
				options={['All', 'NA', 'EMEA']}
				value={region}
				onChange={setRegion}
			/>
			<p className="mt-5 mb-4 ml-5 text-[11px] leading-none font-bold text-black uppercase dark:text-red-400">
				Events
			</p>
			<div className="flex w-full flex-row gap-4">
				<div className="lg:w-150 lg:flex-none">
					<div className="flex flex-col gap-1">
						{filteredEvents.map((event: Event) => (
							<EventCard event={event} key={event.id} />
						))}
					</div>
				</div>
				<div className="fun:lg:flex hidden">
					<div>
						<img className="aspect-video dark:hidden" src="/res/night.gif" />
						<img className="hidden aspect-video dark:block" src="/res/nightnight.gif" />
					</div>
				</div>
			</div>
		</div>
	);
};

export default EventsPage;
