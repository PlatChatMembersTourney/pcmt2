import { atom, map } from 'nanostores';
import type { BracketLayout, Event, Match, PlayerStats, Standing, TeamInfo, TeamMapStats } from '../types/types.ts';
import { fromJson } from '../utils/json.ts';

// load match data for all seasons

import s1NAMatchesRaw from '../data/s1/na/matches/matches.json'
import s2NAMatchesRaw from '../data/s2/na/matches/matches.json';
import s3NAMatchesRaw from '../data/s3/na/matches/matches.json';
import s1EMEAMatchesRaw from '../data/s1/emea/matches/matches.json';
import s2EMEAMatchesRaw from '../data/s2/emea/matches/matches.json';

import s1NAShowmatchMatchesRaw from '../data/showmatch1/na/matches/matches.json';
import s2NAShowmatchMatchesRaw from '../data/showmatch2/na/matches/matches.json';

export const matches: Record<string, Match[]> = {
	's1-na': fromJson<Match[]>(s1NAMatchesRaw),
	's2-na': fromJson<Match[]>(s2NAMatchesRaw),
	's3-na': fromJson<Match[]>(s3NAMatchesRaw),
	's1-emea': fromJson<Match[]>(s1EMEAMatchesRaw),
	's2-emea': fromJson<Match[]>(s2EMEAMatchesRaw),

	'showmatch-s1-na': fromJson<Match[]>(s1NAShowmatchMatchesRaw),
	'showmatch-s2-na': fromJson<Match[]>(s2NAShowmatchMatchesRaw),
};

// load standings data for all seasons

import s1NAStandingsRaw from '../data/s1/na/standings.json';
import s2NAStandingsRaw from '../data/s2/na/standings.json';
import s3NAStandingsRaw from '../data/s3/na/standings.json';
import s1EMEAStandingsRaw from '../data/s1/emea/standings.json';
import s2EMEAStandingsRaw from '../data/s2/emea/standings.json';

import s1NAShowmatchStandingsRaw from '../data/showmatch1/na/standings.json';
import s2NAShowmatchStandingsRaw from '../data/showmatch2/na/standings.json';

const standings: Record<string, Record<string, Standing[]>> = {
	's1-na': fromJson<Record<string, Standing[]>>(s1NAStandingsRaw),
	's2-na': fromJson<Record<string, Standing[]>>(s2NAStandingsRaw),
	's3-na': fromJson<Record<string, Standing[]>>(s3NAStandingsRaw),
	's1-emea': fromJson<Record<string, Standing[]>>(s1EMEAStandingsRaw),
	's2-emea': fromJson<Record<string, Standing[]>>(s2EMEAStandingsRaw),

	'showmatch-s1-na': fromJson<Record<string, Standing[]>>(s1NAShowmatchStandingsRaw),
	'showmatch-s2-na': fromJson<Record<string, Standing[]>>(s2NAShowmatchStandingsRaw),
};

// load teams data for all seasons

import s1NATeamsRaw from '../data/s1/na/teams.json';
import s2NATeamsRaw from '../data/s2/na/teams.json';
import s3NATeamsRaw from '../data/s3/na/teams.json';
import s1EMEATeamsRaw from '../data/s1/emea/teams.json';
import s2EMEATeamsRaw from '../data/s2/emea/teams.json';

import s1NAShowmatchTeamsRaw from '../data/showmatch1/na/teams.json';
import s2NAShowmatchTeamsRaw from '../data/showmatch2/na/teams.json';

// export this so i can load static paths for each team
export const teams: Record<string, Record<string, TeamInfo>> = {
	's1-na': fromJson<Record<string, TeamInfo>>(s1NATeamsRaw),
	's2-na': fromJson<Record<string, TeamInfo>>(s2NATeamsRaw),
	's3-na': fromJson<Record<string, TeamInfo>>(s3NATeamsRaw),
	's1-emea': fromJson<Record<string, TeamInfo>>(s1EMEATeamsRaw),
	's2-emea': fromJson<Record<string, TeamInfo>>(s2EMEATeamsRaw),

	'showmatch-s1-na': fromJson<Record<string, TeamInfo>>(s1NAShowmatchTeamsRaw),
	'showmatch-s2-na': fromJson<Record<string, TeamInfo>>(s2NAShowmatchTeamsRaw),
};

// load stats for all teams

import s1NAPlayerStatsRaw from '../data/s1/na/player-stats.json'
import s2NAPlayerStatsRaw from '../data/s2/na/player-stats.json';
import s3NAPlayerStatsRaw from '../data/s3/na/player-stats.json';
import s1EMEAPlayerStatsRaw from '../data/s1/emea/player-stats.json';
import s2EMEAPlayerStatsRaw from '../data/s2/emea/player-stats.json';

import s1NAShowmatchPlayerStatsRaw from '../data/showmatch1/na/player-stats.json';
import s2NAShowmatchPlayerStatsRaw from '../data/showmatch2/na/player-stats.json';

const playerStats: Record<string, Record<string, PlayerStats[]>> = {
	's1-na': fromJson<Record<string, PlayerStats[]>>(s1NAPlayerStatsRaw),
	's2-na': fromJson<Record<string, PlayerStats[]>>(s2NAPlayerStatsRaw),
	's3-na': fromJson<Record<string, PlayerStats[]>>(s3NAPlayerStatsRaw),
	's1-emea': fromJson<Record<string, PlayerStats[]>>(s1EMEAPlayerStatsRaw),
	's2-emea': fromJson<Record<string, PlayerStats[]>>(s2EMEAPlayerStatsRaw),

	'showmatch-s1-na': fromJson<Record<string, PlayerStats[]>>(s1NAShowmatchPlayerStatsRaw),
	'showmatch-s2-na': fromJson<Record<string, PlayerStats[]>>(s2NAShowmatchPlayerStatsRaw),
};

// load team map stats

import s1NATeamMapStatsRaw from '../data/s1/na/team-map-stats.json';
import s2NATeamMapStatsRaw from '../data/s2/na/team-map-stats.json';
import s3NATeamMapStatsRaw from '../data/s3/na/team-map-stats.json';
import s1EMEATeamMapStatsRaw from '../data/s1/emea/team-map-stats.json';
import s2EMEATeamMapStatsRaw from '../data/s2/emea/team-map-stats.json';

import s1NAShowmatchTeamMapStatsRaw from '../data/showmatch1/na/team-map-stats.json';
import s2NAShowmatchTeamMapStatsRaw from '../data/showmatch2/na/team-map-stats.json';

const teamMapStats: Record<string, Record<string, TeamMapStats>> = {
	's1-na': fromJson<Record<string, TeamMapStats>>(s1NATeamMapStatsRaw),
	's2-na': fromJson<Record<string, TeamMapStats>>(s2NATeamMapStatsRaw),
	's3-na': fromJson<Record<string, TeamMapStats>>(s3NATeamMapStatsRaw),
	's1-emea': fromJson<Record<string, TeamMapStats>>(s1EMEATeamMapStatsRaw),
	's2-emea': fromJson<Record<string, TeamMapStats>>(s2EMEATeamMapStatsRaw),

	'showmatch-s1-na': fromJson<Record<string, TeamMapStats>>(s1NAShowmatchTeamMapStatsRaw),
	'showmatch-s2-na': fromJson<Record<string, TeamMapStats>>(s2NAShowmatchTeamMapStatsRaw),
};

// load bracket layouts - any <season>/<region>/brackets.json is picked up automatically,
// one layout per stage name

import eventsRaw from '../data/events.json';

const bracketFiles = import.meta.glob<Record<string, BracketLayout>>('../data/*/*/brackets.json', {
	eager: true,
	import: 'default',
});

const brackets: Record<string, Record<string, BracketLayout>> = Object.fromEntries(
	fromJson<Event[]>(eventsRaw).map((event) => [event.id, bracketFiles[`../data/${event.path}/brackets.json`] ?? {}])
);

export const $brackets = atom<Record<string, Record<string, BracketLayout>>>(brackets);

export const $matches = atom<Record<string, Match[]>>(matches);

export const $standings = atom<Record<string, Record<string, Standing[]>>>(standings);

export const $teams = atom<Record<string, Record<string, TeamInfo>>>(teams);

export const $playerStats = atom<Record<string, Record<string, PlayerStats[]>>>(playerStats);

// flatten player stats

const allPlayerStats: Record<string, PlayerStats[]> = Object.fromEntries(
	Object.entries(playerStats).map(([region, stats]) => {
		return [region, 'Overall' in stats ? stats['Overall'] : []];
	})
);

export const $allPlayerStats = atom<Record<string, PlayerStats[]>>(allPlayerStats);

export const $teamMapStats = atom<Record<string, Record<string, TeamMapStats>>>(teamMapStats);
