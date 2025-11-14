# Null & Empty Value Handling

## Overview

This guide explains how the Spreadsheet Importer handles NULL values, empty strings, and missing values when uploading data to CAP and RAP backends via OData V2 and V4 services.

Understanding these distinctions is critical for:

- **Updating existing records** - explicitly clearing values vs. leaving them unchanged
- **Creating new records** - controlling default values vs. explicit null/empty
- **Data integrity** - ensuring your spreadsheet data maps correctly to backend state

## The Four-State Model

The Spreadsheet Importer supports four distinct semantic states for each field:

| Cell Content    | JSON Sent to Backend | Backend Effect                                      | When to Use                             |
| --------------- | -------------------- | --------------------------------------------------- | --------------------------------------- |
| **Empty cell**  | Property omitted     | No change (UPDATE)<br>Uses backend default (CREATE) | Leave existing value alone              |
| **`__NULL__`**  | `"field": null`      | Set to NULL                                         | Explicitly clear a value                |
| **`__EMPTY__`** | `"field": ""`        | Set to empty string                                 | Explicitly set to empty string (text fields only) |
| **Any value**   | `"field": value`     | Set to that value                                   | Normal data entry                       |

### Why This Matters

In OData (both V2 and V4), these three things are **completely different**:

1. **Property omitted from request**

   - UPDATE: Backend keeps existing value unchanged
   - CREATE: Backend uses default value or NULL

2. **Property present with value `null`**

   - Backend sets database column to NULL (if field is nullable)
   - Backend rejects with error if field is non-nullable

3. **Property present with value `""`** (empty string)
   - Backend stores empty string (for text fields)
   - This is NOT null - it's a string of length zero

## Understanding NULL vs Empty vs Omit

### Example: Order with Optional Email Field

**Scenario 1: UPDATE - Leave email unchanged**

```
Email cell: [empty]
→ Property omitted from PATCH
→ Backend: Email stays as it was
```

**Scenario 2: UPDATE - Clear email to NULL**

```
Email cell: __NULL__
→ PATCH: { "email": null }
→ Backend: Email becomes NULL
```

**Scenario 3: UPDATE - Set email to empty string**

```
Email cell: __EMPTY__
→ PATCH: { "email": "" }
→ Backend: Email becomes "" (empty, but not NULL)
```

**Scenario 4: CREATE - Set email explicitly**

```
Email cell: __EMPTY__
→ POST: { "email": "" }
→ Backend: Email is "", not NULL
```

### Why Empty Cell ≠ NULL

**Common misconception**: "Empty Excel cell means NULL"

**Reality**: Empty Excel cell means "don't touch this property"

This is by design and follows OData partial update semantics:

- Allows efficient bulk updates (only change what's needed)
- Prevents accidental data overwrites
- Aligns with REST PATCH semantics

**If you want NULL**: Use the `__NULL__` marker explicitly.

## Configuration

### Default Settings (Enabled by Default)

```javascript
componentData: {
  nullMarker: '__NULL__',        // Default enabled
  emptyStringMarker: '__EMPTY__' // Default enabled
}
```

### Custom Markers

You can customize the marker strings:

```javascript
componentData: {
  nullMarker: 'NULL',           // Simpler marker
  emptyStringMarker: 'EMPTY'    // Simpler marker
}
```

### Disabling Markers

Set to empty string to disable:

```javascript
componentData: {
  nullMarker: '',               // Disabled
  emptyStringMarker: ''         // Disabled
}
```

When disabled, markers are treated as literal string values.

## Practical Examples

### Example 1: Creating New Order Items

**Excel spreadsheet**:

| Product ID | Quantity | Title     | Description     | Notes          |
| ---------- | -------- | --------- | --------------- | -------------- |
| P001       | 10       | Laptop    | High-end laptop |                |
| P002       | 5        | **EMPTY** | **NULL**        | Optional field |
| P003       | 3        | Monitor   |                 | Special order  |

**What gets sent to backend**:

**Row 1**:

```json
{
  "product_ID": "P001",
  "quantity": 10,
  "title": "Laptop",
  "description": "High-end laptop"
  // notes: omitted (uses backend default)
}
```

**Row 2**:

```json
{
  "product_ID": "P002",
  "quantity": 5,
  "title": "", // explicitly __EMPTY__
  "description": null, // explicitly __NULL__
  "notes": null // explicitly __NULL__
}
```

**Row 3**:

```json
{
  "product_ID": "P003",
  "quantity": 3,
  "title": "Monitor"
  // description: omitted (backend default)
  // notes: omitted (backend default)
}
```

### Example 2: Updating Existing Records

**Scenario**: Update customer email addresses

**Excel spreadsheet**:

| ID  | Name         | Email     | Phone    |
| --- | ------------ | --------- | -------- |
| 123 |              |           | 555-1234 |
| 456 | John Updated | **NULL**  |          |
| 789 |              | **EMPTY** |          |

**What gets sent**:

**Record 123**:

```json
{
  "ID": "123",
  "phone": "555-1234"
  // name: omitted (no change)
  // email: omitted (no change)
}
```

**Record 456**:

```json
{
  "ID": "456",
  "name": "John Updated",
  "email": null
  // phone: omitted (no change)
}
```

**Record 789**:

```json
{
  "ID": "789",
  "email": ""
  // name: omitted (no change)
  // phone: omitted (no change)
}
```

### Example 3: String Field - NULL vs Empty String

**Use case**: Customer notes field where you need to distinguish:

- "No notes yet" (NULL) vs "Notes explicitly cleared" (empty string)

| Customer | Notes               | Meaning                               |
| -------- | ------------------- | ------------------------------------- |
| Alice    |                     | Leave notes unchanged                 |
| Bob      | **NULL**            | Clear notes (set to NULL)             |
| Charlie  | **EMPTY**           | Notes explicitly empty (empty string) |
| Dave     | Follow up next week | Set notes to this text                |

## Type-Specific Behavior

### String Fields (Edm.String)

| Marker      | Valid? | Result           |
| ----------- | ------ | ---------------- |
| `__NULL__`  | ✅ Yes | JSON `null` sent |
| `__EMPTY__` | ✅ Yes | JSON `""` sent   |

**Use cases**:

- NULL: "no value provided"
- Empty string: "value is explicitly empty"

### Numeric Fields (Edm.Int32, Edm.Decimal, Edm.Double)

| Marker      | Valid?               | Result                                       |
| ----------- | -------------------- | -------------------------------------------- |
| `__NULL__`  | ✅ Yes (if nullable) | JSON `null` sent                             |
| `__EMPTY__` | ❌ No                | **Error**: marker invalid for numeric fields |

**Important**: Zero (`0`) is NOT null:

- Cell contains `0` → JSON `0` (numeric zero)
- Cell contains `__NULL__` → JSON `null` (NULL)

### Boolean Fields (Edm.Boolean)

| Marker      | Valid?               | Result                                       |
| ----------- | -------------------- | -------------------------------------------- |
| `__NULL__`  | ✅ Yes (if nullable) | JSON `null` sent                             |
| `__EMPTY__` | ❌ No                | **Error**: marker invalid for boolean fields |

**Important**: `false` is NOT null:

- Cell contains `false` → JSON `false` (boolean false)
- Cell contains `__NULL__` → JSON `null` (NULL)

### Date/Time Fields (Edm.Date, Edm.DateTimeOffset, Edm.TimeOfDay)

| Marker      | Valid?               | Result                                    |
| ----------- | -------------------- | ----------------------------------------- |
| `__NULL__`  | ✅ Yes (if nullable) | JSON `null` sent                          |
| `__EMPTY__` | ❌ No                | **Error**: marker invalid for date fields |

**Valid date formats**: ISO 8601 (2025-01-15, 2025-01-15T10:30:00Z)

## Validation & Error Messages

### Nullable Field Validation

The Spreadsheet Importer automatically validates null values against OData metadata during data parsing (before payload creation).

**OData Metadata Nullable Attribute**:

- `Nullable="true"` → Field can be set to NULL
- `Nullable="false"` → Field cannot be NULL

**Implementation Note**: Validation happens inline during marker detection in the Parser. If you use `__NULL__` on a non-nullable field, the error is added immediately and the field is skipped from the payload (never reaches the backend).

**Validation behavior**:

| Field Type           | Marker Used | Nullable in Metadata | Result                                                        |
| -------------------- | ----------- | -------------------- | ------------------------------------------------------------- |
| Any                  | `__NULL__`  | `true`               | ✅ Accepted                                                   |
| Any                  | `__NULL__`  | `false`              | ❌ Error: "Null values are not allowed for this field"        |
| String               | `__EMPTY__` | Any                  | ✅ Accepted                                                   |
| Numeric/Boolean/Date | `__EMPTY__` | Any                  | ❌ Error: "Empty string marker is only valid for text fields" |

### Common Error Messages

**"Null values are not allowed for this field"**

- **Cause**: You used `__NULL__` on a non-nullable field
- **Solution**: Check metadata (key fields, mandatory fields are typically non-nullable)

**"Empty string marker (**EMPTY**) is only valid for text fields"**

- **Cause**: You used `__EMPTY__` on numeric, boolean, or date field
- **Solution**: Use `__NULL__` for null, or a concrete value (e.g., `0`, `false`)

## Backend Compatibility

### CAP (Cloud Application Programming Model)

**OData V4**:

- Nullable fields: Default nullable unless marked `not null` in CDS
- Marker behavior: Fully supported
- JSON `null`: Stored as NULL in database

**OData V2 Adapter**:

- Same nullable semantics as V4
- Marker behavior: Fully supported
- Payload format: `{ "d": { "field": null } }`

### RAP (ABAP RESTful Application Programming Model)

**OData V4**:

- Nullable fields: Controlled by CDS and table definitions
- Marker behavior: Fully supported
- NULL handling: Mapped to ABAP initial values / DB NULL

**Gateway OData V2**:

- Nullable fields: Often stricter (many fields non-nullable by default)
- Marker behavior: Fully supported
- Empty string: Common pattern in ABAP (space = "empty", not NULL)

### OData Protocol Compliance

Both markers follow OData V4 specification:

- **Omitted property**: "The service MUST NOT update the property" (OData V4 spec §11.4.3)
- **Property with null**: "Sets the property to null" (OData V4 spec §11.4.3.1)
- **Empty string**: Normal string value of length zero

The implementation works identically for CAP, RAP, V2, and V4.

## Common Pitfalls

### Pitfall 1: Empty Cell vs NULL Marker

**Mistake**: Expecting empty cell to set NULL

```
Email field: [empty cell]
❌ Does NOT send null - property omitted
```

**Correct**: Use marker for NULL

```
Email field: __NULL__
✅ Sends null to backend
```

### Pitfall 2: Mandatory Fields Cannot Be NULL

**Mistake**: Using `__NULL__` on required field

```
Quantity field: __NULL__
❌ Error: Quantity is mandatory (Nullable="false")
```

**Correct**: Provide a value

```
Quantity field: 0
✅ Valid (zero is not null)
```

### Pitfall 3: Key Fields Are Never Nullable

**Mistake**: Trying to null a key field

```
ID field: __NULL__
❌ Error: Key fields cannot be null
```

### Pitfall 4: Wrong Marker for Type

**Mistake**: Empty string marker on number

```
Price field: __EMPTY__
❌ Error: __EMPTY__ only valid for text fields
```

**Correct**: Use null marker or zero

```
Price field: __NULL__  (if nullable)
Price field: 0         (explicit zero)
✅ Valid
```

## Workflow Recommendations

### For CREATE Operations

1. **Required fields**: Always provide values (cannot be omitted or NULL)
2. **Optional fields**:
   - Leave empty → backend uses default
   - Type `__NULL__` → explicitly NULL
   - Type `__EMPTY__` → explicitly empty string (text only)
   - Type value → use that value

### For UPDATE Operations

1. **Download existing data** (with keys included)
2. **Edit spreadsheet**:
   - Leave cells empty → fields unchanged
   - Type `__NULL__` → clear to NULL
   - Type `__EMPTY__` → clear to empty string
   - Type new value → update field
3. **Upload** - only changed properties sent to backend

See [Update Documentation](Update.md) for UPDATE-specific workflows.

## Advanced Topics

### Custom Marker Strings

If `__NULL__` conflicts with your data:

```javascript
componentData: {
  nullMarker: '[[NULL]]',      // Custom syntax
  emptyStringMarker: '[[EMPTY]]'
}
```

**Considerations**:

- Choose markers that won't appear in real data
- Keep them visually distinct and easy to type
- Document them for your users

### Per-Column Marker Behavior

Currently markers are global (same for all columns). This is intentional for simplicity.

**Workaround for column-specific needs**:

- Use different marker strings in different upload sessions
- Split uploads by entity type with different configurations

### Nullable Metadata Details

The Spreadsheet Importer reads nullable information from OData $metadata:

**OData V4**:

```xml
<Property Name="email" Type="Edm.String" Nullable="true"/>
<Property Name="quantity" Type="Edm.Int32" Nullable="false"/>
```

**OData V2**:

```xml
<Property Name="email" Type="Edm.String" Nullable="true"/>
<Property Name="quantity" Type="Edm.Int32" Nullable="false"/>
```

**Default behavior**: If `Nullable` attribute is missing, defaults to `true` (nullable).

**Key fields**: Always have `Nullable="false"` in OData metadata by specification. The component reads this directly from metadata.

## Troubleshooting

### "Null values are not allowed for this field"

**Cause**: You used `__NULL__` marker on a non-nullable field.

**Solutions**:

1. Check if field is mandatory in metadata
2. Use a concrete value instead (e.g., `0`, `false`, or actual text)
3. If field should be nullable, update your backend model (CDS/ABAP)

**Debugging**:

- Enable debug mode: `?sap-ui-debug=true`
- Check browser console for metadata logs
- Verify `Nullable="true"` in $metadata

### "Empty string marker is only valid for text fields"

**Cause**: You used `__EMPTY__` on numeric, boolean, or date field.

**Solutions**:

1. Use `__NULL__` if you want NULL
2. Use `0`, `false`, or valid date if you want zero/false/date
3. Leave cell empty if you want no change

### Marker Not Working

**Check**:

1. Markers enabled? (not set to `''`)
2. Exact match? (case-sensitive, including underscores)
3. Cell trimmed? (leading/trailing spaces removed automatically)
4. Custom marker? (check your configuration)

### Backend Still Rejects NULL

Even with correct marker usage, backend might reject:

**Possible causes**:

1. **Backend validation**: CAP/RAP custom validation logic
2. **Mandatory annotation**: Field marked as mandatory via `@Common.FieldControl: #Mandatory`
3. **Business logic**: Backend determines value before save

**These are backend behaviors, not importer issues.**

## OData Protocol Reference

### OData V4 Specification

From OData V4.0 specification (§11.4.3):

> "A missing property in the request body indicates that the property SHOULD NOT be updated. A present property with a null value indicates that the property SHOULD be set to null."

### OData V2 Specification

OData V2 follows similar semantics:

- Omitted property: no change
- Property with null: set to NULL (if nullable)
- Empty string: valid string value

## CAP-Specific Behavior

### CDS Nullable Defaults

In CAP CDS:

- Fields are **nullable by default**
- Add `not null` to make non-nullable:

```cds
entity Orders {
  OrderNo  : String not null;  // Non-nullable
  notes    : String;           // Nullable (default)
}
```

### CAP Null Handling

```javascript
// CAP processes these differently:

// Empty cell → property omitted
{ "OrderNo": "123" }
→ notes field: unchanged

// Marker __NULL__
{ "OrderNo": "123", "notes": null }
→ notes field: set to NULL

// Marker __EMPTY__
{ "OrderNo": "123", "notes": "" }
→ notes field: empty string (not NULL)
```

## RAP-Specific Behavior

### ABAP Nullable Semantics

In RAP/ABAP:

- Many fields are **non-nullable by default** (ABAP NOT NULL constraint)
- NULL vs initial value: ABAP has "initial" values (space, 0, etc.) distinct from NULL

### Common RAP Patterns

**String fields**:

- Empty string and space often treated as "no value" in ABAP
- NULL explicitly means "no value provided"

**Numeric fields**:

- Zero is a valid value, not "no value"
- NULL means "value not set"

**Date fields**:

- Zero date (`0000-00-00`) sometimes used as "no date" in older ABAP
- Modern RAP prefers NULL for "no date"

## Best Practices

### ✅ Do

1. **Use `__NULL__` for explicit null setting**

   - Updating value to clear it
   - Creating record with explicitly NULL optional field

2. **Leave cells empty for "no change"**

   - Bulk updates where you only change some fields
   - Partial data entry

3. **Use `__EMPTY__` for string fields where empty ≠ null matters**

   - Status fields that distinguish "not set" vs "intentionally empty"
   - Required strings that allow empty but not NULL

4. **Check metadata before using markers**
   - Enable debug mode
   - Review $metadata for Nullable attribute
   - Test with small datasets first

### ❌ Don't

1. **Don't use `__EMPTY__` on numeric/boolean/date fields**

   - Will cause validation error
   - Use `__NULL__` or concrete value instead

2. **Don't expect empty cell to send NULL**

   - Empty cell = omitted property = no change
   - Use marker for explicit NULL

3. **Don't use markers on key fields**

   - Keys are never nullable
   - Will cause validation error

4. **Don't use markers on mandatory fields**
   - Mandatory = non-nullable
   - Provide actual values instead

## Related Documentation

- [Configuration](Configuration.md) - Marker configuration options
- [Update](Update.md) - Using markers for UPDATE operations
- [Error Handling](Checks.md) - Nullable validation errors
- [How It Works](HowItWorks.md) - Technical background

## Technical Details

### Metadata Parsing

**V4 Metadata**:

```typescript
// From UI5 MetaModel
property.$Nullable ?? true; // Default nullable if omitted
```

**V2 Metadata**:

```xml
<!-- From XML metadata -->
<Property Name="field" Type="Edm.String" Nullable="false" />
```

### JSON Payload Examples

**OData V4**:

```json
{
  "product_ID": "P001",
  "quantity": 10,
  "notes": null,
  "description": ""
}
```

**OData V2**:

```json
{
  "d": {
    "product_ID": "P001",
    "quantity": 10,
    "notes": null,
    "description": ""
  }
}
```

Both protocols handle null identically from client perspective.

### Database State

After upload:

| Marker      | Database Column | SQL Equivalent               |
| ----------- | --------------- | ---------------------------- |
| Empty cell  | (unchanged)     | -                            |
| `__NULL__`  | NULL            | `UPDATE SET field = NULL`    |
| `__EMPTY__` | ''              | `UPDATE SET field = ''`      |
| Value       | value           | `UPDATE SET field = 'value'` |

## FAQ

**Q: Why not write markers in downloaded templates?**

A: Current workflow already handles the common case:

- Download: NULL → empty cell
- Upload: empty cell → omit → stays NULL ✓

Markers are only needed when you want to **change** a value to NULL.

**Q: Can I use different markers for different columns?**

A: Not currently. Markers are global per component instance. Use different component configurations if needed.

**Q: What if my data contains the literal text "**NULL**"?**

A: You have two options:

1. Change the marker to something else (`nullMarker: '[[NULL]]'`)
2. Disable markers (`nullMarker: ''`) and handle in backend

**Q: Do markers work with paste functionality?**

A: Yes! When pasting from Excel/Google Sheets, markers are recognized if cells contain the marker text.

**Q: How do I know if a field is nullable?**

A: Enable debug mode and check browser console logs. The component logs metadata information including nullable status.

---

For implementation questions, see [Troubleshooting](Troubleshooting.md) or open an [issue on GitHub](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues).
