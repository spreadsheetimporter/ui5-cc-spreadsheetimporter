# CLAUDE.md — ui5-cc-spreadsheetimporter

Operational guide for working in this repo. For the broad architecture/feature overview see [AGENTS.md](AGENTS.md); this file focuses on the **test setup, the on-the-fly build, and the rules that bite if you get them wrong.**

---

## ⚠️ CRITICAL: `packages/ui5-cc-spreadsheetimporter/dist/` must stay EMPTY for local dev/test

The component is **TypeScript in `src/`, transpiled on the fly** when you run the dev server / CAP server. Do **not** run `npm run build` before developing or testing locally.

**Why it matters.** The component is published with `dist/` as its entry point, so several resolution paths prefer `dist/` over `src/`:

- `packages/ui5-cc-spreadsheetimporter/package.json` → `"main": "dist/Component.js"`, `"types": "dist/index.d.ts"`, `"files": ["dist", …]`
- `packages/ui5-cc-spreadsheetimporter/ui5.yaml` (the default/publish config) maps the mount `/thirdparty/customcontrol/spreadsheetimporter/v2_4_0/` → `./dist/`

If `dist/` contains leftover output from a past `npm run build`, the runtime can serve that **stale compiled JS** instead of your live `src/` changes — your edits silently don't take effect and tests run old code. This is a top source of "why isn't my change working?" confusion.

**The committed state of `dist/` is empty** (only a `.gitkeep`; `dist` is in `.gitignore`). Keep it that way locally.

```bash
# If dist got populated (e.g. you ran a build), reset it:
git clean -xdf packages/ui5-cc-spreadsheetimporter/dist   # or: rm -rf packages/ui5-cc-spreadsheetimporter/dist/* (keep .gitkeep)
```

`npm run build` (`ui5 build --config=ui5-build.yaml --all --clean-dest --dest dist`) is **only** for publishing the npm package. CI builds in a fresh, throwaway runner, so it's a non-issue there — the rule is about not leaving a stale `dist/` in your working copy.

---

## How the on-the-fly component build works

The example apps reference the component by UI5 namespace `cc.spreadsheetimporter.v2_4_0` (manifest `componentUsages` + `resourceRoots` → `./thirdparty/customcontrol/spreadsheetimporter/v2_4_0`). That path is served live, never from a build, via this chain:

1. Example app `ui5.yaml` registers the `ui5-middleware-ui5` middleware pointing at the component package with **`configFile: "ui5-serve.yaml"`** (e.g. [examples/packages/ordersv2fe/ui5.yaml:27-32](examples/packages/ordersv2fe/ui5.yaml)).
2. The component's [`ui5-serve.yaml`](packages/ui5-cc-spreadsheetimporter/ui5-serve.yaml) sets `resources.paths.webapp: src` and mounts at `/thirdparty/customcontrol/spreadsheetimporter/v2_4_0`, then runs three middlewares on every request:
   - `ui5-tooling-stringreplace-middleware` — replaces `XXXnamespaceXXX` → `v2_4_0` (and short/slash variants)
   - `ui5-tooling-transpile-middleware` — transpiles `.ts`/`.tsx` → JS on the fly
   - `ui5-tooling-modules-middleware` — resolves bare npm imports (e.g. xlsx)
3. The CAP server additionally carries `cds-spreadsheetimporter-plugin` ([examples/packages/server/srv/orders-service.cds:2](examples/packages/server/srv/orders-service.cds)); when `cds watch` starts it installs/serves the component too (hence "built on the fly when running the cap server").

Net effect: **edit `src/*.ts` → refresh the app → change is live.** No build step. (This is why a stale `dist/` is dangerous — it can short-circuit this.)

---

## Test setup

Two independent layers. Neither needs `npm run build`.

### Unit tests (Jest) — fast, no server

```bash
npm run test:unit            # from repo root
```

- Config: [packages/ui5-cc-spreadsheetimporter/jest.config.js](packages/ui5-cc-spreadsheetimporter/jest.config.js) (ts-jest).
- Tests + mocks: `packages/ui5-cc-spreadsheetimporter/test/unit/` — SAP UI5 modules and peer classes are mocked under `test/unit/__mocks__/`.
- Use these for **pure logic** (entity matching, draft validation, metadata/expand/payload transforms). ~1.5s.

### wdi5 E2E (WebdriverIO + UI5) — needs the running stack

The stack is **two processes**:

| Process                  | Port                              | Started by                          | Serves                                                                                                    |
| ------------------------ | --------------------------------- | ----------------------------------- | --------------------------------------------------------------------------------------------------------- |
| CAP server (`cds watch`) | `4004`                            | `npm run start:server`              | OData V4 + **V2 via cov2ap** (`@cap-js-community/odata-v2-adapter`), and the component (cds plugin)       |
| UI5 app (`fiori run`)    | e.g. `8081` (v2fe), `8080` (v4fe) | `npm run start:v2fe` / `start:v4fe` | the Fiori Elements app; loads the component from `src` (on the fly); proxies `/odata/v2/orders` → `:4004` |

Run tests (default UI5 version 136):

```bash
npm run test:v2fe           # OData V2 FE   (apps must be running; see below)
npm run test:v4fe           # OData V4 FE
npm run test:v2fe:108       # specific UI5 version

# single spec (from examples/)
cd examples && npm run test -- ordersv2fe 136 --spec ./test/specs/updatev2/DownloadAndUpdateSpreadsheetObjectPageV2
```

To run locally, start the backend + the app first, then run the spec:

```bash
npm run start:server &      # CAP on :4004
npm run start:v2fe &        # V2 FE app on :8081
# wait for both ports, then:
npm run test:v2fe
```

**How the runner is wired:**

- `npm run test:v2fe` → `examples` workspace `wdio run ./test/wdio-base.conf.js ordersv2fe 136`.
- [examples/test/wdio-base.conf.js](examples/test/wdio-base.conf.js) reads the scenario + version from argv, looks them up in [dev/testapps.json](dev/testapps.json) via `dev/util.js`, and derives the **port**, the **spec globs**, and `baseUrl = http://localhost:<port>/index.html?...`.
- [dev/testapps.json](dev/testapps.json) maps each scenario → port + spec patterns + `copyVersions` (per-UI5-version ports/specs).
- **Versioned app copies** (`ordersv2fe136`, `ordersv2fe120`, …) are generated by `npm run copyTestApps` (`dev/copy-example-apps.js create`); `dev/util.js` rewrites each copy's manifest `resourceRoots`/`componentUsages` to the versioned namespace.
- Page objects + helpers: `examples/test/specs/Objects/` (`Base.js`, `BaseUpload.js`, `FEV2.js`, `FEV4.js`, …). Test data: `examples/test/testFiles/`.

**CI** (`.github/workflows/wdi5-test.yml`): matrix of 6 scenarios × 6 UI5 versions. It removes `cds-plugin-ui5`, installs, `copyTestApps`, builds, starts the CAP server + the app (`start:silent`, which uses `ui5-test.yaml` and reaches the component through the CAP server), waits for ports `4004` + the app port, then runs wdi5 headless and uploads the timeline report artifact.

---

## Debugging / observability

Enable the component's verbose logging to see internal state (especially the hard-to-inspect OData V2 metadata):

- **Set `debug: true`** in the importer `componentData` — `Component.init` then calls `Log.setLevel(Log.Level.DEBUG)` + `Log.logSupportInfo(true)`, which activates lazy support-info dumps via `() => component.logger.returnObject(obj)`.
- Or globally: append `?sap-ui-logLevel=DEBUG` to the app URL (trips the same branch).
- Read dumps in the browser console or `sap.base.Log.getLogEntries()`. Filter by component tag: `SpreadsheetUpload: ODataV2`, `ODataV2RequestObjects`, `MetadataHandlerV2`, etc.

**In wdi5 runs**, [examples/test/wdio-base.conf.js](examples/test/wdio-base.conf.js) sets `sap-ui-logLevel=DEBUG` on `baseUrl` (override with `WDI5_LOG_LEVEL=ERROR`), enables Chrome `goog:loggingPrefs`, and on a **failed** test the `afterTest` hook prints the `SpreadsheetUpload` log buffer + the browser console, while TimelineService captures a screenshot (`screenshotStrategy: on:error`, report under `examples/reports/timeline`).

Use the SAP `Log` API, never `console.*` (which can't be gated/filtered).

---

## Conventions & gotchas

- **Code style:** component (`packages/`) uses Prettier `.prettierrc.json` (2 spaces, single quotes, width 150). The **`examples/` folder has its own** `examples/.prettierrc.js` (**tabs**, double quotes, width 200) — match the folder you're editing. Husky runs lint-staged on commit.
- **`tsc --noEmit` reports ~50 pre-existing errors** — the project builds via babel-based `ui5-tooling-transpile`, not `tsc`, so it never type-checks. Don't treat those as regressions; check whether your change _adds_ errors (e.g. `git stash` + compare).
- **Versioned namespace:** source uses `XXXnamespaceXXX` placeholders, replaced with `v2_4_0` at serve/build time. Keep them as placeholders in `src/`.
- **OData V2 is synthetic:** the V2 service is the V4/CDS service translated by cov2ap. V2 metadata, key predicates, and draft fields (`IsActiveEntity`/`HasDraftEntity`) are generated — inspect them at runtime (debug logging or the `examples/test/http/*.http` probes), not from source.

---

## Quick reference

```bash
npm install --legacy-peer-deps   # install (monorepo, npm workspaces)
npm run test:unit                # Jest unit tests (no server)
npm run start:server             # CAP server :4004 (cds watch, OData v2+v4)
npm run start:v2fe               # V2 FE app :8081   (start:v4fe → :8080)
npm run test:v2fe                # wdi5 V2 FE, full scenario (server + app must be running)
npm run test:smoke               # wdi5 V2 deep-export/update/draft, single spec — fast local check
npm run lint                     # eslint
npm run prettier                 # format
# DO NOT run `npm run build` for local dev/test — it populates dist/ (see top).
```
