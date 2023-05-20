## Source

### GitHub Repository Package
https://github.com/marianfoo/ui5-cc-excelUpload/tree/main/packages/ui5-cc-excelUpload-Button

### npmjs.com Package

https://www.npmjs.com/package/ui5-cc-excelupload-button

## Sample App

There is an example app that uses the button.  
You can see the implementation in the XML View [here](https://github.com/marianfoo/ui5-cc-excelUpload/blob/d4f841329cb36d3b35371f0fdc3c06ed78fb2a92/examples/packages/ordersv2freestylenondraft/webapp/view/Detail.view.xml#L12)

## Properties

You can use the same [properties](Configuration.md) and [events](Events.md) as in the Excel Upload Control

# Getting started

1\. Install from npm

```sh
npm install ui5-cc-excelupload-button
```

2\.  Add to your `package.json`:  
:information_source: This step is not necessary from UI5 Tooling V3

````json
"ui5": {
  "dependencies": [
    //...
    "ui5-cc-excelupload-button"
    //...
  ]
}
````

3\. Add `resourceRoots` to you `manifest.json` under `sap.ui5`
   
⚠️ You must always keep your ui5-cc-excelUpload and button version up to date here when updating the module.  
Check on npmjs which ui5-cc-excelUpload version is used by the button version you want to use:   
https://www.npmjs.com/package/ui5-cc-excelupload-button/v/0.4.4?activeTab=code

````json
"resourceRoots": {
   "cc.excelUploadButton.v0_5_2": "./thirdparty/customControl/excelUploadButton/v0_5_2",
    "cc.excelUpload.v0_17_2": "./thirdparty/customControl/excelUpload/v0_17_2"
},
````

4\. Add `componentUsages` to you `manifest.json` under `sap.ui5`
   
⚠️ You must always keep your ui5-cc-excelUpload version up to date here when updating the module.

````json
"componentUsages": {
    "excelUpload": {
        "name": "cc.excelUpload.v0_17_2"
    }
},
````

5\. Add the namespace to your XML View

````xml
<mvc:View
   controllerName="sap.ui.demo.walkthrough.controller.HelloPanel"
   xmlns="sap.m"
   xmlns:mvc="sap.ui.core.mvc"
   xmlns:excel="cc.excelUploadButton.v0_5_2">
...
</mvc:View>
````

6\. Add the button control to your view and define the table id

````xml
<excel:ExcelUpload id="excelUploadButton" text="Excel Upload Button" 
tableId="container-todo---detail--lineItemsList"/>
````
