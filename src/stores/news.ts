import { getCollection } from 'astro:content';

// News articles, newest first - build time only (pages, not React islands)
export const getNews = async () =>
	(await getCollection('news')).sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
