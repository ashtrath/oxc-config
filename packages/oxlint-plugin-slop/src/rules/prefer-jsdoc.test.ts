import { RuleTester } from 'oxlint/plugins-dev'

import { preferJsdoc } from './prefer-jsdoc'

const ruleTester = new RuleTester()
const error = { messageId: 'preferJsdoc' }

ruleTester.run('prefer-jsdoc', preferJsdoc, {
  invalid: [
    {
      code: '// Calculate total sum.\nexport function calculateSum() {}',
      errors: [error],
      output: '/** Calculate total sum. */\nexport function calculateSum() {}',
    },
    {
      code: '// Base configuration options.\n// Second line of details.\nexport const config = {}',
      errors: [{ endLine: 2, line: 1, ...error }],
      output:
        '/**\n * Base configuration options.\n * Second line of details.\n */\nexport const config = {}',
    },
    {
      code: 'export class User {\n  // User display name.\n  name = ""\n}',
      errors: [error],
      output: 'export class User {\n  /** User display name. */\n  name = ""\n}',
    },
    {
      code: 'export class User {\n  // Process payment.\n  // Ensures idempotency.\n  processPayment() {}\n}',
      errors: [error],
      output:
        'export class User {\n  /**\n   * Process payment.\n   * Ensures idempotency.\n   */\n  processPayment() {}\n}',
    },
    {
      code: 'export interface Options {\n  // Timeout in milliseconds.\n  timeout: number\n}',
      errors: [error],
      output: 'export interface Options {\n  /** Timeout in milliseconds. */\n  timeout: number\n}',
    },
    {
      code: 'export interface Service {\n  // Execute task.\n  run(): void\n}',
      errors: [error],
      output: 'export interface Service {\n  /** Execute task. */\n  run(): void\n}',
    },
    {
      code: 'export enum Status {\n  // Status is pending.\n  Pending = 0,\n}',
      errors: [error],
      output: 'export enum Status {\n  /** Status is pending. */\n  Pending = 0,\n}',
    },
    {
      code: '// Main entrypoint.\nexport default function main() {}',
      errors: [error],
      output: '/** Main entrypoint. */\nexport default function main() {}',
    },
    {
      code: 'export class A {\n  // Public thing.\n  public x = 1\n}',
      errors: [error],
      output: 'export class A {\n  /** Public thing. */\n  public x = 1\n}',
    },
    {
      code: 'export abstract class A {\n  // Run it.\n  abstract run(): void\n}',
      errors: [error],
      output: 'export abstract class A {\n  /** Run it. */\n  abstract run(): void\n}',
    },
    {
      code: 'export interface A {\n  // Any key.\n  [key: string]: number\n}',
      errors: [error],
      output: 'export interface A {\n  /** Any key. */\n  [key: string]: number\n}',
    },
    {
      code: 'export interface A {\n  // Call it.\n  (): void\n}',
      errors: [error],
      output: 'export interface A {\n  /** Call it. */\n  (): void\n}',
    },
    {
      code: 'export class A {\n\t// One.\n\t// Two.\n\trun() {}\n}',
      errors: [error],
      output: 'export class A {\n\t/**\n\t * One.\n\t * Two.\n\t */\n\trun() {}\n}',
    },
    {
      code: '// First.\r\n// Second.\r\nexport const a = 1',
      errors: [error],
      output: '/**\r\n * First.\r\n * Second.\r\n */\r\nexport const a = 1',
    },
    {
      code: '// ends a block */ here\nexport const a = 1',
      errors: [error],
      output: null,
    },
    {
      code: '// v8 deopts here\nexport const a = 1',
      errors: [error],
      output: '/** v8 deopts here */\nexport const a = 1',
    },
    {
      code: 'export const a = 1 // trailing\n// Next doc.\nexport const b = 2',
      errors: [error],
      output: 'export const a = 1 // trailing\n/** Next doc. */\nexport const b = 2',
    },
    {
      code: 'export type A = {\n  // outer\n  b: {\n    // inner\n    c: string\n  }\n}',
      errors: [error],
      output: 'export type A = {\n  /** outer */\n  b: {\n    // inner\n    c: string\n  }\n}',
    },
    {
      code: '/** File header */\n\n// Useful export\nexport const a = 1',
      errors: [error],
      output: '/** File header */\n\n/** Useful export */\nexport const a = 1',
    },
  ],
  valid: [
    '// Helper function\nfunction helper() {}',
    '// Local state\nconst state = 1',
    'export class MyClass {\n  // Internal field\n  private secret = 1\n  // Hidden field\n  #hidden = 2\n}',
    'export class Base {\n  // Protected member\n  protected init() {}\n}',
    'class LocalHelper {\n  // Local helper member\n  run() {}\n}',
    'interface LocalInterface {\n  // Local interface member\n  id: string\n}',
    'enum LocalEnum {\n  // Local enum member\n  A = 1\n}',
    '/**\n * User service\n */\nexport function userService() {}',
    '// oxlint-disable-next-line eslint/no-unused-vars\nexport function unused() {}',
    '// Copyright (c) 2026 Ashtrath\nexport function licensed() {}',
    '// Section header\n\nexport function nextSection() {}',
    'export function unadorned() {}',
    'export interface User {\n  name: string // display name\n  age: number\n}',
    'export function build() {\n  class Helper {\n    // internal detail\n    run() {}\n  }\n}',
    'export function f(opts: {\n  // option a\n  a: string\n}) {}',
    '/// <reference types="node" />\nexport const a = 1',
    '// #region setup\nexport const a = 1',
    '// v8 ignore next\nexport function f() {}',
    '// TODO: handle errors\nexport function f() {}',
    '/** Docs. */\n// extra note\nexport const a = 1',
    '//\nexport const a = 1',
    'const a = 1\n// Re-export\nexport { a }',
  ],
})
