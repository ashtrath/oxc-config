import fsp from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { run } from './run'

const mockError = vi.fn()
const mockWarn = vi.fn()
const mockInfo = vi.fn()
const mockSuccess = vi.fn()
const mockOutro = vi.fn()
const mockIntro = vi.fn()
const mockGroup = vi.fn()
const mockConfirm = vi.fn()
const mockSpinner = vi.fn(() => ({
  start: vi.fn(),
  stop: vi.fn(),
}))

vi.mock('@clack/prompts', () => ({
  cancel: vi.fn(),
  confirm: (...args: any[]) => mockConfirm(...args),
  group: (...args: any[]) => mockGroup(...args),
  intro: (...args: any[]) => mockIntro(...args),
  isCancel: () => false,
  outro: (...args: any[]) => mockOutro(...args),
  spinner: () => mockSpinner(),
  log: {
    error: (...args: any[]) => mockError(...args),
    info: (...args: any[]) => mockInfo(...args),
    success: (...args: any[]) => mockSuccess(...args),
    warn: (...args: any[]) => mockWarn(...args),
  },
}))

describe('cli run runner', () => {
  let tempDir: string
  let exitSpy: any

  beforeEach(async () => {
    tempDir = path.join(
      os.tmpdir(),
      `oxc-cli-test-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    )
    await fsp.mkdir(tempDir, { recursive: true })

    exitSpy = vi
      .spyOn(process, 'exit')
      .mockImplementation((code?: string | number | null | undefined) => {
        throw new Error(`process.exit: ${code}`)
      })

    mockError.mockClear()
    mockWarn.mockClear()
    mockInfo.mockClear()
    mockSuccess.mockClear()
    mockOutro.mockClear()
    mockIntro.mockClear()
    mockGroup.mockClear()
    mockConfirm.mockClear()
  })

  afterEach(async () => {
    vi.restoreAllMocks()
    await fsp.rm(tempDir, { force: true, recursive: true })
  })

  it('aborts with exit code 1 when package.json is missing', async () => {
    await expect(run({ cwd: tempDir })).rejects.toThrow('process.exit: 1')
    expect(exitSpy).toHaveBeenCalledWith(1)
    expect(mockError).toHaveBeenCalledWith(expect.stringContaining('No package.json found'))
  })

  it('aborts with exit code 1 when oxlint.config.ts already exists', async () => {
    await fsp.writeFile(path.join(tempDir, 'package.json'), '{}', 'utf8')
    await fsp.writeFile(path.join(tempDir, 'oxlint.config.ts'), 'export default {}', 'utf8')

    await expect(run({ cwd: tempDir })).rejects.toThrow('process.exit: 1')
    expect(mockWarn).toHaveBeenCalledWith(expect.stringContaining('Found existing config'))
  })

  it('executes full wizard setup and displays install guidance', async () => {
    await fsp.writeFile(
      path.join(tempDir, 'package.json'),
      JSON.stringify({ name: 'test-app', version: '1.0.0' }, null, 2),
      'utf8',
    )

    // Create a bun lockfile to verify bun detection
    await fsp.writeFile(path.join(tempDir, 'bun.lock'), '', 'utf8')

    // Mock prompt group to confirm uncommitted changes and provide selections
    mockGroup.mockResolvedValue({
      cwd: tempDir,
      extra: [],
      frameworks: [],
      uncommittedConfirmed: true,
      updateVscodeSettings: false,
    })

    await run({ cwd: tempDir })

    const updatedPkg = JSON.parse(await fsp.readFile(path.join(tempDir, 'package.json'), 'utf8'))
    expect(updatedPkg.scripts.lint).toBe('oxlint')
    expect(updatedPkg.scripts['lint:fix']).toBe('oxlint --fix')
    expect(updatedPkg.scripts.fmt).toBe('oxfmt --write --no-error-on-unmatched-pattern')
    expect(updatedPkg.devDependencies['@ashtrath/oxc-config']).toBeDefined()
    expect(updatedPkg.devDependencies.oxlint).toBeDefined()
    expect(updatedPkg.devDependencies.oxfmt).toBeDefined()

    expect(mockOutro).toHaveBeenCalledWith(expect.stringContaining('bun install'))
  })

  it('prompts and retains existing script when user declines replacement in wizard flow', async () => {
    await fsp.writeFile(
      path.join(tempDir, 'package.json'),
      JSON.stringify({ name: 'collision-app', scripts: { lint: 'custom-lint' } }, null, 2),
      'utf8',
    )
    await fsp.writeFile(path.join(tempDir, 'bun.lock'), '', 'utf8')

    mockGroup.mockResolvedValue({
      cwd: tempDir,
      extra: [],
      frameworks: [],
      uncommittedConfirmed: true,
      updateVscodeSettings: false,
    })
    mockConfirm.mockResolvedValue(false)

    await run({ cwd: tempDir })

    const updatedPkg = JSON.parse(await fsp.readFile(path.join(tempDir, 'package.json'), 'utf8'))
    expect(mockConfirm).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining('Script "lint" already exists'),
      }),
    )
    expect(updatedPkg.scripts.lint).toBe('custom-lint')
    expect(updatedPkg.scripts['lint:fix']).toBe('oxlint --fix')
  })
})
