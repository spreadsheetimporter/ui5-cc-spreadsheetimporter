# Getting Started
## Installing the UI5 Custom Controll
### Requirements
- [Node.js](https://nodejs.org/) Version 14 or later

### General Setup

1\. Install from npm

```sh
npm install ui5-cc-excelupload
```

2\.  Add to your `package.json`:  
:information_source: This step is not necessary from UI5 Tooling V3

````json
"ui5": {
  "dependencies": [
    // ...
    "ui5-cc-excelupload"
    // ...
  ]
}
````

3\. Add `resourceRoots` to you `manifest.json`
   
⚠️ You must always keep your ui5-cc-excelUpload version up to date here when updating the module.

````json
"resourceRoots": {
    "cc.excelUpload": "./thirdparty/customControl/excelUpload/v0/3/5"
},
````

4\. Add `--all` to your build script in the package.json
````json
"scripts": {
// ...
"build": "ui5 build --config=ui5.yaml --all --clean-dest --dest dist",
// ...
},
````


!!! warning 
        There are different implementations for Fiori Elements depending on the OData Version

## Starting with Fiori Elements

To start the Excel Upload Dialog, you need in your Fiori Elements App a Button.  
The best way is start with the [Guided Development](https://blogs.sap.com/2021/08/16/getting-up-to-speed-with-sap-fiori-tools-guided-development-overview/) Extension to add a custom action:  

![Guided Development](./../images/guided_development.png){ loading=lazy }

If you have done that, you can continue with the implementation of your Custom Code either with [V2](#custom-code_1) or [V4](#custom-code).

## Starting with Fiori Elements (OData V4)

### Extension in manifest.json

As a example, here is how you custom action can look like.  
This example is from the [sample app](https://github.com/marianfoo/ui5-cc-excelUpload-sampleapp/blob/744f008b1b052a3df5594215d8d11811a8e646b7/packages/orders/webapp/manifest.json#L145-L157) for the object page.

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
        this.excelUpload = await sap.ui.getCore().createComponent({
            name: "cc.excelUpload",
            async: false,
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

As a example, here is how you custom action can look like.  
This example is from the [sample app](https://github.com/marianfoo/ui5-cc-excelUpload-sampleapp/blob/744f008b1b052a3df5594215d8d11811a8e646b7/packages/ordersv2/webapp/manifest.json#L110-L134) for the object page.

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
        this.excelUpload = await sap.ui.getCore().createComponent({
            name: "cc.excelUpload",
            async: false,
            componentData: {
                context: this
            }
        });
    }
    this.excelUpload.openExcelUploadDialog()
    this.getView().setBusy(false)
}
````