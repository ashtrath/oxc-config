# oxc-config

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](./LICENSE)
[![npm version](https://img.shields.io/npm/v/@ashtrath/oxc-config.svg?style=flat-square&color=orange)](https://www.npmjs.com/package/@ashtrath/oxc-config)
[![Powered by OXC](https://img.shields.io/badge/powered%20by-oxc-f97316.svg?style=flat-square)](https://oxc.rs)

Opinionated Oxlint and Oxfmt configuration toolchain for TypeScript projects.

## Packages

This monorepo contains two packages:

| Package                                                         | Description                                                                      |
| --------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| [`@ashtrath/oxc-config`](./packages/oxc-config)                 | Oxlint and Oxfmt configuration factories, 20+ presets, and interactive setup CLI |
| [`@ashtrath/oxlint-plugin-slop`](./packages/oxlint-plugin-slop) | Oxlint AST heuristic rules flagging low-signal code patterns and prose tells     |

See each package directory for detailed guides, presets, and rule documentation.

## Quick start

Initialize `oxlint.config.ts`, `oxfmt.config.ts`, and editor settings in any repository:

```bash
# Bun
bunx @ashtrath/oxc-config

# pnpm
pnpm dlx @ashtrath/oxc-config

# npm
npx @ashtrath/oxc-config
```

## Repository development

This repository runs on [Bun](https://bun.com) with Turborepo:

```bash
# Install dependencies
bun install

# Run checks across all workspaces
bun run lint
bun run fmt
bun run test
bun run typecheck

# Build packages
bun run build
```

## Acknowledgements

- Factory pattern and composable preset architecture inspired by Anthony Fu's [@antfu/eslint-config](https://github.com/antfu/eslint-config).
- Anti-slop heuristic rules inspired by and referenced from Anthony Fu's [@antfu/eslint-plugin-slop](https://github.com/antfu/eslint-plugin-slop) and Dillon Mulroy's [@dmmulroy/anti-slop](https://github.com/dmmulroy/anti-slop).

## License

[MIT](./LICENSE)
