import { RuleTester } from 'oxlint/plugins-dev'

import { noShapeInSymbolNames } from './no-shape-in-symbol-names'

const ruleTester = new RuleTester()
const error = { messageId: 'forbiddenSymbolName' }

ruleTester.run('no-shape-in-symbol-names', noShapeInSymbolNames, {
  invalid: [
    {
      name: 'variable declaration named shape',
      code: 'const shape = 1;',
      errors: [error],
    },
    {
      name: 'function declaration containing shape',
      code: 'function shapeOf() {}',
      errors: [error],
    },
    {
      name: 'type alias containing shape',
      code: 'type PayloadShape = { id: string };',
      errors: [error],
    },
    {
      name: 'object type property definition named shape',
      code: 'type Payload = { shape: string };',
      errors: [error],
    },
    {
      name: 'object literal property definition named shape',
      code: 'const payload = { shape: "circle" };',
      errors: [error],
    },
    {
      name: 'class declaration containing shape',
      code: 'class ShapeRenderer {}',
      errors: [error],
    },
    {
      name: 'class private field containing shape',
      code: 'class Renderer { #itemShape = "box"; }',
      errors: [error],
    },
    {
      name: 'class method named shape',
      code: 'class Renderer { getShape() { return "box"; } }',
      errors: [error],
    },
    {
      name: 'JSX element containing shape',
      code: 'const element = <CustomShape />;',
      errors: [error],
      filename: 'test.tsx',
    },
    {
      name: 'computed member access with variable named shape',
      code: 'declare const owner: External; const shape = "field"; const value = owner[shape];',
      errors: [error, error],
    },
    {
      name: 'destructuring without rename creates local variable named shape',
      code: 'declare const schema: ExternalSchema; const { shape } = schema;',
      errors: [error],
    },
  ],
  valid: [
    {
      name: 'borrowed static property access on schema object',
      code: 'declare const schema: ExternalSchema; const field = schema.shape.id;',
    },
    {
      name: 'borrowed static property access on nested object',
      code: 'declare const outer: External; const value = outer.inner.shape;',
    },
    {
      name: 'borrowed static property access invoked as method',
      code: 'declare const schema: ExternalSchema; schema.shape.id.parse("x");',
    },
    {
      name: 'borrowed property access with optional chaining',
      code: 'declare const schema: ExternalSchema | null; const field = schema?.shape?.id;',
    },
    {
      name: 'identifier without shape substring',
      code: 'const owner = { id: 1 }; const value = owner.id;',
    },
    {
      name: 'normal function declaration without shape substring',
      code: 'function calculateArea(width: number, height: number): number { return width * height; }',
    },
    {
      name: 'borrowed member access via destructuring with local rename',
      code: 'declare const schema: ExternalSchema; const { shape: field } = schema;',
    },
  ],
})
