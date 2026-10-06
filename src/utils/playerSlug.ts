import slugify from 'slugify';

// A player's page URL (/players/<slug>) - also how the same player is matched across events
// (names are spelled with different capitals, and some S1 names end in "*")
export const playerSlug = (name: string) => slugify(name, { lower: true, strict: true });
