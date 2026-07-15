import type { Match, Event, TeamInfo, MapDetail } from '../../types/types.ts';
import { useState } from 'react';
import StatsTable from './StatsTable.tsx';
import Timeline from './Timeline.tsx';
import { useStore } from '@nanostores/react';
import { $teams } from '../../stores/store.ts';
import { Fragment } from 'react';

interface MatchStatsBoxProps {
	match: Match;
	event: Event;
}

const getAgents = (mapDetails: MapDetail[]) => {
	const agents: Record<string, Set<string>> = {};

	mapDetails.forEach((details) => {
		details.stats.forEach((stat) => {
			stat.players.forEach((player) => {
				if (!(player.Player in agents)) {
					agents[player.Player] = new Set();
				}
				agents[player.Player].add(player.Agent || 'null');
			});
		});
	});
	return agents;
};

const getRounds = (mapDetails: MapDetail[]) => {
	const rounds: Record<string, number> = {};

	mapDetails.forEach((details) => {
		details.stats.forEach((stat) => {
			stat.players.forEach((player) => {
				if (!(player.Player in rounds)) {
					rounds[player.Player] = 0;
				}
				rounds[player.Player] += details.score1 + details.score2;
			});
		});
	});

	return rounds;
};

const copypastas = [
	'Are you kidding ??? What the **** are you talking about man ?\n' +
		'You are a biggest looser i ever seen in my life ! You was doing\n' +
		'PIPI in your pampers when i was beating players much more\n' +
		'stronger then you! You are not proffesional, because\n' +
		'proffesionals knew how to lose and congratulate opponents, you\n' +
		'are like a girl crying after i beat you! Be brave, be honest to\n' +
		'yourself and stop this trush talkings!!! Everybody know that i\n' +
		'am very good pcmt player, i can win anyone in the world in lurk!\n' +
		'And "h"aych "e"dd is nobody for me, just a player who are crying\n' +
		'every single time when loosing, ( remember what you say about\n' +
		'Caleb ) !!! Stop playing with my name, i deserve to have a good\n' +
		'name during whole my valorand carrier, I am Officially inviting\n' +
		'you to 1v1 skirmish match with the Prize fund! Both of us will\n' +
		'invest 5000$ and winner takes it all!',
	"Icebox was released on October 13, 2020, as part of Valorant's Episode\n" +
		'I, Act 3 update. The map is set in Bennett Island, Sakha, Russia,\n' +
		'featuring a snowy port environment with vertical play and zip lines,\n' +
		'making it unique compared to other maps. Icebox emphasizes\n' +
		'skirmishes, fast-paced gameplay, and requires strategic vertical\n' +
		'positioning and effective use of cover. It has two bomb sites with\n' +
		'complex layouts that challenge both attackers and defenders differently,\n' +
		'making it an attacker-sided map with ample opportunities for creative\n' +
		'play.\n' +
		'\n' +
		"The general shape of Valorant's Icebox map is a symmetrical,\n" +
		'rectangular layout with two distinct bomb sites (A and B) located at\n' +
		'opposite ends. The map features a central area with vertical elements\n' +
		'like ziplines, elevated platforms, and numerous obstacles that create\n' +
		"complex sightlines and angles. Icebox's design encourages vertical\n" +
		'engagements with high-ground advantages and close-quarters combat in\n' +
		'tight corridors. The map is heavily segmented with various pathways,\n' +
		'allowing players to approach sites from multiple directions, which\n' +
		'emphasizes strategic positioning and rapid rotations between sites.',
	'When JDG is ahead in man advantage, Sylos feels that JDG is at a great advantage and thus he will push aggressively. When JDG is even in players, Sylos thinks that JDG is at a small advantage, and he so he pushes aggressively to fight to secure their "lead". When JDG is behind by one player, Sylos thinks that JDG is at a disadvantage and so he looks for an aggressive play to regain control of the game. When JDG is down multiple players, Sylos thinks that the team has reached a desperate situation and they are only waiting passively for their death if he does not make an aggressive play.',
];

const MatchStatsBox: React.FC<MatchStatsBoxProps> = (props) => {
	const { match, event } = props;
	const teams: Record<string, TeamInfo> = useStore($teams)[event.id];

	if (!match.completed) {
		return (
			<div className="bg-vlr-gray-200 dark:bg-vlr-gray-700 vlr-box-shadow text-vlr-text-dark dark:text-vlr-text-white flex flex-col p-4 text-sm sm:p-5">
				{copypastas[Math.floor(Math.random() * copypastas.length)]}
			</div>
		);
	}

	// map 0: all maps
	const [selectedMap, setSelectedMap] = useState(0);

	return (
		<div className="bg-vlr-gray-200 dark:bg-vlr-gray-700 vlr-box-shadow flex flex-col">
			<div className="vlr-border flex h-18.5 items-center gap-3 overflow-x-auto border-b p-3">
				{[{ name: 'All' }, ...match.maps].map(({ name }, idx) => {
					return (
						<button
							key={name}
							onClick={() => setSelectedMap(idx)}
							className={
								`flex-1 ${match.bestOf === 3 ? 'min-w-20' : 'min-w-15'} h-full cursor-pointer rounded-xs text-center text-[11px] ` +
								(selectedMap === idx
									? 'bg-[#666] text-white dark:bg-[#848f9a]'
									: 'text-vlr-text-dark dark:text-vlr-text-white bg-vlr-gray-100 dark:bg-vlr-gray-600')
							}
						>
							<p className={idx === 0 ? '' : 'mb-0.5'}>
								{name !== 'All' && (
									<span style={{ verticalAlign: '4px' }} className="mr-1">
										{idx}
									</span>
								)}
								{name === 'All' ? 'All Maps' : name}
							</p>
						</button>
					);
				})}
			</div>
			<div className="flex-col items-center p-4 sm:p-5">
				{selectedMap !== 0 && (
					<>
						<div className="mb-5 grid w-full grid-cols-[1fr_auto_1fr] items-center">
							<div className="flex gap-3">
								<p
									className={
										'text-4xl leading-none font-normal ' +
										(match.maps[selectedMap - 1].score1 > match.maps[selectedMap - 1].score2
											? 'text-green-600 dark:text-green-400'
											: 'text-vlr-text-dark dark:text-vlr-text-white')
									}
								>
									{match.maps[selectedMap - 1].score1}
								</p>
								<div className="flex h-9 flex-col justify-center">
									<p className="text-vlr-text-dark dark:text-vlr-text-white text-xs font-medium">
										{match.team1Name}
									</p>
								</div>
							</div>
							<h2 className="text-vlr-text-dark dark:text-vlr-text-white text-xl leading-none font-bold">
								{match.maps[selectedMap - 1].name}
							</h2>
							<div className="ml-auto flex gap-3">
								<div className="flex h-9 flex-col items-end justify-center">
									<p className="text-vlr-text-dark dark:text-vlr-text-white text-right text-xs font-medium">
										{match.team2Name}
									</p>
								</div>
								<p
									className={
										'text-4xl leading-none font-normal ' +
										(match.maps[selectedMap - 1].score1 < match.maps[selectedMap - 1].score2
											? 'text-green-600 dark:text-green-400'
											: 'text-vlr-text-dark dark:text-vlr-text-white')
									}
								>
									{match.maps[selectedMap - 1].score2}
								</p>
							</div>
						</div>
						{(match.mapDetails[selectedMap - 1].rounds !== null) && (
							<div className="mb-5">
								<Timeline
									rounds={match.mapDetails[selectedMap - 1].rounds!}
									team1={teams[match.team1]}
									team2={teams[match.team2]}
									showAllRounds={true}
								/>
							</div>
						)}
					</>
				)}
				{selectedMap === 0 && (
					<StatsTable
						agents={getAgents(match.mapDetails)}
						event={event}
						teamStats={match.combinedStats}
						rounds={getRounds(match.mapDetails)}
					/>
				)}
				{match.maps.map((map, idx) => (
					<Fragment key={idx}>
						{selectedMap === idx + 1 && (
							<StatsTable
								agents={getAgents([match.mapDetails[idx]])}
								event={event}
								teamStats={match.mapDetails[idx].stats}
								rounds={match.maps[idx].score1 + match.maps[idx].score2}
								key={idx}
							/>
						)}
					</Fragment>
				))}
			</div>
		</div>
	);
};

export default MatchStatsBox;
