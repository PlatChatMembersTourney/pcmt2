import { useUrlTab } from '../../utils/urlTab.ts';
import type { Event, Standing } from '../../types/types.ts';
import { brackets as allBrackets, matches as allMatches, standings, teams as allTeams } from '../../stores/store.ts';
import GroupStandingsBox from './GroupStandingsBox.tsx';
import Bracket from './Bracket.tsx';
import { cx } from '../../utils/cx.ts';

const EventOverviewPanel: React.FC<{ event: Event }> = (props: { event: Event }) => {
	const event = props.event;

	const allStandings: Record<string, Standing[]> = standings[event.id];
	const teams = allTeams[event.id];
	const brackets = allBrackets[event.id];
	const matches = allMatches[event.id];

	const [activeStage, setActiveStage] = useUrlTab(
		'overview',
		event.stages.map((stage) => stage.name),
		event.stages.length - 1
	);

	const format = event.stages[activeStage].format;
	const stageName = event.stages[activeStage].name;
	const bracket = brackets[stageName]; // from the event's brackets.json, if this stage has one

	return (
		<div className="flex flex-col">
			<div className="bg-shade-200 vlr-box-shadow text-main flex h-15 items-center gap-6 pl-9 sm:pl-11">
				{event.stages?.map((stage, idx) => {
					const isActive = activeStage === idx;

					return (
						<button
							key={stage.name}
							className={cx(
								'flex h-full cursor-pointer flex-col items-start justify-center gap-1 border-b-3 border-transparent pt-0.75',
								isActive ? 'border-red-400!' : 'hover:border-vlr-border-mid'
							)}
							onClick={() => {
								setActiveStage(idx);
							}}
						>
							<p className="text-vlr-text-gray text-[10px] leading-none uppercase">{stage.dates}</p>
							<p
								className={cx(
									'text-[12px] leading-none font-medium',
									isActive ? 'text-main' : 'text-pb'
								)}
							>
								{stage.name}
							</p>
						</button>
					);
				})}
			</div>
			<div className="bg-shade-300 text-main px-4 pt-6 pb-4 sm:px-6">
				{bracket ? (
					<>
						<h2 className="mb-3 ml-3 text-[11px] leading-none font-bold text-red-400 uppercase">Bracket</h2>
						<div className="bg-vlr-gray-200 dark:bg-vlr-gray-600">
							<Bracket
								event={event}
								stage={stageName}
								layout={bracket}
								matches={matches.filter((match) => match.stage === stageName)}
								teams={teams}
							/>
						</div>
					</>
				) : format &&
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
