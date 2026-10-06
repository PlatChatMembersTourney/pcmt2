// Type-checks each event's data files against types.ts - run `astro check` to see any mismatches.
// src/stores/ loads these files with import.meta.glob, which has no types, so add each new event's files here.
// This file is never imported, so it isn't part of the site.

import type { MapAgentStats, Match, PlayerStats, Standing, TeamInfo, TeamMapStats } from '../types/types.ts';
import { fromJson } from '../utils/json.ts';

interface EventFiles {
	matches: Match[];
	standings: Record<string, Standing[]>;
	teams: Record<string, TeamInfo>;
	playerStats: Record<string, PlayerStats[]>;
	teamMapStats: Record<string, TeamMapStats>;
	agentStats: Record<string, MapAgentStats>;
}

import s1naMatches from './s1/na/matches/matches.json';
import s1naStandings from './s1/na/standings.json';
import s1naTeams from './s1/na/teams.json';
import s1naPlayerStats from './s1/na/player-stats.json';
import s1naTeamMapStats from './s1/na/team-map-stats.json';
import s1naAgentStats from './s1/na/agent-stats.json';
fromJson<EventFiles>({
	matches: s1naMatches,
	standings: s1naStandings,
	teams: s1naTeams,
	playerStats: s1naPlayerStats,
	teamMapStats: s1naTeamMapStats,
	agentStats: s1naAgentStats,
});

import s2naMatches from './s2/na/matches/matches.json';
import s2naStandings from './s2/na/standings.json';
import s2naTeams from './s2/na/teams.json';
import s2naPlayerStats from './s2/na/player-stats.json';
import s2naTeamMapStats from './s2/na/team-map-stats.json';
import s2naAgentStats from './s2/na/agent-stats.json';
fromJson<EventFiles>({
	matches: s2naMatches,
	standings: s2naStandings,
	teams: s2naTeams,
	playerStats: s2naPlayerStats,
	teamMapStats: s2naTeamMapStats,
	agentStats: s2naAgentStats,
});

import s3naMatches from './s3/na/matches/matches.json';
import s3naStandings from './s3/na/standings.json';
import s3naTeams from './s3/na/teams.json';
import s3naPlayerStats from './s3/na/player-stats.json';
import s3naTeamMapStats from './s3/na/team-map-stats.json';
import s3naAgentStats from './s3/na/agent-stats.json';
fromJson<EventFiles>({
	matches: s3naMatches,
	standings: s3naStandings,
	teams: s3naTeams,
	playerStats: s3naPlayerStats,
	teamMapStats: s3naTeamMapStats,
	agentStats: s3naAgentStats,
});

import s1emeaMatches from './s1/emea/matches/matches.json';
import s1emeaStandings from './s1/emea/standings.json';
import s1emeaTeams from './s1/emea/teams.json';
import s1emeaPlayerStats from './s1/emea/player-stats.json';
import s1emeaTeamMapStats from './s1/emea/team-map-stats.json';
import s1emeaAgentStats from './s1/emea/agent-stats.json';
fromJson<EventFiles>({
	matches: s1emeaMatches,
	standings: s1emeaStandings,
	teams: s1emeaTeams,
	playerStats: s1emeaPlayerStats,
	teamMapStats: s1emeaTeamMapStats,
	agentStats: s1emeaAgentStats,
});

import s2emeaMatches from './s2/emea/matches/matches.json';
import s2emeaStandings from './s2/emea/standings.json';
import s2emeaTeams from './s2/emea/teams.json';
import s2emeaPlayerStats from './s2/emea/player-stats.json';
import s2emeaTeamMapStats from './s2/emea/team-map-stats.json';
import s2emeaAgentStats from './s2/emea/agent-stats.json';
fromJson<EventFiles>({
	matches: s2emeaMatches,
	standings: s2emeaStandings,
	teams: s2emeaTeams,
	playerStats: s2emeaPlayerStats,
	teamMapStats: s2emeaTeamMapStats,
	agentStats: s2emeaAgentStats,
});

import sm1naMatches from './showmatch1/na/matches/matches.json';
import sm1naStandings from './showmatch1/na/standings.json';
import sm1naTeams from './showmatch1/na/teams.json';
import sm1naPlayerStats from './showmatch1/na/player-stats.json';
import sm1naTeamMapStats from './showmatch1/na/team-map-stats.json';
import sm1naAgentStats from './showmatch1/na/agent-stats.json';
fromJson<EventFiles>({
	matches: sm1naMatches,
	standings: sm1naStandings,
	teams: sm1naTeams,
	playerStats: sm1naPlayerStats,
	teamMapStats: sm1naTeamMapStats,
	agentStats: sm1naAgentStats,
});

import sm2naMatches from './showmatch2/na/matches/matches.json';
import sm2naStandings from './showmatch2/na/standings.json';
import sm2naTeams from './showmatch2/na/teams.json';
import sm2naPlayerStats from './showmatch2/na/player-stats.json';
import sm2naTeamMapStats from './showmatch2/na/team-map-stats.json';
import sm2naAgentStats from './showmatch2/na/agent-stats.json';
fromJson<EventFiles>({
	matches: sm2naMatches,
	standings: sm2naStandings,
	teams: sm2naTeams,
	playerStats: sm2naPlayerStats,
	teamMapStats: sm2naTeamMapStats,
	agentStats: sm2naAgentStats,
});
