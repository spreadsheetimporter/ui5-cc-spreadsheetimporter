### Project Setup Overview

This document describes the overall structure, tooling, and development workflows of the repository so contributors can onboard quickly.

### Repository Structure

- Root
  - `packages/ui5-cc-spreadsheetimporter/`: Main library (UI5 custom component/control) implemented in TypeScript.
  - `examples/`: Sample apps (V2/V4, FE/FPM/Freestyle, TS/JS) showcasing integration and features.
  - `docs/`: MkDocs site content.
  - `dev/`: Helper scripts used during development and docs.
  - `Dockerfile`: Container for docs/site or examples as needed.

### Main Library (`packages/ui5-cc-spreadsheetimporter`)

- Source: `src/`
  - `Component.ts`: Entry point of the reusable component. Config surfaces like `deepDownloadConfig`, `updateConfig`, events, etc.
  - `control/`: Custom controls (e.g., upload dialog control and renderer).
  - `controller/`: Feature logic (wizard, dialogs, services, OData handlers, download/export pipeline).
    - `odata/`: Versioned OData handlers and metadata helpers (V2/V4). Abstract `OData` defines the cross‑version contract.
    - `download/`: Spreadsheet download orchestration and workbook generation.
    - `wizard/`: Multi‑step upload wizard handling mapping, preview, and messages.
    - `services/`: Utilities for template creation, validation, parsing, file service, and data extraction.
  - `fragment/`: UI5 XML fragments for dialogs and wizard.
  - `i18n/`: Translations.
  - `enums.ts`, `types.d.ts`: Shared enums and TypeScript types.

### Examples (`examples/`)

Contains multiple UI5 apps illustrating usage across:

- OData V4 FE and Freestyle, with deep download and update.
- OData V2 FE and Freestyle (non‑draft variants as well).
- AnyUpload minimal sample.
- A CAP server package (`examples/server`) for local data and annotations.

Each example has its own `webapp/`, `manifest.json`, and test setup under `test/`.

### Documentation (`docs/`)

An MkDocs site configured via `mkdocs.yml`.

- Navigation groups: Core Concepts, Features (Update, Button, Deep Download), Integration, Reference (API, Changelogs), Resources, Development (Getting Started, Testing, Docs, Prettier/Commitlint, GitHub Actions, Sample Apps, Spreadsheet Download), and this setup document.
- Pages use Material theme with custom overrides and extra CSS. See `docs/overrides` and `docs/stylesheets/extra.css`.

### Build and Tooling

- Language: TypeScript for the component library; examples in JS/TS.
- UI5 Versions: V2 and V4 models supported. Check `docs/pages/SupportVersions.md` for supported UI5 ranges.
- Testing: wdi5 and OPA5 tests live under `examples/**/test` and `examples/test/specs` with configuration in `examples/test/wdio-base.conf.js`.
- Linting/Formatting: Prettier and Commitlint configs at repo root.

### Development Workflow

- Branching: Feature branches (e.g., `feat/export-v2-new`) with PRs into `main`.
- Docs: Add or edit under `docs/` and update `mkdocs.yml` navigation accordingly.
- Examples: Use the example apps to verify features across model versions and FE/Freestyle patterns.
- Do not run `npm run build` for the library unless explicitly required; rely on local UI5 tooling and example apps for manual verification.

### Feature Architecture Highlights

- Abstraction by `OData` interface keeps feature logic (download, wizard, services) decoupled from the OData version specifics.
- Metadata handlers translate UI5 metamodel differences between V2 and V4.
- Download pipeline is shared: `SpreadsheetDownload` → `OData.*` fetchers → `DataAssigner` → `SpreadsheetGenerator`.
- Update pipeline parallels V4 and will be implemented for V2 using `ODataModel.update` with batch `submitChanges` for performance.

### Links

- UI5 V2 Model: `https://ui5.sap.com/#/api/sap.ui.model.odata.v2.ODataModel`.
- UI5 V4 Model: `https://ui5.sap.com/#/api/sap.ui.model.odata.v4.ODataModel`.
- UI5 MetaModel: `https://ui5.sap.com/#/api/sap.ui.model.odata.ODataMetaModel`.


