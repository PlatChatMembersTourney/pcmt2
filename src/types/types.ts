// TypeScript format of matches.json
// this is just to help us with writing the code
// (lets us reference the schema quickly)

// One player's stat line on a map or across a whole match
export interface Player {
	Player: string;
	"R1.0": number;
	ACS: number;
	K: number;
	D: number;
	A: number;
	PlusMinus: number;
	KAST: number;
	ADR: number;
	"HS%": number;
	FK: number;
	FD: number;
	PlusMinus2: number;
}

// A team's roster of player stat lines
export interface TeamStats {
	team: string; // short code, e.g. "TL"
	teamName: string; // full name
	players: Player[];
}

// Score of a single map
export interface MapScore {
	name: string; // map name, e.g. "Pearl"
	score1: number;
	score2: number;
}

// One round within a map
export interface Round {
	round: number;
	winner: 1 | 2; // which team won
	side: "atk" | "def";
}

// Full per-map detail: score, round-by-round, and per-map stats
export interface MapDetail extends MapScore {
	rounds: Round[];
	stats: TeamStats[];
}

// A complete match.
export interface Match {
	id: string;
	team1: string;
	team2: string;
	team1Name: string;
	team2Name: string;
	score1: number;
	score2: number;
	completed: boolean;
	bestOf: number;
	date: string; // ISO-ish date string
	stage: string; // e.g. "group-stage", "playoffs"
	veto: string; // the veto sequence
	maps: MapScore[];
	combinedStats: TeamStats[]; // whole-match totals per team
	mapDetails: MapDetail[]; // per-map breakdown
	streamLink: string;
}

export interface TeamInfo {
	name: string;
	abbr: string;
	logo: string;
	players: string[];
}

export interface Event {
	id: string;
	name: string;
	shortName: string;
	season: number;
	region: string;
	path: string;
	status: string;
	desc: string;
	dates: string;
	stages: StageInfo[]; // will be showed in order, last one default
}

export interface StageInfo {
	name: string;
	dates: string;
	format?: Format;
}

export interface Format {
	type: "round-robin" | "bracket";
	groups?: number;
	groupNames?: string[];
	teamsPerGroup?: number;
	teamColors?: {
		number: number;
		color: string;
	}[];
}

export interface Standing {
	abbr: string;
	name: string;
	matchW: number;
	matchL: number;
	mapW: number;
	mapL: number;
	rndW: number;
	rndL: number;
	rank: number;
	mapDiff: number;
	rndDiff: number;
}