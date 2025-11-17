# Null & Empty Value Handling

> **Available from version 2.4.0**

## Quick Overview

The Spreadsheet Importer distinguishes between NULL values, empty strings, and omitted properties using markers. This is critical for UPDATE operations where you need to clear values vs. leave them unchanged.

## The Four-State Model

| Cell Content    | JSON Payload     | Backend Effect                              |
| --------------- | ---------------- | ------------------------------------------- |
| **Empty cell**  | Property omitted | No change (UPDATE)<br>Uses default (CREATE) |
| **`__NULL__`**  | `"field": null`  | Set to NULL                                 |
| **`__EMPTY__`** | `"field": ""`    | Set to empty string (strings only)          |
| **Any value**   | `"field": value` | Set to that value                           |

**Key insight**: In OData, omitted property ≠ null ≠ empty string. Each has different semantics.

## Configuration

> **Available from version 2.4.0**

Markers are **enabled by default**. Customize or disable them if needed:

```javascript
componentData: {
  nullMarker: '__NULL__',        // Default: '__NULL__', set '' to disable
  emptyStringMarker: '__EMPTY__' // Default: '__EMPTY__', set '' to disable
}
```

## Example: UPDATE Operation

**Spreadsheet**:

| ID  | Name       | Email       | Notes      |
| --- | ---------- | ----------- | ---------- |
| 123 |            |             | Call later |
| 456 | Jane Smith | `__NULL__`  |            |
| 789 |            | `__EMPTY__` | `__NULL__` |

**JSON sent to backend**:

```json
// Row 1: Update notes only
{ "ID": "123", "notes": "Call later" }

// Row 2: Update name, clear email to NULL
{ "ID": "456", "name": "Jane Smith", "email": null }

// Row 3: Set email to empty string, clear notes to NULL
{ "ID": "789", "email": "", "notes": null }
```

## Validation Rules

| Field Type                          | `__NULL__`           | `__EMPTY__`     |
| ----------------------------------- | -------------------- | --------------- |
| **String** (Edm.String)             | ✅ Yes (if nullable) | ✅ Yes (always) |
| **Number** (Edm.Int32, Decimal)     | ✅ Yes (if nullable) | ❌ Error        |
| **Boolean** (Edm.Boolean)           | ✅ Yes (if nullable) | ❌ Error        |
| **Date** (Edm.Date, DateTimeOffset) | ✅ Yes (if nullable) | ❌ Error        |

**Important**: `0`, `false`, and empty cells are NOT null. Use `__NULL__` marker explicitly.

## Common Errors

**"Null values are not allowed for this field"**

- Used `__NULL__` on non-nullable field (e.g., key field, mandatory field)
- Solution: Provide a value or check OData metadata

**"Empty string marker is only valid for text fields"**

- Used `__EMPTY__` on number/boolean/date field
- Solution: Use `__NULL__` or a concrete value (`0`, `false`, date)

## Best Practices

**✅ Do:**

- Use `__NULL__` to explicitly clear values in UPDATE operations
- Leave cells empty when you want to keep existing values unchanged
- Check OData metadata for nullable fields (enable debug mode)

**❌ Don't:**

- Use `__EMPTY__` on non-string fields (numbers, dates, booleans)
- Expect empty cells to send NULL (they omit the property)
- Use markers on key fields or mandatory fields

## Common Questions

**Q: Empty cell means NULL, right?**  
A: No. Empty cell = property omitted = no change (UPDATE) or backend default (CREATE). Use `__NULL__` marker for explicit NULL.

**Q: Can I customize the marker strings?**  
A: Yes. Set `nullMarker: 'NULL'` or any string you prefer. Set to `''` to disable.

**Q: Does this work with both OData V2 and V4?**  
A: Yes. Works with CAP, RAP, OData V2, and V4 backends.

## Backend-Specific Notes

**CAP**: Fields are nullable by default unless marked `not null` in CDS.  
**RAP**: Many fields are non-nullable by default. Check ABAP table definitions.
