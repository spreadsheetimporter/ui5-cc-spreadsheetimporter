/**
 * Normalizes OData V2 `$expand` payloads so the shared deep-export pipeline can consume them.
 *
 * OData V2 returns an expanded to-many navigation property wrapped as `{ results: [...] }`
 * (and carries `__metadata`/`__deferred` technical objects), whereas OData V4 returns a plain
 * array. The shared `DataAssigner` expects plain arrays for child collections, so without this
 * the V2 child/grandchild rows are never extracted and the generated sheet stays empty.
 *
 * Recursively unwraps every `{ results: [...] }` to-many wrapper into the array itself, in place.
 *
 * @namespace cc.spreadsheetimporter.XXXnamespaceXXX
 */
export function normalizeV2Expands(node: any): any {
  if (Array.isArray(node)) {
    for (const entry of node) {
      normalizeV2Expands(entry);
    }
    return node;
  }
  if (node && typeof node === 'object') {
    for (const key of Object.keys(node)) {
      const value = node[key];
      if (value && typeof value === 'object' && Array.isArray(value.results)) {
        // V2 to-many expand: { results: [...] } -> [...]
        node[key] = value.results;
        normalizeV2Expands(node[key]);
      } else if (value && typeof value === 'object') {
        normalizeV2Expands(value);
      }
    }
  }
  return node;
}
