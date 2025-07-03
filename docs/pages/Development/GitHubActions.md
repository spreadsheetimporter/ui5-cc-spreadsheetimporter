## Docs

The GitHub Actions `docs` is defined in the [`pushDocs.yml`](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/blob/main/.github/workflows/pushDocs.yml) file.  
The content of the docs is in the [`docs`](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/tree/main/docs) folder and the config file is [`mkdocs.yml`](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/blob/main/mkdocs.yml).

In an Ubuntu environment, the workflow will set up Python and install `mkdocs-material` and `mkdocs-minify-plugin`.  
With `mkdocs gh-deploy --force`, the docs site will be pushed to the `gh-docs` branch and then published with GitHub Pages to https://docs.spreadsheet-importer.com/.

## wdi5

With wdi5, it is possible to test an E2E Scenaro with UI5 automatically in GitHub Actions.  
In order to cover as many scenarios as possible, this workflow will cover as many scenarios as possible.

To avoid writing a separate configuration and workflow for each scenario, we use the [matrix](https://docs.github.com/en/actions/using-jobs/using-a-matrix-for-your-jobs) function of GitHub Actions. This means that we only have to define the workflow once, and it is executed as often as necessary.

The workflow is defined in the [`wdi5-test.yml`](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/blob/main/.github/workflows/wdi5-test.yml) file.  
The following steps are currently executed in a Ubuntu environment with matrix:

1. Update Chrome in Ubuntu to the latest version.
2. Checkout the `ui5-cc-spreadsheetimporter` repo.
3. Install `pnpm`.
4. Install Node 16.
5. Get the port of the current scenario App (i.e., for `ordersv4fe`, the port is 8080).
   1. With the port, we can check if the app is running.
6. Run `pnpm i`.
7. Build `ui5-cc-spreadsheetimporter`.
8. Start CAP Server (for all scenarios the same).
9. Start the Scenario App

   1. For example, the matrix variables in `start:silent&` are used like:

   `pnpm --filter ${{ matrix.scenario }}${{ matrix.ui5version }} start:silent&`  
   which can be:  
   `pnpm --filter ordersv4fe108 start`

10. Start wdi5 Tests

    a. First check if the server and app are running.

    b. Start wdi5 test `headless` for the current scenario.

    c. So `pnpm --filter ui5-cc-spreadsheetimporter-sample test -- -- --headless ${{ matrix.scenario }} ${{ matrix.ui5version }}`  
    will be  
    `pnpm --filter ui5-cc-spreadsheetimporter-sample test -- -- ordersv4fe 108`

### Start wdi5 Tests

Because we use only one [`wdio-base.conf.js`](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/blob/main/examples/test/wdio-base.conf.js), we must and can only test this one scenario with the names of the scenario.  
We can pass parameters there when we call the test with `"test": "wdio run ./test/wdio-base.conf.js"`.  
So in GitHub, it will be called with `pnpm --filter ui5-cc-spreadsheetimporter-sample test -- -- ordersv4fe 108`.  
With these parameters, we can assign the appropriate port and spec files in the `wdio-base.conf.js` and read them from [`testapps.json`](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/blob/main/dev/testapps.json).  
We try to ensure that all spec files apply to all scenarios, but certain ones can only be tested with OData V4, for example.

## Release Please Action

For automatic versioning and changelog generation, we use [release-please-action](https://github.com/google-github-actions/release-please-action), which allows everything to be done with GitHub Actions.  
This workflow is defined in [release-please.yml](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/blob/main/.github/workflows/release-please.yml).

This workflow will create a Pull Request if a `fix:` or `feat:` commit is pushed to the `main` branch.  
This Pull Request contains all changes, like the updated version and Changelog.  
In addition, scripts run to change the version in other files.  
In this [commit](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/commit/4bf424914ca6c66c52cb17852f36ddbd520af07e), you can see which files are updated with these scripts.  
For example, in `ui5.yaml` and the sample apps.

After this Pull Request is merged, the `ui5-cc-spreadsheetimporter` will be built and published to npm automatically.
