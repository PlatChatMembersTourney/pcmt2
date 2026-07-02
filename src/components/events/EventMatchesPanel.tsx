import { useEffect, useState } from 'react'
import type { Event, Match } from '../../types/types.ts'
import { useStore } from '@nanostores/react'
import { $matches, $teams } from '../../stores/store.ts'
import { groupByDay } from '../../utils/datetime.ts'
import MatchCard from '../matches/MatchCard.tsx'

const EventMatchesPanel: React.FC<{ event: Event }> = (props: {
	event: Event
}) => {
	const event = props.event

	const [timezone, setTimezone] = useState('America/Chicago')

	useEffect(() => {
		// Fetch the IANA timezone string from the browser
		const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone
		setTimezone(userTimezone)
	}, [])

	const teams = useStore($teams)[event.id]
	const matches = useStore($matches)[event.id]

	const stages = ['All', ...event.stages?.map((stage) => stage.name)]

	const [activeStage, setActiveStage] = useState(0);
	const [reverse, setReverse] = useState(false);

	if (!event.stages) {
		return (
			<div className="flex flex-col">
				No stages available for this event yet.
			</div>
		)
	}

	const format =
		activeStage === 0 ? undefined : event.stages[activeStage - 1].format

	console.log(format)

	const filteredMatches: Match[] =
		activeStage === 0
			? matches
			: matches.filter((match) => {
					if (format?.groupNames) {
						return format.groupNames.includes(match.stage)
					}
					return match.stage === stages[activeStage]
				});
	let matchesGrouped = groupByDay<Match>(filteredMatches, timezone)
	if(reverse) {
		matchesGrouped = matchesGrouped.reverse();
	}

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
				<button
					className={"ml-2 bg-vlr-gray-600 rounded-sm px-2 py-1 text-xs cursor-pointer " + (reverse ? "font-bold" : "")}
					onClick={() => setReverse(!reverse)}
				>
					{reverse ? 'esreveR' : 'Reverse'}
				</button>
			</div>
			{filteredMatches.length > 0 ? (
				<div
					className="bg-vlr-gray-300 dark:bg-vlr-gray-800 p-6 text-black dark:text-vlr-text-white
			flex flex-col gap-7.5"
				>
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
				<div className="flex flex-col p-6 text-black dark:text-vlr-text-white">
					No matches yet. :(
				</div>
			)}
		</div>
	)
}

export default EventMatchesPanel
