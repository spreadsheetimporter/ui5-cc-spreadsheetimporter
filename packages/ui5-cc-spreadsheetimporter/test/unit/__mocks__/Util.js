class Util {
  geti18nText(key) {
    return key;
  }

  // Static helpers used by Parser. getValueFromRow is mocked to read each row by the
  // column label -> ValueData ({ rawValue, sheetDataType }); the numeric helpers are
  // pass-throughs so tests exercise Parser's coercion logic, not Util's number formatting.
  static getValueFromRow(row, label, columnKey, matchType) {
    return row[label];
  }

  static fixFloatingPointPrecision(value) {
    return value;
  }

  static normalizeNumberString(value) {
    return String(value);
  }
}

module.exports = Util;
module.exports.default = Util;
