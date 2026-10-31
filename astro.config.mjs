// @ts-check
import { defineConfig } from 'astro/config'
import tailwindcss from '@tailwindcss/vite'

import react from '@astrojs/react'
import { readdirSync } from 'node:fs'

// https://astro.build/config
export default defineConfig({
	vite: {
		plugins: [tailwindcss()],
		// The Advertisement column's images: every file in public/res/garbage, listed here so the component doesn't have to
		// import them (an import would copy each one into the build a second time). Restart the dev server after adding one.
		define: {
			__GARBAGE__: JSON.stringify(readdirSync('public/res/garbage')),
		},
		// Bracket.tsx loads this with import(), which the dev server only finds on first use - it then re-bundles
		// its dependencies and the page fails to load the old bundle ("504 Outdated Optimize Dep"). Bundle it up front.
		optimizeDeps: {
			include: ['brackets-viewer/dist/brackets-viewer.min.js'],
		},
	},

	integrations: [react()],
	output: 'static',
})
