import type { Event } from '../../types/types.ts';
import { useUrlTab } from '../../utils/urlTab.ts';
import { useTimezone } from '../../utils/useTimezone.ts';
import { groupByDay } from '../../utils/datetime.ts';
import { playerSlug } from '../../utils/playerSlug.ts';
import { matches as allMatches } from '../../stores/matches.ts';

import PlayerOverviewPanel from './PlayerOverviewPanel.tsx';
import MatchCard from '../matches/MatchCard.tsx';
import TabBar from '../events/TabBar.tsx';

interface PlayerPanelsProps {
	slug: string;
	events: Event[]; // every event the player was on a roster or played a match in
}

const PlayerPanels: React.FC<PlayerPanelsProps> = ({ slug, events }) => {
	const pages = ['Overview', 'Matches'];
	const [activeIdx, setActive] = useUrlTab('tab', pages);
	const active = pages[activeIdx];

	const timezone = useTimezone();

	// Every match the player has stats in
	const matches = events.flatMap((event) =>
		allMatches[event.id]
			.filter((match) =>
				match.combinedStats.some((team) => team.players.some((player) => playerSlug(player.Player) === slug))
			)
			.map((match) => ({ date: match.date, match, event }))
	);
	const matchesGrouped = groupByDay(matches, timezone).reverse();

	return (
		<div className="flex flex-col">
			<TabBar
				tabs={pages}
				active={active}
				onSelect={(tab) => setActive(pages.indexOf(tab))}
				matchCount={matches.length}
				arrowFill="fill-shade-300"
			/>

			{active === 'Overview' && <PlayerOverviewPanel slug={slug} events={events} matches={matches} />}
			{active === 'Matches' &&
				(matchesGrouped.length > 0 ? (
					<div className="bg-shade-300 text-main mx-4 flex flex-col gap-7.5 py-6 sm:mx-6">
						{matchesGrouped.map(({ date, items }) => {
							return (
								<div className="flex flex-col" key={date}>
									<h2 className="mb-3 ml-3 text-[11px] leading-none font-bold text-red-400 uppercase">
										{date}
									</h2>
									<div className="vlr-box-shadow flex flex-col">
										{items.map(({ match, event }) => {
											return (
												<MatchCard
													match={match}
													event={event}
													addlClass="not-first:border-t-1 border-t-line!"
													key={match.id}
												/>
											);
										})}
									</div>
								</div>
							);
						})}
					</div>
				) : (
					<div className="bg-shade-300 text-main mx-4 h-full py-6 sm:mx-6">
						<div>
							<img src={'/res/exist.png'} />
						</div>
					</div>
				))}
		</div>
	);
};

export default PlayerPanels;
