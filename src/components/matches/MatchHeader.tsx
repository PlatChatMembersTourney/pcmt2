import type { Match, Event, TeamInfo } from '../../types/types.ts'
import slugify from 'slugify'
import { useStore } from '@nanostores/react'
import { $teams } from '../../stores/store.ts'
import { timeUntil } from '../../utils/datetime.ts'

interface MatchHeaderProps {
	match: Match
	event: Event
}

const dateFormatter = new Intl.DateTimeFormat('en-US', {
	dateStyle: 'full'
})
const timeFormatter = new Intl.DateTimeFormat('en-US', {
	hour: 'numeric',
	minute: '2-digit',
	timeZoneName: 'short'
})

const MatchHeader: React.FC<MatchHeaderProps> = (props) => {
	const {
		match, event
	} = props;

	const teams: Record<string, TeamInfo> = useStore($teams)[event.id];
	const team1Winner = match.completed && match.score1 > match.score2;

	return (
		<div className="p-4 sm:p-5 dark:bg-vlr-gray-600 bg-vlr-gray-100 relative cool-border-top text-[#333] dark:text-vlr-text-white">
			<div className="flex h-9 items-center gap-2">
				<img
					src={
						event.region === 'na'
							? '/icons/NA%20Logo.png'
							: '/icons/EMEA%20Logo.png'
					}
					className="h-8 w-8"
				/>
				<div className="flex flex-col">
					<a
						href={`/events/${event.id}`}
						className="flex-1 leading-4.5 text-xs text-pb font-bold"
					>
						PCMT: {event.name}
					</a>
					<p className="flex-1 leading-4.5 text-xs">{match.stage}</p>
				</div>
				<div className="flex flex-col ml-auto text-right">
					<p className="flex-1 leading-4.5 text-xs">
						{dateFormatter.format(new Date(match.date))}
					</p>
					<p className="flex-1 leading-4.5 text-xs">
						{timeFormatter.format(new Date(match.date))}
					</p>
				</div>
			</div>
			<div className="mt-10 mb-15 flex items-center justify-center">
				<a
					href={`/events/${event.id}/teams/${slugify(match.team1Name)}`}
					className="font-black text-base md:text-xl w-30 md:w-37.5 text-right text-plat-blue-dark dark:text-vlr-text-white"
				>
					{match.team1Name}
				</a>
				<div className="h-18 w-18 ml-3 md:ml-5">
					<img
						src={teams[match.team1].logo}
						className="h-18 w-18 object-contain"
						alt={match.team1Name}
					/>
				</div>
				<div className="flex flex-col items-center w-15 md:w-25">
					{match.completed ? (
						<p className="text-[10px] uppercase text-vlr-text-gray">
							Final
						</p>
					) : (
						<p className="text-[10px] uppercase text-green-400">
							{timeUntil(match.date)}
						</p>
					)}

					<p className="text-base md:text-3xl font-medium">
						<span
							className={
								team1Winner
									? ' text-green-500 dark:text-green-400'
									: ''
							}
						>
							{match.score1}
						</span>
						{' : '}
						<span
							className={
								!team1Winner
									? 'text-green-500 dark:text-green-400'
									: ''
							}
						>
							{match.score2}
						</span>
					</p>

					<p className="text-[10px] uppercase text-vlr-text-gray">
						BO{match.bestOf}
					</p>
				</div>

				<div className="h-18 w-18 mr-3 md:mr-5">
					<img
						src={teams[match.team2].logo}
						className="h-18 w-18 object-contain"
						alt={match.team1Name}
					/>
				</div>
				<a
					href={`/events/${event.id}/teams/${slugify(match.team2Name)}`}
					className="font-black text-base md:text-xl w-30 md:w-37.5 text-plat-blue-dark dark:text-vlr-text-white"
				>
					{match.team2Name}
				</a>
			</div>
			<p className="italic text-[11px] md:text-xs leading-normal text-center">{match.veto}</p>
		</div>
	)
}

export default MatchHeader;