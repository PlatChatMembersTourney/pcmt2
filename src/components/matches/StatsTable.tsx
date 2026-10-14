import { useState } from 'react';
import type { TeamStats, Event, Player } from '../../types/types.ts';
import { angusRating } from '../../utils/rating.ts';
import { AcsHeader, AngusHeader, ToxicHeader } from '../stats/RatingHeaders.tsx';
import { agentIcon, playerFlag } from '../../utils/images.ts';
import { playerSlug } from '../../utils/playerSlug.ts';
import { cx } from '../../utils/cx.ts';
import { pctFormatter } from '../../utils/format.ts';

// Green when positive, red when negative
const plusMinusColor = (value: number) =>
	value === 0 ? 'text-main' : value > 0 ? 'text-win' : 'text-red-500 dark:text-red-400';

interface StatsTableProps {
	agents: Record<string, Set<string>>;
	event: Event;
	teamStats: TeamStats[]; // stats for 2 teams
	rounds: number | Record<string, number>;
}

// What each sortable column sorts by
const sortValues: Record<string, (player: Player, rounds: number) => number> = {
	Toxic: (p) => p['R1.0'],
	Angus: (p, rounds) => angusRating(p, rounds),
	ACS: (p) => p.ACS,
	K: (p) => p.K,
	D: (p) => p.D,
	A: (p) => p.A,
	PlusMinus: (p) => p.PlusMinus,
	KAST: (p) => p.KAST,
	ADR: (p) => p.ADR,
	HS: (p) => p['HS%'],
	FK: (p) => p.FK,
	FD: (p) => p.FD,
	PlusMinus2: (p) => p.PlusMinus2,
};

const StatsTable: React.FC<StatsTableProps> = (props: StatsTableProps) => {
	const { agents, teamStats, rounds, event } = props;
	// Each team's sort (by team index): a column of sortValues, highest first unless !desc - not saved
	const [sorts, setSorts] = useState<Record<number, { column: string; desc: boolean }>>({});
	const roundsOf = (player: Player) => (typeof rounds === 'number' ? rounds : rounds[player.Player]);
	return (
		<div className="flex flex-col gap-4">
			{teamStats.map((team, i) => {
				const sort = sorts[i];
				const players = sort
					? [...team.players].sort(
							(a, b) =>
								(sortValues[sort.column](b, roundsOf(b)) - sortValues[sort.column](a, roundsOf(a))) *
								(sort.desc ? 1 : -1)
						)
					: team.players;
				// Click to sort by the column, highest first - click again for lowest first. The sorted header is brighter
				const sortable = (column: string) => ({
					onClick: () => setSorts({ ...sorts, [i]: { column, desc: sort?.column !== column || !sort.desc } }),
					className: cx('cursor-pointer', sort?.column === column && 'text-bright'),
				});
				return (
					<div className="overflow-x-auto pb-2" key={i}>
						<table>
							<thead>
								<tr className="text-subtle px-0.75 text-[11px] font-bold">
									<th></th>
									<th title="Agent"></th>
									<th {...sortable('Toxic')}>
										<ToxicHeader
											label={
												<>
													R<sup>T</sup>
												</>
											}
											side="top"
										/>
									</th>
									<th {...sortable('Angus')}>
										<AngusHeader
											label={
												<>
													R<sup>A</sup>
												</>
											}
											side="top"
										/>
									</th>
									<th {...sortable('ACS')}>
										<AcsHeader side="top" />
									</th>
									<th title="Kills" {...sortable('K')}>
										<div className="ml-1.25 flex justify-center">
											<p>K</p>
										</div>
									</th>
									<th title="Deaths" {...sortable('D')}>
										D
									</th>
									<th title="Assists" {...sortable('A')}>
										<p>A</p>
									</th>
									<th title="Kills - Deaths" {...sortable('PlusMinus')}>
										<div className="mr-1.25 ml-0.5 flex justify-center">+/-</div>
									</th>
									<th title="Kill, Assist, Trade, Survive %" {...sortable('KAST')}>
										KAST
									</th>
									<th title="Average Damage per Round" {...sortable('ADR')}>
										ADR
									</th>
									<th title="Headshot %" {...sortable('HS')}>
										HS%
									</th>
									<th title="First Kills" {...sortable('FK')}>
										<div className="ml-1.25 flex justify-center">FK</div>
									</th>
									<th title="First Deaths" {...sortable('FD')}>
										FD
									</th>
									<th title="First Kills - First Deaths" {...sortable('PlusMinus2')}>
										+/-
									</th>
								</tr>
							</thead>
							<tbody>
								{players.map((player) => {
									const a = [...agents[player.Player]];
									const pRounds = roundsOf(player);
									return (
										<tr className="text-muted px-0.75 text-[11px]" key={player.Player}>
											<td className="flex h-10 items-center gap-2 bg-transparent! sm:w-25">
												<img src={playerFlag(player.Player, event.id, event.region)} />
												<div className="flex flex-col items-start leading-snug">
													<a
														href={`/players/${playerSlug(player.Player)}`}
														className="text-pb text-xs font-medium text-nowrap"
													>
														{player.Player}
													</a>
													<p className="text-vlr-text-light text-nowrap">{team.team}</p>
												</div>
											</td>
											<td className="bg-transparent!">
												<div className="mr-1.25 flex w-20 justify-end gap-1">
													{a.map((agent) => {
														return (
															<img
																src={agentIcon(agent)}
																className={
																	a.length === 1
																		? 'h-7 w-7'
																		: a.length === 2
																			? 'h-6 w-6'
																			: 'h-5 w-5'
																}
																key={agent}
															/>
														);
													})}
												</div>
											</td>
											<td>
												<div className="stats-cell mx-1.25">{player['R1.0'].toFixed(2)}</div>
											</td>
											<td>
												<div className="stats-cell mx-1.25">
													{angusRating(player, pRounds).toFixed(2)}
												</div>
											</td>
											<td>
												<div className="stats-cell mx-1.25">{Math.round(player.ACS)}</div>
											</td>
											<td>
												<div className="stats-cell ml-1.25 rounded-r-none!">{player.K}</div>
											</td>
											<td>
												<div className="stats-cell rounded-none! px-0!">
													<span className="text-vlr-text-gray mr-1.75">/</span>
													{player.D}
													<span className="text-vlr-text-gray ml-1.75">/</span>
												</div>
											</td>
											<td>
												<div className="stats-cell rounded-l-none!">{player.A}</div>
											</td>
											<td>
												<div className="stats-cell mr-1.25 ml-0.5 flex w-8! justify-center font-medium">
													<span className={plusMinusColor(player.PlusMinus)}>
														{`${player.PlusMinus > 0 ? '+' : ''}${player.PlusMinus}`}
													</span>
												</div>
											</td>
											<td>
												<div className="stats-cell mx-1.25">
													{pctFormatter.format(player.KAST)}
												</div>
											</td>
											<td>
												<div className="stats-cell mx-1.25">{Math.round(player.ADR)}</div>
											</td>
											<td>
												<div className="stats-cell mx-1.25">
													{pctFormatter.format(player['HS%'])}
												</div>
											</td>
											<td>
												<div className="stats-cell ml-1.25 w-6!">{player.FK}</div>
											</td>
											<td>
												<div className="stats-cell mx-0.5 w-6!">{player.FD}</div>
											</td>
											<td>
												<div className="stats-cell font-medium">
													<span className={plusMinusColor(player.PlusMinus2)}>
														{`${player.PlusMinus2 > 0 ? '+' : ''}${player.PlusMinus2}`}
													</span>
												</div>
											</td>
										</tr>
									);
								})}
							</tbody>
						</table>
					</div>
				);
			})}
		</div>
	);
};

export default StatsTable;
