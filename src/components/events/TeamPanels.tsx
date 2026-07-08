import { useEffect, useState } from 'react'
import type { Event, Match, TeamInfo } from '../../types/types.ts'

import { $matches, $teamMapStats } from '../../stores/store.ts'
import { useStore } from '@nanostores/react'
import { groupByDay } from '../../utils/datetime.ts'
import MatchCard from '../matches/MatchCard.tsx'
import TeamMapStatsTable from './TeamMapStatsTable.tsx'
import { playerFlag } from '../../utils/images.ts'

interface TeamPanelsProps {
	event: Event;
	team: TeamInfo;
	fun?: boolean;
}

const pctFormatter = new Intl.NumberFormat('en-US', {
	style: 'percent',
	maximumFractionDigits: 1,
})

const exclamations = [
	' :O',
	' :D',
	'!!',
	' >:)',
	' x_x',
	' :3',
	' (╯°□°)╯︵ ┻━┻',
	' (:',
	' ;]',
	' (¬‿¬)',
]

const TeamPanels: React.FC<TeamPanelsProps> = (props: TeamPanelsProps) => {
	const { event, team, fun } = props;
	const pages = ['Overview', 'Matches', 'Stats']
	const [active, setActive] = useState<string>('Overview');
	const [reverse, setReverse] = useState(false);

	const [timezone, setTimezone] = useState('America/Chicago');

	const teamMapStats = useStore($teamMapStats)[event.id];

	useEffect(() => {
		// Fetch the IANA timezone string from the browser
		const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone
		setTimezone(userTimezone)
	}, [])

	const matches: Match[] = useStore($matches)[event.id].filter((match) => {
		return match.team1Name === team.name || match.team2Name === team.name
	})

	let matchesGrouped = groupByDay<Match>(matches, timezone)
	if (reverse) {
		matchesGrouped = matchesGrouped.reverse()
	}



	return (
		<div className="flex flex-col h-full">
			<div className="bg-vlr-gray-100 dark:bg-vlr-gray-600 border-t border-b dark:border-b-0 vlr-box-shadow vlr-border pl-4 sm:pl-6 flex flex-row">
				{pages.map((label) => {
					return (
						<button
							className={
								(active === label
									? 'text-black dark:text-white '
									: 'text-pb ') +
								'px-5 py-5 text-xs font-bold first:border-l border-r vlr-border ' +
								'dark:hover:bg-vlr-gray-500 hover:bg-vlr-gray-300 cursor-pointer relative'
							}
							onClick={() => setActive(label)}
							key={label}
						>
							{label}
							{label === 'Matches' && (
								<sup className="font-normal text-vlr-text-gray">
									{' '}
									({matches.length})
								</sup>
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
										className="dark:hidden absolute -bottom-px left-1/2 -translate-x-1/2 stroke-vlr-border-light"
									>
										<path d="M0 8 L8 0 L16 8" fill="none" />
									</svg>
								</>
							)}
						</button>
					)
				})}
			</div>

			{active === 'Overview' && (
				<div className="flex flex-col mx-4 sm:mx-6 mt-6">
					<h2 className="text-red-400 uppercase font-bold text-[11px] ml-4 mb-3 leading-none">
						Current Roster
					</h2>
					<div className="flex flex-col p-4 gap-2 vlr-box-shadow dark:bg-vlr-gray-600 bg-vlr-gray-100 dark:text-vlr-text-white text-vlr-text-dark">
						{team.players.map((player) => {
							return (
								<p className="text-sm flex items-center gap-1" key={player}>
									<img src={playerFlag(player, event.id, event.region)} alt={"flag"} className="h-4 w-auto" />
									{(team.name !== 'Team Dyslexia' || !fun)
										? player
										: [...player]
												.sort(() => Math.random() - 0.5)
												.join('')}
									{
										exclamations[
											Math.floor(
												Math.random() *
													exclamations.length
											)
										]
									}
								</p>
							)
						})}
					</div>
				</div>
			)}
			{active === 'Matches' && (
				<div className="mx-4 sm:mx-6">
					{matchesGrouped?.length > 0 ? (
						<div
							className="bg-vlr-gray-300 dark:bg-vlr-gray-800 py-6 text-black dark:text-vlr-text-white
			flex flex-col gap-7.5"
						>
							<div>
								<button
									className={
										'ml-2 bg-vlr-gray-100 dark:bg-vlr-gray-600 rounded-sm px-2 py-1 text-xs cursor-pointer ' +
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
										<h2 className="text-red-400 uppercase font-bold text-[11px] ml-3 mb-3 leading-none">
											{date}
										</h2>
										<div className="flex flex-col vlr-box-shadow">
											{items.map((match) => {
												return (
													<MatchCard
														match={match}
														event={event}
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
						<div className="bg-vlr-gray-300 dark:bg-vlr-gray-800 py-6 text-black dark:text-vlr-text-white h-full">
							<div>
								<img src={'/res/exist.png'} />
							</div>
						</div>
					)}
				</div>
			)}
			{active === 'Stats' &&
				(team.abbr in teamMapStats ? (
					<div className="p-4 sm:p-6 flex flex-col">
						<p className="text-vlr-text-dark dark:text-vlr-text-white text-sm mb-4">
							Overall win rates: ATK{' '}
							{pctFormatter.format(
								teamMapStats[team.abbr].overallAtkPct
							)}{' '}
							DEF{' '}
							{pctFormatter.format(
								teamMapStats[team.abbr].overallDefPct
							)}
						</p>
						<h2 className="text-red-400 uppercase font-bold text-[11px] ml-4 mb-3 leading-none">
							Map Stats
						</h2>
						<TeamMapStatsTable
							teamMapStats={teamMapStats[team.abbr]}
						/>
					</div>
				) : (
					<div className="p-4 sm:p-6 flex flex-col text-vlr-text-dark dark:text-vlr-text-white">
						You literally haven't played a game yet. Why are you checking your stats panel
					</div>
				))}
		</div>
	)
}

export default TeamPanels;
