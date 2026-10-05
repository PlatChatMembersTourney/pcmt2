import { useState } from 'react';
import type { Event, Match, TeamInfo } from '../../types/types.ts';

import { matches as allMatches } from '../../stores/matches.ts';
import { teamMapStats as allTeamMapStats } from '../../stores/teamMapStats.ts';
import { teams as allTeams } from '../../stores/teams.ts';
import { groupByDay } from '../../utils/datetime.ts';
import MatchCard from '../matches/MatchCard.tsx';
import TeamMapStatsTable from './TeamMapStatsTable.tsx';
import TabBar from './TabBar.tsx';
import { playerFlag } from '../../utils/images.ts';
import { events as allEvents } from '../../stores/events.ts';

import { cx } from '../../utils/cx.ts';
import { useTimezone } from '../../utils/useTimezone.ts';
import { randomItem, useRandom } from '../../utils/useRandom.ts';

interface TeamPanelsProps {
	event: Event;
	team: TeamInfo;
	fun?: boolean;
}

// Showmatch teams with the same abbr are one team across all showmatches
export const teamEvents = (event: Event, team: TeamInfo, teams: Record<string, Record<string, TeamInfo>>) =>
	event.showmatch ? allEvents.filter((e) => e.showmatch && team.abbr in (teams[e.id] ?? {})) : [event];

const pctFormatter = new Intl.NumberFormat('en-US', {
	style: 'percent',
	maximumFractionDigits: 1,
});

const exclamations = [' :O', ' :D', '!!', ' >:)', ' x_x', ' :3', ' (╯°□°)╯︵ ┻━┻', ' (:', ' ;]', ' (¬‿¬)'];

const TeamPanels: React.FC<TeamPanelsProps> = (props: TeamPanelsProps) => {
	const { event, team, fun } = props;
	const pages = ['Overview', 'Matches', 'Stats'];
	const [active, setActive] = useState<string>('Overview');
	const [reverse, setReverse] = useState(false);

	const timezone = useTimezone();

	const events = teamEvents(event, team, allTeams);

	const matches = events.flatMap((e) =>
		allMatches[e.id]
			.filter((match: Match) => match.team1Name === team.name || match.team2Name === team.name)
			.map((match) => ({ date: match.date, match, event: e }))
	);

	let matchesGrouped = groupByDay(matches, timezone);
	if (!reverse) {
		// change default to reversed
		matchesGrouped = matchesGrouped.reverse();
	}

	// Everyone who played, with the events they played in
	const roster = new Map<string, { player: string; events: Event[] }>();
	for (const e of events) {
		for (const player of allTeams[e.id][team.abbr].players) {
			const entry = roster.get(player.toLowerCase()) ?? { player, events: [] };
			entry.events.push(e);
			roster.set(player.toLowerCase(), entry);
		}
	}

	// Each player's exclamation and scrambled name (for Team Dyslexia), picked after the page loads
	const randomBits = useRandom(
		() =>
			new Map(
				[...roster.values()].map(({ player }) => [
					player,
					{
						exclamation: randomItem(exclamations),
						scrambled: [...player].sort(() => Math.random() - 0.5).join(''),
					},
				])
			)
	);

	const statsEvents = events.filter((e) => team.abbr in (allTeamMapStats[e.id] ?? {}));

	return (
		<div className="flex h-full flex-col">
			<TabBar
				tabs={pages}
				active={active}
				onSelect={setActive}
				matchCount={matches.length}
				arrowFill="fill-shade-300"
			/>

			{active === 'Overview' && (
				<div className="mx-4 mt-6 flex flex-col sm:mx-6">
					<h2 className="mb-3 ml-4 text-[11px] leading-none font-bold text-red-400 uppercase">
						{events.length > 1 ? 'Roster' : 'Current Roster'}
					</h2>
					<div className="vlr-box-shadow bg-shade-100 text-muted flex flex-col gap-2 p-4">
						{[...roster.values()].map(({ player, events: playerEvents }) => {
							return (
								<p className="flex items-center gap-1 text-sm" key={player}>
									<img
										src={playerFlag(player, playerEvents[0].id, playerEvents[0].region)}
										alt={'flag'}
										className="h-4 w-auto"
									/>
									{team.name === 'Team Dyslexia' && fun
										? (randomBits?.get(player)?.scrambled ?? player)
										: player}
									{randomBits?.get(player)?.exclamation}
									{events.length > 1 && (
										<span className="text-vlr-text-gray ml-1 text-xs">
											{playerEvents.map((e) => e.shortName).join(', ')}
										</span>
									)}
								</p>
							);
						})}
					</div>
				</div>
			)}
			{active === 'Matches' && (
				<div className="mx-4 sm:mx-6">
					{matchesGrouped?.length > 0 ? (
						<div className="bg-shade-300 text-main flex flex-col gap-7.5 py-6">
							<div>
								<button
									className={cx(
										'bg-shade-100 ml-2 cursor-pointer rounded-sm px-2 py-1 text-xs',
										reverse && 'font-bold'
									)}
									onClick={() => setReverse(!reverse)}
								>
									{reverse ? 'esreveR' : 'Reverse'}
								</button>
							</div>
							{matchesGrouped.map(({ date, items }) => {
								return (
									<div className="flex flex-col" key={date}>
										<h2 className="mb-3 ml-3 text-[11px] leading-none font-bold text-red-400 uppercase">
											{date}
										</h2>
										<div className="vlr-box-shadow flex flex-col">
											{items.map(({ match, event: matchEvent }) => {
												return (
													<MatchCard
														match={match}
														event={matchEvent}
														addlClass="not-first:border-t-1 border-t-line!"
														key={match.id}
													/>
												);
											})}
										</div>
									</div>
								);
							})}
						</div>
					) : (
						<div className="bg-shade-300 text-main h-full py-6">
							<div>
								<img src={'/res/exist.png'} />
							</div>
						</div>
					)}
				</div>
			)}
			{active === 'Stats' &&
				(statsEvents.length > 0 ? (
					<div className="flex flex-col gap-8 p-4 sm:p-6">
						{statsEvents.map((e) => {
							const stats = allTeamMapStats[e.id][team.abbr];
							return (
								<div className="flex flex-col" key={e.id}>
									{events.length > 1 && (
										<h2 className="text-main mb-2 text-base font-bold">{e.name}</h2>
									)}
									<p className="text-muted mb-4 text-sm">
										Overall win rates: ATK {pctFormatter.format(stats.overallAtkPct)} DEF{' '}
										{pctFormatter.format(stats.overallDefPct)}
									</p>
									<h2 className="mb-3 ml-4 text-[11px] leading-none font-bold text-red-400 uppercase">
										Map Stats
									</h2>
									<TeamMapStatsTable teamMapStats={stats} />
								</div>
							);
						})}
					</div>
				) : (
					<div className="text-muted flex flex-col p-4 sm:p-6">
						You literally haven't played a game yet. Why are you checking your stats panel
					</div>
				))}
		</div>
	);
};

export default TeamPanels;
