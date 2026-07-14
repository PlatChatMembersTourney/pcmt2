import type { TeamInfo, Event } from '../../types/types.ts';
import TeamPanels from './TeamPanels.tsx';
import { useEffect, useState } from 'react';

interface TeamPageProps {
	team: TeamInfo;
	event: Event;
}

const TeamPage: React.FC<TeamPageProps> = (props) => {
	const { event, team } = props;
	const region = event.region;

	const [funVal, setFunVal] = useState('off');

	useEffect(() => {
		const savedToken = localStorage.getItem('fun');
		if (savedToken) {
			setFunVal(savedToken);
		}
	});

	const dyslexia = team.name === 'Team Dyslexia';
	const fun = funVal === 'yes';

	return (
		<div className="font-[roboto]">
			<div className="bg-vlr-gray-100 dark:bg-vlr-gray-600 flex items-center gap-4 p-4 sm:gap-6 sm:p-6">
				<div className="flex h-30 w-30 flex-none items-center justify-center rounded-sm border border-neutral-500">
					<div className={'bg-vlr-gray-200 dark:bg-vlr-gray-800 flex h-28 w-28 items-center justify-center'}>
						<img src={team.logo} className="h-auto w-28 rounded-sm" />
					</div>
				</div>

				<div className="flex flex-col gap-2">
					<a href={`/events/${event.id}`} className="text-pb text-[10pt] leading-4">
						{dyslexia && fun ? 'Palt Chat Mbemres Tuoranmnte:' : 'Plat Chat Members Tournament:'} S
						{event.season} {event.region.toUpperCase()}
					</a>
					<h1 className="dark:text-vlr-text-white mb-1 text-xl font-bold text-black sm:text-2xl">
						{dyslexia && fun ? 'Taem Lydsexia' : team.name}{' '}
						<span className="text-vlr-text-gray font-normal">{team.abbr}</span>
					</h1>
				</div>
			</div>
			<TeamPanels team={team} event={event} fun={fun} />
		</div>
	);
};

export default TeamPage;
