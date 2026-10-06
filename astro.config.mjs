// @ts-check
import { defineConfig } from 'astro/config'
import tailwindcss from '@tailwindcss/vite'

import react from '@astrojs/react'

// https://astro.build/config
export default defineConfig({
	vite: {
		plugins: [tailwindcss()],
		// Bracket.tsx loads this with import(), which the dev server only finds on first use - it then re-bundles
		// its dependencies and the page fails to load the old bundle ("504 Outdated Optimize Dep"). Bundle it up front.
		optimizeDeps: {
			include: ['brackets-viewer/dist/brackets-viewer.min.js'],
		},
	},

	integrations: [react()],
	output: 'static',
})
