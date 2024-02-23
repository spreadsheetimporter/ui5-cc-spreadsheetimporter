## Deployment Strategy

There are two ways to use the Spreadsheet Upload Control. Since a Reuse Component (library) is essentially utilized, this results in two deployment strategies that can be used.

Depending on the deployment environment (ABAP or BTP), you have to consider a few special cases. This is described in the [Deployment of your app](#deployment-of-your-app) page.  
A full deployable BTP example can be found in the [sample project](https://github.com/spreadsheetimporter/sample-full-btp).

### Decentralized deployment

The library is attached directly to each app and deployed with it.

### Central deployment

The Spreadsheet upload is stored directly as a library centrally, e.g. in the on-premise ABAP system or BTP. For more information, please see the [Central Deployment](CentralDeployment.md) page.

## Setup

Here are the manual steps to integrate the ui5-cc-spreadsheetimporter component. For a simplified integration, a [yo generator](Generator.md) is also available.



### Requirements

- Node.js Version v16.18.0, v18.12.0 or higher
- npm Version v8.0.0 or higher
- UI5 CLI v3.0.0 or higher

### Setup Decentralized deployment

1\. Install from npm

```sh
npm install ui5-cc-spreadsheetimporter
```

2\. Add `resourceRoots` to your `manifest.json` under `sap.ui5`
!!! warning ""
    ⚠️ You must always keep your ui5-cc-spreadsheetimporter version up to date here when updating the module. (Explanation here: [Version Namespace](https://blogs.sap.com/2023/03/12/create-a-ui5-custom-library-with-versioning-using-a-multi-version-namespace/) )

```json
"resourceRoots": {
  "cc.spreadsheetimporter.v0_33_0": "./thirdparty/customControl/spreadsheetImporter/v0_33_0"
}
```

3\. Add `--all` to your build script in the package.json

```json
"scripts": {
  ...
  "build": "ui5 build --config=ui5.yaml --all --clean-dest --dest dist",
  ...
}
```

4\. Add `componentUsages` to your `manifest.json` under `sap.ui5`
!!! warning ""
    ⚠️ You must always keep your ui5-cc-spreadsheetimporter version up to date here when updating the module. (Explanation here: [Version Namespace](https://blogs.sap.com/2023/03/12/create-a-ui5-custom-library-with-versioning-using-a-multi-version-namespace/) )

```json
"componentUsages": {
  "spreadsheetImporter": {
    "name": "cc.spreadsheetimporter.v0_33_0"
  }
}
```

5\. **Optional** Avoid error `component does not exist`

If you deploy your app to a SAP System with the Fiori Tools, you may get the error `component does not exist`. Even though an error appears, the app is deployed anyway.

To avoid this error, you can add the following to your `manifest.json` file:

```json
"sap.app": {
  "embeds": ["./thirdparty/customControl/spreadsheetImporter/v0_33_0"]
}
```

### Setup Central deployment

1\. Execute the deployment with the version you would like to use, see [Central Deployment](CentralDeployment.md) for more information.

2\. Add `componentUsages` to your `manifest.json` under `sap.ui5`
!!! warning ""
    ⚠️ You must always keep your ui5-cc-spreadsheetimporter version up to date here when updating the module. (Explanation here: [Version Namespace](https://blogs.sap.com/2023/03/12/create-a-ui5-custom-library-with-versioning-using-a-multi-version-namespace/) )

```json
"componentUsages": {
  "spreadsheetImporter": {
    "name": "cc.spreadsheetimporter.v0_33_0"
  }
}
```

## Starting with the Fiori Elements Application

!!! warning ""
    There are different implementations for Fiori Elements depending on the OData Version

To start the Spreadsheet Upload Dialog, you need a Button in your Fiori Elements App. The best way is to start with the [Guided Development](https://blogs.sap.com/2021/08/16/getting-up-to-speed-with-sap-fiori-tools-guided-development-overview/) Extension to add a custom action:

![Guided Development](./../images/guided_development.png){ loading=lazy }

If you have done that, you can continue with the implementation of your Custom Code either with [V2](#custom-code_1) or [V4](#custom-code). You can also use a controller extension in Fiori Elements. An example can be found with the [Fiori Elements V4 Example App](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/tree/main/examples/packages/ordersv4fe).

## Starting with Fiori Elements (OData V4)

### Extension in manifest.json

As an example, here is how your custom action can look like. This example is from the [sample app](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/blob/main/examples/packages/ordersv4fe/webapp/manifest.json) for the object page and will add the button to the object page's order items table. It is important to always specify the relevant option `tableId` if there are multiple tables on the object page. Using `"enabled": "{ui>/isEditable}"` will automatically disable the button if the object page is not in edit mode.

```json
"OrdersObjectPage": {
  "type": "Component",
  "id": "OrdersObjectPage",
  "name": "sap.fe.templates.ObjectPage",
  "options": {
    "settings": {
      "editableHeaderContent": false,
      "entitySet": "Orders",
      "navigation": {
        "Items": {
          "detail": {
            "route": "Orders_ItemsObjectPage"
          }
        }
      },
      "controlConfiguration": {
        "Items/@com.sap.vocabularies.UI.v1.LineItem": {
          "actions": {
            "ObjectPageExtController": {
              "press": "ui.v4.ordersv4fe.ext.ObjectPageExtController.openSpreadsheetUploadDialogTable",
              "visible": true,
              "requiresSelection": false,
              "enabled": "{ui>/isEditable}",
              "text": "Spreadsheet Upload"
            }
          }
        }
      }
    }
  }
}
```

### Custom Code

This will set the busy indicator and create the component if it is not already created. Then the Dialog will be opened. The attribute `context` is mandatory and must be set so the component can access the context of the app, including binding paths and the model. You can also pass the options (like `context`) to the method `openSpreadsheetUploadDialog` if you would like to pass the options at runtime. A use case would be if you have multiple tables on the object page and you would like to open the dialog for a specific table (see [TableSelector](TableSelector.md)).

```javascript
openSpreadsheetUploadDialog: async function (oEvent) {
  this.getView().setBusyIndicatorDelay(0);
  this.getView().setBusy(true);
  this.spreadsheetUpload = await this.getView()
    .getController()
    .getAppComponent()
    .createComponent({
      usage: "spreadsheetImporter",
      async: true,
      componentData: {
        context: this,
      },
    });
  this.spreadsheetUpload.openSpreadsheetUploadDialog();
  this.getView().setBusy(false);
}
```

### How could this look like

See also this at the live demo <https://livedemo.spreadsheet-importer.com/>.

![Object Page with Buttons](./../images/object_page.png){ loading=lazy }

## Starting with Fiori Elements (OData V2)

### Extension in manifest.json

As an example, here is how your custom action can look like. This example is from the [sample app](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/blob/main/examples/packages/ordersv2fe/webapp/manifest.json) for the object page.

```json
"extends": {
  "extensions": {
    "sap.ui.controllerExtensions": {
      "sap.suite.ui.generic.template.ObjectPage.view.Details": {
        "controllerName": "ui.v2.ordersv2.ext.controller.ObjectPageExt",
        "sap.ui.generic.app": {
          "Orders": {
            "EntitySet": "Orders",
            "Sections": {
              "Items::com.sap.vocabularies.UI.v1.LineItem": {
                "id": "Items::com.sap.vocabularies.UI.v1.LineItem",
                "Actions": {
                  "spreadsheetImporter": {
                    "id": "spreadsheetUploadButton",
                    "text": "Spreadsheet Upload",
                    "applicablePath": "ui>/editable",
                    "press": "openSpreadsheetUploadDialog",
                    "requiresSelection": false
                  }
                }
              }
            }
          },
        }
      }
    }
  }
}
```

### Custom Code

```javascript
openSpreadsheetUploadDialog: async function (oEvent) {
  this.getView().setBusyIndicatorDelay(0);
  this.getView().setBusy(true);
  this.spreadsheetUpload = await this.getView()
    .getController()
    .getOwnerComponent()
    .createComponent({
      usage: "spreadsheetImporter",
      async: true,
      componentData: {
        context: this,
      },
    });
  this.spreadsheetUpload.openSpreadsheetUploadDialog();
  this.getView().setBusy(false);
}
```

## Deployment of your app


### ABAP System Deployment

#### Error: library/component used in application does not exist

When deploying the app to your ABAP system, you may get an error like this: `SAPUI5 library/component cc.spreadsheetimporter.v0_33_0 used in application Z*** does not exist`. The application is deployed, but the service returns an error.

To avoid this error, you can add the following to your `manifest.json` file:

```json
"sap.app": {
  "embeds": ["./thirdparty/customControl/spreadsheetImporter/v0_33_0"]
}
```

#### File unknown when deploying the app

It is possible that the ABAP system does not know how to handle ts files. If you use the `deploy-to-abap` command, you can add the `exclude` option to your `ui5.yaml` file to exclude the files from the deployment:

```yaml
customTasks:
  - name: deploy-to-abap
    afterTask: replaceVersion
    configuration:
      target:
        url: https://XYZ.sap-system.corp:44311
        client: 200
        auth: basic
      credentials:
        username: env:XYZ_USER
        password: env:XYZ_PASSWORD
      app:
        name: /TEST/SAMPLE_APP
        package: /TEST/UPLOAD
        transport: XYZQ300582
      exclude:
      - .*\.ts
      - .*\.ts.map
```

### BTP Environment Deployment

#### Config your `ui5-task-zipper` in your deployment yaml file

A full example can be found in the [sample project](https://github.com/spreadsheetimporter/sample-full-btp/blob/main/app/mitigations/ui5-deploy.yaml).

If you use the `ui5-task-zipper` task, the `ui5-cc-spreadsheetimporter` should be included in the zip file.

```yaml
builder:
  customTasks:
    - name: ui5-task-zipper
      afterTask: generateComponentPreload
      configuration:
        archiveName: uimodule
        includeDependencies:
        - ui5-cc-spreadsheetimporter
```