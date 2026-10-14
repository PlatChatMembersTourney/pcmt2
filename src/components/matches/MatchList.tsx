import { Fragment } from 'react';
import type { Event, Match } from '../../types/types.ts';
import { groupByDay } from '../../utils/datetime.ts';
import { useTimezone } from '../../utils/useTimezone.ts';
import { cx } from '../../utils/cx.ts';
import MatchCard from './MatchCard.tsx';

interface MatchListProps {
	matches: { match: Match; event: Event }[];
	oldestFirst?: boolean; // newest day first by default
	controls?: React.ReactNode; // buttons above the list, e.g. Reverse
	renderAfter?: (match: Match, event: Event) => React.ReactNode; // shown under each match's card
	className?: string; // padding - py-6 by default
	empty?: React.ReactNode; // shown instead when there are no matches
}

// Matches grouped by day in the visitor's timezone, each day's cards under a red date label - used by every match list
const MatchList: React.FC<MatchListProps> = ({ matches, oldestFirst, controls, renderAfter, className, empty }) => {
	const timezone = useTimezone();
	const days = groupByDay(
		matches.map((item) => ({ date: item.match.date, ...item })),
		timezone
	);
	if (!oldestFirst) days.reverse();

	if (days.length === 0) {
		return (
			<div className={cx('bg-shade-300 text-main h-full', className ?? 'py-6')}>
				{empty ?? <img src={'/res/exist.png'} />}
			</div>
		);
	}
	return (
		<div className={cx('bg-shade-300 text-main flex flex-col gap-7.5', className ?? 'py-6')}>
			{controls && <div>{controls}</div>}
			{days.map(({ date, items }) => (
				<div className="flex flex-col" key={date}>
					<h2 className="section-label mb-3 ml-3">{date}</h2>
					<div className="vlr-box-shadow flex flex-col">
						{items.map(({ match, event }) => (
							<Fragment key={match.id}>
								<MatchCard
									match={match}
									event={event}
									addlClass="not-first:border-t-1 border-t-line!"
								/>
								{renderAfter?.(match, event)}
							</Fragment>
						))}
					</div>
				</div>
			))}
		</div>
	);
};

export default MatchList;
