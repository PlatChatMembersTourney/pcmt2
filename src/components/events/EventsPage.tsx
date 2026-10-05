import { Toggle } from '@base-ui/react/toggle';
import { ToggleGroup } from '@base-ui/react/toggle-group';
import { motion } from 'motion/react';
import { useState } from 'react';
import type { TeamInfo, Event } from '../../types/types.ts';

import eventsRaw from '../../data/events.json';
import { fromJson } from '../../utils/json.ts';
import EventCard from './EventCard.tsx';
import { cx } from '../../utils/cx.ts';

const events = fromJson<Event[]>(eventsRaw);

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
		<div className="bg-shade-300 mx-4 mt-4 flex flex-col font-[roboto] sm:mx-6 sm:mt-6">
			<div className="bg-shade-200 vlr-box-shadow flex h-12 w-full items-center items-stretch">
				<div className="border-line flex items-center border-r px-5">
					<p className="text-subtle text-[11px] font-bold uppercase">Region</p>
				</div>
				<ToggleGroup
					aria-label="NA or EMEA"
					value={region}
					onValueChange={handleRegionChange}
					className="text-main relative flex flex-none text-[12px]"
				>
					{['All', 'NA', 'EMEA'].map((item) => (
						<Toggle aria-label={item} value={item} key={item}>
							<div
								className={cx(
									'border-line relative flex h-full cursor-pointer items-center justify-center border-r px-3 transition-colors duration-200',
									region[0] === item && 'bg-vlr-gray-100 dark:bg-vlr-gray-800'
								)}
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

export default TeamsPage;
