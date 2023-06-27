OPA5 Tests are used here to check more unit-like the functionality of the app.

## Setup

The [ui5-test-runner](https://github.com/ArnaudBuchholz/ui5-test-runner) by Arnaud Buchholz is installed and run from the `examples` folder. 
Tests are currently only in OData V4 FE Example.

### Configuration

There is no config file. With the ui5-test-runner only the `opaTests.qunit.html` is called. 

## Run tests

You can run the tests for OData V4 and UI5 Version 108 in the root folder with:
````sh
npm run start:v4fe:108
npm run test:opa:v4fe:108
````

which will run `pnpm --filter ui5-cc-spreadsheetimporter-sample ui5-test-runner --url http://localhost:8080/test/integration/opaTests.qunit.html`.  
All informations about the run are in the folder `./examples/report`.  
So you can run all the other versions like 96 and 84 with the right port.  


## GitHub Actions

The GitHub Action Workflow will run on every Pull Request push, testing the V4 Versions and is written down in [`opa5-test.yml`](https://github.com/marianfoo/ui5-cc-spreadsheetimporter/blob/main/.github/workflows/opa5-test.yml).

More info at [GitHub Actions](./../Development/GitHubActions.md)
