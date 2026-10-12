import { RuleTester } from 'oxlint/plugins-dev'

import { noTrivialTypeAliases } from './no-trivial-type-aliases'

const ruleTester = new RuleTester()
const unknownError = { messageId: 'unknown' }
const primitiveError = { messageId: 'primitive' }

ruleTester.run('no-trivial-type-aliases', noTrivialTypeAliases, {
  invalid: [
    {
      name: 'reports direct unknown type alias',
      code: 'type Unchecked = unknown;',
      errors: [unknownError],
    },
    {
      name: 'reports transitive unknown type aliases in same file',
      code: ['type Unchecked = unknown;', 'type Input = Unchecked;'].join('\n'),
      errors: [unknownError, unknownError],
    },
    {
      name: 'reports exported transitive unknown type alias',
      code: ['type Unchecked = unknown;', 'export type Input = Unchecked;'].join('\n'),
      errors: [unknownError, unknownError],
    },
    {
      name: 'reports deeply chained unknown type alias',
      code: ['type Raw = unknown;', 'type Unparsed = Raw;', 'type Payload = Unparsed;'].join('\n'),
      errors: [unknownError, unknownError, unknownError],
    },
    {
      name: 'reports primitive aliases when allowPrimitives is false',
      code: ['type UserId = string;', 'type AccountId = UserId;'].join('\n'),
      errors: [primitiveError, primitiveError],
      options: [{ allowPrimitives: false }],
    },
    {
      name: 'reports all primitive keywords when allowPrimitives is false',
      options: [{ allowPrimitives: false }],
      code: [
        'type Flag = boolean;',
        'type Count = number;',
        'type BigVal = bigint;',
        'type Sym = symbol;',
        'type Nil = null;',
        'type Undef = undefined;',
      ].join('\n'),
      errors: [
        primitiveError,
        primitiveError,
        primitiveError,
        primitiveError,
        primitiveError,
        primitiveError,
      ],
    },
    {
      name: 'reports both primitive and unknown aliases when allowPrimitives is false',
      code: ['type UserId = string;', 'type Unchecked = unknown;'].join('\n'),
      errors: [primitiveError, unknownError],
      options: [{ allowPrimitives: false }],
    },
  ],
  valid: [
    'type UserId = string;',
    'type AccountId = UserId;',
    'type Flag = boolean;',
    'type Count = number;',
    'type BigVal = bigint;',
    'type Sym = symbol;',
    'type Nil = null;',
    'type Undef = undefined;',
    {
      code: ['type UserId = string;', 'type AccountId = UserId;'].join('\n'),
      options: [{ allowPrimitives: true }],
    },
    'type Identifier = string & { readonly __brand: unique symbol };',
    'type State = "open" | "closed";',
    'type Items = string[];',
    'type Pair = [string, number];',
    'type User = { id: string };',
    'type Handler = () => void;',
    'type ImportedAlias = ExternalType;',
    'export type External = RemoteService;',
    'type Box<T> = T;',
    'type Container<T> = unknown;',
    ['type A = B;', 'type B = A;'].join('\n'),
  ],
})
