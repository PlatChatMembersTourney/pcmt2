import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// News articles: one Markdown file each in src/content/news/ (folders by event), shown at /news/<path>
const news = defineCollection({
	loader: glob({ pattern: '**/*.md', base: './src/content/news' }),
	schema: z.object({
		title: z.string(),
		date: z.coerce.date(),
		author: z.string(),
		summary: z.string(),
		event: z.string().optional(), // events.json id
		matches: z.array(z.string()).optional(), // match ids, shown as cards under the article
	}),
});

export const collections = { news };
