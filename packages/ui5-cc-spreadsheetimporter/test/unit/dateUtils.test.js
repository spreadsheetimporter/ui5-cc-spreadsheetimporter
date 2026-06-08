/**
 * Unit tests for the pure Excel-serial date helpers used by Parser to recover
 * date/time-typed columns that arrive as numeric cells (instead of date cells).
 */

const { excelSerialToDate, isExcelSerialDate } = require('../../src/controller/utils/dateUtils');

describe('excelSerialToDate', () => {
  it('converts an Excel serial to the correct UTC date', () => {
    // 44562 = 2022-01-01, 25569 = 1970-01-01 in Excel's serial calendar
    expect(excelSerialToDate(44562).toISOString().substring(0, 10)).toBe('2022-01-01');
    expect(excelSerialToDate(25569).toISOString().substring(0, 10)).toBe('1970-01-01');
  });

  it('preserves the time-of-day from the fractional part', () => {
    // 44562.5 = 2022-01-01 12:00 (noon)
    expect(excelSerialToDate(44562.5).toISOString().substring(0, 19)).toBe('2022-01-01T12:00:00');
  });

  it('recovers a value that new Date(serial) would have mangled to 1970', () => {
    const serial = 44562;
    // the bug: new Date(serial) treats the serial as epoch-milliseconds -> 1970
    expect(new Date(serial).getUTCFullYear()).toBe(1970);
    // the fix: interpret as an Excel serial -> 2022
    expect(excelSerialToDate(serial).getUTCFullYear()).toBe(2022);
  });
});

describe('isExcelSerialDate', () => {
  it('is true only for finite numbers', () => {
    expect(isExcelSerialDate(44562)).toBe(true);
    expect(isExcelSerialDate(0)).toBe(true);
    expect(isExcelSerialDate('2022-01-01')).toBe(false);
    expect(isExcelSerialDate(Number.NaN)).toBe(false);
    expect(isExcelSerialDate(null)).toBe(false);
    expect(isExcelSerialDate(undefined)).toBe(false);
    expect(isExcelSerialDate(new Date())).toBe(false);
  });
});
