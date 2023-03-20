## Docs

The GitHub Actions `docs` is defined in the [`pushDocs.yml`](https://github.com/marianfoo/ui5-cc-excelUpload/blob/main/.github/workflows/pushDocs.yml) file.  
The content of docs is in the [`docs`](https://github.com/marianfoo/ui5-cc-excelUpload/tree/main/docs) folder and the config file is [`mkdocs.yml`](https://github.com/marianfoo/ui5-cc-excelUpload/blob/main/mkdocs.yml).

In a ubuntu enviroment, the workflow will setup python and install `mkdocs-material` and `mkdocs-minify-plugin`.  
With `mkdocs gh-deploy --force` the docs site will be pushed to the `gh-docs` branch and then published with GitHub Pages to https://marianfoo.github.io/ui5-cc-excelUpload/ .

## wdi5

With wdi5 it is possible to test a E2E Scenario with UI5 automatically in GitHub Actions.  
In order to cover as many scenarios as possible, this Worfklow will cover as many scenarios as possible.  

To avoid writing a separate configuration and workflow for each scenario, we use the [matrix](https://docs.github.com/en/actions/using-jobs/using-a-matrix-for-your-jobs) function of GitHub Actions. This means that we only have to define the workflow once and it is executed as often as necessary.  

The workflow is defined in the [`wdi5-test.yml`](https://github.com/marianfoo/ui5-cc-excelUpload/blob/main/.github/workflows/wdi5-test.yml) file.  
Following steps are currently executed in a ubuntu enviroment with matrix:

1. Update Chrome in Ubuntu to latest version
2. Checkout the ui5-cc-excelupload repo
3. Install pnpm
4. Install Node 16
5. Get Port of current scenario App (i.e. for ordersv4fe is Port 8080)
    1. With the port we can check if the app is running
6. Run `pnpm i`
7. Build ui5-cc-excelupload
8. Update also Chromedriver to latest version
9. Start CAP Server (for all scenarios the same)
10. Start the Scenario App
    1. For example, the matrix variables in `start:silent&` is used like :  
    
    `pnpm --filter ${{ matrix.scenario }}${{ matrix.ui5version }} start:silent&`  
    that can be:  
    `pnpm --filter ordersv4fe108 start`  
11. Start wdi5 Tests
    
    a. First check if server and app is running

    b. Start wdi5 test `headless` for the current scenario
    
    c. So `pnpm --filter ui5-cc-excelupload-sample test -- -- --headless ${{ matrix.scenario }} ${{ matrix.ui5version }}`  
    will be  
    `pnpm --filter ui5-cc-excelupload-sample test -- -- ordersv4fe 108`

### Start wdi5 Tests

Because we use only one [`wdio-base.conf.js`](https://github.com/marianfoo/ui5-cc-excelUpload/blob/main/examples/test/wdio-base.conf.js), we must and can only test this one scenario with the names of the scenario.  
We can pass parameters there when we call the test with `"test": "wdio run ./test/wdio-base.conf.js"`.  
So in the GitHub it will be called with `pnpm --filter ui5-cc-excelupload-sample test -- -- ordersv4fe 108`.  
With these parameters we can assign the appropriate port and spec files in the `wdio-base.conf.js` and read them from [`testapps.json`](https://github.com/marianfoo/ui5-cc-excelUpload/blob/main/dev/testapps.json).  
We try to ensure that all spec files apply to all scenarios, but certain ones can only be tested with OData V4, for example.


## Release Please Action

For automatic versioning and changelog generation, we use [release-please-action](https://github.com/google-github-actions/release-please-action), which allows everything to be done with GitHub Actions.  
This workflow is defined in [release-please.yml](https://github.com/marianfoo/ui5-cc-excelUpload/blob/main/.github/workflows/release-please.yml).  

This workflow will create a Pull Request if a `fix:` or `feat:` commit is pushed to the `main` branch.  
This Pull Request contains all changes, like the updated version and Changelog.  
In addition, scripts run to change the version in other files.  
In this [commit](https://github.com/marianfoo/ui5-cc-excelUpload/commit/4bf424914ca6c66c52cb17852f36ddbd520af07e), you can see which files are updated with this scripts.  
For example, in ui5.yaml and the sample apps.  

After this Pull Request is merged, the ui5-cc-excelupload will be build and published to npm automatically.