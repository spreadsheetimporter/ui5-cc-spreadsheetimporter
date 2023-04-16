# Supported Versions

The goal is to support as many versions and environments as possible, especially all versions in long-term maintenance. 

Here is an overview of the apps that were created and passed the smoke test.

Another overview will be shown to you what apps are already tested automatically with wdi5 and are therefore tested on a constant basis.

All the example apps are found in the [`examples`](https://github.com/marianfoo/ui5-cc-excelUpload/tree/main/examples/packages) folder. The test scripts are found in the [`test`](https://github.com/marianfoo/ui5-cc-excelUpload/tree/main/examples/test) folder.  
More info at [wdi5 tests](./Development/wdi5.md)

## Apps

### CAP V2

| [List Report Draft](https://github.com/marianfoo/ui5-cc-excelUpload/blob/main/examples/packages/ordersv2fe/webapp/ext/controller/ListReportExt.controller.js)  | [List Report Non Draft](https://github.com/marianfoo/ui5-cc-excelUpload/blob/main/examples/packages/ordersv2fenondraft/webapp/ext/controller/ListReportExt.controller.js)  | [Object Page Draft](https://github.com/marianfoo/ui5-cc-excelUpload/blob/main/examples/packages/ordersv2fe/webapp/ext/controller/ObjectPageExt.controller.js)  | [Object Page Non Draft](https://github.com/marianfoo/ui5-cc-excelUpload/blob/main/examples/packages/ordersv2fenondraft/webapp/ext/controller/ObjectPageExt.controller.js)  | [Freestyle](https://github.com/marianfoo/ui5-cc-excelUpload/blob/main/examples/packages/ordersv2freestylenondraft/webapp/controller/List.controller.js) |
|---|---|---|---|---|
| :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: |

### CAP V4

| [List Report Draft](https://github.com/marianfoo/ui5-cc-excelUpload/blob/main/examples/packages/ordersv4fe/webapp/ext/ListReportExtController.js)  | [Object Page Draft](https://github.com/marianfoo/ui5-cc-excelUpload/blob/main/examples/packages/ordersv4fe/webapp/ext/ObjectPageExtController.js)  |  Freestyle | [Flexible Programming Model](https://github.com/marianfoo/ui5-cc-excelUpload/blob/main/examples/packages/ordersv4fpm/webapp/ext/main/Main.controller.js) |
|---|---|---|---|
| :white_check_mark:   | :white_check_mark: |  |  :white_check_mark:  |

## wdi5 Tests

### CAP V2

| UI5 Version  | List Report Draft  | List Report Non Draft  | Object Page Draft  | Object Page Non Draft  | Freestyle | OpenUI5 Freestyle |
|---|---|---|---|---|---|---|
| 1.108  | :white_check_mark:   |  :white_check_mark: | :white_check_mark: | :white_check_mark:  | :white_check_mark:  | :white_check_mark: |
| 1.96  | :white_check_mark:  |  :white_check_mark: |  :white_check_mark: | :white_check_mark:  |  :white_check_mark: | :white_check_mark: |
|  1.84 |  :white_check_mark: | :white_check_mark:  |  :white_check_mark: | :white_check_mark:  | :white_check_mark:  | :white_check_mark: |
|  1.71 | :white_check_mark:  |  :white_check_mark: |  :white_check_mark: | :white_check_mark: |  :white_check_mark: | :white_check_mark: |

!!! warning 
        **OpenUI5**: Draft Activation for V2 in OpenUI5 is not supported.

### CAP V4

| UI5 Version  | List Report Draft  | Object Page Draft  |  Freestyle | Flexible Programming Model |
|---|---|---|---|---|
| 1.108  |  :white_check_mark:  | :white_check_mark: |  |  |
| 1.96  | :white_check_mark:  | :white_check_mark:  |   |   |
|  1.84 |  :white_check_mark: | :white_check_mark:  |   |   |