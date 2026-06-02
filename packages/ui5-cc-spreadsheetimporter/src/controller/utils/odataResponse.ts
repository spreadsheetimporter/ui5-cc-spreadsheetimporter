/**
 * Pure helpers for inspecting OData V2 $batch / submitChanges responses (no UI5
 * dependencies, so they can be unit-tested in isolation).
 *
 * @namespace cc.spreadsheetimporter.XXXnamespaceXXX
 */

/** True if a single response object carries an HTTP error status (>= 400). */
function responseHasError(resp: any): boolean {
  if (!resp) {
    return false;
  }
  const statusCode = resp.response ? resp.response.statusCode : resp.statusCode;
  return statusCode !== undefined && statusCode !== null && Number(statusCode) >= 400;
}

/** True if a batch part errored, checking both a direct response and changeset sub-responses. */
function batchPartHasError(part: any): boolean {
  if (!part) {
    return false;
  }
  // Changeset: create/update/delete operations are nested in __changeResponses
  if (Array.isArray(part.__changeResponses) && part.__changeResponses.some((sub: any) => responseHasError(sub))) {
    return true;
  }
  // Single request (e.g. a failed read) or a top-level error response
  return responseHasError(part);
}

/**
 * True if any part of an OData V2 submitChanges/$batch response reports an error (>= 400).
 *
 * Unlike inspecting only `__batchResponses[0]`, this checks every batch part and every
 * changeset sub-response, so errors in batched create/update operations (which live in
 * `__changeResponses`) or in later batch parts are not missed.
 */
export function hasV2BatchError(submitResponse: any): boolean {
  const batchResponses = submitResponse && submitResponse.__batchResponses;
  if (!Array.isArray(batchResponses)) {
    return false;
  }
  return batchResponses.some(part => batchPartHasError(part));
}
