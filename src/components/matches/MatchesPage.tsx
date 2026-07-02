import { Toggle } from '@base-ui/react/toggle'
import { ToggleGroup } from '@base-ui/react/toggle-group'
import { motion } from 'motion/react'
import { useEffect, useState } from 'react'
import type { Event, Match } from '../../types/types.ts'
import { $matches } from '../../stores/store.ts'
import { useStore } from '@nanostores/react'
import { groupByDay } from '../../utils/datetime.ts'
import MatchCard from './MatchCard.tsx'

import eventsRaw from '../../data/events.json'

const events = eventsRaw as Event[]

type MatchWithEventId = Match & { eventId: string }

const TeamsPage: React.FC = () => {
	const [region, setRegion] = useState(['All'])
	const [season, setSeason] = useState(['All'])

	const [timezone, setTimezone] = useState('America/Chicago')

	useEffect(() => {
		// Fetch the IANA timezone string from the browser
		const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone
		setTimezone(userTimezone)
	}, [])

	const allMatches = useStore($matches)

	const handleRegionChange = (newValue: string[]) => {
		if (newValue.length === 0) {
			// don't change
			return
		}
		setRegion(newValue)
	}

	const handleSeasonChange = (newValue: string[]) => {
		if (newValue.length === 0) {
			// don't change
			return
		}
		setSeason(newValue)
	}

	const filteredKeys = Object.keys(allMatches).filter((key) => {
		return (
			(region[0] === 'All' || key.endsWith(region[0].toLowerCase())) &&
			(season[0] === 'All' || key.startsWith(season[0].toLowerCase()))
		)
	})

	const matches: MatchWithEventId[] = filteredKeys.flatMap((key) =>
		allMatches[key].map((entry: Match): MatchWithEventId => {
			return {
				eventId: key,
				...entry,
			}
		})
	)
	const matchesGrouped = groupByDay<MatchWithEventId>(
		matches,
		timezone
	).reverse()

	return (
		<div className="flex flex-col mx-4 mt-4 sm:mx-6 sm:mt-6 font-[roboto] dark:bg-vlr-gray-800 bg-vlr-gray-300">
			<div className="gap-4 flex flex-col md:flex-row">
				<div className="h-12 flex w-full bg-vlr-gray-200 dark:bg-vlr-gray-700 vlr-box-shadow items-stretch">
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
				<div className="h-12 flex w-full bg-vlr-gray-200 dark:bg-vlr-gray-700 vlr-box-shadow items-stretch">
					<div className="flex items-center px-5 border-r border-vlr-border-light dark:border-vlr-border-gray">
						<p className="uppercase text-[11px] font-bold text-vlr-text-gray dark:text-vlr-text-white">
							Season
						</p>
					</div>
					<ToggleGroup
						aria-label="Season Number"
						value={season}
						onValueChange={handleSeasonChange}
						className="flex-none flex relative text-[12px] text-black dark:text-vlr-text-white"
					>
						{['All', 'S1', 'S2', 'S3'].map((item) => (
							<Toggle aria-label={item} value={item} key={item}>
								<div
									className={
										(season[0] === item
											? 'bg-vlr-gray-100 dark:bg-vlr-gray-800 '
											: '') +
										'flex items-center justify-center transition-colors duration-200 relative h-full px-3 cursor-pointer ' +
										'border-r border-vlr-border-light dark:border-vlr-border-gray'
									}
								>
									{season[0] === item && (
										<motion.div
											layoutId="active-pill-2"
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
			</div>

			{matchesGrouped?.length > 0 ? (
				<div
					className="bg-vlr-gray-300 dark:bg-vlr-gray-800 py-6 text-black dark:text-vlr-text-white
			flex flex-col gap-7.5"
				>
					{matchesGrouped.map(({ date, items }) => {
						return (
							<div className="flex flex-col" key={date}>
								<h2 className="text-red-400 uppercase font-bold text-[11px] ml-3 mb-3 leading-none">
									{date}
								</h2>
								<div className="flex flex-col vlr-box-shadow">
									{items.map((match) => {
										const event = events.find((e) => {
											return e.id === match.eventId
										})
										return (
											<MatchCard
												match={match}
												event={event!}
												addlClass="not-first:border-t-1 dark:border-t-vlr-border-gray! border-t-vlr-border-light!"
												key={match.id}
											/>
										)
									})}
								</div>
							</div>
						)
					})}
				</div>
			) : (
				<div
					className="bg-vlr-gray-300 dark:bg-vlr-gray-800 py-6 text-black dark:text-vlr-text-white h-full"
				>
					<div>
						<img src={'/res/exist.png'} />
					</div>
				</div>
			)}
		</div>
	)
}

export default TeamsPage
