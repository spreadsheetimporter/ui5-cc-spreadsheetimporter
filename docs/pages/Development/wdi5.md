The UI5 Custom Control Excel Upload is used in many different scenarios.  
To ensure that changes do not affect the function, the basic function and a few other additional functions are tested with [wdi5](https://github.com/ui5-community/wdi5) tests.

The overview of which scenarios are covered by wdi5 tests can be found here: [wdi5 tests](../SupportVersions.md#wdi5-tests)

## Setup

wdi5 is used in the test setup in the [`examples`](https://github.com/marianfoo/ui5-cc-excelUpload/tree/main/examples) folder in the [`test`](https://github.com/marianfoo/ui5-cc-excelUpload/tree/main/examples/test) folder.  
As pnpm is used, with `pnpm i` all the packages, including `wdio-ui5-service` is installed.  

### Configuration

The basic config file is the `wdio-base.conf.js` file.  
To avoid having to create a separate configuration file for each scenario, logic is integrated into the file so that the appropriate variables are automatically drawn, for example the port or the appropriate spec files.  
The data for this is stored at the [`testapps.json`](https://github.com/marianfoo/ui5-cc-excelUpload/blob/main/dev/testapps.json) file.

## Run tests

You can run the tests for OData V2 and V4 UI5 Version 108 in the root folder with:

- `npm run test:v4fe:108`
- `npm run test:v2fe:108`

which will run `pnpm --filter ui5-cc-excelupload-sample test -- -- ordersv4fe 108`.  
So you can run all the other apps like `pnpm --filter ui5-cc-excelupload-sample test -- -- ordersv4fe 84`.  

### Run single spec

You can also run single test specs. You need to go in the `examples` folder for this.  
For example you can run the test spec `OpenExcelDialog` with OData V2 FE UI5 Version 96 with:  

- `npm run test -- ordersv2fe  96 --spec OpenExcelDialog`

### Run headless

The wdi5 tests in GitHub Actions must run headless, which is also possible to call locally with: 

- `pnpm --filter ui5-cc-excelupload-sample test -- -- --headless ordersv4fe 84`


## GitHub Actions

TODO