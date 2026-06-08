/**
 * Pure date helpers (no UI5/SAP dependencies) so they can be unit-tested in isolation.
 *
 * @namespace cc.spreadsheetimporter.XXXnamespaceXXX
 */

/**
 * Converts an Excel serial date to a JavaScript Date (UTC).
 *
 * Excel stores dates as serial numbers: integer part = days since the Excel epoch
 * (1899-12-30), fractional part = fraction of the day (time). When a date/time-typed
 * column contains a numeric cell instead of a real date cell (e.g. a file where the
 * date typing was lost during a round-trip, or produced by another tool), the raw value
 * is such a serial. Without this conversion, `new Date(serial)` would misread the serial
 * as epoch-milliseconds and yield a 1970-based value.
 *
 * The fractional part is preserved, so the returned Date also carries the correct
 * time-of-day — callers that only need the time can read it from the resulting Date.
 *
 * @param serial Excel serial date number
 * @returns the corresponding Date (UTC)
 */
export function excelSerialToDate(serial: number): Date {
  // 25569 = number of days between the Excel epoch (1899-12-30) and the Unix epoch (1970-01-01).
  return new Date(Math.round((serial - 25569) * 86400 * 1000));
}

/**
 * Returns true when the value looks like an Excel serial date that should be converted
 * via {@link excelSerialToDate} (a finite number — date columns never legitimately hold
 * a bare number once date typing is intact).
 */
export function isExcelSerialDate(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}
