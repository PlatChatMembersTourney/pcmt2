import { useState } from 'react';
import { useUrlTab } from '../../utils/urlTab.ts';
import type { Event, Match } from '../../types/types.ts';
import { matches as allMatches } from '../../stores/matches.ts';
import { groupByDay } from '../../utils/datetime.ts';
import MatchCard from '../matches/MatchCard.tsx';
import StagePicker from './StagePicker.tsx';
import { useTimezone } from '../../utils/useTimezone.ts';
import ToggleButton from '../ToggleButton.tsx';

const EventMatchesPanel: React.FC<{ event: Event }> = (props: { event: Event }) => {
	const event = props.event;

	const timezone = useTimezone();

	const matches = allMatches[event.id];

	const stages =
		event.stages.length > 1
			? ['All', ...event.stages.map((stage) => stage.name)]
			: event.stages.map((stage) => stage.name);

	const [activeStage, setActiveStage] = useUrlTab('matches', stages);
	const [reverse, setReverse] = useState(false);

	if (!event.stages) {
		return <div className="flex flex-col">No stages available for this event yet.</div>;
	}

	const format = activeStage === 0 ? undefined : event.stages[activeStage - 1].format;

	const filteredMatches: Match[] =
		activeStage === 0
			? matches
			: matches.filter((match) => {
					if (format?.groupNames) {
						return format.groupNames.includes(match.stage);
					}
					return match.stage === stages[activeStage];
				});
	let matchesGrouped = groupByDay<Match>(filteredMatches, timezone);
	if (!reverse) {
		// change default to reversed
		matchesGrouped = matchesGrouped.reverse();
	}

	return (
		<div className="flex flex-col">
			<div className="bg-shade-200 vlr-box-shadow text-main flex h-15 items-center gap-3 pl-9 sm:pl-11">
				<StagePicker stages={stages} active={activeStage} onSelect={setActiveStage} />
				<ToggleButton on={reverse} onClick={() => setReverse(!reverse)} className="ml-2">
					{reverse ? 'esreveR' : 'Reverse'}
				</ToggleButton>
			</div>
			{filteredMatches.length > 0 ? (
				<div className="bg-shade-300 text-main flex flex-col gap-7.5 p-6">
					{matchesGrouped.map(({ date, items }) => {
						return (
							<div className="flex flex-col" key={date}>
								<h2 className="mb-3 ml-3 text-[11px] leading-none font-bold text-red-400 uppercase">
									{date}
								</h2>
								<div className="vlr-box-shadow flex flex-col">
									{items.map((match) => {
										return (
											<MatchCard
												match={match}
												event={event}
												addlClass="not-first:border-t-1 border-t-line!"
												key={match.id}
											/>
										);
									})}
								</div>
							</div>
						);
					})}
				</div>
			) : (
				<div className="text-main flex flex-col p-6">No matches yet. :(</div>
			)}
		</div>
	);
};

export default EventMatchesPanel;
