import type { TeamStats, Event, Flags } from '../../types/types.ts';
import { angusRating } from '../../utils/rating.ts';
import CustomPopover from '../CustomPopover.tsx';
import { agentIcon, playerFlag } from '../../utils/images.ts';

interface StatsTableProps {
	agents: Record<string, Set<string>>;
	event: Event;
	teamStats: TeamStats[]; // stats for 2 teams
	rounds: number | Record<string, number>;
}

const pctFormatter = new Intl.NumberFormat('en-US', {
	style: 'percent',
	maximumFractionDigits: 0,
});

const StatsTable: React.FC<StatsTableProps> = (props: StatsTableProps) => {
	const { agents, teamStats, rounds, event } = props;
	return (
		<div className="flex flex-col gap-4">
			{teamStats.map((team, i) => {
				return (
					<div className="overflow-x-auto pb-2" key={i}>
						<table>
							<thead>
								<tr className="text-vlr-text-gray dark:text-vlr-text-white px-0.75 text-[11px] font-bold">
									<th></th>
									<th title="Agent"></th>
									<th>
										<CustomPopover
											side={'top'}
											content={
												<div className="text-vlr-text-dark dark:text-vlr-text-light flex flex-col text-xs">
													<p className="mb-1">
														I say "toxic", but really it's stolen (with some tweaks).
													</p>

													<p>Specifically, from Mark Zhdan's </p>
													<a
														href="https://www.markzhdan.com/blogs/reverse-engineering-vlr-rating"
														className="mb-2 underline"
													>
														attempt to reverse engineer VLR's Rating 2.0.
													</a>

													<p className="mb-1">The formula:</p>
													<p className="text-black dark:text-white">
														0.898 * KPR + 0.228 * APR + 0.0025 * ADRa
													</p>
													<p className="mb-1 text-black dark:text-white">
														+ 0.313 * KAST + 0.295
													</p>
													<p>(ADRa = [(ADR * Rounds) - (140 * Kills)] / Rounds)</p>
												</div>
											}
											title={"Toxic's Rating"}
										>
											<span className="border-vlr-text-dark dark:border-vlr-text-light border-b-2 border-dotted px-0.5">
												R<sup>T</sup>
											</span>
										</CustomPopover>
									</th>
									<th>
										<CustomPopover
											side={'top'}
											content={
												<div className="text-vlr-text-dark dark:text-vlr-text-light flex flex-col text-xs">
													<p>Adjusted version of VLR rating version 1.0.</p>
													<p className="mb-1">(So like a 1.5, according to Angus.)</p>

													<p className="mb-1">The formula:</p>
													<p className="text-black dark:text-white">
														1.26 * KPR - 0.13 * DPR + 0.55 * APR
													</p>
													<p className="text-black dark:text-white">
														+ 0.25 * FKPR - 0.26 * FDPR
													</p>
												</div>
											}
											title={"Angus's Rating"}
										>
											<span className="border-vlr-text-dark dark:border-vlr-text-light border-b-2 border-dotted px-0.5">
												R<sup>A</sup>
											</span>
										</CustomPopover>
									</th>
									<th>
										<CustomPopover
											side={'top'}
											content={
												<div className="text-vlr-text-dark dark:text-vlr-text-light flex flex-col text-xs">
													<p>You know it, you love it:</p>
													<p className="mb-1">Valorant's very own ACS.</p>

													<p className="mb-1">In case you forgot how to calculate it:</p>
													<p className="text-black dark:text-white">
														Combat Score: 1 pt / damage dealt,
													</p>
													<p className="text-black dark:text-white">
														150/130/110/90/70 pts/kill based on enemies alive,
													</p>
													<p className="mb-1 text-black dark:text-white">
														+50 per additional kill, +25 for non-damaging assists
													</p>
													<p className="text-black dark:text-white">
														ACS = Average combat score across all rounds
													</p>
												</div>
											}
											title={'Average Combat Score'}
										>
											<span className="border-vlr-text-dark dark:border-vlr-text-light border-b-2 border-dotted px-0.5">
												ACS
											</span>
										</CustomPopover>
									</th>
									<th title="Kills">
										<div className="ml-1.25 flex justify-center">
											<p>K</p>
										</div>
									</th>
									<th title="Deaths">D</th>
									<th title="Assists">
										<p>A</p>
									</th>
									<th title="Kills - Deaths">
										<div className="mr-1.25 ml-0.5 flex justify-center">+/-</div>
									</th>
									<th title="Kill, Assist, Trade, Survive %">KAST</th>
									<th title="Average Damage per Round">ADR</th>
									<th title="Headshot %">HS%</th>
									<th title="First Kills">
										<div className="ml-1.25 flex justify-center">FK</div>
									</th>
									<th title="First Deaths">FD</th>
									<th title="First Kills - First Deaths">+/-</th>
								</tr>
							</thead>
							<tbody>
								{team.players.map((player) => {
									const a = [...agents[player.Player]];
									const pRounds = typeof rounds === 'number' ? rounds : rounds[player.Player];
									return (
										<tr
											className="text-vlr-text-dark dark:text-vlr-text-white px-0.75 text-[11px]"
											key={player.Player}
										>
											<td className="flex h-10 items-center gap-2 bg-transparent! sm:w-25">
												<img src={playerFlag(player.Player, event.id, event.region)} />
												<div className="flex flex-col items-start leading-snug">
													<p className="text-pb text-xs font-medium">{player.Player}</p>
													<p className="text-vlr-text-light">{team.team}</p>
												</div>
											</td>
											<td className="bg-transparent!">
												<div className="mr-1.25 flex w-20 justify-end gap-1">
													{a.map((agent) => {
														return (
															<img
																src={agentIcon(agent)}
																className={
																	(a.length === 1 ? 'h-7 w-7' : '') +
																	(a.length === 2 ? 'h-6 w-6' : '') +
																	(a.length >= 3 ? 'h-5 w-5' : '')
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
													<span
														className={
															player.PlusMinus === 0
																? 'dark:text-vlr-text-white text-black'
																: player.PlusMinus >= 0
																	? 'text-green-600 dark:text-green-400'
																	: 'text-red-500 dark:text-red-400'
														}
													>
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
													<span
														className={
															player.PlusMinus2 === 0
																? 'dark:text-vlr-text-white text-black'
																: player.PlusMinus2 >= 0
																	? 'text-green-600 dark:text-green-400'
																	: 'text-red-500 dark:text-red-400'
														}
													>
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
