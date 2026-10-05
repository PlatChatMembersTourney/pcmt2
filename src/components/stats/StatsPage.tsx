import { useState } from 'react';
import FilterToggle from '../FilterToggle.tsx';
import type { PlayerStats, PlayerStatsWithEventId } from '../../types/types.ts';
import { allPlayerStats } from '../../stores/playerStats.ts';

import { events } from '../../stores/events.ts';

import PlayerStatTable from './PlayerStatTable.tsx';
import { cx } from '../../utils/cx.ts';

const StatsPage: React.FC = () => {
	const [region, setRegion] = useState('All');
	const [season, setSeason] = useState('All');

	const [stickyPlayerNames, setStickyPlayerNames] = useState(true);
	const [showShowmatches, setShowShowmatches] = useState(false);

	const [showSubs, setShowSubs] = useState(true);

	const filteredKeys = Object.keys(allPlayerStats).filter((key) => {
		const event = events.find((e) => e.id === key)!;
		return (
			(showShowmatches || !event.showmatch) &&
			(region === 'All' || event.region === region.toLowerCase()) &&
			(season === 'All' || `S${event.season}` === season)
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
				<FilterToggle
					label="Region"
					ariaLabel="NA or EMEA"
					options={['All', 'NA', 'EMEA']}
					value={region}
					onChange={setRegion}
					className="h-9 sm:h-12"
				/>
				<FilterToggle
					label="Season"
					ariaLabel="Season Number"
					options={['All', 'S1', 'S2', 'S3']}
					value={season}
					onChange={setSeason}
					className="h-9 sm:h-12"
				/>
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

export default StatsPage;
