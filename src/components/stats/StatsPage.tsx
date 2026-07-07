import { Toggle } from '@base-ui/react/toggle'
import { ToggleGroup } from '@base-ui/react/toggle-group'
import { motion } from 'motion/react'
import { useState } from 'react'
import type { Event, Match, PlayerStats } from '../../types/types.ts'
import { $allPlayerStats, $matches, $playerStats } from '../../stores/store.ts'
import { useStore } from '@nanostores/react'
import { groupByDay } from '../../utils/datetime.ts'

import eventsRaw from '../../data/events.json'
import PlayerStatTable from './PlayerStatTable.tsx'

const events = eventsRaw as Event[]

type PlayerStatsWithEventId = PlayerStats & { eventId: string }

const TeamsPage: React.FC = () => {
	const [region, setRegion] = useState(['All']);
	const [season, setSeason] = useState(['All']);

	const [stickyPlayerNames, setStickyPlayerNames] = useState(false);

	const allPlayerStats = useStore($allPlayerStats);

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

	const filteredKeys = Object.keys(allPlayerStats).filter((key) => {
		return (
			(region[0] === 'All' || key.endsWith(region[0].toLowerCase())) &&
			(season[0] === 'All' || key.startsWith(season[0].toLowerCase()))
		)
	})

	const players: PlayerStatsWithEventId[] = filteredKeys.flatMap((key) =>
		allPlayerStats[key].map((entry: PlayerStats): PlayerStatsWithEventId => {
			return {
				eventId: key,
				...entry,
			}
		})
	)

	return (
		<div className="flex flex-col font-[roboto] dark:bg-vlr-gray-800 bg-vlr-gray-300 h-full min-h-0">
			<div className="mx-4 mt-4 sm:mx-6 sm:mt-6 gap-2 sm:gap-4 flex flex-col md:flex-row">
				<div className="h-9 sm:h-12 flex w-full bg-vlr-gray-200 dark:bg-vlr-gray-700 vlr-box-shadow items-stretch">
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
				<div className="h-9 sm:h-12 flex w-full bg-vlr-gray-200 dark:bg-vlr-gray-700 vlr-box-shadow items-stretch">
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
			<div className="mx-4 sm:mx-6 mt-2 sm:mt-4">
				<button
					onClick={() => setStickyPlayerNames(!stickyPlayerNames)}
					className={`${stickyPlayerNames ? 'font-bold' : 'font-normal'} text-xs rounded-sm bg-vlr-gray-100 dark:bg-vlr-gray-600 p-2 dark:text-vlr-text-white text-vlr-text-dark`}
				>
					Sticky Player Names
				</button>
			</div>

			{players.length > 0 ? (
				<div className="bg-vlr-gray-300 dark:bg-vlr-gray-800 px-4 sm:px-6 pb-4 sm:pb-6 pt-2 sm:pt-4 min-h-0 flex-1">
					<PlayerStatTable
						playerStats={players}
						showSeason={true}
						stickyPlayerNames={stickyPlayerNames}
					/>
				</div>
			) : (
				<div className="bg-vlr-gray-300 dark:bg-vlr-gray-800 p-4 sm:p-6 text-black dark:text-vlr-text-white h-full">
					<div>
						<img src={'/res/revealed_no_one.gif'} />
					</div>
				</div>
			)}
		</div>
	)
}

export default TeamsPage
