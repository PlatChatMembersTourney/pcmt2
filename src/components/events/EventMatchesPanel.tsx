import { useEffect, useState } from 'react';
import type { Event, Match } from '../../types/types.ts';
import { useStore } from '@nanostores/react';
import { $matches, $teams } from '../../stores/store.ts';
import { groupByDay } from '../../utils/datetime.ts';
import MatchCard from '../matches/MatchCard.tsx';

const EventMatchesPanel: React.FC<{ event: Event }> = (props: { event: Event }) => {
	const event = props.event;

	const [timezone, setTimezone] = useState('America/Chicago');

	useEffect(() => {
		// Fetch the IANA timezone string from the browser
		const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
		setTimezone(userTimezone);
	}, []);

	const teams = useStore($teams)[event.id];
	const matches = useStore($matches)[event.id];

	const stages =
		event.stages.length > 1
			? ['All', ...event.stages?.map((stage) => stage.name)]
			: event.stages?.map((stage) => stage.name);

	const [activeStage, setActiveStage] = useState(0);
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
				<button
					className={
						'bg-vlr-gray-100 dark:bg-vlr-gray-600 ml-2 cursor-pointer rounded-sm px-2 py-1 text-xs ' +
						(reverse ? 'font-bold' : '')
					}
					onClick={() => setReverse(!reverse)}
				>
					{reverse ? 'esreveR' : 'Reverse'}
				</button>
			</div>
			{filteredMatches.length > 0 ? (
				<div className="bg-vlr-gray-300 dark:bg-vlr-gray-800 dark:text-vlr-text-white flex flex-col gap-7.5 p-6 text-black">
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
												addlClass="not-first:border-t-1 dark:border-t-vlr-border-gray! border-t-vlr-border-light!"
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
				<div className="dark:text-vlr-text-white flex flex-col p-6 text-black">No matches yet. :(</div>
			)}
		</div>
	);
};

export default EventMatchesPanel;
