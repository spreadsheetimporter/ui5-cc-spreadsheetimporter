## Source

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

2\.  Add to your `package.json`:  
:information_source: This step is not necessary from UI5 Tooling V3

````json
"ui5": {
  "dependencies": [
    //...
    "ui5-cc-spreadsheetimporter-button"
    //...
  ]
}
````

3\. Add `resourceRoots` to you `manifest.json` under `sap.ui5`
   
⚠️ You must always keep your ui5-cc-spreadsheetimporter and button version up to date here when updating the module.  
Check on npmjs which ui5-cc-spreadsheetimporter version is used by the button version you want to use:   
https://www.npmjs.com/package/ui5-cc-spreadsheetimporter-button/v/0.4.4?activeTab=code

````json
"resourceRoots": {
   "cc.spreadsheetimporter.button.v0_8_0": "./thirdparty/customControl/spreadsheetImporterButton/v0_8_0",
    "cc.spreadsheetimporter.v0_20_0": "./thirdparty/customControl/spreadsheetImporter/v0_20_0"
},
````

4\. Add `componentUsages` to you `manifest.json` under `sap.ui5`
   
⚠️ You must always keep your ui5-cc-spreadsheetimporter version up to date here when updating the module.

````json
"componentUsages": {
    "spreadsheetImporter": {
        "name": "cc.spreadsheetimporter.v0_20_0"
    }
},
````

5\. Add the namespace to your XML View

````xml
<mvc:View
   controllerName="sap.ui.demo.walkthrough.controller.HelloPanel"
   xmlns="sap.m"
   xmlns:mvc="sap.ui.core.mvc"
   xmlns:spreadsheet="cc.spreadsheetimporter.button.v0_8_0">
...
</mvc:View>
````

6\. Add the button control to your view and define the table id

````xml
<spreadsheet:SpreadsheetUpload id="spreadsheetUploadButton" text="Spreadsheet Upload Button" 
tableId="container-todo---detail--lineItemsList"/>
````
