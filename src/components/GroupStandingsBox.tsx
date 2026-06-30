import type { Standing, TeamInfo } from '../types/types.ts'
import { $teams } from '../stores/store.ts'
import { useStore } from '@nanostores/react'

interface GroupStandingsBoxProps {
	standings: Standing[];
	teamColors: {
		number: number
		color: string
	}[];
	name: string;
	region: string;
	teams: Record<string, TeamInfo>;
}

const GroupStandingsBox: React.FC<GroupStandingsBoxProps> = (props   ) => {
	const {
		standings, teamColors, name, region, teams
	} = props;

	// convert teamColors into an array of colors
	const colors: string[] = [];
	for (let i = 0; i < teamColors.length; i++) {
		const color = teamColors[i].color;
		for(let j = 0; j < teamColors[i].number; j++) {
			colors.push(color);
		}
	}

	return (
		<table
			className="[&_th]:border [&_td]:border [&_th]:dark:border-vlr-border-gray [&_th]:border-vlr-border-light
		[&_td]:dark:border-vlr-border-gray [&_td]:border-vlr-border-light vlr-box-shadow border-hidden overflow-x-auto"
		>
			<thead className="h-9 bg-neutral-200 dark:bg-vlr-gray-700 text-[10px] text-[#888] dark:text-vlr-text-white border-collapse">
				<th className="font-bold px-3 text-[11px] text-left">
					{name}
				</th>
				<th className="font-normal uppercase px-3">REC</th>
				<th className="font-normal uppercase px-3">MAP</th>
				<th className="font-normal uppercase px-3">RND</th>
				<th className="font-normal uppercase px-3">
					Δ
				</th>
			</thead>

			<tbody className="text-[11px] text-[#888] dark:text-vlr-text-white bg-vlr-gray-600">
				{standings.map((standing, index) => {
					return (
						<tr key={index}>
							<td className="h-13 w-full">
								<div
									className={
										(colors[index] === 'yellow'
											? 'border-yellow-400'
											: '') +
										(colors[index] === 'red'
											? 'border-red-400'
											: '') +
										(colors[index] === 'green'
											? 'border-green-400'
											: '') +
										' border-l-3 h-full flex items-center gap-3 pl-3 px-3'
									}
								>
									<img
										className="h-6.25 w-6.25"
										src={teams[standing.abbr].logo}
										alt={standing.name}
									/>
									<div className="flex-col overflow-hidden min-w-0">
										<div className="overflow-hidden text-ellipsis whitespace-nowrap text-pb text-xs font-bold min-w-0">
											{standing.name}
										</div>
										<p className="text-nowrap uppercase text-[10px] font-normal">
											{region}
										</p>
									</div>
								</div>
							</td>
							<td className="text-center px-3 whitespace-nowrap">
								<span className="font-bold text-black dark:text-vlr-text-white">
									{standing.matchW}
								</span>{' '}
								-{' '}
								<span className="font-bold text-black dark:text-vlr-text-white">
									{standing.matchL}
								</span>
							</td>
							<td className="text-center px-3 whitespace-nowrap">
								<p>
									{standing.mapW} / {standing.mapL}
								</p>
							</td>
							<td className="text-center px-2 whitespace-nowrap">
								{standing.rndW} / {standing.rndL}
							</td>
							<td
								className={
									'text-center px-3 ' +
									(standing.rndDiff >= 0
										? ' text-green-500 dark:text-green-300'
										: 'text-red-500 dark:text-red-300')
								}
							>
								{standing.rndDiff >= 0 ? '+' : ''}
								{standing.rndDiff}
							</td>
						</tr>
					)
				})}
			</tbody>
		</table>
	)
}

export default GroupStandingsBox;