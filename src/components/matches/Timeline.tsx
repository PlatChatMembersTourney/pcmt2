import type { Round, TeamInfo } from '../../types/types.ts'
import { useEffect } from 'react'

interface TimelineProps {
	rounds: Round[]
	team1: TeamInfo
	team2: TeamInfo
	showAllRounds?: boolean;
}

const Timeline: React.FC<TimelineProps> = (props) => {
	const { rounds, team1, team2, showAllRounds } = props

	const newRounds = [...rounds]

	if(showAllRounds) {
		while(newRounds.length < 24){
			newRounds.push({
				round: newRounds.length + 1,
				winner: 0,
				side: 'atk'
			})
		}
	}

	newRounds.splice(12, 0, {
		round: -1,
		winner: 1,
		side: 'atk',
	})



	return (
		<div className="flex gap-0.75 items-center pb-2 overflow-x-auto">
			<div className="flex flex-col gap-0.75">
				<div className="h-3" />
				<div className="h-5 flex gap-2 items-center mr-10">
					<img src={team1.logo} className="h-5 w-5" />
					<p className="text-vlr-text-dark dark:text-vlr-text-white text-[11px]">
						{team1.abbr}
					</p>
				</div>
				<div className="h-5 flex gap-2 items-center mr-10">
					<img src={team2.logo} className="h-5 w-5" />
					<p className="text-vlr-text-dark dark:text-vlr-text-white text-[11px]">
						{team2.abbr}
					</p>
				</div>
			</div>

			{newRounds.map((round, index) => {
				if (round.round === -1) {
					// return a spacer between the halves
					return <div className="w-5" key="spacer" />
				}

				return (
					<div
						key={index}
						className="flex flex-col gap-0.75 items-center"
					>
						<p className="text-[9px] leading-none h-3 text-vlr-text-gray">
							{round.round}
						</p>
						<div
							className={
								'h-5 w-5 rounded-xs ' +
								(round.winner === 1
									? round.side === 'def'
										? 'bg-[#24b298]'
										: 'bg-[#e25d5a]'
									: 'bg-[#dddddd] dark:bg-vlr-gray-500')
							}
						></div>
						<div
							className={
								'h-5 w-5 rounded-xs ' +
								(round.winner === 2
									? round.side === 'def'
										? 'bg-[#24b298]'
										: 'bg-[#e25d5a]'
									: 'bg-[#dddddd] dark:bg-vlr-gray-500')
							}
						></div>
					</div>
				)
			})}
		</div>
	)
}

export default Timeline
