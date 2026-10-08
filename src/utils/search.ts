// Search for the header's search box: the index is built at build time (src/pages/search-index.json.ts),
// and matched in the browser with typo tolerance.

export type SearchType = 'event' | 'match' | 'team' | 'player';

export interface SearchEntry {
	type: SearchType;
	title: string;
	details: string[]; // shown under the title, the first one highlighted
	url: string;
	images: string[]; // one, or two for a match (its teams' logos)
	terms: string[]; // searched along with the title
	date?: string; // matches: ISO date, searchable and shown in the visitor's timezone
}

// The result sections, in order, with how many results each one shows
export const searchGroups: { type: SearchType; label: string; limit: number }[] = [
	{ type: 'event', label: 'Events', limit: 3 },
	{ type: 'match', label: 'Matches', limit: 5 },
	{ type: 'team', label: 'Teams', limit: 3 },
	{ type: 'player', label: 'Players', limit: 3 },
];

// Easter eggs: searching exactly this text (ignoring capitals and punctuation) puts this player first in the
// Players results - the value is their /players/<slug>
const easterEggs: Record<string, string> = {
	globglogabgalab: 'linus',
	'he ends the round': 'ender',
};

// Lowercase words without accents or punctuation, e.g. "Rage Re-Queuers" -> ["rage", "re", "queuers"]
const words = (text: string) =>
	text
		.normalize('NFKD')
		.replace(/[̀-ͯ]/g, '')
		.toLowerCase()
		.split(/[^a-z0-9]+/)
		.filter(Boolean);

// Edit distance where swapping two neighbouring letters counts as one edit (optimal string alignment)
const editDistance = (a: string, b: string) => {
	const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array<number>(b.length).fill(0)]);
	for (let j = 1; j <= b.length; j++) d[0][j] = j;
	for (let i = 1; i <= a.length; i++) {
		for (let j = 1; j <= b.length; j++) {
			const cost = a[i - 1] === b[j - 1] ? 0 : 1;
			d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
			if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
				d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
			}
		}
	}
	return d[a.length][b.length];
};

// Typos allowed in a query word, by its length - none for 1-2 letters, or "pi" would match everything
const allowedEdits = (length: number) => (length <= 2 ? 0 : length <= 4 ? 1 : length <= 7 ? 2 : 3);

// How well a query word matches a word of an entry (lower is better): 0 exact, 1 prefix, 2+ a typo, null no match
const wordScore = (query: string, word: string, typos: boolean) => {
	if (word === query) return 0;
	if (word.startsWith(query)) return 1;
	const allowed = typos ? allowedEdits(query.length) : 0;
	if (allowed === 0) return null;
	// Also compare with the word's start, so a typo while still typing counts ("snwo" -> snowfall)
	const edits = Math.min(editDistance(query, word), editDistance(query, word.slice(0, query.length)));
	return edits <= allowed ? 1 + edits : null;
};

export interface PreparedEntry {
	entry: SearchEntry;
	words: string[];
	dateWords: string[]; // matched without typos, or "angsu" finds every match in August
	dateText?: string; // matches: the date as shown, in the visitor's timezone
}

// Splits every entry into its searchable words - matches also get their date, in the visitor's timezone
export const prepareIndex = (entries: SearchEntry[], timezone: string): PreparedEntry[] => {
	const shown = new Intl.DateTimeFormat('en-US', {
		timeZone: timezone,
		month: 'short',
		day: 'numeric',
		year: 'numeric',
	});
	const long = new Intl.DateTimeFormat('en-US', {
		timeZone: timezone,
		month: 'long',
		day: 'numeric',
		year: 'numeric',
	});
	const numeric = new Intl.DateTimeFormat('en-CA', { timeZone: timezone }); // YYYY-MM-DD
	return entries.map((entry) => {
		const dates: string[] = [];
		let dateText: string | undefined;
		if (entry.date) {
			const date = new Date(entry.date);
			dateText = shown.format(date);
			const [year, month, day] = numeric.format(date).split('-');
			dates.push(long.format(date), `${year}-${month}-${day}`, `${Number(month)}/${Number(day)}`);
		}
		return {
			entry,
			words: [...new Set([entry.title, ...entry.terms].flatMap(words))],
			dateWords: [...new Set(dates.flatMap(words))],
			dateText,
		};
	});
};

// The best results for a query, in sections - an entry is a result only if every query word matches one of its words
export const search = (index: PreparedEntry[], query: string) => {
	const queryWords = words(query);
	const scored: { item: PreparedEntry; score: number }[] = [];
	if (queryWords.length > 0) {
		for (const item of index) {
			let score = 0;
			for (const queryWord of queryWords) {
				let best: number | null = null;
				for (const [list, typos] of [
					[item.words, true],
					[item.dateWords, false],
				] as const) {
					for (const word of list) {
						const s = wordScore(queryWord, word, typos);
						if (s !== null && (best === null || s < best)) best = s;
					}
				}
				if (best === null) {
					score = -1;
					break;
				}
				score += best;
			}
			if (score >= 0) scored.push({ item, score });
		}
	}
	// Best matches first, then the newest matches, then shorter (closer) titles
	scored.sort(
		(a, b) =>
			a.score - b.score ||
			(b.item.entry.date ?? '').localeCompare(a.item.entry.date ?? '') ||
			a.item.entry.title.length - b.item.entry.title.length
	);

	const egg = index.find((item) => item.entry.url === `/players/${easterEggs[queryWords.join(' ')]}`);
	if (egg) {
		const existing = scored.findIndex(({ item }) => item === egg);
		if (existing !== -1) scored.splice(existing, 1); // already a result - move it to the top instead
		scored.unshift({ item: egg, score: 0 });
	}

	return searchGroups
		.map(({ type, label, limit }) => {
			const all = scored.filter(({ item }) => item.entry.type === type).map(({ item }) => item);
			return { type, label, total: all.length, results: all.slice(0, limit) };
		})
		.filter((group) => group.total > 0);
};
