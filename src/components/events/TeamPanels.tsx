import { useEffect, useState } from 'react';
import type { Event, Match, TeamInfo } from '../../types/types.ts';

import { $matches, $teamMapStats, $teams } from '../../stores/store.ts';
import { useStore } from '@nanostores/react';
import { groupByDay } from '../../utils/datetime.ts';
import MatchCard from '../matches/MatchCard.tsx';
import TeamMapStatsTable from './TeamMapStatsTable.tsx';
import { playerFlag } from '../../utils/images.ts';
import eventsRaw from '../../data/events.json';

const allEvents = eventsRaw as Event[];

interface TeamPanelsProps {
	event: Event;
	team: TeamInfo;
	fun?: boolean;
}

// Showmatch teams with the same abbr are one team across all showmatches
export const teamEvents = (event: Event, team: TeamInfo, teams: Record<string, Record<string, TeamInfo>>) =>
	event.id.startsWith('showmatch')
		? allEvents.filter((e) => e.id.startsWith('showmatch') && team.abbr in (teams[e.id] ?? {}))
		: [event];

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

	const [timezone, setTimezone] = useState('America/Chicago');

	const allTeams = useStore($teams);
	const allMatches = useStore($matches);
	const allTeamMapStats = useStore($teamMapStats);
	const events = teamEvents(event, team, allTeams);

	useEffect(() => {
		// Fetch the IANA timezone string from the browser
		const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
		setTimezone(userTimezone);
	}, []);

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

	const statsEvents = events.filter((e) => team.abbr in (allTeamMapStats[e.id] ?? {}));

	return (
		<div className="flex h-full flex-col">
			<div className="bg-vlr-gray-100 dark:bg-vlr-gray-600 vlr-box-shadow vlr-border flex flex-row border-t border-b pl-4 sm:pl-6 dark:border-b-0">
				{pages.map((label) => {
					return (
						<button
							className={
								(active === label ? 'text-black dark:text-white ' : 'text-pb ') +
								'vlr-border border-r px-5 py-5 text-xs font-bold first:border-l ' +
								'dark:hover:bg-vlr-gray-500 hover:bg-vlr-gray-300 relative cursor-pointer'
							}
							onClick={() => setActive(label)}
							key={label}
						>
							{label}
							{label === 'Matches' && (
								<sup className="text-vlr-text-gray font-normal"> ({matches.length})</sup>
							)}
							{active === label && (
								<>
									<svg
										height="8"
										width="16"
										className={
											'absolute -bottom-px left-1/2 -translate-x-1/2 ' +
											'dark:fill-vlr-gray-800 fill-vlr-gray-300'
										}
									>
										<path d="M0 8 L16 8 L8 0 Z" />
									</svg>
									<svg
										height="8"
										width="16"
										className="stroke-vlr-border-light absolute -bottom-px left-1/2 -translate-x-1/2 dark:hidden"
									>
										<path d="M0 8 L8 0 L16 8" fill="none" />
									</svg>
								</>
							)}
						</button>
					);
				})}
			</div>

			{active === 'Overview' && (
				<div className="mx-4 mt-6 flex flex-col sm:mx-6">
					<h2 className="mb-3 ml-4 text-[11px] leading-none font-bold text-red-400 uppercase">
						{events.length > 1 ? 'Roster' : 'Current Roster'}
					</h2>
					<div className="vlr-box-shadow dark:bg-vlr-gray-600 bg-vlr-gray-100 dark:text-vlr-text-white text-vlr-text-dark flex flex-col gap-2 p-4">
						{[...roster.values()].map(({ player, events: playerEvents }) => {
							return (
								<p className="flex items-center gap-1 text-sm" key={player}>
									<img
										src={playerFlag(player, playerEvents[0].id, playerEvents[0].region)}
										alt={'flag'}
										className="h-4 w-auto"
									/>
									{team.name !== 'Team Dyslexia' || !fun
										? player
										: [...player].sort(() => Math.random() - 0.5).join('')}
									{exclamations[Math.floor(Math.random() * exclamations.length)]}
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
						<div className="bg-vlr-gray-300 dark:bg-vlr-gray-800 dark:text-vlr-text-white flex flex-col gap-7.5 py-6 text-black">
							<div>
								<button
									className={
										'bg-vlr-gray-100 dark:bg-vlr-gray-600 ml-2 cursor-pointer rounded-sm px-2 py-1 text-xs ' +
										(reverse ? 'font-bold' : '')
									}
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
														addlClass="not-first:border-t-1 dark:border-t-vlr-border-gray! border-t-vlr-border-light!"
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
						<div className="bg-vlr-gray-300 dark:bg-vlr-gray-800 dark:text-vlr-text-white h-full py-6 text-black">
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
										<h2 className="dark:text-vlr-text-white mb-2 text-base font-bold text-black">
											{e.name}
										</h2>
									)}
									<p className="text-vlr-text-dark dark:text-vlr-text-white mb-4 text-sm">
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
					<div className="text-vlr-text-dark dark:text-vlr-text-white flex flex-col p-4 sm:p-6">
						You literally haven't played a game yet. Why are you checking your stats panel
					</div>
				))}
		</div>
	);
};

export default TeamPanels;
