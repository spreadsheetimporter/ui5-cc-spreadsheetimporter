# ssi-fiori-demo — Fiori Elements demo against a live RAP backend

A **Fiori Elements** (List Report / Object Page) app over the **live** RAP demo service `ZSSI_UI_ORD_O4`
(OData V4), to test the **ABAP RAP spreadsheet importer** end-to-end through a real UI — and to exercise the
**live `ui5-cc-spreadsheetimporter` component from this monorepo** against a real backend (the other example
apps use a mock server).

It demonstrates **both** import paths side by side, as four buttons on the `Orders` table toolbar:

| Button                             | Path                                     | What it does                                                                      |
| ---------------------------------- | ---------------------------------------- | --------------------------------------------------------------------------------- |
| **Server import (base64)**         | native RAP action `importExcel`          | parameter dialog; paste base64 of an `.xlsx`/`.csv` → **server** parses + creates |
| **Server upload file**             | native RAP action `importUpload`         | file-upload dialog → **server** parses + creates (Fiori `largeObject` channel)    |
| **Spreadsheet Upload (component)** | client-side `ui5-cc-spreadsheetimporter` | the component parses the file **in the browser** and creates rows via OData V4    |
| **Download template (server)**     | `Template` `$value` stream               | one-click download of the generated `.xlsx` template (`getCreateTemplate`)        |

> The reusable importer lives in the **`abap-spreadsheetimporter`** repo (package `ZSSI_IMPORTER`); the demo BO
> `ZSSI_R_ORD` + service live in `ZSSI_RAP`. Deep manual-test cases: that repo's `docs/manual-test-guide.md`.

---

## Setup

This is a **workspace** of the `ui5-cc-spreadsheetimporter` monorepo, so it consumes the component **live from
source** (`"ui5-cc-spreadsheetimporter": "*"` + `ui5-middleware-ui5`) — no vendored copy to keep in sync. Edit
the component, reload the app, see the change.

1. **Backend reachable:** the service `ZSSI_UI_ORD_O4` published on your S/4HANA system.
2. **Secrets in `.env`** (gitignored — never committed). Copy the template and fill it in:
   ```bash
   cp .env.example .env
   # edit .env:
   #   BACKEND_URL=http://your-s4-host:50000
   #   FIORI_TOOLS_USER=YOURUSER
   #   FIORI_TOOLS_PASSWORD=yourpassword
   ```
   `BACKEND_URL` is injected into `ui5.yaml` at start — the committed file is `ui5.yaml.tmpl`; `ui5.yaml` is
   **generated + gitignored**, so the host never lands in git. Credentials are read straight from `.env` by the
   Fiori proxy.

## Run

```bash
# once, from the MONOREPO ROOT (links this workspace + the component):
npm install

# then, in this folder:
npm start
```

`npm start` runs `prestart` (generates `ui5.yaml` from `.env`) then serves on **http://localhost:8080** and
opens the app. UI5 loads from the public CDN (pinned **1.136.0** — the file-upload-as-action-parameter feature
needs > 1.120); `/sap/**` is proxied to `BACKEND_URL`; the component is served live by `ui5-middleware-ui5`.

## What you should see

The `Orders` **List Report** (Order ID / Customer / Total amount) from the live system + the four toolbar
buttons. Drill into an order for its **Items** on the Object Page.

## Test the round-trip (recommended)

1. **Download template (server)** → fill a few rows in Excel → Save As `.xlsx`. Headers are `Label [Property]`
   (and `Property [Property]` for unlabeled fields), matching the component's own template.
2. Re-import it three ways:
   - **Server upload file** → pick the file → result shows `Created / Failed`.
   - **Server import (base64)** → paste `base64 -i orders.xlsx | tr -d '\n'` into `FileContent` → Execute.
   - **Spreadsheet Upload (component)** → Browse → Upload (columns match **case-insensitively**, so the
     backend's UPPER-case template re-imports cleanly).
3. **Go** on the filter bar (or refresh) → the new orders appear.

## How the pieces fit

- `webapp/manifest.json` — `mainService` → the real V4 path; local `annotations/annotation.xml` supplies the UI
  (the RAP service ships none); native actions surfaced as `DataFieldForAction`; the two custom buttons
  (`Download template`, `Spreadsheet Upload`) wired to `webapp/ext/ListReportExt.js`.
- `webapp/index.html` — bootstraps via `sap/ui/core/ComponentSupport` (the declarative component needs it).
- **Component** — the workspace dependency `"ui5-cc-spreadsheetimporter": "*"`, served live by
  `ui5-middleware-ui5` (`configFile: ui5-serve.yaml`); `manifest.json` maps it via `componentUsages` +
  `resourceRoots`. No `webapp/thirdparty/` vendoring.
- `ui5.yaml.tmpl` + `scripts/gen-ui5-yaml.mjs` — keep the backend host out of git.

## Troubleshooting

| Symptom                                           | Fix                                                                                            |
| ------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `BACKEND_URL is not set`                          | copy `.env.example` → `.env` and fill it in.                                                   |
| Blank page / `registerEnum is not a function`     | stale UI5 cache from a version switch — **Empty Cache & Hard Reload**.                         |
| 401 / login loop                                  | wrong/empty `FIORI_TOOLS_*` in `.env`, or the service isn't assigned to your user.             |
| Orders empty                                      | none exist yet — import some (round-trip above).                                               |
| `importUpload` dialog looks plain on S/4HANA 2023 | known 758 `largeObject` `$metadata` gap (action-param ComplexType); functionality still works. |
| `Spreadsheet Upload` button missing               | run `npm install` at the monorepo root so the component workspace is linked.                   |
