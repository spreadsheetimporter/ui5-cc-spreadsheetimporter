# UI5 custom control `ui5-cc-excelupload`

> :warning: **This control is still in beta**: It fundamently works, but the APIs are still changing and lot of bugs still be there!

A UI5 Module to integrate a Excel Upload for Fiori Element Apps.  
The module focuses on making integration into existing Fiori element apps as easy as possible, with as little code and configuration as possible.
![Excel Upload Dialog](/images/ExcelUploadDialog.png "Excel Upload Dialog")

## Install

```bash
npm install ui5-cc-excelupload
```

## Usage

> :warning: **This example is for OData V4**

1. define the dependeny in `$yourapp/package.json`

```json
// it is already in "dependencies" after installation
"ui5": {
  "dependencies": [
    // ...
    "ui5-cc-excelupload"
    // ...
  ]
}
```

2. create a custom controller (exampel for object page)  
create a folder `ext` and in it a folder `controller`  
create js file `ObjectPageExtController.js`, so `webapp/ext/controller/ObjectPageExtController.js`

```js
sap.ui.define([],
    function () {
        "use strict";
        return {
            /**
             * Create Dialog to Upload Excel and open it
             * @param {*} oEvent 
             */
            openExcelUploadDialog: async function (oEvent) {    

            }
        };
    });
```

3. create a button to call custom controller (example for object page)  
**adjust your namespace in `press` property**

```json
"PersonObjectPage": {
  "type": "Component",
  "id": "PersonObjectPage",
  "name": "sap.fe.templates.ObjectPage",
  "options": {
    "settings": {
      "entitySet": "Person",
      "content": {
        "header": {
          "actions": {
            "excelUpload": {
              "id": "excelUploadButton",
              "text": "Excel Upload",
              "enabled": "{ui>/isEditable}",
              "press": "my.namespace.ext.controller.ObjectPageExtController.openExcelUploadDialog",
              "requiresSelection": false
            }
          }
        }
      }
    }
  }
}
```

4. in `manifest.json` add under `sap.ui5` this:

```json
"resourceRoots": {
            "thirdparty.customControl.excelUpload": "./thirdparty/customControl/excelUpload/",
            "xlsx": "./thirdparty/customControl/excelUpload/resources/xlsx",
            "cc.excelUpload": "./thirdparty/customControl/excelUpload/"
        },
```

5. Call the custom control with your own properties. replace the `openExcelUploadDialog` in the `ObjectPageExtController.js` function with the following code

```js
openExcelUploadDialog: async function (oEvent) {

    this._view.setBusyIndicatorDelay(0)
    this._view.setBusy(true)
    if (!this.excelUpload) {
        this.excelUpload = await sap.ui.getCore().createComponent({
            name: "thirdparty.customControl.excelUpload",
            async: false,
            componentData: {
                context: this,
                columns: ["product_ID", "quantity", "title", "price"],
                mandatoryFields: ["product_ID", "quantity"],
                excelFileName: "Test.xlsx"
            }
        });

        // event to check before uploaded to app
        this.excelUpload.attachCheckBeforeRead(function(oEvent) {
            // example
            const sheetData = oEvent.getParameter("sheetData");
            let errorArray = [
                {
                  title: "Price to high (max 100)",
                  counter: 0,
                },
              ];
              for (const row of sheetData) {
                //check for invalid date
                if (row.UnitPrice) {
                  if(row.UnitPrice > 100){
                            errorArray[0].counter = errorArray[0].counter + 1
                        }
                }
              }
            oEvent.getSource().addToErrorsResults(errorArray)
        }, this)

        // event to change data before send to backend
        this.excelUpload.attachChangeBeforeCreate(function(oEvent) {
            oEvent.getSource().setPayload({
                "product_ID": "123",
                "quantity": 1,
                "title": "Test",
                "price": 25
            })
        }, this)
    }
    this.excelUpload.openExcelUploadDialog()
    this._view.setBusy(false)
}
```

## How it works

### Extensions

There are a few extension point available where you can add additional checks.

### Options

When you call the controller of the custom control, you handover a few options. The `context` property is mandatory, others are optional and may be necessary.

#### `columns`

**default:** all fields  
This option defines which fields should only be taken into account during the upload.
**example:** `columns: ["ID", "Birthday","FirstName","LastName"],`

#### `excelFileName`

**default:** Template.xlsx
This option defines the file name when a template is downloaded.  
If not defined, code checks if Label for OData Type defined.

#### `tableId`

Currently it is checked if exactly one table exists in an Object page.
If there is none or more then one, a error is returned.  
In case of error, the ID of the table can be specified.  
**example:** `tableId: "ui5.isu.msb.createmeterread::RunObjectPage--fe::table::_Ableseauftrag::LineItem-innerTable`

#### `odataType`

An attempt is currently being made to read the OData type from the table found.
In case of error, the OData Type can be specified.  
**example:** `odataType: com.sap.gateway.srvd.zui_mr_create_run.v0001.AbleseauftragType`

#### `mandatoryFields`

The selected fields are checked to see if they are present in Excel.
If not defined, they will not be checked.  
**example:** `mandatoryFields: ["product_ID", "quantity"]`

#### `fieldMatchType`

Options:
- `label`
- `labelTypeBrackets`

**default:** `label`

It is possible that the labels of different attributes have the same label.  
In order to assign the correct labels and types, there is an option to make the type visible in the header.  
This way a correct assignment can be made.

Default (with `label`) the header would like this: `ID, Birthday, First Name, Last Name`  
With `labelTypeBrackets` the header would look like this: `ID[ID], Birthday[birth_day], First Name[FirstName], Last Name[LastName]`
## Build time (in apps)

Use `ui5 build --all` to produce a deployable version of your app including `ui5-cc-excelupload` and its’ control(s).  
**example:** `"build": "ui5 build --config=ui5.yaml --all --clean-dest --dest dist",`

Other than that, nothing specific to note for using `ui5-cc-excelupload` in builds in UI5 apps.

## Development

### Commit Message

To create a automatic changelog, we use the [angular commit message guidelines](https://github.com/angular/angular/blob/22b96b9/CONTRIBUTING.md#commit).

The commit starts with the `type` and a optional `scope` like `feat(api)`. Possible types are listed [here](https://github.com/angular/angular/blob/22b96b9/CONTRIBUTING.md#type). Scopes can be freely namend or omitted.

A few examples:

- `feat(api): add new create api for customer`
- `fix(api): edge case when customer is from EU`
- `chore(workflow): changed commiting username`
- `docs: typo in readme`

### Release

**State**: everything is commited

1. [Update Version](https://docs.npmjs.com/cli/v9/commands/npm-version?v=true), create commit and add tag: `npm version  [<newversion> | major | minor | patch | premajor | preminor | prepatch | prerelease | from-git]`  
   1. For example from `0.1.1` to `0.1.2` with `npm version patch`
   2. For example from `0.1.1` to `0.2.0` with `npm version minor`
   3. For example from `0.1.1` to `0.3.4` with `npm version 0.3.3`  
3. push commit and tags to repo: `npm run version:publish`
4. GitHub Workflow will be triggered and npm package published

### Develop

You can start with this dev enviroment: https://github.com/marianfoo/ui5-cc-excelUpload-dev-env

To develop, `npm link` this folder, and `npm link` in your test app.  
Then run `npm run build`.  
For developing, you need to run `npm run build:watch` to have always the latest changes in the `dist` folder.  
Otherwise, you would always have to change the resourceRoots in manifest.json in the consuming app.
