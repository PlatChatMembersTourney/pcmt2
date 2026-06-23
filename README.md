# starter guide by string ray

we use pnpm in this household

[install node.js](https://nodejs.org/en/download) (latest LTS)
(get the prebuilt installer for your OS, for windows that's .msi)

Run the installer, make sure that Add to PATH is enabled

Do whatever you want with "Automatically install the necessary tools" (I don't use it)

Install pnpm using npm

```
npm install -g pnpm@latest
```

then try going to the project directory and running

```text
pnpm install
```

You are now set up. run
```
pnpm run dev
```
to get a preview of the site at localhost:4321.

you can develop the site in whatever IDE you choose (I use WebStorm which comes free with the GitHub Student Pack / if you register as a student on JetBrains)

VSCode also works obviously, but make sure to install extensions for tailwind, astro, react, and typescript. And prettier probably. And ESLint. There might be more idk