import { useState } from 'react';
import { useUrlTab } from '../../utils/urlTab.ts';
import type { Event } from '../../types/types.ts';
import { playerStats as allPlayerStats } from '../../stores/playerStats.ts';
import PlayerStatTable from '../stats/PlayerStatTable.tsx';
import { cx } from '../../utils/cx.ts';
import StagePicker from './StagePicker.tsx';

const EventStatsPanel: React.FC<{ event: Event }> = (props: { event: Event }) => {
	const event = props.event;

	const playerStats = allPlayerStats[event.id];

	const stages = ['All', ...Object.keys(playerStats).filter((name) => name !== 'Overall')];

	const [activeStage, setActiveStage] = useUrlTab('stats', stages);
	const [stickyPlayerNames, setStickyPlayerNames] = useState(true);
	const [showSubs, setShowSubs] = useState(true);

	if (!event.stages) {
		return <div className="flex flex-col">No stages available for this event yet.</div>;
	}

	const players = playerStats[activeStage === 0 ? 'Overall' : stages[activeStage]] || [];
	const filteredPlayers = showSubs ? players : players.filter((player) => !player.Team.includes('(sub)'));

	return (
		<div className="flex flex-col">
			<div className="bg-shade-200 vlr-box-shadow text-main flex h-15 items-center gap-3 pl-9 sm:pl-11">
				<StagePicker stages={stages} active={activeStage} onSelect={setActiveStage} />
			</div>
			{players.length > 0 ? (
				<div className="bg-shade-300 flex h-full max-h-[80vh] flex-col gap-2 p-4 sm:p-6">
					<div className="flex">
						<button
							onClick={() => setStickyPlayerNames(!stickyPlayerNames)}
							className={cx(
								'bg-shade-100 text-muted cursor-pointer rounded-sm p-2 text-xs',
								stickyPlayerNames ? 'font-bold' : 'font-normal'
							)}
						>
							Sticky Player Names
						</button>
						<button
							onClick={() => setShowSubs(!showSubs)}
							className={cx(
								'bg-shade-100 text-muted ml-auto cursor-pointer rounded-sm p-2 text-xs',
								showSubs ? 'font-bold' : 'font-normal'
							)}
						>
							Show Subs
						</button>
					</div>

					<PlayerStatTable
						playerStats={filteredPlayers.map((player) => ({ ...player, eventId: event.id }))}
						showSeason={false}
						stickyPlayerNames={stickyPlayerNames}
					/>
				</div>
			) : (
				<div className="text-main flex flex-col p-6">No stats yet. D:</div>
			)}
		</div>
	);
};

export default EventStatsPanel;
