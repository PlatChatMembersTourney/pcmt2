import {atom, map} from 'nanostores';
import type { Match } from '../types/types.ts'

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

export const $matches = atom<Record<string, Match[]>>(matches);
