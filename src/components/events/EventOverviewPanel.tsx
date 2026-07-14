import { useState } from 'react';
import { useStore } from '@nanostores/react';
import type { Event, Standing } from '../../types/types.ts';
import { $standings, $teams } from '../../stores/store.ts';
import GroupStandingsBox from './GroupStandingsBox.tsx';

const EventOverviewPanel: React.FC<{ event: Event }> = (props: { event: Event }) => {
	const event = props.event;

	const allStandings: Record<string, Standing[]> = useStore($standings)[event.id];
	const teams = useStore($teams)[event.id];

	const [activeStage, setActiveStage] = useState(event.stages.length - 1);

	const format = event.stages[activeStage].format;

	return (
		<div className="flex flex-col">
			<div className="bg-vlr-gray-200 dark:bg-vlr-gray-700 dark:text-vlr-text-white vlr-box-shadow flex h-15 items-center gap-6 pl-9 text-black sm:pl-11">
				{event.stages?.map((stage, idx) => {
					const isActive = activeStage === idx;

					return (
						<button
							key={stage.name}
							className={
								'flex h-full cursor-pointer flex-col items-start justify-center gap-1 border-b-3 border-transparent pt-0.75 ' +
								(isActive ? 'border-red-400!' : 'hover:border-[#666666]')
							}
							onClick={() => {
								setActiveStage(idx);
							}}
						>
							<p className="text-vlr-text-gray text-[10px] leading-none uppercase">{stage.dates}</p>
							<p
								className={
									'text-[12px] leading-none font-medium ' +
									(isActive ? 'dark:text-vlr-text-white text-black' : 'text-pb')
								}
							>
								{stage.name}
							</p>
						</button>
					);
				})}
			</div>
			<div className="bg-vlr-gray-300 dark:bg-vlr-gray-800 dark:text-vlr-text-white px-4 pt-6 pb-4 text-black sm:px-6">
				{format &&
				['round-robin', 'showmatch'].includes(format?.type) &&
				Object.entries(allStandings).length > 0 ? (
					<>
						<h2 className="mb-3 ml-3 text-[11px] leading-none font-bold text-red-400 uppercase">Groups</h2>
						<div className="flex flex-col gap-3 md:flex-row">
							{format.groups === 1 ? (
								<div className="overflow-x-auto">
									<GroupStandingsBox
										standings={allStandings[event.stages[activeStage].name]}
										teamColors={format.teamColors!}
										name={event.stages[activeStage].name}
										teams={teams}
										region={event.region}
										event={event}
									/>
								</div>
							) : (
								format.groupNames?.map((groupName) => (
									<div className="flex-1 overflow-x-auto" key={groupName}>
										<GroupStandingsBox
											standings={allStandings[groupName]}
											teamColors={format.teamColors!}
											name={groupName}
											teams={teams}
											key={groupName}
											region={event.region}
											event={event}
										/>
									</div>
								))
							)}
						</div>
					</>
				) : (
					<div>not supported yet</div>
				)}
			</div>
		</div>
	);
};

export default EventOverviewPanel;
