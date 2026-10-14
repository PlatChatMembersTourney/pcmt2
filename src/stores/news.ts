import { getCollection } from 'astro:content';
import { eventById } from './events.ts';

// News articles, newest first, with their page URL and event - build time only (pages, not React islands)
export const getNews = async () =>
	(await getCollection('news'))
		.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf())
		.map((article) => ({
			...article,
			url: `/news/${article.id}`,
			event: article.data.event ? eventById[article.data.event] : undefined,
		}));

// An article's date as written - frontmatter dates are plain days (midnight UTC), so not shifted into a timezone
export const articleDate = (date: Date, options: Intl.DateTimeFormatOptions) =>
	date.toLocaleDateString('en-US', { ...options, timeZone: 'UTC' });
