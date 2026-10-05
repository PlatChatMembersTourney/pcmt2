import type { Event } from '../types/types.ts';
import { fromJson } from '../utils/json.ts';
import eventsRaw from '../data/events.json';

// Each data type lives in its own file (matches.ts, teams.ts, ...) so a page only downloads the data it imports.
// Each event's files are loaded from src/data/<event.path>/, so adding an event to events.json is enough here.
// Globbed files have no types of their own - add the new event's files to src/data/check.ts so they're type-checked.
// To override an event (e.g. one with a missing file), add its id below the spread in that record.

export const events = fromJson<Event[]>(eventsRaw);

// Each event's file from a glob, keyed by event id - `fallback` if the event doesn't have that file
export const byEvent = <T>(files: Record<string, T>, file: string, fallback: T): Record<string, T> =>
	Object.fromEntries(events.map((event) => [event.id, files[`../data/${event.path}/${file}`] ?? fallback]));
