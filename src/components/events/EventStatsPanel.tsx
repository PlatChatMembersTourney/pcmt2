import { useState } from 'react'
import type { Event, PlayerStats } from '../../types/types.ts'
import { useStore } from '@nanostores/react'
import { $playerStats } from '../../stores/store.ts'
import PlayerStatTable from '../stats/PlayerStatTable.tsx'

const EventStatsPanel: React.FC<{ event: Event }> = (props: {
	event: Event
}) => {
	const event = props.event

	const playerStats = useStore($playerStats)[event.id];

	const stages = ['All', ...Object.keys(playerStats).filter((name) => name !== 'Overall')];

	const [activeStage, setActiveStage] = useState(0);
	const [stickyPlayerNames, setStickyPlayerNames] = useState(true);

	if (!event.stages) {
		return (
			<div className="flex flex-col">
				No stages available for this event yet.
			</div>
		)
	}

	const players = playerStats[activeStage === 0 ? 'Overall' : stages[activeStage]] || [];

	return (
		<div className="flex flex-col">
			<div className="h-15 flex items-center bg-vlr-gray-200 dark:bg-vlr-gray-700  text-black dark:text-vlr-text-white pl-9 sm:pl-11 gap-3 vlr-box-shadow">
				<div>
					<p className="uppercase text-[10px] font-medium text-red-400">
						Stage:
					</p>
				</div>
				{stages.map((stage, idx) => {
					const isActive = activeStage === idx

					return (
						<button
							key={stage}
							className={
								'flex flex-col justify-center items-start cursor-pointer gap-1 h-full pt-0.75 border-b-3 border-transparent ' +
								(isActive ? '' : '')
							}
							onClick={() => {
								setActiveStage(idx)
							}}
						>
							<p
								className={
									'leading-6 text-xs box-border h-6 ' +
									(isActive
										? 'font-bold text-black dark:text-vlr-text-fullwhite border-red-400 border-b-3'
										: 'hover:font-bold text-black dark:text-vlr-text-white hover:dark:text-vlr-text-fullwhite border-[#666666] border-b border-dotted hover:border-transparent')
								}
							>
								{stage}
							</p>
						</button>
					)
				})}
			</div>
			{players.length > 0 ? (
				<div className="bg-vlr-gray-300 dark:bg-vlr-gray-800 p-4 sm:p-6 flex flex-col gap-2 h-full max-h-[80vh]">
					<div>
						<button
							onClick={() =>
								setStickyPlayerNames(!stickyPlayerNames)
							}
							className={`${stickyPlayerNames ? 'font-bold' : 'font-normal'} text-xs rounded-sm bg-vlr-gray-100 dark:bg-vlr-gray-600 p-2 dark:text-vlr-text-white text-vlr-text-dark`}
						>
							Sticky Player Names
						</button>
					</div>

					<PlayerStatTable
						playerStats={players.map(
							(player: PlayerStats & { eventId?: string }) => {
								player.eventId = event.id
								return player
							}
						)}
						showSeason={false}
						stickyPlayerNames={stickyPlayerNames}
					/>
				</div>
			) : (
				<div className="flex flex-col p-6 text-black dark:text-vlr-text-white">
					No stats yet. D:
				</div>
			)}
		</div>
	)
}

export default EventStatsPanel
