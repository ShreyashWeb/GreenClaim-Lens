/**
 * Sanitizes and normalizes claim input for LLM analysis.
 * Strips zero-width characters, collapses whitespace, and enforces hard length bounds.
 */
export function sanitizeClaimInput(text: string, maxLength = 4000): string {
  let clean = '';
  for (const char of text) {
    const code = char.charCodeAt(0);
    const isControl =
      (code <= 0x1f && code !== 0x09 && code !== 0x0a && code !== 0x0d) || code === 0x7f;
    const isZeroWidth = code === 0x200b || code === 0x200c || code === 0x200d || code === 0xfeff;

    if (!isControl && !isZeroWidth) {
      clean += char;
    }
  }

  const normalized = clean.normalize('NFKC').replace(/\s+/g, ' ').trim();

  if (normalized.length > maxLength) {
    return normalized.slice(0, maxLength);
  }

  return normalized;
}
