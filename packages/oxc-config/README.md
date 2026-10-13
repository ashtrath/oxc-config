# @ashtrath/oxc-config

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](https://github.com/ashtrath/oxc-config/blob/main/LICENSE)
[![npm version](https://img.shields.io/npm/v/@ashtrath/oxc-config.svg?style=flat-square&color=orange)](https://www.npmjs.com/package/@ashtrath/oxc-config)
[![Powered by OXC](https://img.shields.io/badge/powered%20by-oxc-f97316.svg?style=flat-square)](https://oxc.rs)

Opinionated Oxlint and Oxfmt configuration factories for TypeScript projects, with an interactive setup wizard and automatic preset composition.

The factory architecture follows the composable design popularized by Anthony Fu in [@antfu/eslint-config](https://github.com/antfu/eslint-config), adapted for native Oxlint and Oxfmt toolchains.

## Quick start

Run the interactive CLI wizard in your project root:

```bash
# Bun
bunx @ashtrath/oxc-config

# pnpm
pnpm dlx @ashtrath/oxc-config

# npm
npx @ashtrath/oxc-config
```

The wizard:

1. Detects your package manager from lockfiles.
2. Identifies project frameworks (React, Next.js, Tailwind CSS).
3. Writes `oxlint.config.ts` and `oxfmt.config.ts`.
4. Adds `lint`, `lint:fix`, and `fmt` scripts to `package.json`.
5. Configures `.vscode/settings.json` for format-on-save.

## Manual installation

Install `@ashtrath/oxc-config` and peer dependencies:

```bash
# Bun
bun add -D @ashtrath/oxc-config oxlint oxfmt

# pnpm
pnpm add -D @ashtrath/oxc-config oxlint oxfmt

# npm
npm i -D @ashtrath/oxc-config oxlint oxfmt
```

Optional peer dependencies for framework support:

```bash
# Tailwind CSS sorting and lint rules
bun add -D oxlint-tailwindcss

# React Doctor inspection rules
bun add -D oxlint-plugin-react-doctor

# Anti-slop heuristic rules
bun add -D @ashtrath/oxlint-plugin-slop
```

## Configuration

### Linter (`oxlint.config.ts`)

Export the result of `ashtrathLint`:

```ts
import ashtrathLint from '@ashtrath/oxc-config/lint'

export default ashtrathLint({
  // Project type: 'app' (default) or 'lib'
  type: 'app',

  // Framework toggles (auto-detected by CLI)
  react: true,
  nextjs: false,

  // Tailwind CSS configuration
  tailwindcss: {
    entryPoint: 'src/index.css',
  },

  // Anti-slop heuristic checks
  antislop: true,

  // Ignore patterns
  ignorePatterns: ['dist/**', 'coverage/**'],
})
```

You can pass extra Oxlint configuration items or overrides as trailing arguments:

```ts
import ashtrathLint from '@ashtrath/oxc-config/lint'

export default ashtrathLint(
  { type: 'lib' },
  {
    rules: {
      'no-console': 'warn',
    },
  },
)
```

### Formatter (`oxfmt.config.ts`)

Export the result of `ashtrathFmt`:

```ts
import ashtrathFmt from '@ashtrath/oxc-config/fmt'

export default ashtrathFmt({
  // Default options: 2 spaces, single quotes, no semicolons, trailing commas, print width 100
  sortImports: true,
  sortPackageJson: true,
  sortTailwindcss: true,
  jsdoc: true,
})
```

Custom file override objects pass directly as trailing arguments:

```ts
import ashtrathFmt from '@ashtrath/oxc-config/fmt'

export default ashtrathFmt(
  {},
  {
    files: ['**/*.md'],
    tabWidth: 4,
  },
)
```

## Presets

`ashtrathLint` packages these presets:

| Preset          | Target                 | Description                                                        |
| --------------- | ---------------------- | ------------------------------------------------------------------ |
| `javascript`    | All files              | Base syntax checks, modern idiom enforcement, and console controls |
| `typescript`    | `*.ts`, `*.tsx`        | TypeScript strictness, type assertions, and `app` vs `lib` rules   |
| `perfectionist` | All files              | Natural sorting for imports, exports, and object keys              |
| `antislop`      | All files              | AST heuristic rules from `@ashtrath/oxlint-plugin-slop`            |
| `react`         | JSX / TSX              | React hooks and React Doctor diagnostics                           |
| `nextjs`        | Next.js projects       | Routing rules and framework conventions                            |
| `tailwindcss`   | Class attributes       | Class sorting and duplicate class detection                        |
| `vitest`        | `*.test.*`, `*.spec.*` | Test assertions and suite structure                                |
| `e18e`          | All files              | Ecosystem cleanup and package dependency hygiene                   |
| `unicorn`       | All files              | Modern standard library patterns                                   |
| `node`          | Node scripts           | Node runtime globals and process controls                          |
| `regexp`        | Regex literals         | Regular expression correctness and backtracking checks             |
| `comments`      | Directives             | Suppression comments and unused disable reporting                  |

## VS Code settings

Install the [Oxc VS Code extension](https://marketplace.visualstudio.com/items?itemName=oxc.oxc-vscode).

Add these settings to `.vscode/settings.json`:

```json
{
  "prettier.enable": false,
  "editor.defaultFormatter": "oxc.oxc-vscode",
  "editor.formatOnSave": true,
  "editor.formatOnSaveMode": "file",
  "editor.codeActionsOnSave": {
    "source.fixAll.oxc": "explicit",
    "source.organizeImports": "never"
  },
  "[javascript]": { "editor.defaultFormatter": "oxc.oxc-vscode" },
  "[javascriptreact]": { "editor.defaultFormatter": "oxc.oxc-vscode" },
  "[typescript]": { "editor.defaultFormatter": "oxc.oxc-vscode" },
  "[typescriptreact]": { "editor.defaultFormatter": "oxc.oxc-vscode" },
  "[json]": { "editor.defaultFormatter": "oxc.oxc-vscode" },
  "[jsonc]": { "editor.defaultFormatter": "oxc.oxc-vscode" }
}
```

## Scripts

Add standard scripts to `package.json`:

```json
{
  "scripts": {
    "lint": "oxlint",
    "lint:fix": "oxlint --fix",
    "fmt": "oxfmt --write --no-error-on-unmatched-pattern"
  }
}
```

## Acknowledgements

- Factory pattern and composable API design inspired by Anthony Fu's [@antfu/eslint-config](https://github.com/antfu/eslint-config).

## License

[MIT](https://github.com/ashtrath/oxc-config/blob/main/LICENSE)
