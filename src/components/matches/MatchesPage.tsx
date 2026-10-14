import { useState } from 'react';
import FilterToggle from '../FilterToggle.tsx';
import { matches as allMatches } from '../../stores/matches.ts';
import MatchList from './MatchList.tsx';

import { eventById } from '../../stores/events.ts';

const MatchesPage: React.FC = () => {
	const [region, setRegion] = useState('All');
	const [season, setSeason] = useState('All');

	const filteredKeys = Object.keys(allMatches).filter((key) => {
		const event = eventById[key];
		return (
			(region === 'All' || event.region === region.toLowerCase()) &&
			(season === 'All' || `S${event.season}` === season)
		);
	});

	const matches = filteredKeys.flatMap((key) => {
		const event = eventById[key];
		return allMatches[key].map((match) => ({ match, event }));
	});

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

			<MatchList matches={matches} />
		</div>
	);
};

export default MatchesPage;
