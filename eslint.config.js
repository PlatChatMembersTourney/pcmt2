// @ts-check
// ESLint config: the recommended presets for JavaScript, TypeScript (with type-aware rules) and Astro,
// plus the two core React hooks rules. Run with `pnpm lint` (or `pnpm lint --fix` to auto-fix what it can).
import js from '@eslint/js';
import astro from 'eslint-plugin-astro';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
	globalIgnores(['dist/', '.astro/']),

	js.configs.recommended,

	// TypeScript rules, including type-aware ones (e.g. unhandled promises, unsafe `any` use)
	tseslint.configs.recommendedTypeChecked,
	{
		languageOptions: {
			parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
			globals: globals.browser,
		},
	},

	// Astro's recommended rules for .astro files
	astro.configs.recommended,
	{
		// type-aware rules don't work reliably inside .astro files, so they get the non-type-aware TypeScript rules only
		files: ['**/*.astro', '**/*.astro/*.ts'],
		...tseslint.configs.disableTypeChecked,
	},

	// React: the two classic hooks rules (the plugin's full preset adds many stricter React Compiler rules)
	{
		files: ['**/*.tsx'],
		// the plugin's published types don't quite match ESLint's Plugin type
		plugins: { 'react-hooks': /** @type {import('eslint').ESLint.Plugin} */ (reactHooks) },
		rules: {
			'react-hooks/rules-of-hooks': 'error',
			'react-hooks/exhaustive-deps': 'warn',
		},
	},

	// Config files run in Node
	{
		files: ['*.{js,mjs}'],
		languageOptions: { globals: globals.node },
	},
]);
