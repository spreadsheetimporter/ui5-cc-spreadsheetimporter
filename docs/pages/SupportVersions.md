# Supported Versions

The goal is to test as many versions and environments as possible, especially all versions in long-term maintenance. 
Even though the tests are currently only in CAP, every OData Service, including the `metadata.xml`, is supported. That includes OData Services created with CAP, RAP, and SEGW. That means as long as you are using UI5 version `1.71`, you can also use this in ECC or S/4HANA.

Here is an overview of the apps that were created and passed the smoke test:

Another overview will show you which apps are already tested automatically with wdi5 and are therefore tested on a constant basis.

All the example apps can be found in the [`examples`](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/tree/main/examples/packages) folder. The test scripts can be found in the [`test`](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/tree/main/examples/test) folder.  
More info at [wdi5 tests](./Development/wdi5.md)

!!! success "Support" 
    **To summarize: All stable UI5 versions are currently supported (from 1.71). Also, 2.0 is already supported but is still experimental, as version 2.0 may still change. Also every OData Service, including SEGW, RAP, and CAP, is supported.**

## Apps used for the tests

Here is an overview of the apps that were created and used for the tests.

### CAP V2

| [List Report Draft](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/blob/main/examples/packages/ordersv2fe/webapp/ext/controller/ListReportExt.controller.js)  | [List Report Non Draft](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/blob/main/examples/packages/ordersv2fenondraft/webapp/ext/controller/ListReportExt.controller.js)  | [Object Page Draft](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/blob/main/examples/packages/ordersv2fe/webapp/ext/controller/ObjectPageExt.controller.js)  | [Object Page Non Draft](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/blob/main/examples/packages/ordersv2fenondraft/webapp/ext/controller/ObjectPageExt.controller.js)  | [Freestyle](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/blob/main/examples/packages/ordersv2freestylenondraft/webapp/controller/List.controller.js) |
|---|---|---|---|---|
| :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: |

### CAP V4

| [List Report Draft](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/blob/main/examples/packages/ordersv4fe/webapp/ext/ListReportExtController.js)  | [Object Page Draft](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/blob/main/examples/packages/ordersv4fe/webapp/ext/ObjectPageExtController.js)  |  Freestyle | [Flexible Programming Model](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/blob/main/examples/packages/ordersv4fpm/webapp/ext/main/Main.controller.js) | [Typescript](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/blob/main/examples/packages/ordersv4fets/webapp/ext/ListReportExtController.ts) | CDS Plugin |
|---|---|---|---|---|---|
| :white_check_mark:   | :white_check_mark: |  |  :white_check_mark:  | |  :white_check_mark:  | |  :white_check_mark:  |

## wdi5 Tests

### CAP V2

| UI5 Version  | List Report Draft  | List Report Non Draft  | Object Page Draft  | Object Page Non Draft  | Freestyle | OpenUI5 Freestyle |
|---|---|---|---|---|---|---|
| 2.0  |    |   | |   |   |  |
| 1.136  | :white_check_mark:   |  :white_check_mark: | :white_check_mark: | :white_check_mark:  | :white_check_mark:  | :white_check_mark: |
| 1.120  | :white_check_mark:   |  :white_check_mark: | :white_check_mark: | :white_check_mark:  | :white_check_mark:  | :white_check_mark: |
| 1.108  | :white_check_mark:   |  :white_check_mark: | :white_check_mark: | :white_check_mark:  | :white_check_mark:  | :white_check_mark: |
| 1.96  | :white_check_mark:  |  :white_check_mark: |  :white_check_mark: | :white_check_mark:  |  :white_check_mark: | :white_check_mark: |
|  1.84 |  :white_check_mark: | :white_check_mark:  |  :white_check_mark: | :white_check_mark:  | :white_check_mark:  | :white_check_mark: |
|  1.71 | :white_check_mark:  |  :white_check_mark: |  :white_check_mark: | :white_check_mark: |  :white_check_mark: | :white_check_mark: |

!!! warning 
     **OpenUI5**: Draft Activation for V2 in OpenUI5 is not supported.

### CAP V4

| UI5 Version  | List Report Draft  | Object Page Draft  |  Freestyle | Flexible Programming Model | Typescript | CDS Plugin|
|---|---|---|---|---|---|---|
| 2.0 |    | |  |  |  |  |
| 1.136  |  :white_check_mark:  | :white_check_mark: |  :white_check_mark: | :white_check_mark: |:white_check_mark:  |:white_check_mark:  |
| 1.120  |  :white_check_mark:  | :white_check_mark: |  |  |:white_check_mark:  |:white_check_mark:  |
| 1.108  |  :white_check_mark:  | :white_check_mark: |  |  |:white_check_mark:  |:white_check_mark:  |
| 1.96  | :white_check_mark:  | :white_check_mark:  |   |   |   |   |
|  1.84 |  :white_check_mark: | :white_check_mark:  |   |   |   |   |
