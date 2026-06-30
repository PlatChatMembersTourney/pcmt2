import { useState } from 'react'
import { useStore } from '@nanostores/react'
import type { Event, Standing } from '../../types/types.ts'
import { $standings, $teams } from '../../stores/store.ts'
import GroupStandingsBox from '../GroupStandingsBox.tsx'

const EventOverviewPanel: React.FC<{ event: Event }> = (props: {
	event: Event
}) => {
	const event = props.event

	const allStandings: Record<string, Standing[]> = useStore($standings)[event.id]
	const teams = useStore($teams)[event.id]

	const [activeStage, setActiveStage] = useState(event.stages.length - 1)

	const format = event.stages[activeStage].format;

	return (
		<div className="flex flex-col">
			<div className="h-15 flex items-center bg-vlr-gray-200 dark:bg-vlr-gray-700  text-black dark:text-vlr-text-white pl-9 sm:pl-11 gap-6 vlr-box-shadow">
				{event.stages?.map((stage, idx) => {
					const isActive = activeStage === idx

					return (
						<button
							key={stage.name}
							className={
								'flex flex-col justify-center items-start cursor-pointer gap-1 h-full pt-0.75 border-b-3 border-transparent ' +
								(isActive
									? 'border-red-400!'
									: 'hover:border-[#666666]')
							}
							onClick={() => {
								setActiveStage(idx)
							}}
						>
							<p className="text-[10px] uppercase text-[#888] leading-none">
								{stage.dates}
							</p>
							<p
								className={
									'leading-none font-medium text-[12px] ' +
									(isActive
										? 'text-black dark:text-vlr-text-white'
										: 'text-pb')
								}
							>
								{stage.name}
							</p>
						</button>
					)
				})}
			</div>
			<div className="bg-vlr-gray-300 dark:bg-vlr-gray-800 px-4 sm:px-6 pt-6 text-black dark:text-vlr-text-white">
				{format?.type === 'round-robin' ? (
					<>
						<h2 className="text-red-400 uppercase font-bold text-[11px] ml-3 mb-3 leading-none">Groups</h2>
						<div className="flex gap-3 flex-col md:flex-row">
							{format.groups === 1 ? (
								<GroupStandingsBox
									standings={
										allStandings[
											event.stages[activeStage].name
										]
									}
									teamColors={format.teamColors!}
									name={event.stages[activeStage].name}
									teams={teams}
									region={event.region}
								/>
							) : (
								format.groupNames?.map((groupName) => (
									<div className="overflow-x-auto">
										<GroupStandingsBox
											standings={allStandings[groupName]}
											teamColors={format.teamColors!}
											name={groupName}
											teams={teams}
											key={groupName}
											region={event.region}
										/>
									</div>
								))
							)}
						</div>
					</>
				) : (
					<div>not supported yet</div>
				)}
			</div>
		</div>
	)
}

export default EventOverviewPanel
