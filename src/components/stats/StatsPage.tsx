import { Toggle } from '@base-ui/react/toggle';
import { ToggleGroup } from '@base-ui/react/toggle-group';
import { motion } from 'motion/react';
import { useState } from 'react';
import type { Event, PlayerStats, PlayerStatsWithEventId } from '../../types/types.ts';
import { allPlayerStats } from '../../stores/store.ts';
import { groupByDay } from '../../utils/datetime.ts';

import eventsRaw from '../../data/events.json';
import { fromJson } from '../../utils/json.ts';
import PlayerStatTable from './PlayerStatTable.tsx';
import { cx } from '../../utils/cx.ts';

const events = fromJson<Event[]>(eventsRaw);

const TeamsPage: React.FC = () => {
	const [region, setRegion] = useState(['All']);
	const [season, setSeason] = useState(['All']);

	const [stickyPlayerNames, setStickyPlayerNames] = useState(true);
	const [showShowmatches, setShowShowmatches] = useState(false);

	const [showSubs, setShowSubs] = useState(true);

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
		const event = events.find((e) => e.id === key)!;
		return (
			(showShowmatches || !event.showmatch) &&
			(region[0] === 'All' || event.region === region[0].toLowerCase()) &&
			(season[0] === 'All' || `S${event.season}` === season[0])
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

	// filter out subs if showSubs is false
	// player is a sub if their team is (sub)
	const filteredPlayers = showSubs ? players : players.filter((player) => !player.Team.includes('(sub)'));

	return (
		<div className="bg-shade-300 flex h-full min-h-0 flex-col font-[roboto]">
			<div className="mx-4 mt-4 flex flex-col gap-2 sm:mx-6 sm:mt-6 sm:gap-4 md:flex-row">
				<div className="bg-shade-200 vlr-box-shadow flex h-9 w-full items-stretch sm:h-12">
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
				<div className="bg-shade-200 vlr-box-shadow flex h-9 w-full items-stretch sm:h-12">
					<div className="border-line flex items-center border-r px-5">
						<p className="text-subtle text-[11px] font-bold uppercase">Season</p>
					</div>
					<ToggleGroup
						aria-label="Season Number"
						value={season}
						onValueChange={handleSeasonChange}
						className="text-main relative flex flex-none text-[12px]"
					>
						{['All', 'S1', 'S2', 'S3'].map((item) => (
							<Toggle aria-label={item} value={item} key={item}>
								<div
									className={cx(
										'border-line relative flex h-full cursor-pointer items-center justify-center border-r px-3 transition-colors duration-200',
										season[0] === item && 'bg-vlr-gray-100 dark:bg-vlr-gray-800'
									)}
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
					className={cx(
						'bg-shade-100 text-muted cursor-pointer rounded-sm p-2 text-xs',
						stickyPlayerNames ? 'font-bold' : 'font-normal'
					)}
				>
					Sticky Player Names
				</button>
				<button
					onClick={() => setShowShowmatches(!showShowmatches)}
					className={cx(
						'bg-shade-100 text-muted ml-auto cursor-pointer rounded-sm p-2 text-xs',
						showShowmatches ? 'font-bold' : 'font-normal'
					)}
				>
					Showmatches
				</button>
				<button
					onClick={() => setShowSubs(!showSubs)}
					className={cx(
						'bg-shade-100 text-muted ml-2 cursor-pointer rounded-sm p-2 text-xs',
						showSubs ? 'font-bold' : 'font-normal'
					)}
				>
					Show Subs
				</button>
			</div>

			{players.length > 0 ? (
				<div className="bg-shade-300 min-h-0 flex-1 px-4 pt-2 pb-4 sm:px-6 sm:pt-4 sm:pb-6">
					<PlayerStatTable
						playerStats={filteredPlayers}
						showSeason={true}
						stickyPlayerNames={stickyPlayerNames}
					/>
				</div>
			) : (
				<div className="bg-shade-300 text-main h-full p-4 sm:p-6">
					<div>
						<img src={'/res/revealed_no_one.gif'} />
					</div>
				</div>
			)}
		</div>
	);
};

export default TeamsPage;
