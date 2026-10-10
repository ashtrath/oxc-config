import { describe, expect, it } from 'vitest'

import { ashtrathFmt } from './factory'

describe('ashtrathFmt factory', () => {
  it('generates expected default oxfmt configuration', () => {
    const config = ashtrathFmt()

    expect(config.arrowParens).toBe('avoid')
    expect(config.bracketSameLine).toBe(false)
    expect(config.bracketSpacing).toBe(true)
    expect(config.endOfLine).toBe('lf')
    expect(config.insertFinalNewline).toBe(true)
    expect(config.jsxSingleQuote).toBe(false)
    expect(config.printWidth).toBe(100)
    expect(config.quoteProps).toBe('as-needed')
    expect(config.semi).toBe(false)
    expect(config.singleQuote).toBe(true)
    expect(config.tabWidth).toBe(2)
    expect(config.trailingComma).toBe('all')
    expect(config.useTabs).toBe(false)
    expect(config.sortPackageJson).toEqual({
      sortScripts: true,
    })
    expect(config.sortImports).toEqual(
      expect.objectContaining({
        internalPattern: ['~/', '@/', '#'],
        order: 'asc',
      }),
    )
    expect(config.jsdoc).toEqual({
      commentLineStrategy: 'multiline',
      preferCodeFences: true,
    })
  })

  it('allows overriding default formatting options', () => {
    const config = ashtrathFmt({
      semi: true,
      singleQuote: false,
      sortImports: false,
      sortPackageJson: false,
    })

    expect(config.semi).toBe(true)
    expect(config.singleQuote).toBe(false)
    expect(config.sortImports).toBe(false)
    expect(config.sortPackageJson).toBe(false)
  })
})
