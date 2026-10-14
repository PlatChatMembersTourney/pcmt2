import { useState } from 'react';
import { useUrlTab } from '../../utils/urlTab.ts';
import type { Event, Match } from '../../types/types.ts';
import { matches as allMatches } from '../../stores/matches.ts';
import MatchList from '../matches/MatchList.tsx';
import StagePicker from './StagePicker.tsx';
import ToggleButton from '../ToggleButton.tsx';

const EventMatchesPanel: React.FC<{ event: Event }> = (props: { event: Event }) => {
	const event = props.event;

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

	return (
		<div className="flex flex-col">
			<div className="bg-shade-200 vlr-box-shadow text-main flex h-15 items-center gap-3 pl-9 sm:pl-11">
				<StagePicker stages={stages} active={activeStage} onSelect={setActiveStage} />
				<ToggleButton on={reverse} onClick={() => setReverse(!reverse)} className="ml-2">
					{reverse ? 'esreveR' : 'Reverse'}
				</ToggleButton>
			</div>
			<MatchList
				matches={filteredMatches.map((match) => ({ match, event }))}
				oldestFirst={reverse}
				className="p-6"
				empty="No matches yet. :("
			/>
		</div>
	);
};

export default EventMatchesPanel;
