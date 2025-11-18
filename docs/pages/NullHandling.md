# Null & Empty Value Handling

!!! info "Available from version 2.4.0"

## Overview

When working with OData services, there's an important distinction between NULL values, empty strings, and omitted properties. The Spreadsheet Importer uses marker strings to give you precise control over these three states.

This is particularly important for UPDATE operations where you need to clear a value (set to NULL) versus leaving it unchanged (omit the property).

## Understanding the Four States

The component supports four distinct states for each cell:

| Cell Content    | JSON Payload     | Backend Behavior                            |
| --------------- | ---------------- | ------------------------------------------- |
| **Empty cell**  | Property omitted | No change (UPDATE)<br>Uses default (CREATE) |
| **`__NULL__`**  | `"field": null`  | Set to NULL                                 |
| **`__EMPTY__`** | `"field": ""`    | Set to empty string (strings only)          |
| **Any value**   | `"field": value` | Set to that value                           |

!!! note "Understanding OData semantics"
In OData, these three states have different meanings:

    - **Omitted property**: Field is not included in the request
    - **NULL value**: Explicitly set to `null`
    - **Empty string**: Set to `""` (only for string fields)

## Configuration

Both markers are enabled by default. You can customize the marker strings or disable them entirely by setting them to an empty string:

```javascript
componentData: {
  nullMarker: '__NULL__',        // Default: '__NULL__', set '' to disable
  emptyStringMarker: '__EMPTY__' // Default: '__EMPTY__', set '' to disable
}
```

!!! tip "Disabling markers"
If you don't need marker functionality, disable it by setting both values to empty strings. This prevents accidental marker detection if your data happens to contain the default marker strings.

## Practical Example: Updating Customer Data

Let's say you're updating customer records. Your spreadsheet might look like this:

| ID  | Name       | Email       | Notes      |
| --- | ---------- | ----------- | ---------- |
| 123 |            |             | Call later |
| 456 | Jane Smith | `__NULL__`  |            |
| 789 |            | `__EMPTY__` | `__NULL__` |

The component will send these requests to your backend:

```json
// Record 123: Only notes field is updated
{ "ID": "123", "notes": "Call later" }

// Record 456: Name updated, email cleared (set to NULL)
{ "ID": "456", "name": "Jane Smith", "email": null }

// Record 789: Email set to empty string, notes cleared (set to NULL)
{ "ID": "789", "email": "", "notes": null }
```

Notice how empty cells in the Name and Phone columns don't appear in the JSON at all. This means those fields remain unchanged on the backend.

## Validation Rules

The component validates markers based on field type and nullable metadata from your OData service:

| Field Type                          | `__NULL__` Marker   | `__EMPTY__` Marker |
| ----------------------------------- | ------------------- | ------------------ |
| **String** (Edm.String)             | Allowed if nullable | Always allowed     |
| **Number** (Edm.Int32, Decimal)     | Allowed if nullable | Not allowed        |
| **Boolean** (Edm.Boolean)           | Allowed if nullable | Not allowed        |
| **Date** (Edm.Date, DateTimeOffset) | Allowed if nullable | Not allowed        |

!!! warning "Common misconception"
The values `0`, `false`, and empty cells are **not** treated as NULL. To explicitly set a field to NULL, you must use the `__NULL__` marker.

## Troubleshooting Common Errors

### "Null values are not allowed for this field"

This error occurs when you try to use `__NULL__` on a non-nullable field. Common causes:

- Key fields (always non-nullable by OData specification)
- Mandatory business fields marked as non-nullable in the backend
- Fields with database constraints

**Solution**: Either provide a concrete value or check your OData metadata to confirm which fields are nullable. Enable debug mode to see detailed metadata information.

### "Empty string marker is only valid for text fields"

You've used `__EMPTY__` on a non-string field type.

**Solution**: For numbers, booleans, or dates, use either `__NULL__` (if nullable) or a concrete value like `0`, `false`, or a specific date.

## Best Practices

When working with null and empty values, keep these guidelines in mind:

**Do:**

- Use `__NULL__` to explicitly clear field values in UPDATE operations
- Leave cells empty when you want to preserve existing values
- Check your OData metadata to understand which fields are nullable
- Enable debug mode when troubleshooting nullable field issues

**Don't:**

- Use `__EMPTY__` on non-string fields (numbers, dates, booleans)
- Expect empty cells to send NULL values (they omit the property entirely)
- Try to use markers on key fields or other non-nullable fields

## Frequently Asked Questions

### Does an empty cell mean NULL?

No. An empty cell causes the property to be omitted from the request entirely. This has different behavior depending on the operation:

- **UPDATE**: Field remains unchanged (keeps existing value)
- **CREATE**: Backend applies its default value (if any)

To explicitly set a field to NULL, you must use the `__NULL__` marker.

### Can I customize the marker strings?

Yes. You can set `nullMarker` and `emptyStringMarker` to any string value you prefer. For example:

```javascript
componentData: {
  nullMarker: 'NULL',
  emptyStringMarker: 'EMPTY'
}
```

To disable marker detection entirely, set them to empty strings.

## Backend-Specific Considerations

### SAP Cloud Application Programming Model (CAP)

Fields in CAP are nullable by default unless explicitly marked as `not null` in your CDS schema:

```cds
entity Customer {
  key ID : UUID;
  name : String not null;  // Non-nullable
  email : String;          // Nullable by default
}
```

### ABAP RESTful Application Programming Model (RAP)

In RAP, many fields are non-nullable by default based on the underlying ABAP table definitions. Check your DDIC table definitions to understand nullable constraints.
