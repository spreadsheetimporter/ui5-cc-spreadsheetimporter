## Deployment Strategy

In the past, we had recommended two ways to deploy the component.
It turned out that there are problems with the so-called decentralized or packaged deployment into the ABAP system and BTP.

Therefore, the **centralized deployment** is clearly recommended and the decentralized should only be used if centralized does not work.

There are a few things to bear in mind for decentralized deployment with ABAP, see [ABAP Component Deployment](#component-deployment).

If you deploy to BTP, special things must be considered, see [BTP Deployment](#btp-deployment).
A full deployable BTP example can be found in the [sample project](https://github.com/spreadsheetimporter/sample-full-btp).

### Decentralized deployment

!!! warning ""
    This is not recommended. Please use the [Central Deployment](CentralDeployment.md) instead.

The component is attached directly to each app and deployed with it. There are specific things to note here on the ABAP stack (see [ABAP Component Deployment](#component-deployment)).

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
  "cc.spreadsheetimporter.v1_1_1": "./thirdparty/customcontrol/spreadsheetimporter/v1_1_1"
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
    "name": "cc.spreadsheetimporter.v1_1_1"
  }
}
```

5\. **Optional** Avoid error `component does not exist`

If you deploy your app to a SAP System (S/4 On-Premise or SAP BTP ABAP environment), you may get the error `component does not exist`.

To avoid this error, you can add the following to your `manifest.json` file:

!!! warning ""
    ⚠️ The `resourceRoots` path "./thirdparty/customcontrol/spreadsheetimporter/v1_1_1" changed from version 0.34.0 to lowercase. Please make sure to use the correct path.


```json
"sap.app": {
  "embeds": ["thirdparty/customcontrol/spreadsheetimporter/v1_1_1"]
}
```

### Setup Central deployment

1\. Execute the deployment with the version you would like to use, see [Central Deployment](CentralDeployment.md) for more information.

2\. Add `componentUsages` to your `manifest.json` under `sap.ui5`
!!! warning ""
    ⚠️ You must always keep your ui5-cc-spreadsheetimporter version up to date here when updating the module. (Explanation here: [Version Namespace](https://blogs.sap.com/2023/03/12/create-a-ui5-custom-library-with-versioning-using-a-multi-version-namespace/) )  
    Make sure the version is available in the system.

```json
"componentUsages": {
  "spreadsheetImporter": {
    "name": "cc.spreadsheetimporter.v1_1_1"
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
openSpreadsheetUploadDialog: async function (event) {
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
openSpreadsheetUploadDialog: async function (event) {
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

#### Component Deployment

The following points are not explicitly relevant for the Spreadsheet Importer, but for the Reuse Component in general (see [UI5 Reuse Components](https://sapui5.hana.ondemand.com/sdk/#/topic/6314fcd2510648fbaad3cee8a421030d.html)).

When you deploy the component to your ABAP system with decentralized deployment, the namespace of the component is registered in the app index. The same happens when you deploy the component centrally.  
This means after you deploy the component decentrally the first time (or centrally), you can use the component in your app always the centrally way ([Central Deployment](#setup-central-deployment)).
As the app index is used to find the component, you can only use this approach in the Fiori Launchpad.

That means, you can deploy the component decentrally only once. After that, the namespace of the component is registered in the app index and the namespace can only exist once in the app index.  
That is the reason why it is recommended to use the central deployment from the start.

#### Using the component outside the app index

If you using the component outside the Fiori Launchpad and can not use the app index or for whatever reason the component is not found even though it is deployed, you can direct the app to the correct path with `url` and `name` in the `createComponent` method:
  
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
      url: "/sap/bc/ui5_ui5/sap/Z_XUP_v0_33_2",
      name: "cc.spreadsheetimporter.v1_1_1"
    });
  this.spreadsheetUpload.openSpreadsheetUploadDialog();
  this.getView().setBusy(false);
}
```

This is alternative to using resourceRoots in the manifest.json when you don't have access to the manifest.json (like in adaption projects).

#### Error: library/component used in application does not exist

When deploying the app to your ABAP system, you may get an error like this: `SAPUI5 library/component cc.spreadsheetimporter.v1_1_1 used in application Z*** does not exist`. The application is deployed, but the service returns an error.

To avoid this error, you can add the following to your `manifest.json` file:

!!! warning ""
    ⚠️ The `resourceRoots` path "./thirdparty/customcontrol/spreadsheetimporter/v1_1_1" changed from version 0.34.0 to lowercase. Please make sure to use the correct path.


```json
"sap.app": {
  "embeds": ["thirdparty/customcontrol/spreadsheetimporter/v1_1_1"]
}
```

After that the component should be found in the app index. This means ressourceRoots is not necessary.

#### File unknown when deploying the app

It is possible that the ABAP system does not know how to handle ts files.  
You need to create a new file called `.Ui5RepositoryTextFiles` like described [here](https://ui5.sap.com/#/topic/a883327a82ef4cc792f3c1e7b7a48de8) in the webapp folder of your app.  
A sample file can be found [here](https://github.com/spreadsheetimporter/packed-deployment-abap/blob/main/webapp/.Ui5RepositoryTextFiles) and can look like this:

```txt
^.*.ts$
^.*.ts.map$
^.*.js.map$
```

If you use the `deploy-to-abap` command, you can add the `exclude` option to your `ui5.yaml` file to exclude the files from the deployment:

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
      - .*\.js.map
```

#### Consuming the central deployed component from the ABAP system

After you have deployed the component centrally, you can consume it in your app when you develop it in VS Code or BAS.  

To find out which URL to enter, the App Index can be called up at the following URL:  
```
<SAP SYSTEM URL>/sap/bc/ui2/app_index/ui5_app_info?id=cc.spreadsheetimporter.v1_1_1
```

Here are the examples for [`fiori-tools-proxy`](https://www.npmjs.com/package/@sap/ux-ui5-tooling#2-proxy) and [`ui5-middleware-simpleproxy`](https://www.npmjs.com/package/ui5-middleware-simpleproxy).

**`fiori-tools-proxy`**

```yml
- name: fiori-tools-proxy
  afterMiddleware: compression
  configuration:
    backend:
      - path: /sap
        url: <Cloud Connector or local URL>
        destination: <System Destination name if in BAS>
      - path: /resources/cc/spreadsheetimporter/v1_1_1
        destination: <System Destination name if in BAS>
        pathPrefix: /sap/bc/ui5_ui5/sap/<BSP NAME>/thirdparty/customcontrol/spreadsheetimporter/v1_1_1/
        url: <Cloud Connector or local URL>
```

**`ui5-middleware-simpleproxy`**

```yml
   - name: ui5-middleware-simpleproxy
      afterMiddleware: compression
      mountPath: /resources/cc/spreadsheetimporter/v1_1_1/
      configuration:
        baseUri: "<SAP SYSTEM URL>/sap/bc/ui5_ui5/sap/<BSP NAME>/thirdparty/customcontrol/spreadsheetimporter/v1_1_1/"
        username: <SAP USERNAME>
        password: <SAP PASSWORD
        query:
          sap-client: '100'
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