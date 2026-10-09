export const GLOB_SRC_EXT = '{js,mjs,cjs,jsx,ts,mts,cts,tsx}'
export const GLOB_SRC = `**/*.${GLOB_SRC_EXT}`

export const GLOB_JS = '**/*.{js,mjs,cjs}'
export const GLOB_JSX = '**/*.{jsx,mjsx,cjsx}'

export const GLOB_TS = '**/*.{ts,mts,cts}'
export const GLOB_TSX = '**/*.{tsx,mtsx,ctsx}'

export const GLOB_TESTS = [
  `**/__tests__/**/*.${GLOB_SRC_EXT}`,
  `**/*.spec.${GLOB_SRC_EXT}`,
  `**/*.test.${GLOB_SRC_EXT}`,
  `**/*.bench.${GLOB_SRC_EXT}`,
  `**/*.benchmark.${GLOB_SRC_EXT}`,
]

export const GLOB_EXCLUDE = [
  // ── Package managers & dependencies ──────────────────────────────────
  // oxlint only skips node_modules when a .gitignore lists it, so without
  // this entry `oxlint`/`oxfmt` rewrites installed packages in projects
  // that have no .gitignore (see issue https://github.com/haydenbleasel/ultracite/issues/737).
  '**/node_modules',
  '**/bun.lock',
  '**/bun.lockb',
  '**/package-lock.json',
  '**/pnpm-lock.yaml',
  '**/yarn.lock',
  '**/.yarn',

  // ── Build & framework outputs ────────────────────────────────────────
  '**/_astro',
  '**/android/build',
  '**/build',
  '**/DerivedData/**/*',
  '**/dist',
  '**/ios/build',
  '**/out',
  '**/output',
  '**/.astro',
  '**/.cache',
  '**/.changeset',
  '**/.expo',
  '**/.expo-shared',
  '**/.history',
  '**/.idea',
  '**/.netifly',
  '**/.next',
  '**/.nuxt',
  '**/.nyc_output',
  '**/.open-next',
  '**/.output',
  '**/.parcel-cache',
  '**/.svelte-kit',
  '**/.temp',
  '**/.tmp',
  '**/.turbo',
  '**/.vercel',
  '**/.vite',
  '**/.vitepress/cache',
  '**/temp',
  '**/tmp',

  // ── Test & coverage ──────────────────────────────────────────────────
  '**/__snapshots__',
  '**/coverage',

  // ── AI & agent artifacts ─────────────────────────────────────────────
  '**/.agents',
  '**/.claude',
  '**/.context',
  '**/.*/skills',

  // ── Generated code & types ───────────────────────────────────────────
  '**/__generated__',
  '**/_generated',
  '**/auto-generated',
  '**/codegen',
  '**/generated',
  '**/graphql-types.*',
  '**/next-env.d.ts',
  '**/schema.d.ts',
  '**/schema.graphql.d.ts',
  '**/worker-configuration.d.ts',
  '**/*.auto.*',
  '**/*.d.ts.map',
  '**/*.gen.*',
  '**/*.generated.*',

  // ── Static assets & metadata ─────────────────────────────────────────
  '**/CHANGELOG*.md',
  '**/LICENSE*',
  '**/*.min.*',
]
