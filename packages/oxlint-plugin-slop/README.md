# @ashtrath/oxlint-plugin-slop

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](https://github.com/ashtrath/oxc-config/blob/main/LICENSE)
[![npm version](https://img.shields.io/npm/v/@ashtrath/oxlint-plugin-slop.svg?style=flat-square&color=pink)](https://www.npmjs.com/package/@ashtrath/oxlint-plugin-slop)
[![Powered by OXC](https://img.shields.io/badge/powered%20by-oxc-f97316.svg?style=flat-square)](https://oxc.rs)

Oxlint plugin providing AST heuristic rules that flag low-signal code patterns, narrative prose filler, and unidiomatic TypeScript constructs.

## Overview

Modern code generators often introduce verbose prose, empty abstraction layers, and repetitive type assertions. This plugin runs native in-memory AST checks via `@oxlint/plugins` to enforce conciseness in comments and code structure without subprocess latency.

## Installation

```bash
# Bun
bun add -D @ashtrath/oxlint-plugin-slop oxlint

# pnpm
pnpm add -D @ashtrath/oxlint-plugin-slop oxlint

# npm
npm i -D @ashtrath/oxlint-plugin-slop oxlint
```

## Usage

### With `@ashtrath/oxc-config`

Enable the `antislop` preset in `oxlint.config.ts`:

```ts
import ashtrathLint from '@ashtrath/oxc-config/lint'

export default ashtrathLint({
  antislop: true,
})
```

### Standalone with `oxlint`

Register the plugin directly in `oxlint.config.ts`:

```ts
import slop from '@ashtrath/oxlint-plugin-slop'
import { defineConfig } from 'oxlint'

export default defineConfig({
  jsPlugins: [slop],
  rules: {
    'slop/no-em-dash': 'error',
    'slop/no-jargon': 'warn',
    'slop/no-trivial-functions': 'error',
    'slop/no-trivial-type-aliases': 'error',
    'slop/no-array-filter-map': 'error',
    'slop/no-reduce-accumulator-copy': 'error',
    'slop/no-conditional-empty-object-spread': 'error',
    'slop/no-chained-type-assertions': 'error',
    'slop/require-safety-comment-for-type-assertion': 'error',
  },
})
```

## Rules

### Prose rules

Rules targeting narrative comments, marketing jargon, and typographic tells in comments and string literals.

| Rule                 | Description                                                                                                   |
| -------------------- | ------------------------------------------------------------------------------------------------------------- |
| `no-em-dash`         | Prohibits em dashes (`—`) in code comments, string literals, and JSX text. Prefer periods or commas.          |
| `no-jargon`          | Flags common corporate and AI buzzwords in code comments (such as "delve", "leverage", "utilize", "crucial"). |
| `max-comment-length` | Restricts comment lines to 100 characters to prevent multi-paragraph essays in source files.                  |
| `prefer-jsdoc`       | Requires JSDoc format (`/** ... */`) for multi-line block comments instead of plain narrative comments.       |

### Structural rules

Rules targeting unidiomatic AST syntax shapes, redundant abstractions, and unsafe type expressions.

| Rule                                        | Description                                                                                                      |
| ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `no-trivial-functions`                      | Forbids wrapper functions that only forward parameters to another function without transformation.               |
| `no-trivial-type-aliases`                   | Forbids type aliases that simply rename primitive types without adding union or branded constraints.             |
| `no-array-filter-map`                       | Replaces sequential `.filter().map()` chains with single-pass `.flatMap()` or `.reduce()`.                       |
| `no-reduce-accumulator-copy`                | Prohibits copying accumulators with object or array spreads inside `.reduce()`. Mutate the accumulator directly. |
| `no-conditional-empty-object-spread`        | Flags patterns like `...(condition ? { key } : {})`. Add properties directly or conditionally.                   |
| `no-chained-type-assertions`                | Prohibits chained type assertions such as `x as unknown as T`.                                                   |
| `require-safety-comment-for-type-assertion` | Requires a preceding structured comment explaining the invariant before any `as T` type assertion.               |
| `no-shape-in-symbol-names`                  | Disallows encoding data structures in identifiers (such as `userListArray` or `optionsObject`).                  |
| `no-static-only-class`                      | Disallows classes that contain only static methods and properties. Use module-level functions instead.           |

## Acknowledgements

- Rule concepts, heuristics, and reference implementations draw inspiration from:
  - Anthony Fu's [antfu/eslint-plugin-slop](https://github.com/antfu/eslint-plugin-slop)
  - Dillon Mulroy's [dmmulroy/anti-slop](https://github.com/dmmulroy/anti-slop)

This package implements these concepts as native Oxlint rules using `@oxlint/plugins`.

## License

[MIT](https://github.com/ashtrath/oxc-config/blob/main/LICENSE)
