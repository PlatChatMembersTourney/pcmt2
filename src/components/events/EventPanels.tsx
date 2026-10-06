import { useUrlTab } from '../../utils/urlTab.ts';
import type { Event, Match } from '../../types/types.ts';

import EventOverviewPanel from './EventOverviewPanel.tsx';
import EventStatsPanel from './EventStatsPanel.tsx';
import EventMatchesPanel from './EventMatchesPanel.tsx';
import EventAgentsPanel from './EventAgentsPanel.tsx';
import TabBar from './TabBar.tsx';

import { matches as allMatches } from '../../stores/matches.ts';

const EventPanels: React.FC<{ event: Event }> = (props: { event: Event }) => {
	const event = props.event;
	const pages = ['Overview', 'Matches', 'Stats', 'Agents'];
	const [activeIdx, setActive] = useUrlTab('tab', pages);
	const active = pages[activeIdx];

	const matches: Match[] = allMatches[event.id];

	return (
		<div className="flex flex-col">
			<TabBar
				tabs={pages}
				active={active}
				onSelect={(tab) => setActive(pages.indexOf(tab))}
				matchCount={matches.length}
				arrowFill={['Overview', 'Matches', 'Stats'].includes(active) ? 'fill-shade-200' : 'fill-shade-300'}
			/>

			{active === 'Overview' && <EventOverviewPanel event={event} />}
			{active === 'Matches' && <EventMatchesPanel event={event} />}
			{active === 'Stats' && <EventStatsPanel event={event} />}
			{active === 'Agents' && <EventAgentsPanel event={event} />}
		</div>
	);
};

export default EventPanels;
