import slugify from 'slugify';
import type { Event, MapAgentStats } from '../../types/types.ts';
import { agentStats as allAgentStats } from '../../stores/agentStats.ts';
import { teams as allTeams } from '../../stores/teams.ts';
import { agentIcon } from '../../utils/images.ts';
import { cx } from '../../utils/cx.ts';

const pctFormatter = new Intl.NumberFormat('en-US', {
	style: 'percent',
	maximumFractionDigits: 0,
});

// vlr's table look: one cell color, grid lines, and a thicker line under the header (plus our top stripe)
const TABLE_CLASSES =
	'vlr-box-shadow bg-shade-100 text-vlr-text-darker dark:text-vlr-text-white border-hidden text-[11px] [&_td]:border [&_td]:border-grid [&_th]:border [&_th]:border-grid [&_th]:border-b-2 [&_th]:border-b-grid-head';
// The stripe covers each header cell's top 3px, so header cells get 3px extra top padding to stay centered
const HEADER_CLASSES =
	'cool-border-top cool-border-pb text-faint relative text-[10px] font-bold uppercase after:top-0!';

// The map's first letter in a small box, then its name
const MapName = ({ name }: { name: string }) => (
	<span className="flex items-center gap-2 whitespace-nowrap">
		<span className="bg-vlr-text-dark rounded-xs px-1.5 text-xs leading-5 text-white">{name[0]}</span>
		{name}
	</span>
);

const AgentHeader = ({ agent }: { agent: string }) => (
	<th className={cx(HEADER_CLASSES, 'px-1 pt-[7px] pb-1')}>
		<img src={agentIcon(agent)} alt={agent} title={agent} className="mx-auto h-8 w-8" />
	</th>
);

// Pick rate as a heatmap square: red at 0%, teal at 100% (see .stat-color). null: no agents recorded
const PickCell = ({ pct }: { pct: number | null }) =>
	pct === null ? (
		<td className="min-w-10 text-center">–</td>
	) : (
		<td
			className="stat-color min-w-10 text-center"
			style={{ '--stat-h': Math.round(pct * 180) } as React.CSSProperties}
		>
			{pctFormatter.format(pct)}
		</td>
	);

const pickPct = (map: MapAgentStats, agent: string) =>
	map.recordedComps === 0 ? null : (map.agents.find((a) => a.agent === agent)?.pickPct ?? 0);

const EventAgentsPanel: React.FC<{ event: Event }> = ({ event }) => {
	const teams = allTeams[event.id];
	// most played maps first
	const maps = Object.entries(allAgentStats[event.id]).sort(([, a], [, b]) => b.mapsPlayed - a.mapsPlayed);

	if (maps.length === 0) {
		return <div className="text-main flex flex-col p-6">No stats yet. D:</div>;
	}

	// Every agent played at the event, most picked first
	const comps = new Map<string, number>();
	for (const [, map] of maps) {
		for (const { agent, comps: count } of map.agents) comps.set(agent, (comps.get(agent) ?? 0) + count);
	}
	const agents = [...comps].sort(([a, x], [b, y]) => y - x || a.localeCompare(b)).map(([agent]) => agent);

	// All maps: pick rates are out of the comps with agents recorded, like each map's.
	// The file has no round counts, so the atk/def win rates are weighted by maps played.
	const totalMaps = maps.reduce((sum, [, map]) => sum + map.mapsPlayed, 0);
	const totalRecorded = maps.reduce((sum, [, map]) => sum + map.recordedComps, 0);
	const weighted = (pct: (map: MapAgentStats) => number) =>
		maps.reduce((sum, [, map]) => sum + pct(map) * map.mapsPlayed, 0) / totalMaps;

	return (
		<div className="bg-shade-300 flex flex-col p-4 sm:p-6">
			<h2 className="mb-3 ml-4 text-[11px] leading-none font-bold text-red-400 uppercase">Pick Rates</h2>
			<div className="overflow-x-auto">
				<table className={TABLE_CLASSES}>
					<thead>
						<tr>
							<th className={cx(HEADER_CLASSES, 'px-3 pt-[3px] text-left')}>Map</th>
							<th className={cx(HEADER_CLASSES, 'px-3 pt-[3px] text-right')}>#</th>
							<th className={cx(HEADER_CLASSES, 'w-20 px-3 pt-[3px] text-right whitespace-nowrap')}>
								Atk Win
							</th>
							<th
								className={cx(
									HEADER_CLASSES,
									'border-r-grid-head w-20 border-r-2 px-3 pt-[3px] text-right whitespace-nowrap'
								)}
							>
								Def Win
							</th>
							{agents.map((agent) => (
								<AgentHeader agent={agent} key={agent} />
							))}
						</tr>
					</thead>
					<tbody>
						<tr className="[&>td]:border-b-grid-head h-[50px] font-bold [&>td]:border-b-2">
							<td className="px-3" />
							<td className="px-3 text-right">{totalMaps}</td>
							<td className="px-3 text-right">{pctFormatter.format(weighted((map) => map.atkPct))}</td>
							<td className="border-r-grid-head border-r-2 px-3 text-right">
								{pctFormatter.format(weighted((map) => map.defPct))}
							</td>
							{agents.map((agent) => (
								<PickCell
									pct={totalRecorded ? (comps.get(agent) ?? 0) / totalRecorded : null}
									key={agent}
								/>
							))}
						</tr>
						{maps.map(([name, map]) => (
							<tr key={name} className="h-[38px]">
								<td className="px-3">
									<MapName name={name} />
								</td>
								<td className="px-3 text-right">{map.mapsPlayed}</td>
								<td className="px-3 text-right">{pctFormatter.format(map.atkPct)}</td>
								<td className="border-r-grid-head border-r-2 px-3 text-right">
									{pctFormatter.format(map.defPct)}
								</td>
								{agents.map((agent) => (
									<PickCell pct={pickPct(map, agent)} key={agent} />
								))}
							</tr>
						))}
					</tbody>
				</table>
			</div>

			<h2 className="mt-6 mb-3 ml-4 text-[11px] leading-none font-bold text-red-400 uppercase">Agents By Map</h2>
			<div className="flex flex-col gap-4">
				{maps.map(([name, map]) => (
					<div key={name} className="overflow-x-auto">
						<table className={TABLE_CLASSES}>
							<thead>
								<tr>
									<th className={cx(HEADER_CLASSES, 'px-3 pt-[3px] text-left')}>
										<MapName name={name} />
									</th>
									{agents.map((agent) => (
										<AgentHeader agent={agent} key={agent} />
									))}
								</tr>
							</thead>
							<tbody>
								{Object.values(map.teams)
									.sort((a, b) => a.teamName.localeCompare(b.teamName))
									.map((team) => (
										<tr key={team.team} className="h-[42px]">
											<td className="py-1 pr-0 pl-3 font-bold">
												{teams[team.team] ? (
													<a
														href={`/events/${event.id}/teams/${slugify(teams[team.team].name, { lower: true })}`}
														className="flex items-center gap-3"
													>
														<img
															src={teams[team.team].logo}
															alt=""
															className="h-8 w-8 object-contain"
														/>
														<span className="w-30 truncate">{team.teamName}</span>
													</a>
												) : (
													<span className="block w-30 truncate">{team.teamName}</span>
												)}
											</td>
											{agents.map((agent) => (
												<td
													key={agent}
													className={cx(
														'min-w-10',
														team.agents.includes(agent) && 'bg-vlr-picked'
													)}
												/>
											))}
										</tr>
									))}
							</tbody>
						</table>
					</div>
				))}
			</div>
		</div>
	);
};

export default EventAgentsPanel;
