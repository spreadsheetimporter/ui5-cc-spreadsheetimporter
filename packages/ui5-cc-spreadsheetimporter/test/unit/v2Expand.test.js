/**
 * Unit tests for normalizeV2Expands — flattens the V2 `{ results: [...] }` to-many wrappers
 * (and nested ones) into plain arrays so the shared deep-export pipeline picks up child rows.
 */

const { normalizeV2Expands } = require('../../src/controller/utils/v2Expand');

describe('normalizeV2Expands', () => {
  it('unwraps a V2 to-many { results: [...] } navigation into a plain array', () => {
    const order = { OrderNo: '2', Items: { results: [{ quantity: 1 }, { quantity: 2 }] } };
    normalizeV2Expands([order]);
    expect(Array.isArray(order.Items)).toBe(true);
    expect(order.Items).toHaveLength(2);
    expect(order.Items[0].quantity).toBe(1);
  });

  it('unwraps nested (grandchild) results recursively', () => {
    const order = { Items: { results: [{ quantity: 1, Product: { results: [{ price: 10 }] } }] } };
    normalizeV2Expands([order]);
    expect(order.Items[0].Product[0].price).toBe(10);
  });

  it('leaves V4-style arrays untouched', () => {
    const order = { Items: [{ quantity: 1 }] };
    normalizeV2Expands([order]);
    expect(order.Items).toEqual([{ quantity: 1 }]);
  });

  it('leaves scalar and non-results object properties untouched', () => {
    const order = { OrderNo: '2', buyer: 'x', meta: { __metadata: { type: 'Order' } } };
    normalizeV2Expands([order]);
    expect(order.OrderNo).toBe('2');
    expect(order.meta.__metadata.type).toBe('Order');
  });

  it('accepts a single object as well as an array', () => {
    const order = { Items: { results: [{ quantity: 5 }] } };
    normalizeV2Expands(order);
    expect(order.Items[0].quantity).toBe(5);
  });
});
