import { RuleTester } from 'oxlint/plugins-dev'

import { noConditionalEmptyObjectSpread } from './no-conditional-empty-object-spread'

const ruleTester = new RuleTester()
const error = { messageId: 'avoid' }

ruleTester.run('no-conditional-empty-object-spread', noConditionalEmptyObjectSpread, {
  invalid: [
    {
      name: 'conditional spread with empty alternate',
      code: 'const result = { ...(condition ? { a: 1 } : {}) };',
      errors: [error],
    },
    {
      name: 'conditional spread with empty consequent',
      code: 'const result = { ...(condition ? {} : { a: 1 }) };',
      errors: [error],
    },
    {
      name: 'parenthesized branches',
      code: 'const result = { ...((condition ? ({ a: 1 }) : ({}))) };',
      errors: [error],
    },
  ],
  valid: [
    'const result = { value };',
    'const result = { ...values };',
    'const result = { ...(condition ? { a: 1 } : { b: 2 }) };',
    'const result = condition ? { value } : {};',
    'const result = [ ...(condition ? [1] : []) ];',
    'fn(...(condition ? [1] : []));',
  ],
})
