import {atom, map} from 'nanostores';
import type { Match, PlayerStats, Standing, TeamInfo, TeamMapStats } from '../types/types.ts'

// load match data for all seasons

import s2NAMatchesRaw from "../data/s2/na/matches/matches.json";
import s3NAMatchesRaw from "../data/s3/na/matches/matches.json";
import s1EMEAMatchesRaw from "../data/s1/emea/matches/matches.json";
import s2EMEAMatchesRaw from "../data/s2/emea/matches/matches.json";

import s1NAShowmatchMatchesRaw from '../data/showmatch1/na/matches/matches.json'
import s2NAShowmatchMatchesRaw from "../data/showmatch2/na/matches/matches.json";

// export this so i can load static paths for each match
export const matches: Record<string, Match[]> = {
	"s1-na": [],
	"s2-na": s2NAMatchesRaw as Match[],
	"s3-na": s3NAMatchesRaw as Match[],
	"s1-emea": s1EMEAMatchesRaw as Match[],
	"s2-emea": s2EMEAMatchesRaw as Match[],

	"showmatch-s1-na": s1NAShowmatchMatchesRaw as Match[],
	"showmatch-s2-na": s2NAShowmatchMatchesRaw as Match[],
}

// load standings data for all seasons

import s2NAStandingsRaw from "../data/s2/na/standings.json";
import s3NAStandingsRaw from "../data/s3/na/standings.json";
import s1EMEAStandingsRaw from "../data/s1/emea/standings.json";
import s2EMEAStandingsRaw from '../data/s2/emea/standings.json';

// import s1NAShowmatchStandingsRaw from '../data/showmatch1/na/standings.json'
import s2NAShowmatchStandingsRaw from "../data/showmatch2/na/standings.json";

const standings: Record<string, Record<string, Standing[]>> = {
	's1-na': {},
	's2-na': s2NAStandingsRaw as Record<string, Standing[]>,
	's3-na': s3NAStandingsRaw as Record<string, Standing[]>,
	's1-emea': s1EMEAStandingsRaw as Record<string, Standing[]>,
	's2-emea': s2EMEAStandingsRaw as Record<string, Standing[]>,

	'showmatch-s1-na': {}, // s1NAShowmatchStandingsRaw as Record<string, Standing[]>,
	'showmatch-s2-na': s2NAShowmatchStandingsRaw as Record<string, Standing[]>,
}

// load teams data for all seasons

import s1NATeamsRaw from "../data/s1/na/teams.json";
import s2NATeamsRaw from "../data/s2/na/teams.json";
import s3NATeamsRaw from "../data/s3/na/teams.json";
import s1EMEATeamsRaw from "../data/s1/emea/teams.json";
import s2EMEATeamsRaw from '../data/s2/emea/teams.json'

import s1NAShowmatchTeamsRaw from '../data/showmatch1/na/teams.json'
import s2NAShowmatchTeamsRaw from "../data/showmatch2/na/teams.json";

// export this so i can load static paths for each team
export const teams: Record<string, Record<string, TeamInfo>> = {
	's1-na': s1NATeamsRaw as Record<string, TeamInfo>,
	's2-na': s2NATeamsRaw as Record<string, TeamInfo>,
	's3-na': s3NATeamsRaw as Record<string, TeamInfo>,
	's1-emea': s1EMEATeamsRaw as Record<string, TeamInfo>,
	's2-emea': s2EMEATeamsRaw as Record<string, TeamInfo>,

	'showmatch-s1-na': s1NAShowmatchTeamsRaw as Record<string, TeamInfo>,
	'showmatch-s2-na': s2NAShowmatchTeamsRaw as Record<string, TeamInfo>,
}

// load stats for all teams

import s2NAPlayerStatsRaw from "../data/s2/na/player-stats.json"
import s3NAPlayerStatsRaw from "../data/s3/na/player-stats.json"
import s1EMEAPlayerStatsRaw from "../data/s1/emea/player-stats.json"
import s2EMEAPlayerStatsRaw from "../data/s2/emea/player-stats.json"

// import s1NAShowmatchPlayerStatsRaw from '../data/showmatch1/na/player-stats.json'
import s2NAShowmatchPlayerStatsRaw from "../data/showmatch2/na/player-stats.json"

const playerStats: Record<string, Record<string, PlayerStats[]>> = {
	's1-na': {},
	's2-na': s2NAPlayerStatsRaw as Record<string, PlayerStats[]>,
	's3-na': s3NAPlayerStatsRaw as Record<string, PlayerStats[]>,
	's1-emea': s1EMEAPlayerStatsRaw as Record<string, PlayerStats[]>,
	's2-emea': s2EMEAPlayerStatsRaw as Record<string, PlayerStats[]>,

	'showmatch-s1-na': {}, // s1NAShowmatchPlayerStatsRaw as Record<string,PlayerStats[]>
	'showmatch-s2-na': s2NAShowmatchPlayerStatsRaw as Record<
		string,
		PlayerStats[]
	>,
}

// load team map stats
import s2NATeamMapStatsRaw from "../data/s2/na/team-map-stats.json"
import s3NATeamMapStatsRaw from "../data/s3/na/team-map-stats.json"
import s1EMEATeamMapStatsRaw from "../data/s1/emea/team-map-stats.json"
import s2EMEATeamMapStatsRaw from '../data/s2/emea/team-map-stats.json'

// import s1NAShowmatchTeamMapStatsRaw from '../data/showmatch1/na/team-map-stats.json'
import s2NAShowmatchTeamMapStatsRaw from "../data/showmatch2/na/team-map-stats.json"

const teamMapStats: Record<string, Record<string, TeamMapStats>> = {
	's1-na': {},
	's2-na': s2NATeamMapStatsRaw as Record<string, TeamMapStats>,
	's3-na': s3NATeamMapStatsRaw as Record<string, TeamMapStats>,
	's1-emea': s1EMEATeamMapStatsRaw as Record<string, TeamMapStats>,
	's2-emea': s2EMEATeamMapStatsRaw as Record<string, TeamMapStats>,

	'showmatch-s1-na': {}, // s1NAShowmatchTeamMapStatsRaw as Record<string, TeamMapStats>,
	'showmatch-s2-na': s2NAShowmatchTeamMapStatsRaw as Record<
		string,
		TeamMapStats
	>,
}

export const $matches = atom<Record<string, Match[]>>(matches);

export const $standings = atom<Record<string, Record<string, Standing[]>>>(standings);

export const $teams = atom<Record<string, Record<string, TeamInfo>>>(teams);

export const $playerStats = atom<Record<string, Record<string, PlayerStats[]>>>(playerStats);

// flatten player stats

const allPlayerStats: Record<string, PlayerStats[]> = Object.fromEntries(Object.entries(playerStats).map(([region, stats]) => {
	return [region, 'Overall' in stats ? stats['Overall'] : []];
}));

export const $allPlayerStats = atom<Record<string, PlayerStats[]>>(allPlayerStats);

export const $teamMapStats = atom<Record<string, Record<string, TeamMapStats>>>(teamMapStats);