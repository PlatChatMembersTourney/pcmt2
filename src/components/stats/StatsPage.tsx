import { useState } from 'react';
import FilterToggle from '../FilterToggle.tsx';
import type { PlayerStats, PlayerStatsWithEventId } from '../../types/types.ts';
import { allPlayerStats } from '../../stores/playerStats.ts';

import { events } from '../../stores/events.ts';
import { teams } from '../../stores/teams.ts';
import { playerSlug } from '../../utils/playerSlug.ts';
import { toxicRating } from '../../utils/rating.ts';
import { useUrlTab } from '../../utils/urlTab.ts';

import PlayerStatTable from './PlayerStatTable.tsx';
import ToggleButton from '../ToggleButton.tsx';

// Combine Seasons: one row per player (matched by playerSlug) across the selected events, best Toxic rating first - totals summed, averages
// weighted by rounds, per-round stats and the Toxic rating recomputed from the totals (the table works out the rest)
const combinePlayers = (rows: PlayerStatsWithEventId[], eventIds: string[]): PlayerStatsWithEventId[] => {
	const groups = new Map<string, PlayerStatsWithEventId[]>();
	for (const row of rows) groups.set(playerSlug(row.Player), [...(groups.get(playerSlug(row.Player)) ?? []), row]);

	return [...groups]
		.map(([slug, group]) => {
			const sum = (key: 'MP' | 'Rounds' | 'K' | 'D' | 'A' | 'FK' | 'FD') => group.reduce((t, r) => t + r[key], 0);
			const Rounds = sum('Rounds');
			const perRound = (key: 'ACS' | 'KAST' | 'ADR' | 'HS%') =>
				group.reduce((t, r) => t + r[key] * r.Rounds, 0) / Rounds;
			const [K, D, A, FK, FD, KAST, ADR] = [
				sum('K'),
				sum('D'),
				sum('A'),
				sum('FK'),
				sum('FD'),
				perRound('KAST'),
				perRound('ADR'),
			];
			// The table skips the 3-maps-or-fewer Angus penalty for showmatch rows - so only if all their games were showmatches
			const regular = group.filter((r) => !events.find((e) => e.id === r.eventId)?.showmatch);
			return {
				Player: [...group].sort((a, b) => b.MP - a.MP)[0].Player, // the spelling they played the most maps under
				eventId: (regular.at(-1) ?? group.at(-1)!).eventId,
				Team: '',
				MP: sum('MP'),
				Rounds,
				K,
				D,
				A,
				FK,
				FD,
				KAST,
				ADR,
				ACS: perRound('ACS'),
				'HS%': perRound('HS%'),
				'R1.0': toxicRating({ K, D, A, KAST, ADR }, Rounds),
				'K/D': K / D,
				PlusMinus: K - D,
				PlusMinus2: FK - FD,
				KPR: K / Rounds,
				DPR: D / Rounds,
				FKPR: FK / Rounds,
				FDPR: FD / Rounds,
				KMAX: Math.max(...group.map((r) => r.KMAX)),
				// every team they were on in the selected events, oldest first
				logos: [
					...new Set(
						eventIds.flatMap((id) =>
							Object.values(teams[id])
								.filter((team) => team.players.some((p) => playerSlug(p) === slug))
								.map((team) => team.logo)
						)
					),
				],
			};
		})
		.sort((a, b) => b['R1.0'] - a['R1.0']); // highest combined Toxic rating first, until a column is sorted
};

const StatsPage: React.FC = () => {
	const [region, setRegion] = useState('All');
	const [season, setSeason] = useState('All');

	const [stickyPlayerNames, setStickyPlayerNames] = useState(true);
	const [showShowmatches, setShowShowmatches] = useState(false);

	const [showSubs, setShowSubs] = useState(true);

	// Combine Seasons, kept in the URL (?view=combined) - the Season filter doesn't apply then
	const views = ['seasons', 'combined'];
	const [viewIdx, setViewIdx] = useUrlTab('view', views);
	const combined = views[viewIdx] === 'combined';

	const filteredKeys = Object.keys(allPlayerStats).filter((key) => {
		const event = events.find((e) => e.id === key)!;
		return (
			(showShowmatches || !event.showmatch) &&
			(region === 'All' || event.region === region.toLowerCase()) &&
			(combined || season === 'All' || `S${event.season}` === season)
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
	const rows = combined ? combinePlayers(filteredPlayers, filteredKeys) : filteredPlayers;

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
					disabled={combined}
				/>
			</div>
			{/* Phones: a 2x2 grid (view options, then what to include) - from sm, a row with the second pair on the right */}
			<div className="mx-4 mt-2 grid grid-cols-2 gap-2 sm:mx-6 sm:mt-4 sm:flex sm:gap-0">
				<ToggleButton on={stickyPlayerNames} onClick={() => setStickyPlayerNames(!stickyPlayerNames)}>
					Sticky Player Names
				</ToggleButton>
				<ToggleButton on={combined} onClick={() => setViewIdx(combined ? 0 : 1)} className="sm:ml-2">
					Combine Seasons
				</ToggleButton>
				<ToggleButton
					on={showShowmatches}
					onClick={() => setShowShowmatches(!showShowmatches)}
					className="sm:ml-auto"
				>
					Showmatches
				</ToggleButton>
				<ToggleButton on={showSubs} onClick={() => setShowSubs(!showSubs)} className="sm:ml-2">
					Show Subs
				</ToggleButton>
			</div>

			{/* Phones: the page scrolls and the table area is 80% of the screen tall (rather than what the filters leave)
			    - from sm, the page fits the screen and the table takes the space that's left */}
			{players.length > 0 ? (
				<div className="bg-shade-300 h-[80dvh] flex-none px-4 pt-2 pb-4 sm:h-auto sm:min-h-0 sm:flex-1 sm:px-6 sm:pt-4 sm:pb-6">
					<PlayerStatTable
						playerStats={rows}
						showSeason={!combined}
						stickyPlayerNames={stickyPlayerNames}
						combined={combined}
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
