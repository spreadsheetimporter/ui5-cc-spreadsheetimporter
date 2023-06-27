## Deployment Strategy

There are two ways to use the Spreadsheet Upload Control.
Since a Reuse Component (library) is basically utilised, this results in two deployment strategies that can be used.  
### Decentralized deployment
The library is attached directly to each app and deployed with it.  
### Central deployment
The Spreadsheet upload is stored directly as a library centrally, e.g. in the on-premise ABAP system.  
For more information, please see the Page [Central Deployment](CentralDeployment.md).

## Setup

Here are the manual steps how to integrate the ui5-cc-spreadsheetimporter component. For a simplified integration, a [yo generator](Generator.md) is also available.
### Setup Decentralized deployment

1\. Install from npm

```sh
npm install ui5-cc-spreadsheetimporter
```

2\.  Add to your `package.json`:  
:information_source: This step is not necessary from UI5 Tooling V3

````json
"ui5": {
  "dependencies": [
    //...
    "ui5-cc-spreadsheetimporter"
    //...
  ]
}
````

3\. Add `resourceRoots` to you `manifest.json` under `sap.ui5`
   
⚠️ You must always keep your ui5-cc-spreadsheetimporter version up to date here when updating the module.

````json
"resourceRoots": {
    "cc.spreadsheetimporter.v0_20_0": "./thirdparty/customControl/spreadsheetImporter/v0_20_0"
},
````

4\. Add `--all` to your build script in the package.json  
:information_source: This step is not necessary from UI5 Tooling V3

````json
"scripts": {
// ...
"build": "ui5 build --config=ui5.yaml --all --clean-dest --dest dist",
// ...
},
````

5\. Add `componentUsages` to you `manifest.json` under `sap.ui5`
   
⚠️ You must always keep your ui5-cc-spreadsheetimporter version up to date here when updating the module.

````json
"componentUsages": {
    "spreadsheetImporter": {
        "name": "cc.spreadsheetimporter.v0_20_0"
    }
},
````

### Setup Central deployment

1\. Execute the deployment with the version you like to use, see here [Central Deployment](CentralDeployment.md).

2\. Add `componentUsages` to you `manifest.json` under `sap.ui5`
   
⚠️ You must always keep your ui5-cc-spreadsheetimporter version up to date here when updating the module.

````json
"componentUsages": {
    "spreadsheetImporter": {
        "name": "cc.spreadsheetimporter.v0_20_0"
    }
},
````




!!! warning 
        There are different implementations for Fiori Elements depending on the OData Version

## Starting with the Fiori Elements Application

To start the Spreadsheet Upload Dialog, you need in your Fiori Elements App a Button.  
The best way is start with the [Guided Development](https://blogs.sap.com/2021/08/16/getting-up-to-speed-with-sap-fiori-tools-guided-development-overview/) Extension to add a custom action:  

![Guided Development](./../images/guided_development.png){ loading=lazy }

If you have done that, you can continue with the implementation of your Custom Code either with [V2](#custom-code_1) or [V4](#custom-code).

## Starting with Fiori Elements (OData V4)

### Extension in manifest.json

As a example, here is how your custom action can look like.  
This example is from the [sample app](https://github.com/marianfoo/ui5-cc-spreadsheetimporter/blob/main/examples/packages/ordersv4fe/webapp/manifest.json) for the object page and will add the button to the object page header.  
You can also add the button on the object page table directly. A example is also in this manifest.
It is important to always specify the relevant option [`tableId`](Configuration.md#tableid  ) if there are multiple tables on the object page.  
Using `"enabled": "{ui>/isEditable}"` will automatically disable the button if the object page is not in edit mode.

````json
"OrdersObjectPage": {
    "type": "Component",
    "id": "OrdersObjectPage",
    "name": "sap.fe.templates.ObjectPage",
    "options": {
        "settings": {
            "editableHeaderContent": false,
            "entitySet": "Orders",
            "content": {
                "header": {
                    "actions": {
                        "spreadsheetImporter": {
                            "id": "spreadsheetUploadButton",
                            "text": "Spreadsheet Upload",
                            "enabled": "{ui>/isEditable}",
                            "press": "ui.v4.orders.ext.ObjectPageExtController.openSpreadsheetUploadDialog",
                            "requiresSelection": false
                        }
                    }
                }
            }
        }
    }
},
````

### Custom Code

This will set the busy indicator and create the component if it is not already created.  
Then the Dialog will be opened.  
The attribute `context` is mandatory and must be set so the component can access the context of the app, including binding paths and the model.  

````javascript
openSpreadsheetUploadDialog: async function (oEvent) {
    this.getView().setBusyIndicatorDelay(0)
    this.getView().setBusy(true)
    if (!this.spreadsheetUpload) {
        this.spreadsheetUpload = await this.getView().getController().getAppComponent().createComponent({
            usage: "spreadsheetImporter",
            async: true,
            componentData: {
                context: this
            }
        });
    }
    this.spreadsheetUpload.openSpreadsheetUploadDialog()
    this.getView().setBusy(false)
}
````

### How could this look like

see also this at the live demo https://excelupload.marianzeis.de/

![Object Page with Buttons](./../images/object_page.png){ loading=lazy }


## Starting with Fiori Elements (OData V2)

### Extension in manifest.json

As a example, here is how your custom action can look like.  
This example is from the [sample app](https://github.com/marianfoo/ui5-cc-spreadsheetimporter/blob/47d22cdc42aa1cacfd797bdc0e025b830330dc5e/examples/packages/ordersv2fe/webapp/manifest.json#L115-L135) for the object page.

````json
"extends": {
    "extensions": {
        "sap.ui.controllerExtensions": {
            "sap.suite.ui.generic.template.ObjectPage.view.Details": {
                "controllerName": "ui.v2.ordersv2.ext.controller.ObjectPageExt",
                "sap.ui.generic.app": {
                    "Orders": {
                        "EntitySet": "Orders",
                        "Header": {
                            "Actions": {
                                "spreadsheetImporter": {
                                    "id": "spreadsheetUploadButton",
                                    "text": "Excel Upload",
                                    "applicablePath": "ui>/editable",
                                    "press": "openSpreadsheetUploadDialog",
                                    "requiresSelection": false
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
````

### Custom Code

````javascript
openSpreadsheetUploadDialog: async function (oEvent) {
    this.getView().setBusyIndicatorDelay(0)
    this.getView().setBusy(true)
    if (!this.spreadsheetUpload) {
        this.spreadsheetUpload = await this.getView().getController().getOwnerComponent().createComponent({
            usage: "spreadsheetImporter",
            async: true,
            componentData: {
                context: this
            }
        });
    }
    this.spreadsheetUpload.openSpreadsheetUploadDialog()
    this.getView().setBusy(false)
}
````