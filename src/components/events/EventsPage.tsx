import { Toggle } from '@base-ui/react/toggle';
import { ToggleGroup } from '@base-ui/react/toggle-group';
import { motion } from 'motion/react';
import { useState } from 'react';
import type { TeamInfo, Event } from '../../types/types.ts';

import eventsRaw from '../../data/events.json';
import EventCard from './EventCard.tsx';

const events = eventsRaw as Event[];

const TeamsPage: React.FC = () => {
	const [region, setRegion] = useState(['All']);

	const handleRegionChange = (newValue: string[]) => {
		if (newValue.length === 0) {
			// don't change
			return;
		}
		setRegion(newValue);
	};

	const filteredEvents = events
		.filter((event: Event) => {
			return region[0] === 'All' || region[0].toLowerCase() === event.region;
		})
		.reverse();

	return (
		<div className="dark:bg-vlr-gray-800 bg-vlr-gray-300 mx-4 mt-4 flex flex-col font-[roboto] sm:mx-6 sm:mt-6">
			<div className="bg-vlr-gray-200 dark:bg-vlr-gray-700 vlr-box-shadow flex h-12 w-full items-center items-stretch">
				<div className="border-vlr-border-light dark:border-vlr-border-gray flex items-center border-r px-5">
					<p className="text-vlr-text-gray dark:text-vlr-text-white text-[11px] font-bold uppercase">
						Region
					</p>
				</div>
				<ToggleGroup
					aria-label="NA or EMEA"
					value={region}
					onValueChange={handleRegionChange}
					className="dark:text-vlr-text-white relative flex flex-none text-[12px] text-black"
				>
					{['All', 'NA', 'EMEA'].map((item) => (
						<Toggle aria-label={item} value={item} key={item}>
							<div
								className={
									(region[0] === item ? 'bg-vlr-gray-100 dark:bg-vlr-gray-800 ' : '') +
									'relative flex h-full cursor-pointer items-center justify-center px-3 transition-colors duration-200 ' +
									'border-vlr-border-light dark:border-vlr-border-gray border-r'
								}
							>
								{region[0] === item && (
									<motion.div
										layoutId="active-pill"
										className="absolute inset-0 border-b-3 border-red-400"
										transition={{
											type: 'spring',
											stiffness: 300,
											damping: 30,
										}}
									/>
								)}
								<span>{item}</span>
							</div>
						</Toggle>
					))}
				</ToggleGroup>
			</div>
			<p className="mt-5 mb-4 ml-5 text-[11px] leading-none font-bold text-black uppercase dark:text-red-400">
				Events
			</p>
			<div className="flex w-full flex-row gap-4">
				<div className="lg:w-150 lg:flex-none">
					<div className="flex flex-col gap-1">
						{filteredEvents.map((event: Event) => (
							<EventCard
								name={'Plat Chat Members Tournament: ' + event.name}
								id={event.id}
								region={event.region}
								status={event.status}
								prizePool={event.id.includes('showmatch') ? "wyatt's weekly award" : 'a showmatch idk'}
								dates={event.dates}
								logo={
									event.id.includes('showmatch')
										? '/icons/PC%20Logo%20Box.png'
										: event.region === 'na'
											? '/icons/NA%20Logo.png'
											: '/icons/EMEA%20Logo.png'
								}
								key={event.id}
							/>
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

export default TeamsPage;
