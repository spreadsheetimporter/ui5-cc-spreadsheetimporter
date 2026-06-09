# AGENTS.md — ui5-cc-spreadsheetimporter

## Project Overview

**ui5-cc-spreadsheetimporter** is a production-grade SAP UI5 custom control component for bulk spreadsheet data import into Fiori Elements and other UI5 applications. It parses Excel/CSV files client-side and submits the extracted data to the backend via OData V2 or V4 — the file itself is never uploaded.

- **Current version:** 2.4.0
- **Package:** `ui5-cc-spreadsheetimporter` (NPM)
- **License:** Commercial (v2.0.0+), Apache 2.0 for v1.x
- **Namespace:** `cc.spreadsheetimporter.v2_4_0` (versioned namespace for Fiori Launchpad coexistence)

## Repository Structure

This is a **monorepo** using npm workspaces.

```
/
├── packages/
│   └── ui5-cc-spreadsheetimporter/     # Main component (the NPM-published package)
│       ├── src/                         # TypeScript source
│       │   ├── Component.ts             # UIComponent entry point
│       │   ├── controller/              # Business logic (see Architecture below)
│       │   ├── control/                 # Custom UI5 controls (SpreadsheetDialog)
│       │   ├── fragment/                # XML UI fragments (7 files)
│       │   ├── i18n/                    # Translations (11 languages)
│       │   ├── css/                     # Styling
│       │   ├── enums.ts                 # Action, FieldMatchType, MessageType enums
│       │   ├── types.d.ts               # TypeScript interfaces
│       │   └── manifest.json            # UI5 component manifest
│       ├── dist/                        # Built output
│       ├── ui5.yaml                     # Runtime config
│       ├── ui5-build.yaml               # Build config (namespace replacement, transpile)
│       └── package.json
├── examples/
│   ├── packages/                        # Demo/test apps (20+ variants)
│   │   ├── ordersv4fe*/                 # OData V4 Fiori Elements examples
│   │   ├── ordersv2fe*/                 # OData V2 Fiori Elements examples
│   │   ├── ordersv4freestyle*/          # Freestyle examples
│   │   ├── ordersv2freestyle*/          # V2 Freestyle
│   │   ├── anyupload/                   # Standalone upload example
│   │   ├── server/                      # CAP backend (CDS models + services)
│   │   └── common/                      # Shared resources
│   └── test/
│       ├── specs/                       # wdi5 integration tests
│       ├── testFiles/                   # Sample Excel/CSV files
│       └── http/                        # HTTP request examples
├── docs/                                # MkDocs documentation source
├── dev/                                 # Build/utility scripts
├── .github/workflows/                   # CI/CD (see below)
├── mkdocs.yml                           # Documentation site config
├── package.json                         # Root workspace config
└── tsconfig.json                        # TypeScript config
```

## Tech Stack

| Layer              | Technology                                                                        |
| ------------------ | --------------------------------------------------------------------------------- |
| Language           | TypeScript 5.8 (component), JavaScript (tooling/tests)                            |
| UI Framework       | SAP UI5 1.84+ (min), 1.136 (default)                                              |
| Excel Parsing      | SheetJS (XLSX) 0.20.3 via CDN                                                     |
| Build              | @ui5/cli 4, ui5-tooling-transpile, ui5-tooling-modules, ui5-tooling-stringreplace |
| Backend (examples) | SAP CAP (CDS) with @sap/cds 9, SQLite                                             |
| Testing            | wdi5 v3 (WebdriverIO + UI5), OPA5                                                 |
| Linting            | ui5lint, Prettier 3.5                                                             |
| CI/CD              | GitHub Actions                                                                    |
| Docs               | MkDocs with Material theme                                                        |
| Release            | release-please (conventional commits)                                             |

## Architecture

### Data Flow

```
File Upload → FileService (read XLSX) → SheetHandler (sheet→JSON)
  → DataExtractorService (extract raw data) → Parser (type conversion + markers)
  → ValidationService (mandatory fields, max length, format)
  → MessageHandler (show errors/warnings to user)
  → User confirms → UploadService → OData Handler (V2 or V4) → Backend
```

### Key Source Files (`packages/ui5-cc-spreadsheetimporter/src/`)

**Entry & Orchestration:**

- `Component.ts` — UIComponent entry point; defines all configurable properties
- `controller/SpreadsheetUpload.ts` — Main orchestrator; manages dialog/wizard lifecycle, OData handler selection
- `controller/ImportService.ts` — Multi-stage import pipeline coordinator

**Data Processing:**

- `controller/SheetHandler.ts` — XLSX sheet-to-JSON conversion (custom implementation)
- `controller/Parser.ts` — Data type parsing, marker detection (`__NULL__`, `__EMPTY__`), OData payload construction
- `controller/MessageHandler.ts` — Validation messages, error grouping, row-level errors

**OData Integration:**

- `controller/odata/OData.ts` — Abstract base for OData handlers
- `controller/odata/ODataV2.ts` — V2-specific create/update/batch logic
- `controller/odata/ODataV4.ts` — V4-specific create/update/batch logic
- `controller/odata/MetadataHandlerV2.ts` / `MetadataHandlerV4.ts` — Parse entity metadata, build type/label maps
- `controller/odata/ODataV4RequestObjects.ts` — V4 batch request construction

**Services (single-responsibility):**

- `controller/services/FileService.ts` — File reading, sheet selection
- `controller/services/DataExtractorService.ts` — Raw sheet data extraction
- `controller/services/ValidationService.ts` — Data validation pipeline
- `controller/services/UploadService.ts` — Route to OData or standalone upload
- `controller/services/TemplateService.ts` — Template XLSX generation
- `controller/services/TextToWorkbookService.ts` — Paste-from-clipboard conversion

**UI & Dialogs:**

- `control/SpreadsheetDialog.ts` — Custom dialog with drag-drop and paste support
- `controller/dialog/SpreadsheetUploadDialog.ts` — Main upload dialog controller
- `controller/dialog/WizardDialog.ts` — Multi-step import wizard
- `controller/dialog/OptionsDialog.ts` — Runtime configuration UI
- `controller/dialog/ODataMessageHandler.ts` — Backend error display

**Download/Export (reverse flow):**

- `controller/download/SpreadsheetGenerator.ts` — Generate XLSX from OData entities
- `controller/download/SpreadsheetDownload.ts` / `SpreadsheetDownloadDialog.ts`
- `controller/download/DataAssigner.ts` — Map entity data to spreadsheet columns

**Wizard Steps:**

- `controller/wizard/steps/UploadStep.ts`
- `controller/wizard/steps/HeaderSelectionStep.ts`
- `controller/wizard/steps/PreviewStep.ts`
- `controller/wizard/steps/MessagesStep.ts`

### Versioned Namespace System

The component uses a **versioned namespace** (`cc.spreadsheetimporter.v2_4_0`) to allow multiple versions to coexist in a Fiori Launchpad. During build, placeholders are replaced:

- `XXXnamespaceXXX` → `v2_4_0`
- `XXXnamespaceShortXXX` → `v240`
- `XXXnamespaceSlashXXX` → `v2_4_0`

This is handled by `ui5-tooling-stringreplace` in `ui5-build.yaml`.

### Key Component Properties

| Property            | Default               | Description                                 |
| ------------------- | --------------------- | ------------------------------------------- |
| `action`            | `'CREATE'`            | `CREATE`, `UPDATE`, `DELETE`, `UPSERT`      |
| `standalone`        | `false`               | Upload to app memory only (no OData)        |
| `useImportWizard`   | `false`               | Step-by-step wizard UI                      |
| `activateDraft`     | `false`               | Auto-activate draft entities                |
| `batchSize`         | `1000`                | Records per OData batch                     |
| `fieldMatchType`    | `'labelTypeBrackets'` | How spreadsheet headers match entity fields |
| `nullMarker`        | `'__NULL__'`          | Marker string to set fields to null         |
| `emptyStringMarker` | `'__EMPTY__'`         | Marker string to set text fields to empty   |
| `enablePaste`       | `true`                | Allow paste-from-clipboard                  |

### Extension Points (Events)

- `changeBeforeCreate` — Modify payload before OData upload
- `uploadButtonPress` — Intercept upload initiation
- `requestCompleted` — Post-upload processing
- `beforeDownloadFileExport` — Pre-download customization

## Build & Development

```bash
# Install dependencies
npm install

# Build component
npm run build

# Start dev server with V4 Fiori Elements demo
npm run start:v4fe

# Start dev server with V2 Fiori Elements demo
npm run start:v2fe

# Lint
npm run lint:ui5

# Format
npm run prettier
```

**Build produces:** Transpiled JS + .d.ts files in `packages/ui5-cc-spreadsheetimporter/dist/`

**Note:** The build (`npm run build`) is only needed for publishing the NPM package. It is NOT required for running tests or local development. The dev server and test infrastructure use the TypeScript source directly via ui5-tooling-transpile at runtime.

## Testing

**Important:** The build (`npm run build`) is NOT needed for running tests. It is only needed for publishing the NPM package. The dev server and wdi5 tests use TypeScript source directly via ui5-tooling-transpile at runtime.

### Unit Tests (Jest)

Fast tests for pure logic (entity matching, validation, draft handling). No server required.

```bash
npm run test:unit              # Run all unit tests from root
```

- **Config:** `packages/ui5-cc-spreadsheetimporter/jest.config.js`
- **Tests:** `packages/ui5-cc-spreadsheetimporter/test/unit/`
- **Mocks:** SAP UI5 modules mocked in `test/unit/__mocks__/sap/`
- **Runtime:** ~1.5s, no servers needed

### wdi5 E2E Tests (WebdriverIO + UI5)

Browser-based integration tests against running CAP server + UI5 apps.

```bash
# From root — run against default UI5 version (136)
npm run test:v4fe              # OData V4 Fiori Elements
npm run test:v2fe              # OData V2 Fiori Elements

# Specific UI5 version
npm run test:v4fe:108          # V4 FE on UI5 1.108
npm run test:v2fe:108          # V2 FE on UI5 1.108

# Single spec (from examples/ directory)
cd examples
npm run test -- ordersv2fe 136 --spec ./test/specs/updatev2/DownloadAndUpdateSpreadsheetObjectPageV2

# Headless (CI mode)
npm run test --workspace=ui5-cc-spreadsheetimporter-sample -- -- --headless ordersv4fe 136

# Watch mode (reruns on file changes)
cd examples && npm run test -- ordersv4fe 136 --watch

# Debug mode (opens Chrome DevTools)
cd examples && npm run test -- ordersv4fe 136 --debug
```

**Prerequisites:** CAP server + UI5 app must be running:

```bash
npm run start:server &         # Start CAP server on port 4004
npm run start:v2fe             # Start V2 FE app on port 8081
npm run start:v4fe             # Start V4 FE app on port 8080
```

### OPA5 Tests

```bash
npm run test:opa5:v4fe         # OPA5 integration tests (V4 only)
```

### Test Infrastructure Details

- **Config:** `examples/test/wdio-base.conf.js` — dynamic scenario/version routing
- **Mapping:** `dev/testapps.json` — maps scenarios to ports, UI5 versions, and spec files
- **Specs:** `examples/test/specs/` — organized by feature:
  - `all/` — common tests (upload, paste, options)
  - `update/` — V4 download + update tests
  - `updatev2/` — V2 download + mass update tests
  - `download/` — export/download tests
  - `wizard/` — wizard flow tests
  - `v4/` — V4-specific tests
- **Page Objects:** `examples/test/specs/Objects/`
  - `Base.js` — browser control utilities
  - `BaseUpload.js` — file upload helper (dialog + file input)
  - `FEV2.js` / `FEV4.js` — Fiori Elements selector constants
- **Test Data:** `examples/test/testFiles/` — sample XLSX/CSV files

**CI matrix:** 6 scenarios x 6 UI5 versions (1.71, 1.84, 1.96, 1.108, 1.120, 1.136).

## CI/CD Workflows (`.github/workflows/`)

| Workflow                         | Purpose                                                   |
| -------------------------------- | --------------------------------------------------------- |
| `wdi5-test.yml`                  | Integration tests (matrix: scenarios x UI5 versions)      |
| `opa5-test.yml`                  | Fiori Elements OPA5 tests                                 |
| `ui5-lint.yml`                   | ui5lint                                                   |
| `release-please.yml`             | Automated releases via conventional commits → NPM publish |
| `pushDocs.yml`                   | Build/deploy MkDocs to gh-pages                           |
| `health-check-livedemo.yml`      | Live demo health monitoring                               |
| `dockerfile-examples-deploy.yml` | Docker deployment of examples                             |
| `link-checker.yml`               | Documentation link validation                             |
| `cla.yml`                        | CLA checking                                              |

## Code Style & Conventions

- **Line width:** 150 characters
- **Indentation:** 2 spaces
- **Quotes:** Single quotes
- **Trailing commas:** None
- **Commit messages:** Conventional commits (enforced by commitlint + Husky)
- **TypeScript:** Strict mode enabled, target ES2022
- Global `sap` variable assumed in all UI5 code
- XML fragments use `core:FragmentDefinition` pattern

## Supported Languages (i18n)

EN, DE, ES, FR, HI, IT, JA, PT, NL, ZH, KO

## Working with This Codebase

### Adding a new feature

1. Modify TypeScript source in `packages/ui5-cc-spreadsheetimporter/src/`
2. If adding a new component property, update `Component.ts` metadata and `Component.gen.d.ts`
3. Add i18n strings to all 11 language files in `src/i18n/`
4. Update version references if namespace-sensitive
5. Run `npm run build` to verify
6. Test with appropriate demo app (`npm run start:v4fe` etc.)

### Version bumps

Handled automatically by release-please. Version appears in:

- `package.json`
- `manifest.json`
- Namespace placeholders in `ui5-build.yaml`

### OData V2 vs V4

The codebase uses a strategy pattern: `ODataV2.ts` and `ODataV4.ts` both extend `OData.ts`. The correct handler is selected at runtime based on the model type detected from the UI5 binding context.

## Docs

Documentation is built with MkDocs (`mkdocs.yml`) and deployed to GitHub Pages. Source in `docs/` and `docs/pages/`. The `docs/ABAP.md` and `docs/ABAP_DOCS.md` files contain RAP backend implementation guides.
