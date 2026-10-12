import { RuleTester } from 'oxlint/plugins-dev'

import { noJargon } from './no-jargon'

const ruleTester = new RuleTester()

ruleTester.run('no-jargon', noJargon, {
  invalid: [
    {
      code: '// We utilize this helper.',
      errors: [
        {
          data: { word: 'utilize' },
          messageId: 'jargon',
          suggestions: [
            {
              data: { replacement: 'use', word: 'utilize' },
              messageId: 'replace',
              output: '// We use this helper.',
            },
          ],
        },
      ],
    },
    {
      code: '/* We leverage cache here. */',
      errors: [
        {
          data: { word: 'leverage' },
          messageId: 'jargon',
          suggestions: [
            {
              data: { replacement: 'use', word: 'leverage' },
              messageId: 'replace',
              output: '/* We use cache here. */',
            },
          ],
        },
      ],
    },
    {
      code: '// We delve into the implementation.',
      errors: [
        {
          data: { word: 'delve' },
          messageId: 'jargon',
          suggestions: [
            {
              data: { replacement: 'explore', word: 'delve' },
              messageId: 'replace',
              output: '// We explore into the implementation.',
            },
          ],
        },
      ],
    },
    {
      code: '// Additionally, check bounds.',
      errors: [
        {
          data: { word: 'Additionally' },
          messageId: 'jargon',
          suggestions: [
            {
              data: { replacement: 'Also', word: 'Additionally' },
              messageId: 'replace',
              output: '// Also, check bounds.',
            },
          ],
        },
      ],
    },
    {
      code: '// Fostering better performance.',
      errors: [
        {
          data: { word: 'Fostering' },
          messageId: 'jargon',
          suggestions: [
            {
              data: { replacement: 'Supporting', word: 'Fostering' },
              messageId: 'replace',
              output: '// Supporting better performance.',
            },
          ],
        },
      ],
    },
    {
      code: '// Streamline the pipeline.',
      errors: [
        {
          data: { word: 'Streamline' },
          messageId: 'jargon',
          suggestions: [
            {
              data: { replacement: 'Simplify', word: 'Streamline' },
              messageId: 'replace',
              output: '// Simplify the pipeline.',
            },
          ],
        },
      ],
    },
    {
      code: '// This is crucial.',
      errors: [
        {
          data: { word: 'crucial' },
          messageId: 'jargon',
          suggestions: [
            {
              data: { replacement: 'important', word: 'crucial' },
              messageId: 'replace',
              output: '// This is important.',
            },
          ],
        },
      ],
    },
    {
      code: '// A pivotal change in behavior.',
      errors: [
        {
          data: { word: 'pivotal' },
          messageId: 'jargon',
        },
      ],
    },
    {
      code: '// Complex interplay between components.',
      errors: [
        {
          data: { word: 'interplay' },
          messageId: 'jargon',
        },
      ],
    },
    {
      code: '// A testament to simplicity.',
      errors: [
        {
          data: { word: 'testament' },
          messageId: 'jargon',
        },
      ],
    },
    {
      code: '// Synergize the components.',
      options: [{ extraWords: ['synergize'] }],
      errors: [
        {
          data: { word: 'Synergize' },
          messageId: 'jargon',
        },
      ],
    },
    {
      code: '// We utilize and utilizes it.',
      options: [{ allow: ['utilize'] }],
      errors: [
        {
          messageId: 'jargon',
          suggestions: [{ messageId: 'replace', output: '// We utilize and uses it.' }],
        },
      ],
    },
  ],
  valid: [
    '// This is a normal comment.',
    '/* Block comment without buzzwords. */',
    '// see https://example.com/robust-design',
    '// returns `foo.leverage()`',
    '// see `robust`',
    '/* ```\nrobust\n``` */',
    '// The word "utilize" is discussed here.',
    '// We avoid `leverage` in names.',
    "// Quote 'delve' as a concept.",
    '// robustConfig and robust_config',
    '// robusté',
    '// eslint-disable-next-line foo -- robust reason',
    'const msg = "we utilize this";',
    'const utilize = true;',
    {
      code: '// We delve into this topic.',
      options: [{ allow: ['delve'] }],
    },
    {
      code: '/** We delve into this topic. */',
      options: [{ ignoreJSDoc: true }],
    },
    {
      code: '// A robust setup.',
      options: [{ allow: ['robust'] }],
    },
  ],
})
