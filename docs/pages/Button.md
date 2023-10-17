
!!! warning
      The seperate button control was deprecated and integrated in the `ui5-spreadsheet-importer` component from version `0.26.0`.


## Button in Component

The usage of the [UIComponent](https://sapui5.hana.ondemand.com/sdk/#/api/sap.ui.core.UIComponent) enables the possibility to return a button with the usage of a [ComponentContainer](https://sapui5.hana.ondemand.com/sdk/#/api/sap.ui.core.ComponentContainer).  
This has the big advantage that no separate dependency has to be installed and a button for spreadsheet upload can be integrated very easily.

### Requirements

- Node.js Version v16.18.0, v18.12.0 or higher  
- npm Version v8.0.0 or higher
- UI5 CLI v3.0.0 or higher

### Getting started

1\. Install from npm

```sh
npm install ui5-cc-spreadsheetimporter-button
```

2\. Add `resourceRoots` to you `manifest.json` under `sap.ui5`
   
⚠️ You must always keep your ui5-cc-spreadsheetimporter and button version up to date here when updating the module.

````json
"resourceRoots": {
    "cc.spreadsheetimporter.v0_28_0": "./thirdparty/customControl/spreadsheetImporter/v0_28_0"
},
````

3\. Add `components` to you `manifest.json` under `sap.ui5.dependencies`
   
⚠️ You must always keep your ui5-cc-spreadsheetimporter version up to date here when updating the module.

````json
"dependencies": {
  "minUI5Version": "1.108.19",
  "libs": {
    "sap.m": {},
    "sap.ui.core": {},
    "sap.f": {},
    "sap.ui.table": {}
  },
  "components": {
    "cc.spreadsheetimporter.v0_28_0": {}
  }
},
````

4\. Add `componentUsages` to you `manifest.json` under `sap.ui5`
   
⚠️ You must always keep your ui5-cc-spreadsheetimporter version up to date here when updating the module.

````json
"componentUsages": {
    "spreadsheetImporter": {
        "name": "cc.spreadsheetimporter.v0_28_0"
    }
},
````

5\. Add the namespace `core` to your XML View

````xml
<mvc:View controllerName="ui.v2.ordersv2freestylenondraft.controller.UploadToTable"
  xmlns="sap.m"
  xmlns:semantic="sap.f.semantic"
  xmlns:mvc="sap.ui.core.mvc"
  xmlns:core="sap.ui.core">
...
</mvc:View>
````

6\. Add the `core:ComponentContainer` control to your view.

````xml
<core:ComponentContainer width="100%" 
usage="spreadsheetImporter" propagateModel="true" 
async="true"/>
````

### Define Configuration Options

You can set configuration options for the spreadsheet importer in the `settings` property of the `core:ComponentContainer` control.  
For special configuration options for the ComponantContainer see [Configuration](Configuration.md#componentcontainerdata).

````xml
<core:ComponentContainer width="100%" 
usage="spreadsheetImporter" propagateModel="true" async="true" 
settings="{
  standalone:true,
  columns: ['product_ID', 'username'],
  componentContainerData:{
    uploadButtonPress:'uploadButtonPress',
    buttonText:'Excel Upload'
    }
  }" />
````

### Example App

#### Freestyle OData V2

XML View: [Detail.view.xml](https://github.com/marianfoo/ui5-cc-spreadsheetimporter/blob/main/examples/packages/ordersv2freestylenondraft/webapp/view/Detail.view.xml)  
Controller: [Detail.controller.js](https://github.com/marianfoo/ui5-cc-spreadsheetimporter/blob/main/examples/packages/ordersv2freestylenondraft/webapp/controller/Detail.controller.js)

#### Freestyle OData V2 Standalone

XML View: [UploadToTable.view.xml](https://github.com/marianfoo/ui5-cc-spreadsheetimporter/blob/main/examples/packages/ordersv2freestylenondraft/webapp/view/UploadToTable.view.xml)  
Controller: [UploadToTable.controller.js](https://github.com/marianfoo/ui5-cc-spreadsheetimporter/blob/main/examples/packages/ordersv2freestylenondraft/webapp/controller/UploadToTable.controller.js)

## Deprecated Button Control

!!! warning
      This information is only relevant if you use the seperate button control version `0.11.4` and the spreadsheet importer component `0.25.4`.

### GitHub Repository Package
https://github.com/marianfoo/ui5-cc-spreadsheetimporter/tree/main/packages/ui5-cc-spreadsheetimporter-button

### npmjs.com Package

https://www.npmjs.com/package/ui5-cc-spreadsheetimporter-button

## Sample App

There is an example app that uses the button.  
You can see the implementation in the XML View [here](https://github.com/marianfoo/ui5-cc-spreadsheetimporter/blob/d4f841329cb36d3b35371f0fdc3c06ed78fb2a92/examples/packages/ordersv2freestylenondraft/webapp/view/Detail.view.xml#L12)

## Properties

You can use the same [properties](Configuration.md) and [events](Events.md) as in the Spreadsheet Upload Control

# Getting started

1\. Install from npm

```sh
npm install ui5-cc-spreadsheetimporter-button
```

2\. Add `resourceRoots` to you `manifest.json` under `sap.ui5`
   
⚠️ You must always keep your ui5-cc-spreadsheetimporter and button version up to date here when updating the module.  
Check on npmjs which ui5-cc-spreadsheetimporter version is used by the button version you want to use:   
https://www.npmjs.com/package/ui5-cc-spreadsheetimporter-button?activeTab=code

````json
"resourceRoots": {
   "cc.spreadsheetimporter.button.undefined": "./thirdparty/customControl/spreadsheetImporterButton/v0_8_0",
    "cc.spreadsheetimporter.v0_28_0": "./thirdparty/customControl/spreadsheetImporter/v0_28_0"
},
````

3\. Add `componentUsages` to you `manifest.json` under `sap.ui5`
   
⚠️ You must always keep your ui5-cc-spreadsheetimporter version up to date here when updating the module.

````json
"componentUsages": {
    "spreadsheetImporter": {
        "name": "cc.spreadsheetimporter.v0_28_0"
    }
},
````

4\. Add the namespace to your XML View

````xml
<mvc:View
   controllerName="sap.ui.demo.walkthrough.controller.HelloPanel"
   xmlns="sap.m"
   xmlns:mvc="sap.ui.core.mvc"
   xmlns:spreadsheet="cc.spreadsheetimporter.button.undefined">
...
</mvc:View>
````

5\. Add the button control to your view and define the table id

````xml
<spreadsheet:SpreadsheetUpload id="spreadsheetUploadButton" text="Spreadsheet Upload Button" 
tableId="container-todo---detail--lineItemsList"/>
````
