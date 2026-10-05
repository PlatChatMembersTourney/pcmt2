import type { Round, TeamInfo } from '../../types/types.ts';
import { roundIcon } from '../../utils/images.ts';
import { cx } from '../../utils/cx.ts';

const sideColors = { atk: 'bg-vlr-atk', def: 'bg-vlr-def' };

interface TimelineProps {
	rounds: Round[];
	team1: TeamInfo;
	team2: TeamInfo;
	showAllRounds?: boolean;
}

const Timeline: React.FC<TimelineProps> = (props) => {
	const { rounds, team1, team2, showAllRounds } = props;

	const newRounds = [...rounds];

	if (showAllRounds) {
		while (newRounds.length < 24) {
			newRounds.push({
				round: newRounds.length + 1,
				winner: 0,
				side: 'atk',
			});
		}
	}

	// overtimes
	if (newRounds.length > 24) {
		newRounds.splice(24, 0, {
			round: -1,
			winner: 1,
			side: 'atk',
		});
	}

	newRounds.splice(12, 0, {
		round: -1,
		winner: 1,
		side: 'atk',
	});

	return (
		<div className="flex items-center gap-0.75 overflow-x-auto pb-2">
			<div className="flex flex-col gap-0.75">
				<div className="h-3" />
				<div className="mr-10 flex h-5 items-center gap-2">
					<img src={team1.logo} className="h-5 w-5" />
					<p className="text-muted text-[11px]">{team1.abbr}</p>
				</div>
				<div className="mr-10 flex h-5 items-center gap-2">
					<img src={team2.logo} className="h-5 w-5" />
					<p className="text-muted text-[11px]">{team2.abbr}</p>
				</div>
			</div>

			{newRounds.map((round, index) => {
				if (round.round === -1) {
					// return a spacer between the halves
					return <div className="w-5 min-w-5" key={`spacer-${index}`} />;
				}

				return (
					<div key={index} className="flex flex-col items-center gap-0.75">
						<p className="text-vlr-text-gray h-3 text-[9px] leading-none">{round.round}</p>
						<div
							className={cx(
								'flex h-5 w-5 items-center justify-center rounded-xs',
								round.winner !== 1 ? 'bg-vlr-gray-300 dark:bg-vlr-gray-500' : sideColors[round.side]
							)}
						>
							{round.winner === 1 && round.endType && (
								<img src={roundIcon(round.endType)} className="h-4.5 w-4.5 object-contain" />
							)}
						</div>
						<div
							className={cx(
								'flex h-5 w-5 items-center justify-center rounded-xs',
								round.winner !== 2 ? 'bg-vlr-gray-300 dark:bg-vlr-gray-500' : sideColors[round.side]
							)}
						>
							{round.winner === 2 && round.endType && (
								<img src={roundIcon(round.endType)} className="h-4.5 w-4.5 object-contain" />
							)}
						</div>
					</div>
				);
			})}
		</div>
	);
};

export default Timeline;
