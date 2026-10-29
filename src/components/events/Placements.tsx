import slugify from 'slugify';
import { cx } from '../../utils/cx.ts';
import type { BracketLayout, Event, Match, TeamInfo } from '../../types/types.ts';
import { playBracket } from '../../utils/bracket.ts';

interface PlacementsProps {
	event: Event;
	layout: BracketLayout;
	matches: Match[]; // the stage's matches
	teams: Record<string, TeamInfo>;
}

// 1 -> 1<sup>st</sup>, like vlr
const ordinal = (n: number) => {
	const suffix = n % 100 >= 11 && n % 100 <= 13 ? 'th' : (['th', 'st', 'nd', 'rd'][n % 10] ?? 'th');
	return (
		<>
			{n}
			<sup className="relative -top-1 align-baseline text-[9px] leading-0">{suffix}</sup>
		</>
	);
};

// 1st-3rd place's text: gold, silver and bronze
const medals: Record<number, string> = {
	1: 'text-gold font-bold',
	2: 'text-silver font-bold',
	3: 'text-bronze font-bold',
};

// A playoff bracket's final standings, like vlr's Prize Distribution: the grand final's winner and loser, then the
// teams knocked out in each round from last to first (the lower bracket's, or in single elimination, the upper's)
const Placements: React.FC<PlacementsProps> = ({ event, layout, matches, teams }) => {
	const rounds = playBracket(layout, matches);
	const final = rounds.final[0];
	if (!final) return null; // no grand final, so no 1st place (an LCQ)

	// byes (null slots) knock no one out
	const knockedOut = (rounds.lower ?? rounds.upper).map((round) =>
		round.flatMap((slot) => (slot ? [slot.loser] : []))
	);
	const tiers = [[final.winner], [final.loser], ...knockedOut.reverse()];
	let place = 1;
	const rows = tiers.flatMap((tier) => {
		const [first, last] = [place, place + tier.length - 1];
		place += tier.length;
		const label =
			first === last ? (
				ordinal(first)
			) : (
				<>
					{ordinal(first)}–{ordinal(last)}
				</>
			);
		const color = medals[first] ?? 'text-main';
		// knocked-out teams first, then a TBD for each place still being played for
		return [...tier].sort((a, b) => Number(!a) - Number(!b)).map((abbr) => ({ label, color, abbr }));
	});

	return (
		<div className="mt-6 flex max-w-198.5 flex-col">
			<h2 className="section-label mb-3 ml-3">Placements</h2>
			<div className="vlr-box-shadow overflow-x-auto">
				<div role="table" className="bg-grid grid grid-cols-[max-content_1fr] gap-px text-xs">
					<div role="row" className="text-vlr-text-gray contents text-[10px] font-medium uppercase">
						<div role="columnheader" className="bg-shade-200 py-3 pr-3.75 pl-5">
							Place
						</div>
						<div role="columnheader" className="bg-shade-200 px-3.75 py-3">
							Team
						</div>
					</div>
					{rows.map(({ label, color, abbr }, idx) => {
						const team = abbr ? teams[abbr] : undefined;
						return (
							<div role="row" className="contents" key={idx}>
								<div
									role="cell"
									className={cx(
										'bg-shade-100 flex items-center py-2.5 pr-3.75 pl-5 whitespace-nowrap',
										color
									)}
								>
									{label}
								</div>
								<div role="cell" className="bg-shade-100 flex min-h-13.5 items-center px-3.75 py-2.5">
									{team ? (
										<a
											href={`/events/${event.id}/teams/${slugify(team.name, { lower: true })}`}
											className="flex max-w-50 items-center gap-3"
										>
											<img src={team.logo} alt="" className="h-6.25 w-6.25 object-contain" />
											<div className="text-pb min-w-0 truncate leading-normal font-bold">
												{team.name}
												<div className="text-vlr-text-gray text-[11px] font-normal uppercase">
													{event.region}
												</div>
											</div>
										</a>
									) : (
										<span className="text-vlr-text-gray">TBD</span>
									)}
								</div>
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
};

export default Placements;
