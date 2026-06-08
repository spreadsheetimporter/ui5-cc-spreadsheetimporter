The UI5 Custom Control Spreadsheet Upload is used in many different scenarios. To ensure that changes do not affect the function, the basic function and a few other additional functions are tested with wdi5 tests.

The overview of which scenarios are covered by wdi5 tests can be found here: [wdi5 tests](../SupportVersions.md#wdi5-tests)

## Setup

wdi5 is used in the test setup in the [`examples`](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/tree/main/examples) folder in the [`test`](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/tree/main/examples/test) folder.
As npm workspaces is used, with `npm install --legacy-peer-deps`, all the packages, including `wdio-ui5-service`, are installed.

### Configuration

The basic config file is the `wdio-base.conf.js` file.
To avoid having to create a separate configuration file for each scenario, logic is integrated into the file so that the appropriate variables are automatically drawn, for example the port or the appropriate spec files.
The data for this is stored in the [`testapps.json`](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/blob/main/dev/testapps.json) file.

#### How `wdio-base.conf.js` works

The config file receives the scenario name and UI5 version as command-line arguments (e.g., `ordersv2fe 136`). It then:

1. Looks up the scenario in `testapps.json` via `util.getTestappObject(scenario, version)`
2. Extracts the **port** and **spec file patterns** from the mapping
3. Constructs the `baseUrl` as `http://localhost:{port}/index.html?sap-language=EN`
4. Configures Chrome with appropriate window size and download directory

#### How `testapps.json` works

Each entry in `testapps.json` defines:

- `rootAppName` — scenario identifier (e.g., `ordersv2fe`, `ordersv4fe`)
- `port` — the port the UI5 app runs on for the default version
- `testMapping.specs` — array of glob patterns pointing to test spec files
- `copyVersions` — array of alternative UI5 versions, each with their own port and optional spec overrides

Example: `ordersv2fe` at version 136 maps to port 8081 and runs specs from `../test/specs/all/**.test.js` and `../test/specs/updatev2/**.test.js`.

### Test Object Helpers

Located in `examples/test/specs/Objects/`:

| File            | Purpose                                                                                                                  |
| --------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `Base.js`       | Browser control utilities: `getControlById()`, `pressById()`, `dummyWait()`                                              |
| `BaseUpload.js` | Reusable file upload helper — opens dialog, removes block layer, makes file input visible, sets file path, clicks upload |
| `FEV2.js`       | OData V2 Fiori Elements control selectors and IDs (list report, object page, tables)                                     |
| `FEV4.js`       | OData V4 Fiori Elements control selectors and IDs                                                                        |
| `FEV2ND.js`     | Non-draft V2 variant selectors                                                                                           |
| `types.js`      | Shared test option constants                                                                                             |

### Test Data Files

Located in `examples/test/testFiles/`:

- Various `.xlsx` and `.csv` files for different test scenarios
- Files with errors, no errors, format variations, decimal separators
- Separate CSV subdirectories for comma/dot decimal formats

## Run tests

You can run the tests for OData V2 and V4 with the default UI5 version (136) from the root folder:

```sh
npm run test:v4fe
npm run test:v2fe
```

Or with a specific UI5 version:

```sh
npm run test:v4fe:108
npm run test:v2fe:108
```

which will run `npm run test --workspace=ui5-cc-spreadsheetimporter-sample -- -- ordersv4fe 108`.
So, you can run all the other apps like

```sh
npm run test --workspace=ui5-cc-spreadsheetimporter-sample -- -- ordersv4fe 84
```

### Run single spec

You can also run single test specs. You need to go to the `examples` folder for this.
For example, you can run the test spec `OpenSpreadsheetUploadDialog` with OData V2 FE UI5 Version 96 with:

```sh
npm run test -- ordersv2fe  96 --spec OpenSpreadsheetUploadDialog
```

### Run headless

The wdi5 tests in GitHub Actions must run headless, which is also possible to call locally with:

```sh
npm run test --workspace=ui5-cc-spreadsheetimporter-sample -- -- --headless ordersv4fe 84
```

### Watch mode

Watch mode reruns tests automatically when source or test files change:

```sh
cd examples
npm run test -- ordersv4fe 136 --watch
```

In watch mode:

- Only 1 browser instance runs (vs 5 in normal mode) for stability
- File changes in `test/specs/` and `packages/ui5-cc-spreadsheetimporter/src/` are monitored
- Each test result is printed with pass/fail indicators

### Debug mode

Debug mode opens Chrome DevTools automatically and extends timeouts:

```sh
cd examples
npm run test -- ordersv4fe 136 --debug
```

Connection timeout is extended to 20 minutes in debug mode to allow stepping through breakpoints.

## V2 Update Tests

The `updatev2/` test directory contains tests for the OData V2 deep download and mass update feature:

**Flow:**

1. Set entity to draft state via V4 API (CAP's cov2ap adapter translates)
2. Navigate to V2 draft object page
3. Trigger deep download → verify XLSX file created
4. Modify spreadsheet data (update quantities)
5. Upload modified file via mass update dialog
6. Save/activate draft
7. Verify updated data via API

**Prerequisites:** CAP server must be running on port 4004, and the V2 FE app on its mapped port.

## Unit Tests (Jest)

In addition to wdi5 E2E tests, there are unit tests for the core library logic using Jest.

```sh
npm run test:unit    # From root
```

Unit tests are located in `packages/ui5-cc-spreadsheetimporter/test/unit/` and test pure logic like entity matching, draft validation, and error handling without requiring a running server.

See the [Jest config](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/blob/main/packages/ui5-cc-spreadsheetimporter/jest.config.js) for module mapping details. SAP UI5 modules are mocked in `test/unit/__mocks__/sap/`.

## GitHub Actions

As specified in the [`testapps.json`](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/blob/main/dev/testapps.json) file, the GitHub Action Workflow will run on every Pull Request push, testing scenarios with all current UI5 Maintenance Versions and is written in [`wdi5-test.yml`](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/blob/main/.github/workflows/wdi5-test.yml).

More info at [GitHub Actions](./../Development/GitHubActions.md)
