import { useState } from 'react';
import slugify from 'slugify';
import type { Event, Match, Player } from '../../types/types.ts';
import { teams as allTeams } from '../../stores/teams.ts';
import { angusRating, toxicRating } from '../../utils/rating.ts';
import { cx } from '../../utils/cx.ts';
import { playerSlug } from '../../utils/playerSlug.ts';
import PlayerAgentTable, { type AgentRow } from './PlayerAgentTable.tsx';

interface PlayerOverviewPanelProps {
	slug: string;
	events: Event[];
	matches: { match: Match; event: Event }[];
}

const DAY = 24 * 60 * 60 * 1000;
const timespans: Record<string, number> = { '30d': 30, '60d': 60, '90d': 90, All: Infinity };

// One agent's (or "All") totals - ACS, KAST, ADR and HS% are summed per round, then divided by rounds at the end
type Totals = Omit<AgentRow, 'usePct' | 'Toxic' | 'Angus'>;

const newTotals = (agent: string): Totals => ({
	agent,
	MP: 0,
	Rounds: 0,
	K: 0,
	D: 0,
	A: 0,
	FK: 0,
	FD: 0,
	ACS: 0,
	KAST: 0,
	ADR: 0,
	'HS%': 0,
	KMAX: 0,
});

const addMap = (totals: Totals, player: Player, rounds: number) => {
	totals.MP += 1;
	totals.Rounds += rounds;
	for (const key of ['K', 'D', 'A', 'FK', 'FD'] as const) totals[key] += player[key];
	for (const key of ['ACS', 'KAST', 'ADR', 'HS%'] as const) totals[key] += player[key] * rounds;
	totals.KMAX = Math.max(totals.KMAX, player.K);
};

const toRow = (totals: Totals, usePct: number | null): AgentRow => {
	const { Rounds } = totals;
	const row = {
		...totals,
		ACS: totals.ACS / Rounds,
		KAST: totals.KAST / Rounds,
		ADR: totals.ADR / Rounds,
		'HS%': totals['HS%'] / Rounds,
	};
	return { ...row, usePct, Toxic: toxicRating(row, Rounds), Angus: angusRating(row, Rounds) };
};

const PlayerOverviewPanel: React.FC<PlayerOverviewPanelProps> = ({ slug, events, matches }) => {
	const [timespan, setTimespan] = useState('All');
	const [showSubs, setShowSubs] = useState(false);
	const [includeSubs, setIncludeSubs] = useState(true);
	const [hiddenEvents, setHiddenEvents] = useState<string[]>([]); // event ids toggled off in the Agents filter

	// Every team the player was on (roster) or played for (e.g. as a sub), newest event first - not showmatch teams
	const playerTeams = [...events].reverse().flatMap((event) => {
		if (event.showmatch) return [];
		const teams = allTeams[event.id];
		const roster = Object.keys(teams).filter((abbr) => teams[abbr].players.some((p) => playerSlug(p) === slug));
		const played = matches
			.filter((m) => m.event.id === event.id)
			.flatMap(({ match }) => match.combinedStats)
			.filter((team) => team.players.some((p) => playerSlug(p.Player) === slug))
			.map((team) => team.team);
		return [...new Set([...roster, ...played])].map((abbr) => ({
			event,
			team: teams[abbr],
			sub: !roster.includes(abbr),
		}));
	});

	const shownTeams = showSubs ? playerTeams : playerTeams.filter(({ sub }) => !sub);

	// Subbing: playing for a team whose roster they aren't on
	const isSub = (event: Event, abbr: string) =>
		!allTeams[event.id][abbr]?.players.some((player) => playerSlug(player) === slug);

	// The player's totals on each agent, and across every map ("All", which includes maps with no agent recorded)
	const cutoff = Date.now() - timespans[timespan] * DAY; // -Infinity for All
	const playedEvents = events.filter((event) => matches.some((m) => m.event.id === event.id));
	const all = newTotals('All');
	const byAgent = new Map<string, Totals>();
	for (const { match, event } of matches) {
		if (new Date(match.date).getTime() < cutoff || hiddenEvents.includes(event.id)) continue;
		for (const map of match.mapDetails) {
			for (const team of map.stats) {
				if (!includeSubs && isSub(event, team.team)) continue;
				for (const player of team.players) {
					if (playerSlug(player.Player) !== slug) continue;
					const rounds = player.Rounds ?? map.score1 + map.score2;
					addMap(all, player, rounds);
					if (!player.Agent) continue;
					if (!byAgent.has(player.Agent)) byAgent.set(player.Agent, newTotals(player.Agent));
					addMap(byAgent.get(player.Agent)!, player, rounds);
				}
			}
		}
	}
	// Most played first until the table is sorted. Use % is out of the maps with an agent recorded
	const agents = [...byAgent.values()].sort((a, b) => b.MP - a.MP || b.Rounds - a.Rounds);
	const agentMaps = agents.reduce((sum, totals) => sum + totals.MP, 0);
	const rows = [toRow(all, null), ...agents.map((totals) => toRow(totals, totals.MP / agentMaps))];

	return (
		<div className="bg-shade-300 flex flex-col p-4 sm:p-6">
			<div className="mb-3 ml-4 flex items-center justify-between">
				<h2 className="text-[11px] leading-none font-bold text-red-400 uppercase">Teams</h2>
				<button
					onClick={() => setShowSubs(!showSubs)}
					className={cx(
						'bg-shade-100 text-muted cursor-pointer rounded-sm p-2 text-xs',
						showSubs ? 'font-bold' : 'font-normal'
					)}
				>
					Show Subs ({playerTeams.filter(({ sub }) => sub).length})
				</button>
			</div>
			{shownTeams.length === 0 && <div className="text-muted text-sm">Only played as a sub.</div>}
			<div className="vlr-box-shadow bg-shade-100 flex flex-col">
				{shownTeams.map(({ event, team, sub }) => (
					<a
						href={`/events/${event.id}/teams/${slugify(team.name, { lower: true })}`}
						className="border-line hover:bg-vlr-gray-150 dark:hover:bg-vlr-gray-500 flex items-center gap-5 px-5 py-[15px] text-xs not-first:border-t"
						key={`${event.id}-${team.abbr}`}
					>
						<img src={team.logo} alt="" className="h-10 w-10 object-contain" />
						<div className="flex flex-col leading-[1.45]">
							<span className="text-main font-medium">{team.name}</span>
							<span className="text-vlr-text-gray">
								{event.name}
								{sub && ' · Sub'}
							</span>
						</div>
					</a>
				))}
			</div>

			<div className="mt-6 mb-3 ml-4 flex items-end justify-between gap-2">
				{/* as tall as the Include Subs row, so it's centered on that row when the filters wrap */}
				<h2 className="flex h-8 items-center text-[11px] leading-none font-bold text-red-400 uppercase">
					Agents
				</h2>
				{/* Events filter: next to the other filters, or above them when there isn't room */}
				<div className="flex flex-col items-end gap-2 md:flex-row md:items-center md:gap-4">
					<div className="text-faint flex flex-wrap items-center justify-end gap-1 text-[10px]">
						<span className="mr-1 font-bold uppercase">Events:</span>
						{playedEvents.map((event) => (
							<button
								className={cx(
									'cursor-pointer rounded-xs px-1 py-0.5',
									hiddenEvents.includes(event.id) ? 'text-pb' : 'bg-vlr-text-dark text-white'
								)}
								onClick={() =>
									setHiddenEvents((hidden) =>
										hidden.includes(event.id)
											? hidden.filter((id) => id !== event.id)
											: [...hidden, event.id]
									)
								}
								key={event.id}
							>
								{event.shortName}
							</button>
						))}
					</div>
					<div className="text-faint flex items-center gap-1 text-[10px]">
						<button
							onClick={() => setIncludeSubs(!includeSubs)}
							className={cx(
								'bg-shade-100 text-muted mr-3 cursor-pointer rounded-sm p-2 text-xs',
								includeSubs ? 'font-bold' : 'font-normal'
							)}
						>
							Include Subs
						</button>
						<span className="mr-1 font-bold uppercase">Past:</span>
						{Object.keys(timespans).map((option) => (
							<button
								className={cx(
									'cursor-pointer rounded-xs px-1 py-0.5',
									option === timespan ? 'bg-vlr-text-dark text-white' : 'text-pb'
								)}
								onClick={() => setTimespan(option)}
								key={option}
							>
								{option}
							</button>
						))}
					</div>
				</div>
			</div>
			{all.MP === 0 ? (
				<img src={'/res/revealed_no_one.gif'} className="max-w-160" />
			) : (
				<PlayerAgentTable rows={rows} />
			)}
		</div>
	);
};

export default PlayerOverviewPanel;
