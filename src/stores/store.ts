import {atom, map} from 'nanostores';
import type { Match, Standing, TeamInfo } from '../types/types.ts'

// load match data for all seasons

import s2NAMatchesRaw from "../data/s2/na/matches/matches.json";
import s3NAMatchesRaw from "../data/s3/na/matches/matches.json";
import s1EMEAMatchesRaw from "../data/s1/emea/matches/matches.json";

const matches: Record<string, Match[]> = {
	"s1-na": [],
	"s2-na": s2NAMatchesRaw as Match[],
	"s3-na": s3NAMatchesRaw as Match[],
	"s1-emea": s1EMEAMatchesRaw as Match[]
}

// load standings data for all seasons

import s2NAStandingsRaw from "../data/s2/na/standings.json";
import s3NAStandingsRaw from "../data/s3/na/standings.json";
import s1EMEAStandingsRaw from "../data/s1/emea/standings.json";

const standings: Record<string, Record<string, Standing[]>> = {
	's1-na': {},
	's2-na': s2NAStandingsRaw as Record<string, Standing[]>,
	's3-na': s3NAStandingsRaw as Record<string, Standing[]>,
	's1-emea': s1EMEAStandingsRaw as Record<string, Standing[]>,
}

// load teams data for all seasons

import s1NATeamsRaw from "../data/s1/na/teams.json";
import s2NATeamsRaw from "../data/s2/na/teams.json";
import s3NATeamsRaw from "../data/s3/na/teams.json";
import s1EMEATeamsRaw from "../data/s1/emea/teams.json";

const teams: Record<string, Record<string, TeamInfo>> = {
	's1-na': s1NATeamsRaw as Record<string, TeamInfo>,
	's2-na': s2NATeamsRaw as Record<string, TeamInfo>,
	's3-na': s3NATeamsRaw as Record<string, TeamInfo>,
	's1-emea': s1EMEATeamsRaw as Record<string, TeamInfo>,
}

export const $matches = atom<Record<string, Match[]>>(matches);

export const $standings = atom<Record<string, Record<string, Standing[]>>>(standings);

export const $teams = atom < Record<string, Record<string, TeamInfo>>>(teams);