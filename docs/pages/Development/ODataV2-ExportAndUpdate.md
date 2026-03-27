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

### Delete (V2 and V4)

- V2: Use `ODataModel.remove(sPath, { success, error })` with `sPath` built from `createKey(entitySetName, keys)`. Batch using `submitChanges()` if `useBatch` is enabled. Keys can be derived from `MetadataHandlerV2.getKeys(binding, payload)`.
- V4: Acquire the context to delete (e.g., via `requestContexts` or from matched contexts) and call `context.delete($$groupId)`. For FE draft scenarios, ensure correct active/draft context before delete. Integrate with the same progress/batch flow as UPDATE.

### Limitations and Next Steps

- Expand conversion supports arbitrary depth via chained paths (e.g., `A,B,B/C,B/C/D`).
- Introduce automatic switching to paginated reads when result size exceeds a threshold.
