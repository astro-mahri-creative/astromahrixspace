/**
 * Parse the API sub-path from a Netlify function event.
 *
 * Netlify redirects `/api/products/foo` → `/.netlify/functions/api-products/foo`
 * but `event.path` may contain EITHER the original or the rewritten path.
 *
 * This helper handles both cases and returns the sub-path segments after the
 * function base (e.g. ["foo"]).
 *
 * @param {string} fullPath  - event.path from the Netlify function event
 * @param {string} baseName  - the function base name, e.g. "products", "users"
 * @returns {string[]} sub-path segments
 */
export function parseApiPath(fullPath, baseName) {
  const segments = fullPath.split("/").filter(Boolean);

  // Case 1: rewritten path like .netlify/functions/api-products/foo/bar
  const fnIdx = segments.findIndex((s) => s === `api-${baseName}`);
  if (fnIdx >= 0) {
    return segments.slice(fnIdx + 1);
  }

  // Case 2: original path like api/products/foo/bar
  const apiIdx = segments.indexOf("api");
  if (apiIdx >= 0 && segments[apiIdx + 1] === baseName) {
    return segments.slice(apiIdx + 2);
  }

  // Fallback: strip first 3 segments (legacy behavior)
  return segments.slice(3);
}
