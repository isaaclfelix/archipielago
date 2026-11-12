/**
 * Turns Drih Handlebars hex-escaped quotes back into JSON punctuation.
 *
 * The Handlebars shell writes `"` as `\u0022` across the whole JSON text,
 * including structural quotes, so `JSON.parse` cannot read it until those
 * sequences are restored. PHP's shell leaves structural quotes as `"`.
 *
 * @param {string} encoded - Attribute value from `data-component-props`.
 * @returns {string} JSON text `JSON.parse` can read.
 */
function normalizeComponentPropsJson(encoded: string): string {
  return encoded.replaceAll('\\u0022', '"').replaceAll('\\u0027', "'");
}

/**
 * Decodes island props written on `data-component-props`.
 *
 * Accepts ordinary JSON and the Handlebars shell's hex-escaped form. An empty
 * attribute is empty props. Rejects arrays and non-objects so a bad attribute
 * fails closed instead of being spread into a component.
 *
 * @param {string} encoded - JSON object from `data-component-props`.
 * @returns {Record<string, unknown>} The decoded props object.
 */
export function decodeComponentProps(encoded: string): Record<string, unknown> {
  if (encoded === '') {
    return {};
  }

  const value: unknown = JSON.parse(normalizeComponentPropsJson(encoded));

  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error('Island props must be a JSON object.');
  }

  return value as Record<string, unknown>;
}
