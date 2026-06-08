/**
 * Unit tests for Parser — the pure spreadsheet-cell -> OData payload logic.
 *
 * Covers:
 *  - detectMarkerState: the four-state null/empty/omit/value model (the recent markers feature)
 *  - parseSpreadsheetData: marker handling + type coercion, including the V2(string) vs
 *    V4(number) numeric divergence and the Excel-serial date guard (regression lock for the
 *    "dates read as 1970" bug).
 *
 * Parser is required directly; jest.config maps ManagedObject/Util/MessageHandler/enums to
 * mocks so the module loads without the SAP runtime. The Util mock's getValueFromRow reads
 * each row by column label -> ValueData ({ rawValue, sheetDataType }).
 */

const Parser = require('../../src/controller/Parser').default;

const NULL = '__NULL__';
const EMPTY = '__EMPTY__';

describe('Parser.detectMarkerState', () => {
  it('omits empty cells (undefined / null / empty string)', () => {
    expect(Parser.detectMarkerState(undefined, NULL, EMPTY)).toEqual({ state: 'omit', value: undefined });
    expect(Parser.detectMarkerState(null, NULL, EMPTY)).toEqual({ state: 'omit', value: undefined });
    expect(Parser.detectMarkerState('', NULL, EMPTY)).toEqual({ state: 'omit', value: undefined });
  });

  it('maps the null marker to state "null"', () => {
    expect(Parser.detectMarkerState(NULL, NULL, EMPTY)).toEqual({ state: 'null', value: null });
  });

  it('maps the empty-string marker to state "emptyString"', () => {
    expect(Parser.detectMarkerState(EMPTY, NULL, EMPTY)).toEqual({ state: 'emptyString', value: '' });
  });

  it('trims surrounding whitespace before matching a marker', () => {
    expect(Parser.detectMarkerState('  __NULL__  ', NULL, EMPTY)).toEqual({ state: 'null', value: null });
    expect(Parser.detectMarkerState('  __EMPTY__  ', NULL, EMPTY)).toEqual({ state: 'emptyString', value: '' });
  });

  it('treats an ordinary string as a value', () => {
    expect(Parser.detectMarkerState('hello', NULL, EMPTY)).toEqual({ state: 'value', value: 'hello' });
  });

  it('never treats non-strings as markers (guards numeric/boolean/date false positives)', () => {
    // A null marker of '0' must NOT swallow the number 0.
    expect(Parser.detectMarkerState(0, '0', EMPTY)).toEqual({ state: 'value', value: 0 });
    expect(Parser.detectMarkerState(false, NULL, EMPTY)).toEqual({ state: 'value', value: false });
    const d = new Date();
    expect(Parser.detectMarkerState(d, NULL, EMPTY)).toEqual({ state: 'value', value: d });
  });

  it('does nothing when markers are not configured (empty strings)', () => {
    expect(Parser.detectMarkerState('__NULL__', '', '')).toEqual({ state: 'value', value: '__NULL__' });
  });
});

describe('Parser.parseSpreadsheetData', () => {
  let component;
  let messageHandler;
  let util;

  beforeEach(() => {
    component = {
      getNullMarker: () => NULL,
      getEmptyStringMarker: () => EMPTY,
      getFieldMatchType: () => 'label',
      getSpreadsheetRowPropertyName: () => '' // falsy -> no __rowNum__ injection
    };
    messageHandler = { addMessageToMessages: jest.fn() };
    util = { geti18nText: k => k };
  });

  // typeLabelList is iterated via .entries() -> use a Map keyed by the payload property name.
  function labelList(entries) {
    return new Map(entries);
  }
  // A row is keyed by the column *label* (Util.getValueFromRow mock reads row[label]).
  function parseOne(typeLabelList, cells, isODataV4) {
    const result = Parser.parseSpreadsheetData([cells], typeLabelList, component, messageHandler, util, isODataV4);
    return result[0];
  }

  describe('four-state markers', () => {
    it('omits a property when the cell is empty', () => {
      const tl = labelList([['quantity', { label: 'Quantity', type: 'Edm.Int32', nullable: true }]]);
      const payload = parseOne(tl, {}, true); // no "Quantity" cell
      expect(payload).not.toHaveProperty('quantity');
    });

    it('applies the null marker on a nullable field', () => {
      const tl = labelList([['note', { label: 'Note', type: 'Edm.String', nullable: true }]]);
      const payload = parseOne(tl, { Note: { rawValue: NULL } }, true);
      expect(payload.note).toBeNull();
    });

    it('rejects the null marker on a non-nullable field (and reports it)', () => {
      const tl = labelList([['id', { label: 'ID', type: 'Edm.String', nullable: false }]]);
      const payload = parseOne(tl, { ID: { rawValue: NULL } }, true);
      expect(payload).not.toHaveProperty('id');
      expect(messageHandler.addMessageToMessages).toHaveBeenCalled();
    });

    it('applies the empty-string marker on a string field', () => {
      const tl = labelList([['note', { label: 'Note', type: 'Edm.String', nullable: true }]]);
      const payload = parseOne(tl, { Note: { rawValue: EMPTY } }, true);
      expect(payload.note).toBe('');
    });

    it('rejects the empty-string marker on a non-string field (and reports it)', () => {
      const tl = labelList([['quantity', { label: 'Quantity', type: 'Edm.Int32', nullable: true }]]);
      const payload = parseOne(tl, { Quantity: { rawValue: EMPTY } }, true);
      expect(payload).not.toHaveProperty('quantity');
      expect(messageHandler.addMessageToMessages).toHaveBeenCalled();
    });
  });

  describe('type coercion', () => {
    it('parses Edm.Boolean', () => {
      const tl = labelList([['active', { label: 'Active', type: 'Edm.Boolean', nullable: true }]]);
      expect(parseOne(tl, { Active: { rawValue: true } }, true).active).toBe(true);
      expect(parseOne(tl, { Active: { rawValue: false } }, true).active).toBe(false);
    });

    it('parses Edm.Int32 as a number', () => {
      const tl = labelList([['quantity', { label: 'Quantity', type: 'Edm.Int32', nullable: true }]]);
      expect(parseOne(tl, { Quantity: { rawValue: 5 } }, true).quantity).toBe(5);
    });

    it('serializes Edm.Double as a number for V4 but a string for V2', () => {
      const tl = labelList([['price', { label: 'Price', type: 'Edm.Double', nullable: true }]]);
      expect(parseOne(tl, { Price: { rawValue: 5.5 } }, true).price).toBe(5.5);
      expect(parseOne(tl, { Price: { rawValue: 5.5 } }, false).price).toBe('5.5');
    });

    it('serializes Edm.Decimal as a string (both V2 and V4)', () => {
      const tl = labelList([['amount', { label: 'Amount', type: 'Edm.Decimal', nullable: true }]]);
      expect(parseOne(tl, { Amount: { rawValue: 5.5 } }, true).amount).toBe('5.5');
      expect(parseOne(tl, { Amount: { rawValue: 5.5 } }, false).amount).toBe('5.5');
    });

    it('accepts a valid Edm.Guid and rejects an invalid one', () => {
      const tl = labelList([['id', { label: 'ID', type: 'Edm.Guid', nullable: true }]]);
      const valid = '64e718c9-ff99-47f1-8ca3-950c850777d4';
      expect(parseOne(tl, { ID: { rawValue: valid } }, true).id).toBe(valid);

      const payload = parseOne(tl, { ID: { rawValue: 'not-a-guid' } }, true);
      expect(payload).not.toHaveProperty('id');
      expect(messageHandler.addMessageToMessages).toHaveBeenCalled();
    });
  });

  describe('Edm.Date — Excel-serial guard (1970 regression lock)', () => {
    it('recovers a numeric Excel serial instead of mangling it to 1970', () => {
      const tl = labelList([['validFrom', { label: 'ValidFrom', type: 'Edm.Date', nullable: true }]]);
      // 45292 = 2024-01-01 in Excel's serial calendar; sheetDataType !== 'd' triggers parsing.
      const payload = parseOne(tl, { ValidFrom: { rawValue: 45292, sheetDataType: 'n' } }, true);
      expect(payload.validFrom).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(Number(payload.validFrom.substring(0, 4))).toBeGreaterThanOrEqual(2024);
      // new Date(45292) would have produced a 1970 date — assert we did NOT.
      expect(payload.validFrom.substring(0, 4)).not.toBe('1970');
    });

    it('parses an ISO date string as-is for Edm.Date', () => {
      const tl = labelList([['validFrom', { label: 'ValidFrom', type: 'Edm.Date', nullable: true }]]);
      const payload = parseOne(tl, { ValidFrom: { rawValue: '2024-03-15', sheetDataType: 's' } }, true);
      expect(payload.validFrom).toBe('2024-03-15');
    });
  });
});
