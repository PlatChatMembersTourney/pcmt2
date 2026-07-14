import { Toggle } from '@base-ui/react/toggle';
import { ToggleGroup } from '@base-ui/react/toggle-group';
import { motion } from 'motion/react';
import { useState } from 'react';
import type { Event, Match, PlayerStats } from '../../types/types.ts';
import { $allPlayerStats, $matches, $playerStats } from '../../stores/store.ts';
import { useStore } from '@nanostores/react';
import { groupByDay } from '../../utils/datetime.ts';

import eventsRaw from '../../data/events.json';
import PlayerStatTable from './PlayerStatTable.tsx';

const events = eventsRaw as Event[];

type PlayerStatsWithEventId = PlayerStats & { eventId: string };

const TeamsPage: React.FC = () => {
	const [region, setRegion] = useState(['All']);
	const [season, setSeason] = useState(['All']);

	const [stickyPlayerNames, setStickyPlayerNames] = useState(true);
	const [showShowmatches, setShowShowmatches] = useState(false);

	const allPlayerStats = useStore($allPlayerStats);

	const handleRegionChange = (newValue: string[]) => {
		if (newValue.length === 0) {
			// don't change
			return;
		}
		setRegion(newValue);
	};

	const handleSeasonChange = (newValue: string[]) => {
		if (newValue.length === 0) {
			// don't change
			return;
		}
		setSeason(newValue);
	};

	const filteredKeys = Object.keys(allPlayerStats).filter((key) => {
		if (key.includes('showmatch')) {
			if (!showShowmatches) {
				return false;
			}
			key = key.replace('showmatch-', '');
		}
		return (
			(region[0] === 'All' || key.endsWith(region[0].toLowerCase())) &&
			(season[0] === 'All' || key.startsWith(season[0].toLowerCase()))
		);
	});

	const players: PlayerStatsWithEventId[] = filteredKeys.flatMap((key) =>
		allPlayerStats[key].map((entry: PlayerStats): PlayerStatsWithEventId => {
			return {
				eventId: key,
				...entry,
			};
		})
	);

	return (
		<div className="dark:bg-vlr-gray-800 bg-vlr-gray-300 flex h-full min-h-0 flex-col font-[roboto]">
			<div className="mx-4 mt-4 flex flex-col gap-2 sm:mx-6 sm:mt-6 sm:gap-4 md:flex-row">
				<div className="bg-vlr-gray-200 dark:bg-vlr-gray-700 vlr-box-shadow flex h-9 w-full items-stretch sm:h-12">
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
				<div className="bg-vlr-gray-200 dark:bg-vlr-gray-700 vlr-box-shadow flex h-9 w-full items-stretch sm:h-12">
					<div className="border-vlr-border-light dark:border-vlr-border-gray flex items-center border-r px-5">
						<p className="text-vlr-text-gray dark:text-vlr-text-white text-[11px] font-bold uppercase">
							Season
						</p>
					</div>
					<ToggleGroup
						aria-label="Season Number"
						value={season}
						onValueChange={handleSeasonChange}
						className="dark:text-vlr-text-white relative flex flex-none text-[12px] text-black"
					>
						{['All', 'S1', 'S2', 'S3'].map((item) => (
							<Toggle aria-label={item} value={item} key={item}>
								<div
									className={
										(season[0] === item ? 'bg-vlr-gray-100 dark:bg-vlr-gray-800 ' : '') +
										'relative flex h-full cursor-pointer items-center justify-center px-3 transition-colors duration-200 ' +
										'border-vlr-border-light dark:border-vlr-border-gray border-r'
									}
								>
									{season[0] === item && (
										<motion.div
											layoutId="active-pill-2"
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
			</div>
			<div className="mx-4 mt-2 flex sm:mx-6 sm:mt-4">
				<button
					onClick={() => setStickyPlayerNames(!stickyPlayerNames)}
					className={`${stickyPlayerNames ? 'font-bold' : 'font-normal'} bg-vlr-gray-100 dark:bg-vlr-gray-600 dark:text-vlr-text-white text-vlr-text-dark cursor-pointer rounded-sm p-2 text-xs`}
				>
					Sticky Player Names
				</button>
				<button
					onClick={() => setShowShowmatches(!showShowmatches)}
					className={`${showShowmatches ? 'font-bold' : 'font-normal'} bg-vlr-gray-100 dark:bg-vlr-gray-600 dark:text-vlr-text-white text-vlr-text-dark ml-auto cursor-pointer rounded-sm p-2 text-xs`}
				>
					Show Showmatches
				</button>
			</div>

			{players.length > 0 ? (
				<div className="bg-vlr-gray-300 dark:bg-vlr-gray-800 min-h-0 flex-1 px-4 pt-2 pb-4 sm:px-6 sm:pt-4 sm:pb-6">
					<PlayerStatTable playerStats={players} showSeason={true} stickyPlayerNames={stickyPlayerNames} />
				</div>
			) : (
				<div className="bg-vlr-gray-300 dark:bg-vlr-gray-800 dark:text-vlr-text-white h-full p-4 text-black sm:p-6">
					<div>
						<img src={'/res/revealed_no_one.gif'} />
					</div>
				</div>
			)}
		</div>
	);
};

export default TeamsPage;
