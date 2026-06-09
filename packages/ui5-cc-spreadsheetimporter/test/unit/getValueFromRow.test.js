/**
 * Unit tests for Util.getValueFromRow — how the two `fieldMatchType` modes resolve a cell value
 * from a spreadsheet row (issue #58, refs #29).
 *
 * - "label": the row is keyed by the plain field label, so the value is read by label.
 * - "labelTypeBrackets" (default): the row is keyed by "<label> [<Property>]", so the value is read
 *   by the bracketed technical token via Util.columnMatchesType (case-insensitive, see
 *   columnMatchesType.test.js).
 *
 * The modes are mutually exclusive on the same headers — a header that matches in one mode is "not
 * found" (undefined) in the other, which is exactly what makes an unmatched column surface as a
 * "column not found" error during validation.
 */

const Util = require('../../src/controller/Util').default;

describe('Util.getValueFromRow (the two fieldMatchTypes)', () => {
  // labelTypeBrackets headers: "<label>[<key>]"; label headers: plain "<label>"
  const bracketRow = {
    'ID[product_ID]': { rawValue: '254' },
    'UnitPrice[price]': { rawValue: '13.7' }
  };
  const labelRow = {
    ID: { rawValue: '254' },
    UnitPrice: { rawValue: '13.7' }
  };

  it("'label' mode resolves the value by the plain field label", () => {
    expect(Util.getValueFromRow(labelRow, 'UnitPrice', 'price', 'label')).toEqual({ rawValue: '13.7' });
  });

  it("'labelTypeBrackets' mode resolves the value by the [key] token", () => {
    expect(Util.getValueFromRow(bracketRow, 'UnitPrice', 'price', 'labelTypeBrackets')).toEqual({ rawValue: '13.7' });
  });

  it("'labelTypeBrackets' matches the [key] token case-insensitively (e.g. ABAP UPPER CASE template)", () => {
    const upperRow = { 'UNITPRICE[PRICE]': { rawValue: '13.7' } };
    expect(Util.getValueFromRow(upperRow, 'UnitPrice', 'price', 'labelTypeBrackets')).toEqual({ rawValue: '13.7' });
  });

  it('the two modes are mutually exclusive on the same headers', () => {
    // a bracket header is not resolved in "label" mode ...
    expect(Util.getValueFromRow(bracketRow, 'UnitPrice', 'price', 'label')).toBeUndefined();
    // ... and a plain-label header is not resolved in "labelTypeBrackets" mode
    expect(Util.getValueFromRow(labelRow, 'UnitPrice', 'price', 'labelTypeBrackets')).toBeUndefined();
  });

  it('returns undefined when the column is not present (basis for the column-not-found error)', () => {
    expect(Util.getValueFromRow(labelRow, 'Missing', 'doesNotExist', 'label')).toBeUndefined();
    expect(Util.getValueFromRow(bracketRow, 'Missing', 'doesNotExist', 'labelTypeBrackets')).toBeUndefined();
  });
});
