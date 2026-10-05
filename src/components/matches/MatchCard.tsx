import type { Match, Event } from '../../types/types.ts';
import slugify from 'slugify';

import { timeAgo, timeUntil } from '../../utils/datetime.ts';
import { regionFlag, teamFlag } from '../../utils/images.ts';
import { cx } from '../../utils/cx.ts';

interface MatchCardProps {
	match: Match;
	event: Event;
	addlClass?: string;
}

const formatter = new Intl.DateTimeFormat('en-US', {
	timeStyle: 'short',
});

const MatchCard: React.FunctionComponent<MatchCardProps> = (props) => {
	const { match, event, addlClass } = props;

	const date = new Date(match.date);

	const team1Winner = match.completed && match.score1 > match.score2;
	return (
		<a
			href={`/events/${event.id}/${slugify(match.id)}`}
			className={cx(
				event.showmatch ? 'cool-border-pb' : `cool-border-${event.region}`,
				'bg-shade-100 cool-border relative flex h-14 w-full items-center px-4 hover:bg-vlr-gray-150 md:px-5 dark:hover:bg-vlr-gray-500',
				addlClass
			)}
		>
			<p className="w-14 text-right text-xs md:mr-15 md:w-17.5">{formatter.format(date)}</p>
			<div className="ml-auto flex w-60 flex-col sm:mr-15 md:ml-0">
				{[
					{
						winner: team1Winner,
						name: match.team1Name,
						abbr: match.team1,
						score: match.score1,
					},
					{
						winner: !team1Winner,
						name: match.team2Name,
						abbr: match.team2,
						score: match.score2,
					},
				].map(({ winner, name, abbr, score }, idx) => {
					return (
						<div
							key={'Team ' + idx}
							className="text-muted flex h-5 w-60 items-center gap-1.75 text-xs font-medium whitespace-nowrap"
						>
							<div className="flex flex-none items-center">
								<div className="mr-0.5 flex w-3 items-center">
									{winner && match.completed && (
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
								<img src={teamFlag(abbr, event.id, event.region)} alt={event.region} className="w-4" />
							</div>
							<span className="shrink overflow-hidden text-ellipsis">{name}</span>
							{match.completed ? (
								<p
									className={cx(
										'ml-auto flex-none underline',
										winner ? 'text-muted font-medium' : 'text-vlr-text-gray dark:text-vlr-text-light font-normal'
									)}
								>
									{score}
								</p>
							) : (
								<p
									className="text-muted ml-auto flex-none font-medium"
								>
									-
								</p>
							)}
						</div>
					);
				})}
			</div>
			<div className="hidden items-center text-[11px] sm:flex">
				{match.completed ? (
					<>
						<div className="rounded-l-sm bg-vlr-text-silver px-1.5 py-1 text-white dark:bg-vlr-text-gray dark:text-vlr-text-offwhite">
							Completed
						</div>
						<div className="rounded-r-sm bg-vlr-text-gray py-1 pr-1.5 pl-1 font-medium text-white dark:bg-[#777] dark:text-vlr-text-offwhite">
							{timeAgo(match.date)}
						</div>
					</>
				) : (
					<>
						<div className="rounded-l-sm bg-vlr-green-dark px-1.5 py-1 text-white dark:bg-vlr-green dark:text-vlr-text-offwhite">
							Upcoming
						</div>
						<div className="rounded-r-sm bg-vlr-green py-1 pr-1.5 pl-1 font-medium text-white dark:bg-vlr-green-dark dark:text-vlr-text-offwhite">
							{timeUntil(match.date)}
						</div>
					</>
				)}
			</div>
			<div className="ml-auto hidden flex-col text-right text-xs md:flex">
				<p className="dark:text-vlr-text-white font-medium">
					PCMT: {event.region.toUpperCase()} S{event.season}
				</p>
				<p className="dark:text-vlr-text-light">{match.stage}</p>
			</div>
		</a>
	);
};

export default MatchCard;
