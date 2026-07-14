import type { Match, Event, TeamInfo } from '../../types/types.ts';
import slugify from 'slugify';
import { useStore } from '@nanostores/react';
import { $teams } from '../../stores/store.ts';
import { timeUntil } from '../../utils/datetime.ts';

interface MatchHeaderProps {
	match: Match;
	event: Event;
}

const dateFormatter = new Intl.DateTimeFormat('en-US', {
	month: 'long',
	day: 'numeric',
	weekday: 'short',
	year: 'numeric',
});
const timeFormatter = new Intl.DateTimeFormat('en-US', {
	hour: 'numeric',
	minute: '2-digit',
	timeZoneName: 'short',
});

const MatchHeader: React.FC<MatchHeaderProps> = (props) => {
	const { match, event } = props;

	const teams: Record<string, TeamInfo> = useStore($teams)[event.id];
	const team1Winner = match.completed && match.score1 > match.score2;

	return (
		<div
			className={`${
				event.id.includes('showmatch')
					? 'cool-border-pb'
					: {
							na: 'cool-border-na',
							emea: 'cool-border-emea',
						}[event.region]
			} vlr-box-shadow dark:bg-vlr-gray-600 bg-vlr-gray-100 cool-border-top dark:text-vlr-text-white relative p-4 text-[#333] sm:p-5`}
		>
			<div className="flex h-9 items-center gap-2">
				<img
					src={
						event.id.includes('showmatch')
							? '/icons/PC%20Logo%20Box.png'
							: event.region === 'na'
								? '/icons/NA%20Logo.png'
								: '/icons/EMEA%20Logo.png'
					}
					className="h-8 w-8"
				/>
				<div className="flex flex-col">
					<a href={`/events/${event.id}`} className="text-pb flex-1 text-xs leading-4.5 font-bold">
						PCMT: {event.name}
					</a>
					<p className="flex-1 text-xs leading-4.5">{match.stage}</p>
				</div>
				<div className="ml-auto flex flex-col text-right">
					<p className="flex-1 text-xs leading-4.5">{dateFormatter.format(new Date(match.date))}</p>
					<p className="flex-1 text-xs leading-4.5">{timeFormatter.format(new Date(match.date))}</p>
				</div>
			</div>
			<div className="mt-10 mb-15 flex items-center justify-center">
				<a
					href={`/events/${event.id}/teams/${slugify(match.team1Name, { lower: true })}`}
					className="text-plat-blue-dark dark:text-vlr-text-white w-30 text-right text-base leading-tight font-black md:w-37.5 md:text-xl"
				>
					{match.team1Name}
				</a>
				<div className="ml-3 h-12 w-12 md:ml-5 md:h-18 md:w-18">
					<img src={teams[match.team1].logo} className="h-full w-full object-contain" alt={match.team1Name} />
				</div>
				<div className="flex w-20 flex-col items-center md:w-25">
					{match.completed ? (
						<p className="text-vlr-text-gray text-[10px] uppercase">Final</p>
					) : (
						<p className="text-[10px] text-green-400 uppercase">{timeUntil(match.date)}</p>
					)}

					<p className="text-base font-medium md:text-3xl">
						{!match.completed ? (
							<span className="text-vlr-text-gray font-normal">–</span>
						) : (
							<>
								<span className={team1Winner ? 'text-green-500 dark:text-green-400' : ''}>
									{match.score1}
								</span>
								{' : '}
								<span className={!team1Winner ? 'text-green-500 dark:text-green-400' : ''}>
									{match.score2}
								</span>
							</>
						)}
					</p>

					<p className="text-vlr-text-gray text-[10px] uppercase">BO{match.bestOf}</p>
				</div>

				<div className="mr-3 h-12 w-12 md:mr-5 md:h-18 md:w-18">
					<img src={teams[match.team2].logo} className="h-full w-full object-contain" alt={match.team2Name} />
				</div>
				<a
					href={`/events/${event.id}/teams/${slugify(match.team2Name, { lower: true })}`}
					className="text-plat-blue-dark dark:text-vlr-text-white w-30 text-base leading-tight font-black md:w-37.5 md:text-xl"
				>
					{match.team2Name}
				</a>
			</div>
			<p className="text-center text-[11px] leading-normal italic md:text-xs">{match.veto}</p>
		</div>
	);
};

export default MatchHeader;
