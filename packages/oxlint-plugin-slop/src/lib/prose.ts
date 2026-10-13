/**
 * Computes leading whitespace indentation for the line containing the character index. Returns the
 * prefix whitespace if the line before the index contains only whitespace, or null if there is
 * non-whitespace text prior to index on the same line.
 */
export function getLineIndent(text: string, index: number): string | null {
  const lineStart = text.lastIndexOf('\n', index - 1) + 1
  const prefix = text.slice(lineStart, index)
  return prefix.trim() === '' ? prefix : null
}

/**
 * Returns true if the token or comment at index begins on its own line (only whitespace precedes
 * it).
 */
export function startsOwnLine(text: string, index: number): boolean {
  return getLineIndent(text, index) !== null
}

/**
 * Replaces all non-newline characters in the given span with spaces, preserving character offsets.
 */
export function maskPreservingOffsets(span: string): string {
  return span.replace(/[^\n]/g, ' ')
}
