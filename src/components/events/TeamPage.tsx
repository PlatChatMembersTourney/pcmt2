import type { TeamInfo, Event } from '../../types/types.ts'
import TeamPanels from './TeamPanels.tsx'

interface TeamPageProps {
	team: TeamInfo;
	event: Event;
}

const TeamPage: React.FC<TeamPageProps> = (props) => {
	const { event, team } = props;
	const region = event.region;

	const dyslexia = team.name === 'Team Dyslexia';

	return (
		<div className="font-[roboto]">
			<div className="p-4 sm:p-6 bg-vlr-gray-100 dark:bg-vlr-gray-600 flex items-center gap-4 sm:gap-6">
				<div className="w-30 h-30 border-neutral-500 border rounded-sm flex items-center justify-center flex-none">
					<div
						className={
							'w-28 h-28 bg-vlr-gray-200 dark:bg-vlr-gray-800 flex items-center justify-center'
						}
					>
						<img src={team.logo} className="rounded-sm h-auto w-28" />
					</div>
				</div>

				<div className="flex flex-col gap-2">
					<a
						href={`/events/${event.id}`}
						className="text-pb text-[10pt] leading-4"
					>
						{dyslexia
							? 'Palt Chat Mbemres Tuoranmnte:'
							: 'Plat Chat Members Tournament:'}{' '}
						S{event.season} {event.region.toUpperCase()}
					</a>
					<h1 className="text-black dark:text-vlr-text-white font-bold sm:text-2xl text-xl mb-1">
						{dyslexia ? 'Taem Lydsexia' : team.name}{' '}
						<span className="text-vlr-text-gray font-normal">
							{team.abbr}
						</span>
					</h1>
				</div>
			</div>
			<TeamPanels team={team} event={event} />
		</div>
	)
}

export default TeamPage;