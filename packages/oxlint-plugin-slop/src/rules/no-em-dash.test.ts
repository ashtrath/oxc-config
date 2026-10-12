// oxlint-disable eslint/no-template-curly-in-string -- test case verifying template literal with interpolation
import { RuleTester } from 'oxlint/plugins-dev'

import { noEmDash } from './no-em-dash'

const ruleTester = new RuleTester()
const error = { messageId: 'avoid' }

ruleTester.run('no-em-dash', noEmDash, {
  invalid: [
    {
      code: '// Comment with \u2014 em dash.',
      errors: [error],
    },
    {
      code: 'const note = "one \u2014 two";',
      errors: [error],
    },
    {
      code: "const note = 'hello \u2014 world';",
      errors: [error],
    },
    {
      code: 'const note = "First. Second \u2014 with dash. Third.";',
      errors: [error],
    },
    {
      code: 'const t = `simple \u2014 template`;',
      errors: [error],
    },
    {
      code: 'const t = `interpolated ${val} \u2014 template`;',
      errors: [error],
    },
    {
      code: 'const t = `\n  first line\n  second \u2014 line\n  third line\n`;',
      errors: [error],
    },
    {
      code: '// One \u2014 two \u2014 three.',
      errors: [error],
    },
    {
      code: 'const note = "One \u2014 two \u2014 three.";',
      errors: [error],
    },
    {
      code: '/* Sentence one. Sentence \u2014 two. Sentence three. */',
      errors: [error],
    },
    {
      code: 'const a = "one \u2014 two";\n// three \u2014 four',
      errors: [error, error],
    },
    {
      // Two sentences in one string: two reports
      code: 'const s = "A \u2014 b. C \u2014 d.";',
      errors: [error, error],
    },
    {
      // JSDoc continuation line: the leading `*` is part of the highlight
      code: '/**\n * Foo \u2014 bar.\n */',
      errors: [error],
    },
    {
      name: '',
      code: 'const a = 1;\r\n// x \u2014 y',
      errors: [error],
    },
    {
      code: 'const a = <p>Fast \u2014 and simple</p>;',
      errors: [error],
      filename: 'test.jsx',
    },
    {
      code: 'const a = <p title="Fast \u2014 simple" />;',
      errors: [error],
      filename: 'test.jsx',
    },
  ],
  valid: [
    '// This is a normal comment without em dash.',
    '/* Block comment with -- double hyphen. */',
    '// Comment with \u2013 en dash.',
    'const msg = "normal string without em dash";',
    'const msg = "string with -- double hyphen";',
    'const msg = "string with \u2013 en dash";',
    // Known blind spot: an escaped dash is not visible in the source text
    'const msg = "\\u2014";',
    'const t = `template without em dash`;',
    'const t = `template with ${name} and no em dash`;',
    'const t = `template with -- double hyphen`;',
    'const re = /\u2014/;',
    'const re = /[\u2014]/u;',
    // Em dash in code position (identifier-adjacent) is not prose
    'const a = 1; // fine',
    {
      code: 'const a = <p>Fast and simple</p>;',
      filename: 'test.jsx',
    },
  ],
})
