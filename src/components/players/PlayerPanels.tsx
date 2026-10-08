import { Fragment, useState } from 'react';
import type { CompletedMatch, Event } from '../../types/types.ts';
import { useUrlTab } from '../../utils/urlTab.ts';
import { useTimezone } from '../../utils/useTimezone.ts';
import { groupByDay } from '../../utils/datetime.ts';
import { playerSlug } from '../../utils/playerSlug.ts';
import { matches as allMatches } from '../../stores/matches.ts';
import { agentIcon } from '../../utils/images.ts';
import { angusRating } from '../../utils/rating.ts';
import { cx } from '../../utils/cx.ts';

import PlayerOverviewPanel from './PlayerOverviewPanel.tsx';
import MatchCard from '../matches/MatchCard.tsx';
import TabBar from '../events/TabBar.tsx';

// The player's line for one match, shown under its card: Toxic and Angus ratings, K / D / A, and the agents they played
const PlayerMatchStats = ({ match, slug }: { match: CompletedMatch; slug: string }) => {
	const line = match.combinedStats.flatMap((team) => team.players).find((p) => playerSlug(p.Player) === slug);
	if (!line) return null;

	// Rounds they played (for the Angus rating) and their agents, from the per-map stats
	let rounds = 0;
	const agents = new Set<string>();
	for (const map of match.mapDetails) {
		for (const team of map.stats) {
			for (const p of team.players) {
				if (playerSlug(p.Player) !== slug) continue;
				rounds += p.Rounds ?? map.score1 + map.score2;
				if (p.Agent) agents.add(p.Agent);
			}
		}
	}

	const label = 'text-subtle text-[10px] leading-none font-bold uppercase';
	const unit = 'text-subtle ml-1 text-[10px] font-bold';
	return (
		// The striped edge (cool-border's ::after) gets a top border too, moved up onto the border row,
		// so the divider above reaches as far right as the stripes - ! because cool-border's CSS isn't layered
		// Rating and K / D / A have fixed widths so every strip's columns line up.
		// Phones: every column centred, and the strip grows to fit the agent icons (stacked under their label there)
		<div className="bg-shade-200 border-line text-muted cool-border cool-border-pb after:border-line relative flex items-center gap-3 border-t px-4 py-2 text-xs tabular-nums after:-top-px! after:h-[calc(100%+1px)]! after:border-t sm:gap-6 md:h-11 md:py-0 md:pl-37.5">
			<div className="flex w-21 flex-none flex-col gap-1">
				<span className={label}>Rating</span>
				<span className="leading-none">
					{line['R1.0'].toFixed(2)}
					<span className={unit}>T</span>
					<span className="ml-3">{angusRating(line, rounds).toFixed(2)}</span>
					<span className={unit}>A</span>
				</span>
			</div>
			<div className="flex w-19 flex-none flex-col gap-1">
				<span className={label}>K / D / A</span>
				<span className="leading-none">
					{line.K} / {line.D} / {line.A}
				</span>
			</div>
			{/* Stacked like the others on phones (to fit 5 icons), label to the left of the icons from md up */}
			<div className="flex flex-col gap-1 md:flex-row md:items-center md:gap-1.5">
				<span className={label}>Agents</span>
				<span className="flex h-6 items-center">
					{agents.size > 0
						? [...agents].map((agent) => (
								<img src={agentIcon(agent)} alt={agent} title={agent} className="h-6 w-6" key={agent} />
							))
						: '–'}
				</span>
			</div>
		</div>
	);
};

interface PlayerPanelsProps {
	slug: string;
	events: Event[]; // every event the player was on a roster or played a match in
}

const PlayerPanels: React.FC<PlayerPanelsProps> = ({ slug, events }) => {
	const pages = ['Overview', 'Matches'];
	const [activeIdx, setActive] = useUrlTab('tab', pages);
	const active = pages[activeIdx];

	const timezone = useTimezone();
	const [showStats, setShowStats] = useState(false);

	// Every match the player has stats in
	const matches = events.flatMap((event) =>
		allMatches[event.id]
			.filter((match) => match.completed)
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
						<div>
							<button
								onClick={() => setShowStats(!showStats)}
								className={cx(
									'bg-shade-100 text-muted cursor-pointer rounded-sm p-2 text-xs',
									showStats ? 'font-bold' : 'font-normal'
								)}
							>
								Show Stats
							</button>
						</div>
						{matchesGrouped.map(({ date, items }) => {
							return (
								<div className="flex flex-col" key={date}>
									<h2 className="mb-3 ml-3 text-[11px] leading-none font-bold text-red-400 uppercase">
										{date}
									</h2>
									<div className="vlr-box-shadow flex flex-col">
										{items.map(({ match, event }) => {
											return (
												<Fragment key={match.id}>
													<MatchCard
														match={match}
														event={event}
														addlClass="not-first:border-t-1 border-t-line!"
													/>
													{showStats && <PlayerMatchStats match={match} slug={slug} />}
												</Fragment>
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
