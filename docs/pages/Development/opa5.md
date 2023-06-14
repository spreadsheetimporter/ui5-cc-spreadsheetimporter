OPA5 Tests are used here to check more unit-like the functionality of the app.

## Setup

Karma is installed and run from the `examples` folder. 
Tests are currently only in OData V4 FE Example.

### Configuration

The basic config file is the `karma.conf.js` file.  
To avoid having to create a separate configuration file for each version, logic is integrated into the file so that the appropriate variables are automatically drawn, for example the port or the appropriate spec files.  
The data for this is stored at the [`testapps.json`](https://github.com/marianfoo/ui5-cc-excelUpload/blob/main/dev/testapps.json) file.

## Run tests

You can run the tests for OData V4 and UI5 Version 108 in the root folder with:
````sh
npm run test:opa:v4fe:108
````

which will run `pnpm --filter ui5-cc-excelupload-sample karma -- -- ordersv4fe 108`.  
So you can run all the other versions like 96 and 84.  

````sh
pnpm --filter ui5-cc-excelupload-sample karma -- -- ordersv4fe 96
````


### Run headless

The opa5 tests in GitHub Actions must run headless, which is also possible to call locally with: 

````sh
pnpm --filter ui5-cc-excelupload-sample karma-headless -- -- ordersv4fe 108
````

## GitHub Actions

As specified in the [`testapps.json`](https://github.com/marianfoo/ui5-cc-excelUpload/blob/main/dev/testapps.json) file, the GitHub Action Workflow will run on every Pull Request push, testing the V4 Versions and is written down in [`opa5-test.yml`](https://github.com/marianfoo/ui5-cc-excelUpload/blob/main/.github/workflows/opa5-test.yml).

More info at [GitHub Actions](./../Development/GitHubActions.md)
