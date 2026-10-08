import { Fragment, useState } from 'react';
import type { CompletedMatch, Event, Player } from '../../types/types.ts';
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

interface StatStripProps {
	heading: string; // "Rating", or the map's name
	line: Player; // the player's stat line
	rounds: number; // rounds they played, for the Angus rating
	agents: string[];
	agentLabel: string;
	won?: boolean; // map strips: colours the map name green or red
	divider?: boolean; // border above the strip - off between map strips
}

// One strip of the player's stats under a match card: Toxic and Angus ratings, K / D / A, and agents
const StatStrip = ({ heading, line, rounds, agents, agentLabel, won, divider = true }: StatStripProps) => {
	const label = 'text-subtle text-[10px] leading-none font-bold uppercase';
	const unit = 'text-subtle ml-1 text-[10px] font-bold';
	return (
		// The striped edge (cool-border's ::after) gets a top border too, moved up onto the border row,
		// so the divider above reaches as far right as the stripes - ! because cool-border's CSS isn't layered
		// Rating and K / D / A have fixed widths so every strip's columns line up.
		// Phones: every column centred, and the strip grows to fit the agent icons (stacked under their label there)
		// Without the divider, the stripe runs the full height instead, so stripes of strips in a row join up
		<div
			className={cx(
				'bg-shade-200 text-muted cool-border cool-border-pb relative flex items-center gap-2.5 px-4 py-2 text-xs tabular-nums sm:gap-6 md:h-11 md:py-0 md:pl-37.5',
				divider
					? 'border-line after:border-line border-t after:-top-px! after:h-[calc(100%+1px)]! after:border-t'
					: 'after:top-0! after:h-full!'
			)}
		>
			<div className="flex w-23 flex-none flex-col gap-1">
				<span className={cx(label, won !== undefined && (won ? 'text-win' : 'text-red-500 dark:text-red-400'))}>
					{heading}
				</span>
				<span className="leading-none">
					{line['R1.0'].toFixed(2)}
					<span className={unit}>
						R<sup>T</sup>
					</span>
					<span className="ml-2">{angusRating(line, rounds).toFixed(2)}</span>
					<span className={unit}>
						R<sup>A</sup>
					</span>
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
				<span className={label}>{agentLabel}</span>
				<span className="flex h-6 items-center">
					{agents.length > 0
						? agents.map((agent) => (
								<img src={agentIcon(agent)} alt={agent} title={agent} className="h-6 w-6" key={agent} />
							))
						: '–'}
				</span>
			</div>
		</div>
	);
};

// The player's stats for one match, under its card - the whole match, then (with showMaps) each map they played
const PlayerMatchStats = ({ match, slug, showMaps }: { match: CompletedMatch; slug: string; showMaps: boolean }) => {
	const line = match.combinedStats.flatMap((team) => team.players).find((p) => playerSlug(p.Player) === slug);
	if (!line) return null;

	// The player's line on each map, with the rounds they played there
	const maps = match.mapDetails.flatMap((map) =>
		map.stats
			.flatMap((team) => team.players)
			.filter((p) => playerSlug(p.Player) === slug)
			.map((p) => {
				const team1 = map.stats.find((team) => team.players.includes(p))?.team === match.team1;
				return {
					name: map.name,
					line: p,
					rounds: p.Rounds ?? map.score1 + map.score2,
					won: team1 ? map.score1 > map.score2 : map.score2 > map.score1,
				};
			})
	);
	const agents = [...new Set(maps.flatMap(({ line }) => (line.Agent ? [line.Agent] : [])))];

	return (
		<>
			<StatStrip
				heading="Rating"
				line={line}
				rounds={maps.reduce((sum, map) => sum + map.rounds, 0)}
				agents={agents}
				agentLabel="Agents"
			/>
			{showMaps &&
				maps.map((map, i) => (
					<StatStrip
						heading={map.name}
						line={map.line}
						rounds={map.rounds}
						agents={map.line.Agent ? [map.line.Agent] : []}
						agentLabel="Agent"
						won={map.won}
						divider={i === 0}
						key={i}
					/>
				))}
		</>
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
	const [showMaps, setShowMaps] = useState(false);

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
							{showStats && (
								<button
									onClick={() => setShowMaps(!showMaps)}
									className={cx(
										'bg-shade-100 text-muted ml-2 cursor-pointer rounded-sm p-2 text-xs',
										showMaps ? 'font-bold' : 'font-normal'
									)}
								>
									Show Maps
								</button>
							)}
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
													{showStats && (
														<PlayerMatchStats
															match={match}
															slug={slug}
															showMaps={showMaps}
														/>
													)}
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
