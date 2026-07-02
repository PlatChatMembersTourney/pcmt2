import type { Match, Event } from '../../types/types.ts'
import slugify from 'slugify'

import { timeAgo, timeUntil } from '../../utils/datetime.ts'

interface MatchCardProps {
	match: Match
	event: Event
	addlClass?: string
}

const formatter = new Intl.DateTimeFormat('en-US', {
	timeStyle: 'short',
})

const MatchCard: React.FunctionComponent<MatchCardProps> = (props) => {
	const { match, event, addlClass } = props

	const date = new Date(match.date)

	const team1Winner = match.completed && match.score1 > match.score2
	return (
		<a
			href={`/events/${event.id}/${slugify(match.id)}`}
			className={
				'flex px-4 md:px-5 items-center w-full h-14 dark:bg-vlr-gray-600 dark:hover:bg-vlr-gray-500 bg-vlr-gray-100 hover:bg-[#f1f1f1] cool-border relative' +
				(addlClass ? ` ${addlClass}` : '')
			}
		>
			<p className="text-xs w-14 md:w-17.5 text-right md:mr-15">
				{formatter.format(date)}
			</p>
			<div className="flex flex-col w-60 ml-auto md:ml-0 sm:mr-15">
				{[
					{
						winner: team1Winner,
						name: match.team1Name,
						score: match.score1,
					},
					{
						winner: !team1Winner,
						name: match.team2Name,
						score: match.score2,
					},
				].map(({ winner, name, score }, idx) => {
					return (
						<div key={"Team " + idx} className="flex w-60 whitespace-nowrap gap-1.75 items-center h-5 text-xs font-medium dark:text-vlr-text-white text-vlr-text-dark">
							<div className="flex-none flex items-center">
								<div className="w-3 mr-0.5 flex items-center">
									{winner && (
										<svg
											xmlns="http://www.w3.org/2000/svg"
											height="16px"
											viewBox="0 0 24 24"
											className="fill-green-500"
										>
											<path d="M9 6c0-.852.986-1.297 1.623-.783l.084.076l6 6a1 1 0 0 1 .083 1.32l-.083.094l-6 6l-.094.083l-.077.054l-.096.054l-.036.017l-.067.027l-.108.032l-.053.01l-.06.01l-.057.004L10 19l-.059-.002l-.058-.005l-.06-.009l-.052-.01l-.108-.032l-.067-.027l-.132-.07l-.09-.065l-.081-.073l-.083-.094l-.054-.077l-.054-.096l-.017-.036l-.027-.067l-.032-.108l-.01-.053l-.01-.06l-.004-.057z" />
										</svg>
									)}
								</div>
								<img
									src={
										event.region === 'na'
											? '/icons/flags/16/us.png'
											: '/icons/flags/16/eu.png'
									}
									className="w-4"
								/>
							</div>
							<span className="text-ellipsis overflow-hidden shrink">
								{name}
							</span>
							{match.completed ? (
								<p
									className={
										'flex-none underline ml-auto ' +
										(winner
											? 'font-medium text-vlr-text-dark dark:text-vlr-text-white'
											: 'font-normal text-vlr-text-gray dark:text-vlr-text-light')
									}
								>
									{score}
								</p>
							) : (
								<p
									className={'flex-none ml-auto font-medium text-vlr-text-dark dark:text-vlr-text-white'}
								>
									-
								</p>
							)}
						</div>
					)
				})}
			</div>
			<div className="hidden sm:flex items-center text-[11px]">
				{match.completed ? (
					<>
						<div className="rounded-l-sm px-1.5 py-1 bg-[#aaa] dark:bg-[#888] text-white dark:text-[#eee]">
							Completed
						</div>
						<div className="rounded-r-sm pl-1 pr-1.5 py-1 bg-[#888] dark:bg-[#777] font-medium text-white dark:text-[#eee]">
							{timeAgo(match.date)}
						</div>
					</>
				) : (
					<>
						<div className="rounded-l-sm px-1.5 py-1 bg-[#498357] dark:bg-[#5ca36c] text-white dark:text-[#eee]">
							Upcoming
						</div>
						<div className="rounded-r-sm pl-1 pr-1.5 py-1 bg-[#5ca36c] dark:bg-[#498357] font-medium text-white dark:text-[#eee]">
							{timeUntil(match.date)}
						</div>
					</>
				)}
			</div>
			<div className="hidden flex-col ml-auto md:flex text-right text-xs">
				<p className="dark:text-vlr-text-white font-medium">PCMT</p>
				<p className="dark:text-vlr-text-light">{match.stage}</p>
			</div>
		</a>
	)
}

export default MatchCard
