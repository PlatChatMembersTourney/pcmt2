import type { Standing, TeamInfo, Event } from '../../types/types.ts';
import slugify from 'slugify';

interface GroupStandingsBoxProps {
	standings: Standing[];
	teamColors: {
		number: number;
		color: string;
	}[];
	name: string;
	region: string;
	teams: Record<string, TeamInfo>;
	event: Event;
}

const GroupStandingsBox: React.FC<GroupStandingsBoxProps> = (props) => {
	const { standings, teamColors, name, region, teams, event } = props;

	// convert teamColors into an array of colors
	const colors: string[] = [];
	for (let i = 0; i < teamColors.length; i++) {
		const color = teamColors[i].color;
		for (let j = 0; j < teamColors[i].number; j++) {
			colors.push(color);
		}
	}

	return (
		<table className="[&_th]:dark:border-vlr-border-gray [&_th]:border-vlr-border-light [&_td]:dark:border-vlr-border-gray [&_td]:border-vlr-border-light vlr-box-shadow overflow-x-auto border-hidden [&_td]:border [&_th]:border">
			<thead className="dark:bg-vlr-gray-700 dark:text-vlr-text-white h-9 border-collapse bg-neutral-200 text-[10px] text-[#888]">
				<th className="h-9 px-3 text-left text-[11px] font-bold">{name}</th>
				<th className="px-3 font-normal uppercase">REC</th>
				<th className="px-3 font-normal uppercase">MAP</th>
				<th className="px-3 font-normal uppercase">RND</th>
				<th className="px-3 font-normal uppercase">Δ</th>
			</thead>

			<tbody className="dark:text-vlr-text-white bg-vlr-gray-100 dark:bg-vlr-gray-600 text-[11px] text-[#888]">
				{standings.map((standing, index) => {
					return (
						<tr key={index}>
							<td className="h-13 w-full">
								<div
									className={`${
										{
											yellow: 'border-yellow-400',
											red: 'border-red-400',
											green: 'border-green-400',
										}[colors[index]]
									} flex h-full items-center gap-3 border-l-3 px-3 pl-3`}
								>
									<div className="flex h-6.25 w-6.25 items-center justify-center">
										<img
											className="h-full w-full object-contain"
											src={teams[standing.abbr].logo}
											alt={standing.name}
										/>
									</div>
									<div className="min-w-0 flex-col overflow-hidden">
										<a
											href={`/events/${event.id}/teams/${slugify(standing.name, { lower: true })}`}
											className="text-pb min-w-0 overflow-hidden text-xs font-bold text-ellipsis whitespace-nowrap"
										>
											{standing.name}
										</a>
										<p className="text-[10px] font-normal text-nowrap uppercase">{region}</p>
									</div>
								</div>
							</td>
							<td className="px-3 text-center whitespace-nowrap">
								<span className="dark:text-vlr-text-white font-bold text-black">{standing.matchW}</span>{' '}
								-{' '}
								<span className="dark:text-vlr-text-white font-bold text-black">{standing.matchL}</span>
							</td>
							<td className="px-3 text-center whitespace-nowrap">
								<p>
									<span className="dark:text-vlr-text-white text-black">{standing.mapW}</span> /{' '}
									<span className="dark:text-vlr-text-white text-black">{standing.mapL}</span>
								</p>
							</td>
							<td className="px-2 text-center whitespace-nowrap">
								<span className="dark:text-vlr-text-white text-black">{standing.rndW}</span> /{' '}
								<span className="dark:text-vlr-text-white text-black">{standing.rndL}</span>
							</td>
							<td
								className={
									'px-3 text-center ' +
									(standing.rndDiff > 0
										? ' text-green-500 dark:text-green-300'
										: standing.rndDiff < 0
											? 'text-red-500 dark:text-red-300'
											: '')
								}
							>
								{standing.rndDiff > 0 ? '+' : ''}
								{standing.rndDiff}
							</td>
						</tr>
					);
				})}
			</tbody>
		</table>
	);
};

export default GroupStandingsBox;
