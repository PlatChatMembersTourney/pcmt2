import slugify from 'slugify';
import type { Event, Match, TeamInfo } from '../../types/types.ts';
import { matches as allMatches } from '../../stores/matches.ts';
import { standings as allStandings } from '../../stores/standings.ts';
import { teams as allTeams } from '../../stores/teams.ts';
import { cx } from '../../utils/cx.ts';

const TARGET = 4; // wins to qualify, losses to be eliminated

type WinLoss = { w: number; l: number };
const recordText = ({ w, l }: WinLoss) => `${w}-${l}`;
const byRecord = (a: WinLoss, b: WinLoss) => b.w - a.w || a.l - b.l;

// Each team's starting record, from the GSL groups before this stage: 2 group wins (2-0 or 2-1) start 1-0,
// the rest start 0-1
const startRecords = (event: Event) => {
	const groups = event.stages.find((stage) => stage.format?.type === 'gsl')?.format?.groupNames ?? [];
	const start: { [abbr: string]: WinLoss } = {};
	for (const group of groups) {
		for (const row of allStandings[event.id][group] ?? []) {
			start[row.abbr] = row.matchW >= 2 ? { w: 1, l: 0 } : { w: 0, l: 1 };
		}
	}
	return start;
};

// Plays the stage's matches in date order: each match's round (the teams' n-th Swiss match) and the teams' records
// going into it, then everyone's record now. Swiss pairings are made round by round, so there's no layout file
const playSwiss = (matches: Match[], start: { [abbr: string]: WinLoss }) => {
	const records: { [abbr: string]: WinLoss } = {};
	const played: { [abbr: string]: number } = {};
	const record = (abbr: string) => (records[abbr] ??= { ...(start[abbr] ?? { w: 0, l: 0 }) });

	const games = [...matches]
		.sort((a, b) => a.date.localeCompare(b.date))
		.map((match) => {
			const round = Math.max(played[match.team1] ?? 0, played[match.team2] ?? 0) + 1;
			played[match.team1] = played[match.team2] = round;
			const before = [{ ...record(match.team1) }, { ...record(match.team2) }];
			if (match.completed) {
				const team1Won = match.score1 > match.score2;
				record(match.team1)[team1Won ? 'w' : 'l']++;
				record(match.team2)[team1Won ? 'l' : 'w']++;
			}
			return { match, round, before };
		});
	for (const abbr of Object.keys(start)) record(abbr);
	return { games, records };
};

type Game = ReturnType<typeof playSwiss>['games'][number];

// A match's pool: the record both teams share, or both records for a match between different records (e.g. "3-2 vs 2-3")
const poolName = ({ before: [a, b] }: Game) =>
	recordText(a) === recordText(b) ? recordText(a) : [a, b].sort(byRecord).map(recordText).join(' vs ');

// A small match box, like the bracket's: both teams and the score once played
const SwissMatch: React.FC<{ event: Event; match: Match; teams: { [abbr: string]: TeamInfo } }> = ({
	event,
	match,
	teams,
}) => (
	<a
		href={`/events/${event.id}/${slugify(match.id)}`}
		className="border-line hover:bg-vlr-gray-150 dark:hover:bg-vlr-gray-500 flex w-40 flex-col border-t first:border-t-0"
	>
		{[
			[match.team1, match.score1],
			[match.team2, match.score2],
		].map(([abbr, score], idx) => {
			const won = match.completed && score === Math.max(match.score1, match.score2);
			return (
				<div className="flex h-7 items-center gap-2 px-2 text-xs" key={idx}>
					<img src={teams[abbr]?.logo} alt="" className="h-4 w-4 object-contain" />
					<span className={cx('flex-1 truncate', won ? 'text-main font-bold' : 'text-muted')}>{abbr}</span>
					<span className={cx(won && 'text-main font-bold')}>{match.completed ? score : '-'}</span>
				</div>
			);
		})}
	</a>
);

// The whole stage before any Swiss matches exist: each round's pools as [record, matches, extra matches only played
// sometimes]. 16 teams starting 1-0 or 0-1, to 4 wins or losses - round 5 has five teams on 3-2 and five on 2-3, so
// one 3-2 team plays a 2-3 team. If the 2-3 team wins, both end on 3-3 and round 6 needs a third 3-3 match
const SKELETON: [string, number, number?][][] = [
	[
		['1-0', 4],
		['0-1', 4],
	],
	[
		['2-0', 2],
		['1-1', 4],
		['0-2', 2],
	],
	[
		['3-0', 1],
		['2-1', 3],
		['1-2', 3],
		['0-3', 1],
	],
	[
		['3-1', 2],
		['2-2', 3],
		['1-3', 2],
	],
	[
		['3-2', 2],
		['3-2 vs 2-3', 1],
		['2-3', 2],
	],
	[['3-3', 2, 1]],
];
// round 1's pairings come from the group results; after that it's whoever ends up on the record
const OPENING_SIDES: { [pool: string]: string[] } = {
	'1-0': ['Group 2-0', 'Group 2-1'],
	'0-1': ['Group 1-2', 'Group 0-2'],
};

// A match box for a pairing that isn't known yet, like the bracket's TBD rows
const PlaceholderMatch: React.FC<{ sides: string[]; faded?: boolean }> = ({ sides, faded }) => (
	<div className={cx('border-line flex w-40 flex-col border-t first:border-t-0', faded && 'opacity-50')}>
		{sides.map((side, idx) => (
			<div className="text-muted flex h-7 items-center gap-2 px-2 text-xs" key={idx}>
				<img src="/icons/vlr_team.png" alt="" className="h-4 w-4 object-contain" />
				<span className="flex-1 truncate">{side}</span>-
			</div>
		))}
	</div>
);

// A Swiss stage, like a Counter-Strike major's: each round's matches in pools by record, then the standings
// with every team's results round by round. Records start from the GSL groups
const SwissStage: React.FC<{ event: Event; stageName: string }> = ({ event, stageName }) => {
	const teams = allTeams[event.id];
	const start = startRecords(event);
	const { games, records } = playSwiss(
		allMatches[event.id].filter((match) => match.stage === stageName),
		start
	);
	const roundCount = games.length > 0 ? Math.max(...games.map((game) => game.round)) : 0;
	const rounds = Array.from({ length: roundCount }, (_, idx) => {
		const pools = new Map<string, Game[]>();
		for (const game of games.filter((game) => game.round === idx + 1)) {
			pools.set(poolName(game), [...(pools.get(poolName(game)) ?? []), game]);
		}
		// best record first
		return [...pools].sort(([, [a]], [, [b]]) => byRecord(a.before[0], b.before[0]));
	});

	const standings = Object.entries(records).sort(([, a], [, b]) => byRecord(a, b));
	const finished = (status: 'w' | 'l') => standings.filter(([, record]) => record[status] >= TARGET);
	const teamLink = (abbr: string) =>
		`/events/${event.id}/teams/${slugify(teams[abbr]?.name ?? abbr, { lower: true })}`;

	return (
		<div className="flex flex-col">
			<h2 className="section-label mb-3 ml-3">Swiss</h2>
			<div className="bg-vlr-gray-200 dark:bg-vlr-gray-600 overflow-x-auto p-4">
				<div className="flex w-max gap-6">
					{games.length === 0 &&
						SKELETON.map((pools, idx) => (
							<div className="flex flex-col gap-3" key={idx}>
								<p className="text-center text-xs font-bold">Round {idx + 1}</p>
								{pools.map(([name, count, ifNeeded = 0]) => (
									<div className="vlr-box-shadow bg-shade-100" key={name}>
										<p className="border-line text-subtle border-b px-2 py-1 text-center text-[11px] font-bold">
											{name}
										</p>
										{Array.from({ length: count + ifNeeded }, (_, n) => (
											<PlaceholderMatch
												sides={OPENING_SIDES[name] ?? ['TBD', 'TBD']}
												faded={n >= count}
												key={n}
											/>
										))}
										{ifNeeded > 0 && (
											<p className="border-line text-muted w-40 border-t px-2 py-1 text-[10px] leading-tight">
												The last match is only played if the 2-3 team wins round 5's 3-2 vs 2-3
											</p>
										)}
									</div>
								))}
							</div>
						))}
					{rounds.map((pools, idx) => (
						<div className="flex flex-col gap-3" key={idx}>
							<p className="text-center text-xs font-bold">Round {idx + 1}</p>
							{pools.map(([name, poolGames]) => (
								<div className="vlr-box-shadow bg-shade-100" key={name}>
									<p className="border-line text-subtle border-b px-2 py-1 text-center text-[11px] font-bold">
										{name}
									</p>
									{poolGames.map(({ match }) => (
										<SwissMatch event={event} match={match} teams={teams} key={match.id} />
									))}
								</div>
							))}
						</div>
					))}
					{/* teams that are out of the stage, either way */}
					{(['w', 'l'] as const).map((status) => (
						<div className="flex w-40 flex-col gap-3" key={status}>
							<p className="text-center text-xs font-bold">
								{status === 'w' ? 'Qualified' : 'Eliminated'}
							</p>
							<div
								className={cx(
									'vlr-box-shadow bg-shade-100 border-l-3',
									status === 'w' ? 'border-green-400' : 'border-red-400'
								)}
							>
								{finished(status).map(([abbr, record]) => (
									<a
										href={teamLink(abbr)}
										className="border-line flex h-7 items-center gap-2 border-t px-2 text-xs first:border-t-0"
										key={abbr}
									>
										<img src={teams[abbr]?.logo} alt="" className="h-4 w-4 object-contain" />
										<span className="flex-1 truncate">{abbr}</span>
										<span className="text-muted">{recordText(record)}</span>
									</a>
								))}
								{/* before any matches, a TBD for each of the 8 places */}
								{games.length === 0
									? Array.from({ length: 8 }, (_, n) => <PlaceholderMatch sides={['TBD']} key={n} />)
									: finished(status).length === 0 && (
											<p className="text-muted px-2 py-1.5 text-xs">-</p>
										)}
							</div>
						</div>
					))}
				</div>
			</div>
			<p className="text-muted mt-2 ml-3 text-xs">
				Teams start 1-0 (two wins in their group) or 0-1, and each round play a team on the same record.{' '}
				{TARGET} wins and you make the playoffs, {TARGET} losses and you're eliminated.
			</p>

			{/* the standings, once there are results to show */}
			{games.length > 0 && (
				<>
					<h2 className="section-label mt-6 mb-3 ml-3">Standings</h2>
					<div className="vlr-box-shadow max-w-full self-start overflow-x-auto">
						<table className="[&_td]:border-line [&_th]:border-line border-hidden text-xs [&_td]:border [&_th]:border">
							<thead className="text-subtle dark:bg-vlr-gray-700 h-9 bg-neutral-200 text-[10px] uppercase">
								<tr>
									<th className="px-3">#</th>
									<th className="px-3 text-left">Team</th>
									<th className="px-3 font-normal">Start</th>
									{rounds.map((_, idx) => (
										<th className="px-2 font-normal" key={idx}>
											R{idx + 1}
										</th>
									))}
									<th className="px-3 font-normal">Record</th>
								</tr>
							</thead>
							<tbody className="bg-shade-100 text-subtle">
								{standings.map(([abbr, record], rank) => (
									<tr key={abbr} className="h-11">
										<td
											className={cx(
												'border-l-3 px-3 text-center',
												record.w >= TARGET && 'border-l-green-400!',
												record.l >= TARGET && 'border-l-red-400!'
											)}
										>
											{rank + 1}
										</td>
										<td className="px-3">
											<a
												href={teamLink(abbr)}
												className="flex items-center gap-2 whitespace-nowrap"
											>
												<img
													src={teams[abbr]?.logo}
													alt=""
													className="h-6 w-6 object-contain"
												/>
												<span className="text-pb font-bold">{teams[abbr]?.name ?? abbr}</span>
											</a>
										</td>
										<td className="px-3 text-center">
											{recordText(start[abbr] ?? { w: 0, l: 0 })}
										</td>
										{/* each round: the opponent, green for a win and red for a loss */}
										{rounds.map((_, idx) => {
											const game = games.find(
												({ match, round }) =>
													round === idx + 1 && (match.team1 === abbr || match.team2 === abbr)
											);
											if (!game) return <td key={idx} />;
											const { match } = game;
											const opponent = match.team1 === abbr ? match.team2 : match.team1;
											const won = (match.team1 === abbr) === match.score1 > match.score2;
											return (
												<td
													key={idx}
													className={cx(
														'px-2 text-center',
														match.completed && (won ? 'bg-green-500/20' : 'bg-red-500/20')
													)}
												>
													<a
														href={`/events/${event.id}/${slugify(match.id)}`}
														title={`vs ${opponent}`}
													>
														<img
															src={teams[opponent]?.logo}
															alt={opponent}
															className="mx-auto h-5 w-5 object-contain"
														/>
													</a>
												</td>
											);
										})}
										<td className="text-main px-3 text-center font-bold">{recordText(record)}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</>
			)}
		</div>
	);
};

export default SwissStage;
