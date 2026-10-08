import slugify from 'slugify';
import { events } from '../stores/events.ts';
import { matches } from '../stores/matches.ts';
import { teams } from '../stores/teams.ts';
import { players } from '../stores/players.ts';
import { eventLogo, playerFlag } from '../utils/images.ts';
import type { SearchEntry } from '../utils/search.ts';

// Built once at build time into /search-index.json, which the header's search box loads when it's first used

const teamUrl = (eventId: string, name: string) => `/events/${eventId}/teams/${slugify(name, { lower: true })}`;

const eventEntries: SearchEntry[] = events.map((event) => ({
	type: 'event',
	title: event.name,
	details: [event.shortName, event.dates],
	url: `/events/${event.id}`,
	images: [eventLogo(event.showmatch, event.region)],
	terms: [event.shortName, event.desc, ...(event.showmatch ? ['showmatch'] : [])],
}));

const matchEntries: SearchEntry[] = events.flatMap((event) =>
	matches[event.id].map((match) => ({
		type: 'match',
		title: `${match.team1Name} vs ${match.team2Name}`,
		details: [event.shortName, match.completed ? `${match.score1}–${match.score2}` : 'Upcoming'],
		url: `/events/${event.id}/${slugify(match.id)}`,
		images: [teams[event.id][match.team1]?.logo, teams[event.id][match.team2]?.logo].filter(Boolean),
		terms: [match.team1, match.team2],
		date: match.date,
	}))
);

// Showmatch teams share one page across showmatches - list them once, under their latest showmatch
const teamEntries: SearchEntry[] = events.flatMap((event, i) =>
	Object.values(teams[event.id])
		.filter((team) => !event.showmatch || !events.slice(i + 1).some((e) => e.showmatch && team.abbr in teams[e.id]))
		.map((team) => ({
			type: 'team',
			title: team.name,
			details: [team.abbr, event.showmatch ? 'Showmatches' : event.name],
			url: teamUrl(event.id, team.name),
			images: [team.logo],
			terms: [team.abbr],
		}))
);

const playerEntries: SearchEntry[] = players.map((player) => {
	const latest = player.events[player.events.length - 1];
	return {
		type: 'player',
		title: player.name,
		details: [player.rosterEvents.map((event) => event.shortName).join(', ') || 'Sub'],
		url: `/players/${player.slug}`,
		images: [playerFlag(player.name, latest.id, latest.region)],
		terms: player.spellings,
	};
});

export const GET = () =>
	new Response(JSON.stringify([...eventEntries, ...matchEntries, ...teamEntries, ...playerEntries]), {
		headers: { 'Content-Type': 'application/json' },
	});
