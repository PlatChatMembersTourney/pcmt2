import type { Match, Event, TeamInfo, MapDetail } from '../../types/types.ts'
import { useState } from 'react'
import StatsTable from './StatsTable.tsx'
import Timeline from './Timeline.tsx'
import { useStore } from '@nanostores/react'
import { $teams } from '../../stores/store.ts'

interface MatchStatsBoxProps {
	match: Match
	event: Event
}

const getAgents = (mapDetails: MapDetail[])=> {
	const agents: Record<string, Set<string>> = {}

	mapDetails.forEach((details) => {
		details.stats.forEach((stat) => {
			stat.players.forEach((player) => {
				if (!(player.Player in agents)) {
					agents[player.Player] = new Set()
				}
				agents[player.Player].add(player.Agent!)
			})
		})
	});

	return agents;
}

const MatchStatsBox: React.FC<MatchStatsBoxProps> = (props) => {
	const { match, event } = props;
	const teams: Record<string, TeamInfo> = useStore($teams)[event.id];

	if(!match.completed) {
		return (
			<div className="flex flex-col p-4 sm:p-5 bg-vlr-gray-200 dark:bg-vlr-gray-700 vlr-box-shadow text-vlr-text-dark text-sm dark:text-vlr-text-white">
				Are you kidding ??? What the **** are you talking about man ?
				You are a biggest looser i ever seen in my life ! You was doing
				PIPI in your pampers when i was beating players much more
				stronger then you! You are not proffesional, because
				proffesionals knew how to lose and congratulate opponents, you
				are like a girl crying after i beat you! Be brave, be honest to
				yourself and stop this trush talkings!!! Everybody know that i
				am very good pcmt player, i can win anyone in the world in lurk!
				And "h"aych "e"dd is nobody for me, just a player who are crying
				every single time when loosing, ( remember what you say about
				Caleb ) !!! Stop playing with my name, i deserve to have a good
				name during whole my valorand carrier, I am Officially inviting
				you to 1v1 skirmish match with the Prize fund! Both of us will
				invest 5000$ and winner takes it all!
			</div>
		)
	}

	// map 0: all maps
	const [selectedMap, setSelectedMap] = useState(0)

	return (
		<div className="flex flex-col bg-vlr-gray-200 dark:bg-vlr-gray-700 vlr-box-shadow">
			<div className="flex gap-3 h-18.5 items-center overflow-x-auto p-3 vlr-border border-b">
				{[{ name: 'All' }, ...match.maps].map(({ name }, idx) => {
					return (
						<button
							key={name}
							onClick={() => setSelectedMap(idx)}
							className={
								`flex-1 ${match.bestOf === 3 ? 'min-w-20' : 'min-w-15'} h-full cursor-pointer rounded-xs text-[11px] text-center ` +
								(selectedMap === idx
									? 'bg-[#666] text-white dark:bg-[#848f9a]'
									: 'text-vlr-text-dark dark:text-vlr-text-white bg-vlr-gray-100 dark:bg-vlr-gray-600')
							}
						>
							<p className={idx === 0 ? '' : ' mb-0.5'}>
								{name !== 'All' && (
									<span
										style={{ verticalAlign: '4px' }}
										className="mr-1"
									>
										{idx}
									</span>
								)}
								{name === 'All' ? 'All Maps' : name}
							</p>
						</button>
					)
				})}
			</div>
			<div className="p-4 sm:p-5 flex-col items-center">
				{selectedMap !== 0 && (
					<>
						<div className="mb-5 grid w-full grid-cols-[1fr_auto_1fr] items-center">
							<div className="flex gap-3">
								<p
									className={
										'text-4xl font-normal leading-none ' +
										(match.maps[selectedMap - 1].score1 >
										match.maps[selectedMap - 1].score2
											? 'text-green-600 dark:text-green-400'
											: 'text-vlr-text-dark dark:text-vlr-text-white')
									}
								>
									{match.maps[selectedMap - 1].score1}
								</p>
								<div className="flex flex-col h-9 justify-center">
									<p className="text-vlr-text-dark dark:text-vlr-text-white font-medium text-xs">
										{match.team1Name}
									</p>
								</div>
							</div>
							<h2 className="font-bold leading-none text-xl text-vlr-text-dark dark:text-vlr-text-white">
								{match.maps[selectedMap - 1].name}
							</h2>
							<div className="flex gap-3 ml-auto">
								<div className="flex flex-col h-9 justify-center items-end">
									<p className="text-vlr-text-dark dark:text-vlr-text-white font-medium text-xs text-right">
										{match.team2Name}
									</p>
								</div>
								<p
									className={
										'text-4xl font-normal leading-none ' +
										(match.maps[selectedMap - 1].score1 <
										match.maps[selectedMap - 1].score2
											? 'text-green-600 dark:text-green-400'
											: 'text-vlr-text-dark dark:text-vlr-text-white')
									}
								>
									{match.maps[selectedMap - 1].score2}
								</p>
							</div>
						</div>
						<div className="mb-5">
							<Timeline
								rounds={
									match.mapDetails[selectedMap - 1].rounds
								}
								team1={teams[match.team1]}
								team2={teams[match.team2]}
								showAllRounds={true}
							/>
						</div>
					</>
				)}
				{selectedMap === 0 && (
					<StatsTable
						agents={getAgents(match.mapDetails)}
						event={event}
						teamStats={match.combinedStats}
						rounds={match.maps
							.map((m) => m.score1 + m.score2)
							.reduce((a, b) => a + b)}
					/>
				)}
				{match.maps.map((map, idx) => (
					<>
						{selectedMap === idx + 1 && (
							<StatsTable
								agents={getAgents([match.mapDetails[idx]])}
								event={event}
								teamStats={match.mapDetails[idx].stats}
								rounds={
									match.maps[idx].score1 +
									match.maps[idx].score2
								}
							/>
						)}
					</>
				))}
			</div>
		</div>
	)
}

export default MatchStatsBox
