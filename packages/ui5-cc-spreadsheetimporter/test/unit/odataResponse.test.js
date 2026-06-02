/**
 * Unit tests for the OData V2 batch-response error detection used by ODataV2.checkForErrors.
 */

const { hasV2BatchError } = require('../../src/controller/utils/odataResponse');

describe('hasV2BatchError', () => {
  it('returns false when there are no batch responses', () => {
    expect(hasV2BatchError(undefined)).toBe(false);
    expect(hasV2BatchError(null)).toBe(false);
    expect(hasV2BatchError({})).toBe(false);
    expect(hasV2BatchError({ __batchResponses: [] })).toBe(false);
  });

  it('returns false when every response succeeds', () => {
    expect(hasV2BatchError({ __batchResponses: [{ response: { statusCode: 200 } }] })).toBe(false);
    expect(hasV2BatchError({ __batchResponses: [{ __changeResponses: [{ statusCode: 201 }, { statusCode: 204 }] }] })).toBe(false);
  });

  it('detects an error in a direct batch response', () => {
    expect(hasV2BatchError({ __batchResponses: [{ response: { statusCode: 500 } }] })).toBe(true);
  });

  it('detects an error in a changeset sub-response, even if it is not the first batch part', () => {
    const response = {
      __batchResponses: [
        { __changeResponses: [{ statusCode: 201 }] },
        { __changeResponses: [{ statusCode: 200 }, { response: { statusCode: 400 } }] }
      ]
    };
    expect(hasV2BatchError(response)).toBe(true);
  });

  it('handles statusCode given as a string', () => {
    expect(hasV2BatchError({ __batchResponses: [{ response: { statusCode: '412' } }] })).toBe(true);
    expect(hasV2BatchError({ __batchResponses: [{ response: { statusCode: '204' } }] })).toBe(false);
  });
});
