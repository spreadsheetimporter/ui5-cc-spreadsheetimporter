# Freestyle test harness

A fast, stable alternative to driving component features through Fiori Elements. Each feature
lives on its own **freestyle view** reached by a stable hash route, so a wdi5 spec deep-links
straight to it — no list-report → object-page navigation, no draft lifecycle, no FE template load.
The same spec runs unchanged against **both OData versions**.

## Why

A Fiori Elements feature spec spends most of its time on host-app choreography (filter → Go →
navigate → edit/draft → dialog → save) that has nothing to do with the component. The freestyle
harness strips that away: a feature page is a button + a table, and the component does the rest.
Result: ~2–6 s per spec instead of 10–50 s, deterministic hand-authored control IDs, and one spec
covering both OData V2 and V4.

## The two harness apps

| App                                           | OData                              | Router                                           | Serves component                                |
| --------------------------------------------- | ---------------------------------- | ------------------------------------------------ | ----------------------------------------------- |
| `examples/packages/ordersv4freestyle`         | V4 (`/odata/v4/orders`)            | `sap.m.routing.Router` (pages)                   | on-the-fly (`ui5.yaml`)                         |
| `examples/packages/ordersv2freestylenondraft` | V2 via cov2ap (`/odata/v2/orders`) | `sap.f.routing.Router` (FCL, `beginColumnPages`) | CAP in CI (`ui5-test.yaml`); on-the-fly locally |

Both expose an identical set of feature routes. The views differ only in namespace
(`ordersv4freestyle.*` vs `ui.v2.ordersv2freestylenondraft.*`) and the OData model behind `/Orders`.

## Routes & views

| Route                | View       | Flavor      | What it exercises                                                                                                                                               |
| -------------------- | ---------- | ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `#/feature`          | `Launcher` | —           | Overview console: lists every feature page, navigates on press. Also the manual-test console.                                                                   |
| `#/feature/upload`   | `Upload`   | standalone  | `standalone:true` parse — component returns parsed rows via `uploadButtonPress`, no backend write.                                                              |
| `#/feature/download` | `Download` | backend     | `deepDownloadConfig` deepLevel-2 export (Orders + Items + Shipping) → multi-sheet file.                                                                         |
| `#/feature/create`   | `Create`   | backend     | Non-standalone create — component resolves the bound `/Orders` table from `context` and writes to the backend.                                                  |
| `#/feature/locale`   | `Locale`   | typed parse | `decimalSeparator: ","` coerces "1.000,99" → 1000.99 against the OrderItems `price` (Double), captured via `uploadButtonPress` + `preventDefault()` (no write). |
| `#/feature/errors`   | `Errors`   | backend     | Upload an invalid file; the component validates against `/OrderItems` and raises its "Upload Error" messages dialog instead of writing.                         |
| `#/feature/options`  | `Options`  | backend     | `availableOptions: ["strict"]` surfaces the dialog's options/settings menu.                                                                                     |

Each view has **hand-authored stable IDs** (`uploadOpenButton`, `uploadResultTable`,
`downloadOpenButton`, `createOpenButton`, `featureList`, …). Specs select by id-suffix regex
(`id: /uploadResultTable$/`) so they are app-agnostic.

## Specs

`examples/test/specs/feature/*.test.js` — one per feature, deep-linking via
`browser.goTo({ sHash: "#/feature/..." })`. Verification:

- **standalone** → assert the local result table / parsed rows;
- **backend create** → assert via the shared CAP DB (V4 endpoint, app-agnostic) using a per-run
  count baseline (the DB is shared, so assert _delta_, never absolute existence);
- **backend export** → read the generated `.xlsx` from `examples/test/downloads` and assert sheets.

They are wired in `dev/testapps.json` for `ordersv4freestyle` and `ordersv2freestylenondraft`
(base + versioned copies); the **openui5** variant is intentionally excluded — it has no feature
views.

## Adding a feature

1. Add `view/<Feature>.view.xml` + `controller/<Feature>.controller.js` to **both** harness apps
   (same stable IDs; V2 controller uses the `ui.v2.…` namespace).
2. Register the route + target in each `manifest.json` (`feature/<name>` → `<Feature>`; V2 targets
   need `"viewLevel": 1`).
3. Add an entry to the `FEATURES` array in both `Launcher.controller.js` (drives the console row).
4. Add `examples/test/specs/feature/<Feature>.test.js` (app-agnostic id-suffix selectors).
5. In event handlers, **capture models/view in a closure** — never rely on `this` (the component
   dispatches custom events with `this === null`; see `fireEventAsync`).

## Running

```bash
# backend
npm run start:server                                   # CAP :4004 (in-memory DB, resets on restart)

# V4 harness on-the-fly (:8190)
npm run start:silent --workspace=ordersv4freestyle136
# V2 harness on-the-fly (:8082) — NOT start:silent locally (that uses ui5-test.yaml -> 404s the component)
( cd examples/packages/ordersv2freestylenondraft && npx fiori run -p 8082 )

# run the feature specs
cd examples
npx wdio run ./test/wdio-base.conf.js ordersv4freestyle 136 --spec ./test/specs/feature/Create.test.js
# or the whole scenario (feature specs + that app's existing specs)
npm run test -- ordersv2freestylenondraft 136
```

CI-parity: `npm run test:docker:build && docker run --rm spreadsheet-test ordersv4freestyle 136`
(replicates the GitHub Actions environment, auto-removes `cds-plugin-ui5`, fresh DB).

> The shared in-memory CAP DB means create/update specs can pollute reads in sibling specs. Assert
> on _deltas_ or _existence-anywhere_, never on absolute counts or first-row ordering.
