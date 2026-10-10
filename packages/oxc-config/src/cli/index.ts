import { defineCommand, runMain } from 'citty'
import path from 'node:path'

import { run } from './run'

export const main = defineCommand({
  async run({ args }) {
    const targetDir = path.resolve(args.cwd || '.')
    await run({ cwd: targetDir })
  },
  args: {
    cwd: {
      type: 'positional',
      default: '.',
      description: 'Target project directory',
      required: false,
    },
  },
  meta: {
    name: 'oxc-config',
    description: 'Ashtrath OXC configuration toolchain initialization wizard',
    version: '0.0.0',
  },
})

runMain(main)
