## Deployment Strategy

There are two ways to use the Excel Upload Control.
Since a Reuse Component (library) is basically utilised, this results in two deployment strategies that can be used.  
### Decentralized deployment
The library is attached directly to each app and deployed with it.  
### Central deployment
The Excel upload is stored directly as a library centrally, e.g. in the on-premise ABAP system.  
For more information, please see the Page [Central Deployment](CentralDeployment.md).

## Setup

Here are the manual steps how to integrate the ui5-cc-excelUpload component. For a simplified integration, a [yo generator](Generator.md) is also available.
### Setup Decentralized deployment

1\. Install from npm

```sh
npm install ui5-cc-excelupload
```

2\.  Add to your `package.json`:  
:information_source: This step is not necessary from UI5 Tooling V3

````json
"ui5": {
  "dependencies": [
    //...
    "ui5-cc-excelupload"
    //...
  ]
}
````

3\. Add `resourceRoots` to you `manifest.json` under `sap.ui5`
   
⚠️ You must always keep your ui5-cc-excelUpload version up to date here when updating the module.

````json
"resourceRoots": {
    "cc.excelUpload.v0_14_1": "./thirdparty/customControl/excelUpload/v0_14_1"
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
   
⚠️ You must always keep your ui5-cc-excelUpload version up to date here when updating the module.

````json
"componentUsages": {
    "excelUpload": {
        "name": "cc.excelUpload.v0_14_1"
    }
},
````

### Setup Central deployment

1\. Execute the deployment with the version you like to use, see here [Central Deployment](CentralDeployment.md).

2\. Add `componentUsages` to you `manifest.json` under `sap.ui5`
   
⚠️ You must always keep your ui5-cc-excelUpload version up to date here when updating the module.

````json
"componentUsages": {
    "excelUpload": {
        "name": "cc.excelUpload.v0_14_1"
    }
},
````




!!! warning 
        There are different implementations for Fiori Elements depending on the OData Version

## Starting with the Fiori Elements application

To start the Excel Upload Dialog, you need in your Fiori Elements App a Button.  
The best way is start with the [Guided Development](https://blogs.sap.com/2021/08/16/getting-up-to-speed-with-sap-fiori-tools-guided-development-overview/) Extension to add a custom action:  

![Guided Development](./../images/guided_development.png){ loading=lazy }

If you have done that, you can continue with the implementation of your Custom Code either with [V2](#custom-code_1) or [V4](#custom-code).

## Starting with Fiori Elements (OData V4)

### Extension in manifest.json

As a example, here is how your custom action can look like.  
This example is from the [sample app](https://github.com/marianfoo/ui5-cc-excelUpload/blob/47d22cdc42aa1cacfd797bdc0e025b830330dc5e/examples/packages/ordersv4fe/webapp/manifest.json#L158-L188) for the object page.

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
                        "excelUpload": {
                            "id": "excelUploadButton",
                            "text": "Excel Upload",
                            "enabled": "{ui>/isEditable}",
                            "press": "ui.v4.orders.ext.ObjectPageExtController.openExcelUploadDialog",
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

````javascript
openExcelUploadDialog: async function (oEvent) {
    this._view.setBusyIndicatorDelay(0)
    this._view.setBusy(true)
    if (!this.excelUpload) {
        this.excelUpload = await this._controller.getAppComponent().createComponent({
            usage: "excelUpload",
            async: true,
            componentData: {
                context: this
            }
        });
    }
    this.excelUpload.openExcelUploadDialog()
    this._view.setBusy(false)
}
````


## Starting with Fiori Elements (OData V2)

### Extension in manifest.json

As a example, here is how your custom action can look like.  
This example is from the [sample app](https://github.com/marianfoo/ui5-cc-excelUpload/blob/47d22cdc42aa1cacfd797bdc0e025b830330dc5e/examples/packages/ordersv2fe/webapp/manifest.json#L115-L135) for the object page.

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
                                "excelUpload": {
                                    "id": "excelUploadButton",
                                    "text": "Excel Upload",
                                    "applicablePath": "ui>/editable",
                                    "press": "openExcelUploadDialog",
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
openExcelUploadDialog: async function (oEvent) {
    this.getView().setBusyIndicatorDelay(0)
    this.getView().setBusy(true)
    if (!this.excelUpload) {
        this.excelUpload = await this.getView().getController().getOwnerComponent().createComponent({
            usage: "excelUpload",
            async: true,
            componentData: {
                context: this
            }
        });
    }
    this.excelUpload.openExcelUploadDialog()
    this.getView().setBusy(false)
}
````