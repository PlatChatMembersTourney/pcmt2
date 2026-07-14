import { useState } from 'react';
import type { Event, PlayerStats } from '../../types/types.ts';
import { useStore } from '@nanostores/react';
import { $playerStats } from '../../stores/store.ts';
import PlayerStatTable from '../stats/PlayerStatTable.tsx';

const EventStatsPanel: React.FC<{ event: Event }> = (props: { event: Event }) => {
	const event = props.event;

	const playerStats = useStore($playerStats)[event.id];

	const stages = ['All', ...Object.keys(playerStats).filter((name) => name !== 'Overall')];

	const [activeStage, setActiveStage] = useState(0);
	const [stickyPlayerNames, setStickyPlayerNames] = useState(true);

	if (!event.stages) {
		return <div className="flex flex-col">No stages available for this event yet.</div>;
	}

	const players = playerStats[activeStage === 0 ? 'Overall' : stages[activeStage]] || [];

	return (
		<div className="flex flex-col">
			<div className="bg-vlr-gray-200 dark:bg-vlr-gray-700 dark:text-vlr-text-white vlr-box-shadow flex h-15 items-center gap-3 pl-9 text-black sm:pl-11">
				<div>
					<p className="text-[10px] font-medium text-red-400 uppercase">Stage:</p>
				</div>
				{stages.map((stage, idx) => {
					const isActive = activeStage === idx;

					return (
						<button
							key={stage}
							className={
								'flex h-full cursor-pointer flex-col items-start justify-center gap-1 border-b-3 border-transparent pt-0.75 ' +
								(isActive ? '' : '')
							}
							onClick={() => {
								setActiveStage(idx);
							}}
						>
							<p
								className={
									'box-border h-6 text-xs leading-6 ' +
									(isActive
										? 'dark:text-vlr-text-fullwhite border-b-3 border-red-400 font-bold text-black'
										: 'dark:text-vlr-text-white hover:dark:text-vlr-text-fullwhite border-b border-dotted border-[#666666] text-black hover:border-transparent hover:font-bold')
								}
							>
								{stage}
							</p>
						</button>
					);
				})}
			</div>
			{players.length > 0 ? (
				<div className="bg-vlr-gray-300 dark:bg-vlr-gray-800 flex h-full max-h-[80vh] flex-col gap-2 p-4 sm:p-6">
					<div>
						<button
							onClick={() => setStickyPlayerNames(!stickyPlayerNames)}
							className={`${stickyPlayerNames ? 'font-bold' : 'font-normal'} bg-vlr-gray-100 dark:bg-vlr-gray-600 dark:text-vlr-text-white text-vlr-text-dark cursor-pointer rounded-sm p-2 text-xs`}
						>
							Sticky Player Names
						</button>
					</div>

					<PlayerStatTable
						playerStats={players.map((player: PlayerStats & { eventId?: string }) => {
							player.eventId = event.id;
							return player;
						})}
						showSeason={false}
						stickyPlayerNames={stickyPlayerNames}
					/>
				</div>
			) : (
				<div className="dark:text-vlr-text-white flex flex-col p-6 text-black">No stats yet. D:</div>
			)}
		</div>
	);
};

export default EventStatsPanel;
