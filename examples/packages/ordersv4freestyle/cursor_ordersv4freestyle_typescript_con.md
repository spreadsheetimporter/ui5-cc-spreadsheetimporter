# OrdersV4Freestyle TypeScript conversion

_Exported on 15/12/2025 at 21:25:33 CET from Cursor (2.2.20)_

---

**User**

@examples/packages/ordersv4freestyle
Convert the SAPUI5 UI of this project to TypeScript.
Use the MCP tool to get conversion guidelines. Ignore the tests for the time being.

Implement the plan as specified, it is attached for your reference. Do NOT edit the plan file itself.

To-do's from the plan have already been created. Do not create them again. Mark them as in_progress as you work, starting with the first one. Don't stop until you have completed all the to-dos.

Implement the plan as specified, it is attached for your reference. Do NOT edit the plan file itself.

To-do's from the plan have already been created. Do not create them again. Mark them as in_progress as you work, starting with the first one. Don't stop until you have completed all the to-dos.

---

**Cursor**

```json
{
  "name": "ordersv4freestyle136",
  "version": "0.0.1",
  "private": true,
  "description": "An SAP Fiori application.",
  "keywords": ["ui5", "openui5", "sapui5"],
  "main": "webapp/index.html",
  "dependencies": {
    "ui5-cc-spreadsheetimporter": "*"
  },
  "devDependencies": {
    "@sap-ux/ui5-middleware-fe-mockserver": "^2.2.97",
    "@sap/ux-ui5-tooling": "^1.18.0",
    "@sapui5/types": "~1.136.0",
    "@ui5/cli": "^4.0.18",
    "typescript": "~5.7.0",
    "typescript-eslint": "~8.18.0",
    "ui5-middleware-livereload": "~3.2.0",
    "ui5-middleware-ui5": "3.3.0",
    "ui5-tooling-modules": "3.27.6",
    "ui5-tooling-transpile": "~3.10.0"
  },
  "scripts": {
    "start": "fiori run -p 8190 --open \"index.html?sap-ui-xx-viewCache=false\"",
    "start:dist": "fiori run -p 8190 --config ./ui5-dist.yaml --open \"index.html?sap-ui-xx-viewCache=false\"",
    "start:silent": "fiori run -p 8190",
    "start-local": "fiori run --config ./ui5-local.yaml --open \"test/flpSandbox.html?sap-ui-xx-viewCache=false#ordersv4freestyle-display\"",
    "build": "ui5 build --config=ui5.yaml --all --clean-dest --dest dist",
    "deploy": "fiori verify",
    "deploy-config": "fiori add deploy-config",
    "start-noflp": "fiori run --open \"index.html?sap-ui-xx-viewCache=false\"",
    "start-mock": "fiori run --config ./ui5-mock.yaml --open \"test/flpSandbox.html?sap-ui-xx-viewCache=false#ordersv4freestyle-display\"",
    "start-variants-management": "fiori run --open \"preview.html?sap-ui-xx-viewCache=false&fiori-tools-rta-mode=true&sap-ui-rta-skip-flex-validation=true#preview-app\"",
    "unit-tests": "fiori run --config ./ui5-mock.yaml --open 'test/unit/unitTests.qunit.html'",
    "int-tests": "fiori run --config ./ui5-mock.yaml --open 'test/integration/opaTests.qunit.html'"
  },
  "sapuxLayer": "CUSTOMER_BASE"
}
```

```jsonc
{
  "compilerOptions": {
    "target": "es2023",
    "module": "es2022",
    "moduleResolution": "node",
    "skipLibCheck": true,
    "allowJs": true,
    "strict": true,
    "strictNullChecks": false,
    "strictPropertyInitialization": false,
    "outDir": "./dist",
    "rootDir": "./webapp",
    "types": ["@sapui5/types"],
    "paths": {
      "ordersv4freestyle/*": ["./webapp/*"]
    }
  },
  "include": ["./webapp/**/*"],
  "exclude": ["./webapp/test/**/*"]
}
```

```yaml
# yaml-language-server: $schema=https://sap.github.io/ui5-tooling/schema/ui5.yaml.json

specVersion: "3.1"
metadata:
  name: ordersv4freestyle
type: application
builder:
  customTasks:
    - name: ui5-tooling-transpile-task
      afterTask: replaceVersion
server:
  customMiddleware:
    - name: fiori-tools-proxy
      afterMiddleware: compression
      configuration:
        ignoreCertError: false # If set to true, certificate errors will be ignored. E.g. self-signed certificates will be accepted
        ui5:
          path:
            - /resources
            - /test-resources
          url: https://ui5.sap.com
        backend:
          - path: /odata
            url: http://localhost:4004
    - name: ui5-middleware-ui5
      afterMiddleware: compression
      configuration:
        modules:
          ui5-cc-spreadsheetimporter:
            configFile: "ui5-serve.yaml"
    - name: ui5-tooling-modules-middleware
      afterMiddleware: compression
      configuration:
        debug: "verbose"
        addToNamespace: true
        prependPathMappings: true
    - name: fiori-tools-appreload
      afterMiddleware: compression
      configuration:
        port: 35729
        path: webapp
        delay: 300
    - name: fiori-tools-preview
      afterMiddleware: fiori-tools-appreload
      configuration:
        component: ordersv4freestyle
        ui5Theme: sap_horizon
```

```yaml
# yaml-language-server: $schema=https://sap.github.io/ui5-tooling/schema/ui5.yaml.json

specVersion: "3.1"
metadata:
  name: ordersv4freestyle
type: application
builder:
  customTasks:
    - name: ui5-tooling-transpile-task
      afterTask: replaceVersion
server:
  customMiddleware:
    - name: ui5-tooling-transpile-middleware
      afterMiddleware: compression
    - name: ui5-middleware-livereload
      afterMiddleware: compression
    - name: fiori-tools-proxy
      afterMiddleware: compression
      configuration:
        ignoreCertError: false # If set to true, certificate errors will be ignored. E.g. self-signed certificates will be accepted
        ui5:
          path:
            - /resources
            - /test-resources
          url: https://ui5.sap.com
        backend:
          - path: /odata
            url: http://localhost:4004
    - name: ui5-middleware-ui5
      afterMiddleware: compression
      configuration:
        modules:
          ui5-cc-spreadsheetimporter:
            configFile: "ui5-serve.yaml"
    - name: ui5-tooling-modules-middleware
      afterMiddleware: compression
      configuration:
        debug: "verbose"
        addToNamespace: true
        prependPathMappings: true
    - name: fiori-tools-appreload
      afterMiddleware: compression
      configuration:
        port: 35729
        path: webapp
        delay: 300
    - name: fiori-tools-preview
      afterMiddleware: fiori-tools-appreload
      configuration:
        component: ordersv4freestyle
        ui5Theme: sap_horizon
```

```typescript
/**
 * eslint-disable @sap/ui5-jsdocs/no-jsdoc
 */

import UIComponent from "sap/ui/core/UIComponent";
import Device from "sap/ui/Device";
import models from "ordersv4freestyle/model/models";

/**
 * @namespace ordersv4freestyle
 */
export default class Component extends UIComponent {
  public static metadata = {
    manifest: "json"
  };

  /**
   * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
   * @public
   * @override
   */
  public init(): void {
    // call the base component's init function
    super.init();

    // enable routing
    this.getRouter().initialize();

    // set the device model
    this.setModel(models.createDeviceModel(), "device");
  }
}
```

```typescript
import JSONModel from "sap/ui/model/json/JSONModel";
import Device from "sap/ui/Device";

/**
 * provide app-view type models (as in the first "V" in MVVC)
 *
 * @returns {Function} createDeviceModel() for providing runtime info for the device the UI5 app is running on
 */
const models = {
  createDeviceModel: function (): JSONModel {
    const oModel = new JSONModel(Device);
    oModel.setDefaultBindingMode("OneWay");
    return oModel;
  }
};

export default models;
```

```typescript
import Controller from "sap/ui/core/mvc/Controller";

/**
 * @namespace ordersv4freestyle.controller
 */
export default class AppController extends Controller {
  public onInit(): void {}
}
```

```typescript
import Controller from "sap/ui/core/mvc/Controller";
import Component from "../Component";

/**
 * @namespace ordersv4freestyle.controller
 */
export default class MainViewController extends Controller {
  private spreadsheetUpload: Component;

  public onInit(): void {}

  public goToSampleApp(): void {
    // open https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/tree/main/examples/packages/ordersv4freestyle
    window.open("https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/tree/main/examples/packages/ordersv4freestyle", "_blank");
  }

  public async onDownload(): Promise<void> {
    this.spreadsheetUpload = await (this.getOwnerComponent() as Component).createComponent({
      usage: "spreadsheetImporter",
      async: true,
      componentData: {
        context: this,
        createActiveEntity: true,
        debug: false,
        deepDownloadConfig: {
          deepLevel: 2,
          deepExport: true,
          addKeysToExport: true,
          showOptions: false,
          filename: "Orders123",
          columns: {
            OrderNo: {
              order: 1
            },
            buyer: {
              order: 3
            },
            Items: {
              quantity: {
                order: 2
              },
              title: {
                order: 4
              }
            },
            Shipping: {
              address: {
                order: 5
              }
            }
          }
        }
      }
    });

    // this.spreadsheetUpload.attachBeforeDownloadFileProcessing(this.onBeforeDownloadFileProcessing, this);
    // this.spreadsheetUpload.attachBeforeDownloadFileExport(this.onBeforeDownloadFileExport, this);

    (this.spreadsheetUpload as any).triggerDownloadSpreadsheet();
  }

  public onNavToCDSPlugin(): void {
    const oRouter = (this.getOwnerComponent() as Component).getRouter();
    oRouter.navTo("RouteCDSPlugin");
  }

  public onNavToOrders(): void {
    const oRouter = (this.getOwnerComponent() as Component).getRouter();
    oRouter.navTo("RouteOrdersTable");
  }

  public onNavToWizard(): void {
    const oRouter = (this.getOwnerComponent() as Component).getRouter();
    oRouter.navTo("RouteWizard");
  }
}
```

```typescript
import Controller from "sap/ui/core/mvc/Controller";
import Component from "../Component";

/**
 * @namespace ordersv4freestyle.controller
 */
export default class OrdersTableController extends Controller {
  private spreadsheetUpload: Component;

  public onInit(): void {}

  public async onDownload(): Promise<void> {
    this.spreadsheetUpload = await (this.getOwnerComponent() as Component).createComponent({
      usage: "spreadsheetImporter",
      async: true,
      componentData: {
        context: this,
        createActiveEntity: true,
        debug: false,
        deepDownloadConfig: {
          deepLevel: 2,
          deepExport: true,
          addKeysToExport: true,
          showOptions: false,
          filename: "Orders123",
          columns: {
            OrderNo: {
              order: 1
            },
            buyer: {
              order: 3
            },
            Items: {
              quantity: {
                order: 2
              },
              title: {
                order: 4
              }
            },
            Shipping: {
              address: {
                order: 5
              }
            }
          }
        }
      }
    });

    // this.spreadsheetUpload.attachBeforeDownloadFileProcessing(this.onBeforeDownloadFileProcessing, this);
    // this.spreadsheetUpload.attachBeforeDownloadFileExport(this.onBeforeDownloadFileExport, this);

    (this.spreadsheetUpload as any).triggerDownloadSpreadsheet();
  }

  public async onMassUpdate(): Promise<void> {
    this.spreadsheetUpload = await (this.getOwnerComponent() as Component).createComponent({
      usage: "spreadsheetImporter",
      async: true,
      componentData: {
        context: this,
        action: "UPDATE",
        updateConfig: {
          fullUpdate: false
        }
      }
    });
    (this.spreadsheetUpload as any).openSpreadsheetUploadDialog();
  }

  // onBeforeDownloadFileProcessing: function (event) {
  //     event.getParameters().data.$XYZData[0].buyer = "Customer 123";
  // },

  // onBeforeDownloadFileExport: function (event) {
  //     event.getParameters().filename = "Orders123_modified";
  // }
}
```

```typescript
import Controller from "sap/ui/core/mvc/Controller";
import MessageToast from "sap/m/MessageToast";
import Component from "../Component";
import ComponentContainer from "sap/ui/core/ComponentContainer";

/**
 * @namespace ordersv4freestyle.controller
 */
export default class WizardController extends Controller {
  public onInit(): void {
    // Controller initialization
  }

  /**
   * Navigate back to main view
   */
  public onNavBack(): void {
    const oRouter = (this.getOwnerComponent() as Component).getRouter();
    oRouter.navTo("RouteMainView");
  }

  /**
   * Open wizard programmatically
   */
  public openWizard(): void {
    // Get the spreadsheet importer component
    const oSpreadsheetUpload = this.byId("wizardSpreadsheetImporter") as ComponentContainer;

    if (oSpreadsheetUpload) {
      // Get the component instance
      const oComponent = oSpreadsheetUpload.getComponentInstance();

      if (oComponent) {
        // Open the wizard
        (oComponent as any)
          .openWizard()
          .then(function (result: { canceled: boolean }) {
            if (!result.canceled) {
              MessageToast.show("Wizard completed successfully!");
            } else {
              MessageToast.show("Wizard was canceled");
            }
          })
          .catch(function (error: Error) {
            MessageToast.show("Error opening wizard: " + error.message);
          });
      } else {
        MessageToast.show("Component not ready yet");
      }
    } else {
      MessageToast.show("Spreadsheet importer not found");
    }
  }
}
```

```typescript
import Controller from "sap/ui/core/mvc/Controller";
import Component from "../Component";

/**
 * @namespace ordersv4freestyle.controller
 */
export default class CDSPluginController extends Controller {
  public onInit(): void {}

  public onNavBack(): void {
    (this.getOwnerComponent() as Component).getRouter().navTo("RouteMainView", {}, true);
  }
}
```

```typescript
import Controller from "sap/ui/core/mvc/Controller";
import MessageToast from "sap/m/MessageToast";
import ODataModel from "sap/ui/model/odata/v4/ODataModel";
import BusyIndicator from "sap/ui/core/BusyIndicator";
import Component from "../Component";
import FileUploader from "sap/ui/unified/FileUploader";
import Event from "sap/ui/base/Event";
import ODataListBinding from "sap/ui/model/odata/v4/ODataListBinding";

// Define a group ID for batch requests if explicit control is needed
const UPLOAD_GROUP_ID = "uploadGroup";

/**
 * @namespace ordersv4freestyle.controller
 */
export default class CDSPluginBackupController extends Controller {
  private oImporterModel: ODataModel;

  public onInit(): void {
    // Determine the base URL for services (different for localhost)
    let sServiceUrl = "/odata/v4/importer/";
    if (window.location.hostname === "localhost") {
      // When running UI locally but using a remote service on port 4004
      // uncomment below line and comment the next line if you need absolute URLs
      // sServiceUrl = "http://localhost:4004/odata/v4/importer/";

      // We're assuming server-relative URLs work because UI app and backend
      // are served from the same origin or proper CORS is configured
      console.log("Running on localhost, service URLs will be relative or configured in proxy");
    }

    // Create a dedicated model for the ImporterService
    // Using synchronizationMode "None" allows explicit batch control via submitBatch
    this.oImporterModel = new ODataModel({
      serviceUrl: sServiceUrl,
      synchronizationMode: "None",
      groupId: "$auto", // Default group for reads
      updateGroupId: UPLOAD_GROUP_ID, // Default group for updates (including setValue)
      operationMode: "Server"
    });

    // Log model configuration
    console.log("ImporterService model created with serviceUrl:", sServiceUrl);

    // Set the model on the view if you need to access it declaratively
    this.getView().setModel(this.oImporterModel, "importerService");
  }

  public onNavBack(): void {
    (this.getOwnerComponent() as Component).getRouter().navTo("RouteMainView", {}, true);
  }

  // Prevent default file uploader "Upload" button
  public uploadButtonPress(oEvent: Event): void {
    oEvent.preventDefault();
  }

  // File selected in FileUploader
  public preFileProcessing(oEvent: Event): void {
    oEvent.preventDefault(); // stop FileUploader's built-in upload
    const file = oEvent.getParameter("file" as never) as File;
    MessageToast.show("Selected file: " + file.name);

    // Send to CAP backend using the direct XMLHttpRequest approach
    this.sendFileToCAPBackend(file);
  }

  // Reads the file and uploads it directly using XMLHttpRequest (without OData APIs)
  public sendFileToCAPBackend(file: File): void {
    // Define the upload URL (base service URL + entity path + content property)
    const sEntityId = "OrdersService.Orders"; // Unique ID for the Spreadsheet entity

    // Get the serviceUrl from the model (handles localhost automatically based on onInit config)
    let sBaseUrl = "";
    if (this.oImporterModel && (this.oImporterModel as any).sServiceUrl) {
      // Remove trailing slash if present (oImporterModel.sServiceUrl often has it)
      sBaseUrl = ((this.oImporterModel as any).sServiceUrl as string).replace(/\/$/, "");
    }

    // Remove 'odata/v4/importer' from sBaseUrl if present, as it's already in the path below
    if (sBaseUrl.endsWith("odata/v4/importer")) {
      sBaseUrl = sBaseUrl.substring(0, sBaseUrl.length - "odata/v4/importer".length);
    }

    const sUploadUrl = sBaseUrl + "odata/v4/importer/Spreadsheet(entity='" + encodeURIComponent(sEntityId) + "')/content";

    console.log("Base URL:", sBaseUrl);
    console.log("Computed upload URL:", sUploadUrl);

    // First, ensure entity exists before attempting the upload
    this._ensureEntityExists(sEntityId)
      .then(() => {
        // Once entity exists, perform the direct upload using XMLHttpRequest
        this._uploadFileWithXHR(file, sUploadUrl);
      })
      .catch((oError: Error) => {
        console.error("Error ensuring spreadsheet entity exists:", oError);
        MessageToast.show("Upload preparation failed: " + (oError.message || oError));
      });
  }

  // Helper: Ensures the spreadsheet entity exists, creates it if it doesn't
  private _ensureEntityExists(sEntityId: string): Promise<void> {
    const sEntityPath = "/Spreadsheet(entity='" + encodeURIComponent(sEntityId) + "')";
    const oContext = this.oImporterModel.bindContext(sEntityPath).getBoundContext();

    return new Promise((resolve, reject) => {
      // Try to fetch the entity, resolves if it exists
      oContext
        .requestObject()
        .then(() => {
          console.log("Entity with ID", sEntityId, "exists.");
          resolve();
        })
        .catch((oError: any) => {
          // If entity doesn't exist (404), create it
          if (oError.status === 404 || (oError.getMessages && oError.getMessages().some((msg: any) => msg.getCode() === "404"))) {
            console.log("Entity with ID", sEntityId, "does not exist. Creating it...");

            // Create the entity using list binding with $count
            const oListBinding = this.oImporterModel.bindList("/Spreadsheet", undefined, undefined, undefined, { $count: true }) as ODataListBinding;
            oListBinding.create({ entity: sEntityId }, true);

            // Submit the batch to create the entity
            this.oImporterModel
              .submitBatch(UPLOAD_GROUP_ID)
              .then(() => {
                console.log("Entity creation successful:", sEntityId);
                resolve();
              })
              .catch((oCreateError: Error) => {
                console.error("Entity creation failed:", oCreateError);
                reject(oCreateError);
              });
          } else {
            // Some other error occurred
            reject(oError);
          }
        });
    });
  }

  // Helper: Uploads file using direct XHR PUT request (similar to sap.m.upload.Uploader)
  private _uploadFileWithXHR(oFile: File, sUploadUrl: string): void {
    const oXhr = new XMLHttpRequest();

    // Adjust URL for localhost development (port 4004)
    let sAdjustedUrl = sUploadUrl;
    if (window.location.hostname === "localhost") {
      // If the URL starts with a slash, it's a relative URL that needs the full server base
      if (sUploadUrl.startsWith("/")) {
        sAdjustedUrl = "http://localhost:4004" + sUploadUrl;
        console.log("Running on localhost, adjusted URL to:", sAdjustedUrl);
      }
    }

    // Show busy indicator
    BusyIndicator.show(0);

    // Configure the XHR request
    oXhr.open("PUT", sAdjustedUrl, true);

    // Set Content-Type header based on file type if available
    if (oFile.type) {
      oXhr.setRequestHeader("Content-Type", oFile.type);
    }

    // Add any additional headers if needed
    // If using CSRF protection, you might need to get a token first and add it here

    // Set up progress event handler (optional)
    oXhr.upload.addEventListener("progress", (oEvent: ProgressEvent) => {
      if (oEvent.lengthComputable) {
        const fPercentComplete = (oEvent.loaded / oEvent.total) * 100;
        console.log("Upload progress: " + Math.round(fPercentComplete) + "%");
      }
    });

    // Set up completion handler
    oXhr.onreadystatechange = () => {
      if (oXhr.readyState === XMLHttpRequest.DONE) {
        BusyIndicator.hide();

        if (oXhr.status >= 200 && oXhr.status < 300) {
          // Upload succeeded
          console.log("Upload completed successfully!");
          MessageToast.show("File uploaded successfully!");

          // Clear file uploader
          const oFileUploader = this.byId("fileUploader") as FileUploader;
          if (oFileUploader) {
            oFileUploader.clear();
          }
        } else {
          // Upload failed
          console.error("Upload failed with status:", oXhr.status, oXhr.statusText);
          console.error("Response:", oXhr.responseText);
          MessageToast.show("Upload failed: " + (oXhr.statusText || "Server error"));
        }
      }
    };

    // Handle network errors
    oXhr.onerror = () => {
      BusyIndicator.hide();
      console.error("Network error during upload");
      MessageToast.show("Network error during upload");
    };

    // Send the file
    try {
      oXhr.send(oFile);
      console.log("XHR upload started for file:", oFile.name);
    } catch (error) {
      BusyIndicator.hide();
      console.error("Error sending file:", error);
      MessageToast.show("Error starting upload: " + (error as Error).message);
    }
  }
}
```

All tasks have been completed successfully. Here's a summary of what was done:

## Completed TypeScript Conversion

### 1. Project Setup & Configuration

- **Updated `package.json`**: Added TypeScript-related devDependencies:

  - `@sapui5/types` (~1.136.0)
  - `typescript` (~5.7.0)
  - `typescript-eslint` (~8.18.0)
  - `ui5-middleware-livereload` (~3.2.0)
  - `ui5-tooling-transpile` (~3.10.0)

- **Created `tsconfig.json`**: Configured with:

  - ES2023 target
  - Path mappings for `ordersv4freestyle/*`
  - Excluded test files from compilation

- **Updated `ui5.yaml`**: Added:
  - `ui5-tooling-transpile-task` under `builder.customTasks`
  - `ui5-tooling-transpile-middleware` under `server.customMiddleware`
  - `ui5-middleware-livereload` for development

### 2. Code Conversion

Converted all JavaScript files to TypeScript:

| Original File                              | Converted File                             |
| ------------------------------------------ | ------------------------------------------ |
| `Component.js`                             | `Component.ts`                             |
| `model/models.js`                          | `model/models.ts`                          |
| `controller/App.controller.js`             | `controller/App.controller.ts`             |
| `controller/MainView.controller.js`        | `controller/MainView.controller.ts`        |
| `controller/OrdersTable.controller.js`     | `controller/OrdersTable.controller.ts`     |
| `controller/Wizard.controller.js`          | `controller/Wizard.controller.ts`          |
| `controller/CDSPlugin.controller.js`       | `controller/CDSPlugin.controller.ts`       |
| `controller/CDSPluginBackup.controller.js` | `controller/CDSPluginBackup.controller.ts` |

### Key Conversion Patterns Applied

- Converted `sap.ui.define` to ES module `import`/`export` syntax
- Converted `Controller.extend()` to `class extends Controller`
- Added `@namespace` JSDoc annotations for proper UI5 class naming
- Added TypeScript type annotations for parameters and return types
- Used proper type casts for `getOwnerComponent()` and other UI5 methods
- Preserved all existing comments and JSDoc documentation

### Next Steps (for you)

1. Run `npm install` in the `examples/packages/ordersv4freestyle` directory to install the new dependencies
2. Test the application with `npm start` to verify everything works correctly
