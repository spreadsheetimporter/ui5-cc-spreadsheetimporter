# HTTP Test Scripts for OrderItems Null Value Testing

This directory contains HTTP test scripts to verify how the CAP backend handles null values when creating and updating OrderItems via OData V4 and V2 endpoints.

## Files

- `create-order-item-v4-null-tests.http` - Tests for OData V4 endpoint (`/odata/v4/orders`)
- `create-order-item-v2-null-tests.http` - Tests for OData V2 endpoint (`/odata/v2/Orders`)

## Prerequisites

1. CAP backend server running on `http://localhost:4004`
2. HTTP client that supports `.http` files (VS Code REST Client extension, IntelliJ HTTP Client, etc.)

## Test Scenarios

### 1. Baseline Tests

- **Step 0**: Get first Order (automatically uses first order from database)
- **Step 1**: (Optional) Create a new Order if needed
- **Step 7**: Create OrderItem with all fields populated (baseline)

### 2. Null Value Tests

- **Step 2**: Create OrderItem with all nullable fields set to `null`
- **Step 8-12**: PATCH operations to set individual fields to `null`

### 3. Omitted Field Tests

- **Step 3**: Create OrderItem with most fields omitted
- **Step 10**: PATCH OrderItem with fields omitted (should not change existing values)

### 4. Empty vs Null Tests

- **Step 4**: Empty string `""` vs `null` for string fields
- **Step 5**: Zero `0` vs `null` for numeric fields
- **Step 6**: `false` vs `null` for boolean fields

### 5. Invalid Value Tests (Expected to Fail)

- **Step 13**: Empty string `""` for numeric field → should return 400/422
- **Step 14**: String `"NULL"` for numeric field → should return 400/422
- **Step 15**: Empty string `""` for boolean field → should return 400/422
- **Step 16**: Empty string `""` for date field → should return 400/422

### 6. Verification

- **Step 17**: Query all created OrderItems to verify null values persisted correctly

## Expected Behavior

### OData Semantics (CAP & RAP)

1. **Omitted Property** → Property is not changed (no update)
2. **Property set to `null`** → Property is set to NULL in database (if Nullable="true")
3. **Property set to `null` on non-nullable field** → Returns 4xx error
4. **Empty string `""`** → Valid value for strings (not null)
5. **Zero `0`** → Valid value for numbers (not null)
6. **`false`** → Valid value for booleans (not null)

### Type-Specific Behavior

#### Strings (Edm.String)

- `null` → Database NULL (if nullable)
- `""` → Empty string (valid, not null)
- Omitted → No change

#### Numbers (Edm.Int32, Edm.Decimal, Edm.Double)

- `null` → Database NULL (if nullable)
- `0` → Numeric zero (valid, not null)
- `""` → **Invalid** → Returns 400/422
- `"NULL"` → **Invalid** → Returns 400/422
- Omitted → No change

#### Boolean (Edm.Boolean)

- `null` → Database NULL (if nullable)
- `false` → Boolean false (valid, not null)
- `""` → **Invalid** → Returns 400/422
- Omitted → No change

#### Date/Time (Edm.Date, Edm.DateTimeOffset, Edm.TimeOfDay)

- `null` → Database NULL (if nullable)
- Valid ISO format → Valid value
- `""` → **Invalid** → Returns 400/422
- Omitted → No change

## Usage

1. Open the `.http` file in your HTTP client (VS Code REST Client, IntelliJ HTTP Client, etc.)
2. Update the `@baseUrl` variable if your server runs on a different port/host
3. **Execute Step 0** - This automatically captures the first Order ID
4. Execute tests sequentially (Steps 2-17)
5. **For PATCH tests (Steps 8-12)**: Execute Step 7a after Step 7 to automatically capture the OrderItem ID
6. **Optional**: Execute Step 1 if you want to create a new test order (then re-run Step 0)

### How Automatic Variables Work

- **Step 0**: Named request `# @name getFirstOrder` captures the Order response
- **@orderId**: Automatically set via `{{getFirstOrder.response.body.value[0].ID}}`
- **Step 7a**: Named request `# @name getLatestOrderItem` captures the latest OrderItem
- **@orderItemId**: Automatically set via `{{getLatestOrderItem.response.body.value[0].ID}}`
- All subsequent requests use these variables automatically - no manual copying needed!

## Notes

- V2 endpoint uses different date formats:
  - DateTime: `/Date(timestamp)/` format
  - Date: `/Date(timestamp)/` format
  - Time: `PT10H30M0S` format (ISO 8601 duration)
- V4 endpoint uses ISO 8601 formats:
  - DateTime: `2025-01-15T10:30:00Z`
  - Date: `2025-01-15`
  - Time: `10:30:00`
- Response format differs:
  - V4: `{"value": [...]}`
  - V2: `{"d": {"results": [...]}}`

## What These Tests Verify

These tests verify that:

1. The CAP backend correctly handles `null` values according to OData V4/V2 specifications
2. Empty cells in spreadsheets should be **omitted** (not sent as `null` or `""`)
3. Explicit null tokens (e.g., `__NULL__`) should be converted to JSON `null`
4. Type mismatches (e.g., `""` for numbers) are properly rejected
5. The importer should send proper JSON types (numbers as numbers, not strings)
