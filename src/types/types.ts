// TypeScript format of matches.json
// this is just to help us with writing the code
// (lets us reference the schema quickly)

// One player's stat line on a map or across a whole match
export interface Player {
	Player: string;
	Agent?: string;
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

export interface PlayerStats extends Player {
	"K/D": number;
	Team: string;
	MP: number;
	Rounds: number;
	KPR: number;
	DPR: number;
	FKPR: number;
	FDPR: number;
	KMAX: number;
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
	winner: 0 | 1 | 2; // which team won - 0 for placeholder rounds
	side: "atk" | "def";
	endType?: "Eliminated" | "Bomb detonated" | "Bomb defused" | "Round timer expired"; // how the round ended
	// this only exists on newer data (so may not exist for all games)
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
	streamLink: string | {
		link: string;
		name: string;
	}[];
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

export interface TeamMapStats {
	team: string;
	teamName: string;
	overallAtkPct: number;
	overallDefPct: number;
	maps: MapStat[];
}

export interface MapStat {
	map: string;
	pick: number;
	ban: number;
	played: number;
	won: number;
	winPct: number;
	rounds: number;
	roundsWon: number;
	roundPct: number;
	atkPct: number;
	defPct: number;
}

export interface Flags {
	Teams: Record<string, Record<string, string>>;
	All: Record<string, string>;
	Overrides: Record<string, Record<string, string>>;
}