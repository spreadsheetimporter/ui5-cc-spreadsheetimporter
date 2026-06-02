### OData V2 Excel Export and Update: Design and Implementation Plan

This document explains what is being implemented to bring the existing OData V4 deep download (Excel export) feature to OData V2, why certain design decisions were made, and how the OData V2 mass update will be implemented next.

The implementation follows UI5 APIs and patterns for `sap.ui.model.odata.v2.ODataModel` and `sap.ui.model.odata.v2.ODataListBinding`. Differences from OData V4 are explicitly called out.

### Goals

- Achieve feature parity with the V4 deep download:
  - Entity graph traversal by navigation properties (recursive up to a configurable level).
  - Optional deep export of siblings and nested entities.
  - Column selection and ordering, optional inclusion of key properties.
  - Events to hook into data processing and the final file export.
- Keep a consistent API surface for component consumers regardless of OData version.

### Key Classes and Responsibilities

- `controller/download/SpreadsheetDownload`:
  - Orchestrates fetching data and shaping it into an entity tree using `OData.getODataEntitiesRecursive` and `DataAssigner`.
  - Delegates file creation to `SpreadsheetGenerator`.
- `controller/download/SpreadsheetGenerator`:
  - Builds the workbook and triggers the download.
  - Fires `beforeDownloadFileExport` event for last‑mile customization.
- `controller/odata/ODataV2`:
  - OData V2 specific data access, binding creation, pagination, and metadata resolution.
  - Converts V4 `$expand` object shape to V2 comma‑separated `$expand` string.
- `controller/odata/MetadataHandlerV2`:
  - Reads V2 metamodel, resolves entity types, keys, labels, and builds a recursive entity graph for `expand`.
- `controller/download/DataAssigner` and `controller/Util`:
  - Normalize and assign raw results to the entity graph structure expected by the generator.

### End‑to‑End Flow (V2)

1. Resolve entity graph and expand
   - `SpreadsheetDownload.fetchData` calls `ODataV2.getODataEntitiesRecursive(entityType, deepLevel)` to obtain `mainEntity` and an `expands` object produced by `MetadataHandlerV2`.
2. Create a list binding with expand
   - `ODataV2.getBindingFromBinding(binding, expands)` returns a new `ODataListBinding` for the same path with a V2‑compatible `expand` parameter (comma‑separated paths, e.g. `Orders,Orders/Items`).
3. Fetch data (with pagination fallback)
   - `ODataV2.fetchBatch(customBinding, batchSize)` performs a `model.read(path, { urlParameters })` and maps results into context‑like objects so the existing `Util.extractObjects` pipeline works the same way for V2 and V4.
   - For future large datasets, `_fetchAllDataV2` supports `$inlinecount`, `$skip`, `$top` based chunking.
4. Assign data and generate workbook
   - `DataAssigner` attaches `$XYZEntity`, `$XYZData`, and flattened columns as in V4. Then `SpreadsheetGenerator` creates the workbook and triggers `XLSX.writeFile` after firing `beforeDownloadFileExport`.

### Notable Differences vs V4 and How They’re Addressed

- Expand format:
  - V4 uses nested `$expand` objects on the binding. V2 requires a comma‑separated string of navigation paths. `ODataV2._convertExpandToV2Format` converts the nested object into `prop,prop/subProp,...`.
- Binding API:
  - V4 uses `bindList(path, ..., { $$updateGroupId, $count })` and `requestContexts`. V2 uses `ODataModel.read` for data retrieval; the implementation maps results into lightweight context‑like objects to keep the rest of the pipeline unchanged.
- Count and pagination:
  - V4 can `requestContexts` and read `$count` from the header context. V2 uses `$inlinecount=allpages` and `$skip`/`$top`. `_fetchAllDataV2` is prepared for this.
- Key extraction:
  - A basic `_extractKey` exists as a fallback. Production code will rely on `MetadataHandlerV2.getKeyList` to construct proper key predicates for context paths when needed.

### UI5 APIs used (V2)

- `sap.ui.model.odata.v2.ODataModel.read(sPath, mParameters)` with `urlParameters: { $expand, $inlinecount, $skip, $top }`.
- `sap.ui.model.odata.v2.ODataModel.bindList(path, context, sorters, filters, parameters)` for creating a list binding with `expand`.
- `sap.ui.model.odata.v2.ODataMetaModel` for entity type and label metadata.

### Error Handling

- `ODataV2.checkForErrors` inspects the `submitChanges` batch response; when `showBackendErrorMessages` is enabled, messages are shown via the UI5 `MessageManager` wrapper.

### Current Implementation Status

- Implemented for export (deep download):
  - Expand conversion and list binding creation in `ODataV2.getBindingFromBinding`.
  - Data fetching via `ODataV2.fetchBatch` with `$expand` and `$inlinecount`, auto-switching to paginated reads (`$skip`/`$top`) when needed.
  - Data shaping and workbook generation via the existing `SpreadsheetDownload` and `SpreadsheetGenerator` pipeline.
- To be improved next:
  - Replace `_extractKey` fallback with metadata‑based key predicate construction for logging.

### OData V2 Update: Implementation Plan

Objective: Make UPDATE work with V2 similar to V4’s `updateAsync`, honoring the same `UpdateConfig` (`columns`, `fullUpdate`, `continueOnError`).

1. Derive keys and target path
   - Use `MetadataHandlerV2.getKeys(binding, payload)` (or `getKeyList(odataEntityType)`) to extract key values from the import row.
   - Use `ODataModel.createKey(entitySetName, keys)` to construct the key predicate and derive the absolute path to the entity.
2. Update path and batching
   - Directly call `model.update(sPath, payload, { merge: !fullUpdate })` per entity, where `sPath` is built via `ODataModel.createKey(entitySetName, keys)`.
   - All updates are collected and sent using a single `submitChanges` call as part of the existing pipeline.
3. Draft compatibility
   - If the service uses Draft (FE V2 pattern), detect draft vs active based on `IsActiveEntity` in payload or metadata. When updating a draft, include `IsActiveEntity=false` in the key predicate or path when applicable. Where available, use `DraftController` to activate (already implemented in `waitForDraft`).
4. Respect `UpdateConfig`
   - `fullUpdate: boolean`: send full payload via `model.update(..., { merge: false })`; otherwise send only changed, configured fields via `merge: true`.
   - `columns: string[]`: if provided and not empty, restrict updates to these properties.
5. Error handling and continue‑on‑error
   - Collect errors from the batch response in `checkForErrors` (already implemented) and use the existing message handler to display backend messages when enabled.
6. Performance
   - Group updates into a single batch with `submitChanges` when possible (ensure `useBatch` is enabled on the model). For very large updates, chunk requests to avoid payload limits.

### API and Events

- The same component settings and events used for V4 apply to V2, notably:
  - `deepDownloadConfig` for export (columns, deepExport, deepLevel, filename, addKeysToExport, showOptions).
  - `beforeDownloadFileProcessing` and `beforeDownloadFileExport` events.
  - `updateConfig` for UPDATE behavior in future V2 implementation.

### What changed (August 2025)

- Implemented V2 UPDATE via `ODataV2.updateAsync` using metadata-based keys (`MetadataHandlerV2.getKeys`) and `ODataModel.createKey`, honoring `UpdateConfig` (`fullUpdate`, `columns`).
- Enhanced expand conversion to support deep nesting by flattening nested objects into comma-separated V2 `$expand` paths.
- Improved V2 export to switch automatically to paginated reads for large datasets.
- Fixed typings in `MetadataHandlerV2` (`ODataMetaModel`) and minor readability refactors in V2 handler.

### What changed (March 2026)

- **Draft prefetch for V2 UPDATE:** Created `ODataV2RequestObjects` mirroring V4's `ODataV4RequestObjects` pattern. Dual-fetches active and draft entities using `model.read()` with filters, matches spreadsheet rows to backend entities, validates draft state, and reports not-found/mismatch errors.
- **Draft-aware `updateAsync`:** Checks prefetched entity for `HasDraftEntity` / `IsActiveEntity` status. When targeting a draft entity, includes `IsActiveEntity=false` in the key predicate. Existing `waitForDraft()` with `DraftController.activateDraftEntity()` handles post-update activation.
- **Deep export `getLabelList` fix:** Stored MetaModel reference on `MetadataHandlerV2` (lazily cached) so `getLabelList` can resolve entity types without a binding parameter during recursive sibling sheet generation.
- **Restored `precision`, `scale`, `nullable` in V2 metadata:** Re-added metadata property extraction that was accidentally dropped during branch development. Required for null/empty marker support and decimal validation.
- **Replaced `console.log` with SAP `Log` API** and removed dead `_extractKey()` fallback method.

### What changed (June 2026)

- **Debug instrumentation across the V2 path:** Added lazy support-info dumps (`Log.debug(..., () => logger.returnObject(obj))`) at the V2 decision points — entity-graph resolution and association ends (`MetadataHandlerV2`), expand conversion, fetch parameters/response and pagination, and the update key/payload (`ODataV2`), plus active/draft reads and entity matching (`ODataV2RequestObjects`). Standardized component tags (`SpreadsheetUpload: ODataV2` / `ODataV2RequestObjects` / `MetadataHandlerV2`), fixed a copy-pasted `ODataV4` tag inside `ODataV2`, and converted the remaining stray `console.*` calls to the `Log` API.
- **Fixed deep-export nested expand:** `MetadataHandlerV2._findEntitiesByNavigationProperty` resolved associations against `rootEntity` instead of the entity currently being traversed, so navigation properties beyond the first hop (e.g. `Orders/Items`, `Orders/Shipping`) silently failed to resolve and were dropped from the export. It now passes the current `entity`, so the graph traverses fully up to `deepLevel`.
- **Fixed the mass-update example wiring:** `ordersv2fe`'s `massUpdate()` did not pass a `tableId`; on an Object Page with more than one table this aborts initialization (`Found more than one table on Object Page`) before the dialog opens, so `updateAsync` was never reached. Added the Items `tableId`.
- **wdi5 failure diagnostics:** on a failed test, the config dumps the `SpreadsheetUpload` log buffer + browser console and saves a screenshot under `examples/reports/errorShots/`. UI5 `DEBUG`-level logging is opt-in via `WDI5_LOG_LEVEL=DEBUG` (default off, to keep CI fast); the fixes above were found this way. See _Debugging an OData V2 issue_ below.
- **Fixed V4 deep export leaking collection properties:** the no-columns export path included every `$kind:'Property'` field, including the draft-internal `DraftMessages` collection present in newer Fiori Elements metadata (UI5 ≥ 1.120). That extra column was rejected as `ColumnNotFound` on re-upload and blocked the whole update (the active entity was never changed). The export now skips `$isCollection` properties, so the download → upload round-trip is consistent across UI5 versions. (This was the cause of the `ordersv4fe` 1.120/1.136 CI failures.)
- **Excel-serial date recovery in the parser:** when a date/time-typed column arrives as a numeric cell (date-cell typing lost in a round-trip, or produced by another tool), the parser previously fed the serial to `new Date()` and produced 1970-based values. A new pure, unit-tested `excelSerialToDate` helper is now used for `Edm.Date` / `Edm.DateTimeOffset` / `Edm.TimeOfDay` when the cell is numeric and not date-typed. Proper date cells and non-numeric values are unchanged.
- **`checkForErrors` robustness (V2):** previously inspected only `__batchResponses[0].response`, missing errors in batched create/update operations (nested in `__changeResponses`) and in later batch parts. A pure, unit-tested `hasV2BatchError` helper now scans every batch part and changeset sub-response for an HTTP error (≥ 400).
- **Update value-change detection (parity with V4):** `ODataV2.updateAsync` now skips columns whose value already matches the prefetched backend entity (unless `fullUpdate`), instead of sending every configured column. Date-typed values are still sent (formats differ), so the date round-trip is unaffected.
- **CI stabilization:** a merge conflict with `main` makes GitHub skip the `pull_request` wdi5 workflow entirely (no run is created), so merging `main` into the branch is required to unblock it. Flaky busy-overlay (`sap-ui-blocklayer-popup`) click intercepts under parallel load were addressed with `specFileRetries` (deferred) and lower `maxInstances` in `wdio-base.conf.js`.

### Delete (V2 and V4)

- V2: Use `ODataModel.remove(sPath, { success, error })` with `sPath` built from `createKey(entitySetName, keys)`. Batch using `submitChanges()` if `useBatch` is enabled. Keys can be derived from `MetadataHandlerV2.getKeys(binding, payload)`.
- V4: Acquire the context to delete (e.g., via `requestContexts` or from matched contexts) and call `context.delete($$groupId)`. For FE draft scenarios, ensure correct active/draft context before delete. Integrate with the same progress/batch flow as UPDATE.

### Limitations and Next Steps

- Expand conversion supports arbitrary depth via chained paths (e.g., `A,B,B/C,B/C/D`).
- Introduce automatic switching to paginated reads when result size exceeds a threshold.
- **DELETE / UPSERT** are advertised by the `Action` enum but not implemented in either V2 or V4 (`callOdata` only dispatches CREATE/UPDATE). See the _Delete (V2 and V4)_ notes above for the intended approach.
- **Component-driven V2 draft activation** (`activateDraft: true`) relies on `ODataV2.waitForDraft`, which carries a known caveat in Object Page tables (`hasDraft` can stay true) and is not yet covered by an e2e test — the update spec activates via the FE Save button instead.

### Quirks and Gotchas (OData V2 specifics)

These are the V2-specific traps that cost the most time. Most stem from V2 being a different — and, in the example apps, _generated_ — protocol than V4.

- **The example V2 service is synthetic (cov2ap).** The CAP server exposes one V4/CDS service and serves V2 through the `@cap-js-community/odata-v2-adapter` (cov2ap). The V2 `$metadata`, entity-set names, key predicates and draft fields are _translated_, not hand-written — so inspect what the V2 layer actually emits at runtime rather than assuming it matches V4. In tests, draft state is even set via the V4 endpoint (`draftEdit`) and read back over V2.
- **The V2 metamodel is XML-derived and loosely typed.** Vocabulary annotations are plain object fields (`property['sap:label']`, `property['com.sap.vocabularies.UI.v1.Hidden'].Bool`, `property['com.sap.vocabularies.Common.v1.FieldControl'].EnumMember`); entity types expose `key.propertyRef[]` and `navigationProperty[]`. Most access goes through `as any`. Dump the resolved entity type with debug logging before relying on a field's shape.
- **`getODataAssociationEnd` is entity-relative.** Resolve a navigation property against the entity that _owns_ it — `metaModel.getODataAssociationEnd(entityType, navProp.name)` — not against the root entity. The wrong entity returns `null` and the branch is silently dropped (this caused the nested-expand bug fixed in June 2026).
- **Expand is a string, not a tree.** V4 uses nested `$expand` objects; V2 wants a comma-separated path string (`Orders,Orders/Items,Orders/Shipping`). `ODataV2._convertExpandToV2Format` flattens the V4-style nested object into that string.
- **Reads, not contexts.** V2 has no `requestContexts`/`$count` header context. `ODataV2.fetchBatch` uses `model.read(path, { urlParameters: { $expand, $inlinecount } })` and wraps raw results into context-like `{ getObject, getPath, data }` objects so the shared download pipeline (`Util.extractObjects` → `DataAssigner` → `SpreadsheetGenerator`) stays version-agnostic. Large result sets auto-switch to `$skip`/`$top` pagination.
- **Draft is runtime data, not metadata.** `IsActiveEntity` / `HasDraftEntity` / `HasActiveEntity` appear only in read results (from cov2ap's draft enablement). On UPDATE, when the matched entity is a draft, the key predicate must include `IsActiveEntity=false`; `waitForDraft()` then activates via `DraftController.activateDraftEntity()`.
- **Known open issue — date/time round-trip.** On UPDATE, `Edm.DateTime` / `Edm.Time` / `Edm.DateTimeOffset` values can be sent back wrong (epoch-like). Not yet root-caused (export write vs. spreadsheet re-serialization vs. parser on re-upload).

### Debugging an OData V2 issue

1. **Turn on debug logging.** Set `debug: true` in the importer `componentData`, or append `?sap-ui-logLevel=DEBUG` to the app URL. Either flips the component into `Log.setLevel(DEBUG)` + `Log.logSupportInfo(true)`, which activates the lazy object dumps (`() => logger.returnObject(...)`).
2. **Read the dumps** in the browser console or via `sap.base.Log.getLogEntries()`. Filter by tag — `SpreadsheetUpload: ODataV2`, `ODataV2RequestObjects`, `MetadataHandlerV2`. You'll see the resolved entity graph, each association resolution, the generated expand string, the `read` URL parameters + raw response, the active/draft matches, and the final update key + payload.
3. **In wdi5 runs**, a failed test auto-dumps the `SpreadsheetUpload` log buffer + browser console and saves a screenshot under `examples/reports/errorShots/` (set `WDI5_LOG_LEVEL=ERROR` to quieten).
4. **Probe the V2 wire directly** with `examples/test/http/create-order-item-v2-null-tests.http` (REST Client) to see exactly what cov2ap accepts/returns for `$expand`, `$filter` and draft reads, decoupled from the UI5 layer.
5. **Build/run note:** the component is transpiled from `src/` on the fly — keep `packages/ui5-cc-spreadsheetimporter/dist` empty (see the repo `CLAUDE.md`). When serving the example apps via `cds watch`, note that `cds-plugin-ui5` expects each app's `dist/` to exist, so either build the apps or disable that plugin (CI removes it).
