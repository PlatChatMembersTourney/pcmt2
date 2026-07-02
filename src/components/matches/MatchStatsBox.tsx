import type { Match, Event } from '../../types/types.ts'
import { useState } from 'react'
import StatsTable from './StatsTable.tsx'

interface MatchStatsBoxProps {
	match: Match
	event: Event
}

const MatchStatsBox: React.FC<MatchStatsBoxProps> = (props) => {
	const { match, event } = props

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

	const agents: Record<string, Set<string>> = {}

	const selectedDetails =
		selectedMap === 0
			? match.mapDetails
			: [match.mapDetails[selectedMap - 1]]

	selectedDetails.forEach((details) => {
		details.stats.forEach((stat) => {
			stat.players.forEach((player) => {
				if (!(player.Player in agents)) {
					agents[player.Player] = new Set()
				}
				agents[player.Player].add(player.Agent!)
			})
		})
	})

	console.log(agents)

	return (
		<div className="flex flex-col bg-vlr-gray-200 dark:bg-vlr-gray-700 vlr-box-shadow">
			<div className="flex gap-1 h-18.5 items-center overflow-x-auto p-3 vlr-border border-b">
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
									<span style={{ verticalAlign: '4px' }} className="mr-1">
										{idx}
									</span>
								)}
								{name === 'All' ? 'All Maps' : name}
							</p>
						</button>
					)
				})}
			</div>
			<div className="p-4 sm:p-5">
				<StatsTable
					agents={agents}
					event={event}
					teamStats={
						selectedMap === 0
							? match.combinedStats
							: match.mapDetails[selectedMap - 1].stats
					}
					rounds={
						selectedMap === 0
							? match.maps.map((m) => m.score1 + m.score2).reduce((a, b) => a + b)
							: match.maps[selectedMap - 1].score1 +
								match.maps[selectedMap - 1].score2
					}
				/>
			</div>
		</div>
	)
}

export default MatchStatsBox
