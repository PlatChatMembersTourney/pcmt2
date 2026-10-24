import type { APIRoute, GetStaticPaths } from 'astro';
import slugify from 'slugify';
import { events } from '../../stores/events.ts';
import { matches } from '../../stores/matches.ts';

// Static JSON API for match data, built once at build time:
//   /api/matches.json                    every event, with its match count and endpoint
//   /api/matches/<event>.json            all of an event's matches (its matches/matches.json)
//   /api/matches/<event>/<match>.json    one match - the same slug as its page, /events/<event>/<match>

const index = events.map((event) => ({
	id: event.id,
	name: event.name,
	season: event.season,
	region: event.region,
	showmatch: event.showmatch ?? false,
	status: event.status,
	matchCount: matches[event.id].length,
	url: `/api/matches/${event.id}.json`,
}));

export const getStaticPaths = (() => [
	{ params: { path: 'matches' }, props: { data: index } },
	...events.flatMap((event) => [
		{ params: { path: `matches/${event.id}` }, props: { data: matches[event.id] } },
		...matches[event.id].map((match) => ({
			params: { path: `matches/${event.id}/${slugify(match.id)}` },
			props: { data: match },
		})),
	]),
]) satisfies GetStaticPaths;

export const GET: APIRoute = ({ props }) =>
	new Response(JSON.stringify(props.data), { headers: { 'Content-Type': 'application/json' } });