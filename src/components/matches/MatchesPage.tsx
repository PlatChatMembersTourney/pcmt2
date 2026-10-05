import { useState } from 'react';
import FilterToggle from '../FilterToggle.tsx';
import { matches as allMatches } from '../../stores/matches.ts';
import { groupByDay } from '../../utils/datetime.ts';
import MatchCard from './MatchCard.tsx';

import { events } from '../../stores/events.ts';

import { useTimezone } from '../../utils/useTimezone.ts';

const MatchesPage: React.FC = () => {
	const [region, setRegion] = useState('All');
	const [season, setSeason] = useState('All');

	const timezone = useTimezone();

	const filteredKeys = Object.keys(allMatches).filter((key) => {
		const event = events.find((e) => e.id === key)!;
		return (
			(region === 'All' || event.region === region.toLowerCase()) &&
			(season === 'All' || `S${event.season}` === season)
		);
	});

	const matches = filteredKeys.flatMap((key) => {
		const event = events.find((e) => e.id === key)!;
		return allMatches[key].map((match) => ({ date: match.date, match, event }));
	});
	const matchesGrouped = groupByDay(matches, timezone).reverse();

	return (
		<div className="bg-shade-300 mx-4 mt-4 flex flex-col font-[roboto] sm:mx-6 sm:mt-6">
			<div className="flex flex-col gap-4 md:flex-row">
				<FilterToggle
					label="Region"
					ariaLabel="NA or EMEA"
					options={['All', 'NA', 'EMEA']}
					value={region}
					onChange={setRegion}
				/>
				<FilterToggle
					label="Season"
					ariaLabel="Season Number"
					options={['All', 'S1', 'S2', 'S3']}
					value={season}
					onChange={setSeason}
				/>
			</div>

			{matchesGrouped?.length > 0 ? (
				<div className="bg-shade-300 text-main flex flex-col gap-7.5 py-6">
					{matchesGrouped.map(({ date, items }) => {
						return (
							<div className="flex flex-col" key={date}>
								<h2 className="mb-3 ml-3 text-[11px] leading-none font-bold text-red-400 uppercase">
									{date}
								</h2>
								<div className="vlr-box-shadow flex flex-col">
									{items.map(({ match, event }) => {
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
				<div className="bg-shade-300 text-main h-full py-6">
					<div>
						<img src={'/res/exist.png'} />
					</div>
				</div>
			)}
		</div>
	);
};

export default MatchesPage;
