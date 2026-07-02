import type { TeamStats, Event } from '../../types/types.ts'
import { angusRating } from '../../utils/rating.ts'

interface StatsTableProps {
	agents: Record<string, Set<string>>
	event: Event
	teamStats: TeamStats[] // stats for 2 teams
	rounds: number
}

const pctFormatter = new Intl.NumberFormat('en-US', {
	style: 'percent',
	maximumFractionDigits: 0,
})

const StatsTable: React.FC<StatsTableProps> = (props: StatsTableProps) => {
	const { agents, teamStats, rounds, event } = props
	return (
		<div className="flex flex-col gap-4">
			{teamStats.map((team) => {
				return (
					<div className="overflow-x-auto pb-2">
						<table>
							<thead>
								<tr className="font-bold text-[11px] px-0.75 text-vlr-text-gray dark:text-vlr-text-white">
									<th></th>
									<th title="Agent"></th>
									<th title="Rating (Toxic)">
										R<sup>T</sup>
									</th>
									<th title="Rating (Angus)">
										R<sup>A</sup>
									</th>
									<th title="Average Combat Score">ACS</th>
									<th title="Kills">
										<div className="flex ml-1.25 justify-center">
											<p>K</p>
										</div>
									</th>
									<th title="Deaths">D</th>
									<th title="Assists">
										<p>A</p>
									</th>
									<th title="Kills - Deaths">
										<div className="flex ml-0.5 mr-1.25 justify-center">
											+/-
										</div>
									</th>
									<th title="Kill, Assist, Trade, Survive %">
										KAST
									</th>
									<th title="Average Damage per Round">
										ADR
									</th>
									<th title="Headshot %">HS%</th>
									<th title="First Kills">
										<div className="flex ml-1.25 justify-center">FK</div>
									</th>
									<th title="First Deaths">FD</th>
									<th title="First Kills - First Deaths">
										+/-
									</th>
								</tr>
							</thead>
							<tbody>
								{team.players.map((player) => {
									const a = [...agents[player.Player]]
									return (
										<tr className="text-vlr-text-dark dark:text-vlr-text-white text-[11px] px-0.75">
											<td className="flex gap-2 items-center bg-transparent! sm:w-25">
												<img
													src={
														event.region === 'na'
															? '/icons/flags/16/us.png'
															: '/icons/flags/16/eu.png'
													}
												/>
												<div className="flex flex-col items-start leading-snug">
													<p className="text-pb font-medium text-xs">
														{player.Player}
													</p>
													<p className="text-vlr-text-light">
														{team.team}
													</p>
												</div>
											</td>
											<td className="bg-transparent!">
												<div className="flex gap-1 justify-end w-20 mr-1.25">
													{a.map((agent) => {
														if (agent === 'KAY/O') {
															agent = 'KAYO'
														}
														return (
															<img
																src={`/agents/${agent}_icon.png`}
																className={
																	(a.length ===
																	1
																		? 'h-7 w-7'
																		: '') +
																	(a.length ===
																	2
																		? 'h-6 w-6'
																		: '') +
																	(a.length >=
																	3
																		? 'h-5 w-5'
																		: '')
																}
																key={agent}
															/>
														)
													})}
												</div>
											</td>
											<td>
												<div className="stats-cell mx-1.25">
													{player['R1.0'].toFixed(2)}
												</div>
											</td>
											<td>
												<div className="stats-cell mx-1.25">
													{angusRating(
														player,
														rounds
													).toFixed(2)}
												</div>
											</td>
											<td>
												<div className="stats-cell mx-1.25">
													{player.ACS}
												</div>
											</td>
											<td>
												<div className="stats-cell ml-1.25 rounded-r-none!">
													{player.K}
												</div>
											</td>
											<td>
												<div className="stats-cell px-0! rounded-none!">
													<span className="text-vlr-text-gray mr-1.75">
														/
													</span>
													{player.D}
													<span className="text-vlr-text-gray ml-1.75">
														/
													</span>
												</div>
											</td>
											<td>
												<div className="stats-cell rounded-l-none!">
													{player.A}
												</div>
											</td>
											<td>
												<div className="stats-cell ml-0.5 mr-1.25 w-8! font-medium flex justify-center">
													<span
														className={
															player.PlusMinus ===
															0
																? 'text-black dark:text-vlr-text-white'
																: player.PlusMinus >=
																	  0
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
													{pctFormatter.format(
														player.KAST
													)}
												</div>
											</td>
											<td>
												<div className="stats-cell mx-1.25">
													{player.ADR}
												</div>
											</td>
											<td>
												<div className="stats-cell mx-1.25">
													{pctFormatter.format(
														player['HS%']
													)}
												</div>
											</td>
											<td>
												<div className="stats-cell w-6! ml-1.25">
													{player.FK}
												</div>
											</td>
											<td>
												<div className="stats-cell w-6! mx-0.5">
													{player.FD}
												</div>
											</td>
											<td>
												<div className="stats-cell font-medium">
													<span
														className={
															player.PlusMinus2 ===
															0
																? 'text-black dark:text-vlr-text-white'
																: player.PlusMinus2 >=
																	  0
																	? 'text-green-600 dark:text-green-400'
																	: 'text-red-500 dark:text-red-400'
														}
													>
														{`${player.PlusMinus2 > 0 ? '+' : ''}${player.PlusMinus2}`}
													</span>
												</div>
											</td>
										</tr>
									)
								})}
							</tbody>
						</table>
					</div>
				)
			})}
		</div>
	)
}

export default StatsTable
