import { useState } from 'react';
import slugify from 'slugify';
import type { Event, Match } from '../../types/types.ts';
import { brackets as allBrackets } from '../../stores/brackets.ts';
import { matches as allMatches } from '../../stores/matches.ts';
import { standings as allStandings } from '../../stores/standings.ts';
import { teams as allTeams } from '../../stores/teams.ts';
import { playerFlag } from '../../utils/images.ts';
import { playerSlug } from '../../utils/playerSlug.ts';
import { cx } from '../../utils/cx.ts';
import ToggleButton from '../ToggleButton.tsx';

// The match stage names that make up a stage - a grouped stage's matches are named after their groups
const matchStages = (event: Event, stageIdx: number) =>
	event.stages[stageIdx].format?.groupNames ?? [event.stages[stageIdx].name];

// Maps each player played for a team in these matches, by playerSlug
const mapsPlayed = (matches: Match[], abbr: string) => {
	const maps = new Map<string, number>();
	for (const match of matches) {
		if (!match.completed) continue;
		for (const map of match.mapDetails) {
			for (const team of map.stats) {
				if (team.team !== abbr) continue;
				for (const p of team.players) maps.set(playerSlug(p.Player), (maps.get(playerSlug(p.Player)) ?? 0) + 1);
			}
		}
	}
	return maps;
};

// The team's lineup: the 5 teams.json roster players with the most maps in the stage (ties: most maps in the
// event, then roster order), shown in roster order - rosters can have 6 after mid-season substitutions
const lineup = (roster: string[], stageMaps: Map<string, number>, eventMaps: Map<string, number>) => {
	const count = (maps: Map<string, number>, name: string) => maps.get(playerSlug(name)) ?? 0;
	const five = [...roster]
		.sort((a, b) => count(stageMaps, b) - count(stageMaps, a) || count(eventMaps, b) - count(eventMaps, a))
		.slice(0, 5);
	return roster.filter((name) => five.includes(name));
};

// A stage's teams, like vlr's: logo cards that switch to the stage's lineups, with how each team got in
const ParticipatingTeams: React.FC<{ event: Event; stageIdx: number }> = ({ event, stageIdx }) => {
	const [showRosters, setShowRosters] = useState(false);

	const teams = allTeams[event.id];
	const matches = allMatches[event.id];
	const standings = allStandings[event.id];
	const stage = event.stages[stageIdx];
	const names = matchStages(event, stageIdx);
	const stageMatches = matches.filter((match) => names.includes(match.stage));
	const playedIn = (stageNames: string[], abbr: string) =>
		matches.some((m) => stageNames.includes(m.stage) && (m.team1 === abbr || m.team2 === abbr));

	// The stage's teams: from its bracket and matches, plus a grouped stage's teams.json groups (known before games)
	const abbrs = new Set<string>();
	const bracket = allBrackets[event.id][stage.name];
	for (const slot of [...(bracket?.upper ?? []), ...(bracket?.lower ?? []), bracket?.final ?? []].flat()) {
		slot?.teams?.forEach((abbr) => abbr && abbrs.add(abbr));
	}
	for (const m of stageMatches) abbrs.add(m.team1).add(m.team2);
	for (const team of Object.values(teams)) if (team.group && names.includes(team.group)) abbrs.add(team.abbr);

	// How each team got into the stage - [note, sort key]. Earlier stages come later in the list (newest first)
	const qualification = (abbr: string): [string, number] => {
		const type = stage.format?.type;
		if (type === 'showmatch') return ['', 0];
		if (type === 'round-robin') {
			// a grouped stage: their group; a single group: nothing to say
			const group =
				names.length > 1
					? names.find((name) => teams[abbr]?.group === name || playedIn([name], abbr))
					: undefined;
			return [group ?? '', group ? names.indexOf(group) : 0];
		}
		// later stages: their place in the latest earlier stage they played, e.g. "Group Alpha #1" or "LCQ #1"
		for (let i = stageIdx + 1; i < event.stages.length; i++) {
			const earlier = matchStages(event, i);
			const group = earlier.find((name) => playedIn([name], abbr));
			if (!group) continue;
			const rank = standings[group]?.find((s) => s.abbr === abbr)?.rank;
			return [
				rank ? `${group} #${rank}` : group,
				(event.stages.length - i) * 100 + earlier.indexOf(group) * 10 + (rank ?? 9),
			];
		}
		return ['', 999];
	};

	const cards = [...abbrs]
		.filter((abbr) => teams[abbr])
		.map((abbr) => {
			const [note, order] = qualification(abbr);
			const players = lineup(teams[abbr].players, mapsPlayed(stageMatches, abbr), mapsPlayed(matches, abbr));
			return { team: teams[abbr], note, order, players };
		})
		.sort((a, b) => a.order - b.order);

	if (cards.length === 0) return null;
	return (
		// Cards fill their row: 2 per row on phones, up to 4 - max-w-198.5 makes 4 cards 192.5px each, like vlr
		<div className="mt-6 flex max-w-198.5 flex-col">
			<div className="mb-3 ml-3 flex items-center justify-between">
				<h2 className="text-[11px] leading-none font-bold text-red-400 uppercase">Participating Teams</h2>
				<ToggleButton on={showRosters} onClick={() => setShowRosters(!showRosters)}>
					Toggle Rosters
				</ToggleButton>
			</div>
			<div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
				{cards.map(({ team, note, players }) => (
					<div className="vlr-box-shadow bg-shade-100 flex min-w-0 flex-col text-[11px]" key={team.abbr}>
						<a
							href={`/events/${event.id}/teams/${slugify(team.name, { lower: true })}`}
							className="border-line text-pb truncate border-b px-2 py-[15px] text-center font-bold"
						>
							{team.name}
						</a>
						{/* The logo, faded behind the lineup when rosters are showing (like vlr) */}
						<div className="relative aspect-square">
							<img
								src={team.logo}
								alt={team.name}
								className={cx('h-full w-full object-contain p-5', showRosters && 'opacity-10')}
							/>
							{showRosters && (
								<div className="absolute inset-0 flex flex-col">
									{players.map((player) => (
										<a
											href={`/players/${playerSlug(player)}`}
											className="border-line text-main flex flex-1 items-center gap-1.5 truncate px-3 font-bold not-first:border-t"
											key={player}
										>
											<img
												src={playerFlag(player, event.id, event.region)}
												alt=""
												className="h-3 w-auto"
											/>
											{player}
										</a>
									))}
								</div>
							)}
						</div>
						<div className="border-line text-muted h-[42px] border-t px-2 text-center leading-[41px]">
							{note}
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

export default ParticipatingTeams;
