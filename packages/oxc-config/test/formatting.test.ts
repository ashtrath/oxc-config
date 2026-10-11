import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { format, parse, resolve } from 'node:path'
import { x } from 'tinyexec'
import { glob } from 'tinyglobby'
import { afterAll, beforeAll, it } from 'vitest'

import ashtrathFmt from '../src/fmt'

const fixtureRoot = resolve('test/__fixtures__/formatting')
const fixtureFiles = await glob('**/*', {
  cwd: fixtureRoot,
  onlyFiles: true,
})

let tempDir: string
let configPath: string

beforeAll(async () => {
  tempDir = await mkdtemp(resolve(tmpdir(), 'oxfmt-formatting-test-'))
  configPath = resolve(tempDir, 'oxfmt.json')
  await writeFile(configPath, JSON.stringify(ashtrathFmt(), null, 2))
})

afterAll(async () => {
  if (tempDir) {
    await rm(tempDir, { force: true, recursive: true })
  }
})

it.for(fixtureFiles)('$file formatting snapshots', async (file, { expect }) => {
  const filePath = resolve(fixtureRoot, file)
  const input = await readFile(filePath, 'utf8')

  const result = await x('bunx', ['oxfmt', `--stdin-filepath=${file}`, '-c', configPath], {
    stdin: input,
    throwOnError: true,
    nodeOptions: {
      cwd: fixtureRoot,
      stdio: 'pipe',
    },
  })

  const output = result.stdout.replaceAll('\r\n', '\n')

  const { dir, ext, name } = parse(file)
  const snapshotFile = format({
    base: `${name}.snap${ext}`,
    dir,
  })

  await expect(output).toMatchFileSnapshot(resolve('test/__snapshots__/formatting', snapshotFile))
})
