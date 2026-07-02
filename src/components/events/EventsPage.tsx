import { Toggle } from '@base-ui/react/toggle'
import { ToggleGroup } from '@base-ui/react/toggle-group'
import { motion } from 'motion/react'
import { useState } from 'react'
import type { TeamInfo, Event } from '../../types/types.ts'

import eventsRaw from '../../data/events.json'
import EventCard from './EventCard.tsx'

const events = eventsRaw as Event[]

const TeamsPage: React.FC = () => {
	const [region, setRegion] = useState(['All'])

	const handleRegionChange = (newValue: string[]) => {
		if (newValue.length === 0) {
			// don't change
			return
		}
		setRegion(newValue)
	}

	const filteredEvents = events.filter(
		(event: Event) => {
			return region[0] === 'All' || region[0].toLowerCase() === event.region
		}
	).reverse();

	return (
		<div className="flex flex-col mx-4 mt-4 sm:mx-6 sm:mt-6 font-[roboto] dark:bg-vlr-gray-800 bg-vlr-gray-300">
			<div className="h-12 flex w-full items-center bg-vlr-gray-200 dark:bg-vlr-gray-700 vlr-box-shadow items-stretch">
				<div className="flex items-center px-5 border-r border-vlr-border-light dark:border-vlr-border-gray">
					<p className="uppercase text-[11px] font-bold text-vlr-text-gray dark:text-vlr-text-white">
						Region
					</p>
				</div>
				<ToggleGroup
					aria-label="NA or EMEA"
					value={region}
					onValueChange={handleRegionChange}
					className="flex-none flex relative text-[12px] text-black dark:text-vlr-text-white"
				>
					{['All', 'NA', 'EMEA'].map((item) => (
						<Toggle aria-label={item} value={item} key={item}>
							<div
								className={
									(region[0] === item
										? 'bg-vlr-gray-100 dark:bg-vlr-gray-800 '
										: '') +
									'flex items-center justify-center transition-colors duration-200 relative h-full px-3 cursor-pointer ' +
									'border-r border-vlr-border-light dark:border-vlr-border-gray'
								}
							>
								{region[0] === item && (
									<motion.div
										layoutId="active-pill"
										className="absolute inset-0 border-red-400 border-b-3"
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
			<p className="ml-5 mt-5 mb-4 uppercase text-[11px] font-bold text-black dark:text-red-400 leading-none">
				Events
			</p>
			<div className="w-full flex flex-row gap-4">
				<div className="lg:w-150 lg:flex-none">
					<div className="flex flex-col gap-1">
						{filteredEvents.map((event: Event) => (
							<EventCard
								name={
									'Plat Chat Members Tournament: ' +
									event.name
								}
								id={event.id}
								region={event.region}
								status={event.status}
								prizePool={'a showmatch idk'}
								dates={event.dates}
								logo={
									event.region === 'na'
										? '/icons/NA%20Logo.png'
										: '/icons/EMEA%20Logo.png'
								}
								key={event.id}
							/>
						))}
					</div>
				</div>
				<div className="hidden lg:flex">
					<div>
						<img
							className="dark:hidden aspect-video"
							src="/res/night.gif"
						/>
						<img
							className="hidden dark:block aspect-video"
							src="/res/nightnight.gif"
						/>
					</div>
				</div>
			</div>
		</div>
	)
}

export default TeamsPage
