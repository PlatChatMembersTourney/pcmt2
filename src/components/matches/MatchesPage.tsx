import { Toggle } from '@base-ui/react/toggle';
import { ToggleGroup } from '@base-ui/react/toggle-group';
import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import type { Event } from '../../types/types.ts';
import { matches as allMatches } from '../../stores/store.ts';
import { groupByDay } from '../../utils/datetime.ts';
import MatchCard from './MatchCard.tsx';

import eventsRaw from '../../data/events.json';
import { fromJson } from '../../utils/json.ts';
import { cx } from '../../utils/cx.ts';

const events = fromJson<Event[]>(eventsRaw);

const TeamsPage: React.FC = () => {
	const [region, setRegion] = useState(['All']);
	const [season, setSeason] = useState(['All']);

	const [timezone, setTimezone] = useState('America/Chicago');

	useEffect(() => {
		// Fetch the IANA timezone string from the browser
		const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
		setTimezone(userTimezone);
	}, []);

	const handleRegionChange = (newValue: string[]) => {
		if (newValue.length === 0) {
			// don't change
			return;
		}
		setRegion(newValue);
	};

	const handleSeasonChange = (newValue: string[]) => {
		if (newValue.length === 0) {
			// don't change
			return;
		}
		setSeason(newValue);
	};

	const filteredKeys = Object.keys(allMatches).filter((key) => {
		const event = events.find((e) => e.id === key)!;
		return (
			(region[0] === 'All' || event.region === region[0].toLowerCase()) &&
			(season[0] === 'All' || `S${event.season}` === season[0])
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
				<div className="bg-shade-200 vlr-box-shadow flex h-12 w-full items-stretch">
					<div className="border-line flex items-center border-r px-5">
						<p className="text-subtle text-[11px] font-bold uppercase">
							Region
						</p>
					</div>
					<ToggleGroup
						aria-label="NA or EMEA"
						value={region}
						onValueChange={handleRegionChange}
						className="relative flex flex-none text-[12px] text-main"
					>
						{['All', 'NA', 'EMEA'].map((item) => (
							<Toggle aria-label={item} value={item} key={item}>
								<div
									className={cx(
										'border-line relative flex h-full cursor-pointer items-center justify-center border-r px-3 transition-colors duration-200',
										region[0] === item && 'bg-vlr-gray-100 dark:bg-vlr-gray-800'
									)}
								>
									{region[0] === item && (
										<motion.div
											layoutId="active-pill"
											className="absolute inset-0 border-b-3 border-red-400"
											transition={{
												type: 'spring',
												stiffness: 300,
												damping: 30,
											}}
										/>
									)}
									<span>{item}</span>
								</div>
							</Toggle>
						))}
					</ToggleGroup>
				</div>
				<div className="bg-shade-200 vlr-box-shadow flex h-12 w-full items-stretch">
					<div className="border-line flex items-center border-r px-5">
						<p className="text-subtle text-[11px] font-bold uppercase">
							Season
						</p>
					</div>
					<ToggleGroup
						aria-label="Season Number"
						value={season}
						onValueChange={handleSeasonChange}
						className="relative flex flex-none text-[12px] text-main"
					>
						{['All', 'S1', 'S2', 'S3'].map((item) => (
							<Toggle aria-label={item} value={item} key={item}>
								<div
									className={cx(
										'border-line relative flex h-full cursor-pointer items-center justify-center border-r px-3 transition-colors duration-200',
										season[0] === item && 'bg-vlr-gray-100 dark:bg-vlr-gray-800'
									)}
								>
									{season[0] === item && (
										<motion.div
											layoutId="active-pill-2"
											className="absolute inset-0 border-b-3 border-red-400"
											transition={{
												type: 'spring',
												stiffness: 300,
												damping: 30,
											}}
										/>
									)}
									<span>{item}</span>
								</div>
							</Toggle>
						))}
					</ToggleGroup>
				</div>
			</div>

			{matchesGrouped?.length > 0 ? (
				<div className="bg-shade-300 flex flex-col gap-7.5 py-6 text-main">
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
				<div className="bg-shade-300 h-full py-6 text-main">
					<div>
						<img src={'/res/exist.png'} />
					</div>
				</div>
			)}
		</div>
	);
};

export default TeamsPage;
