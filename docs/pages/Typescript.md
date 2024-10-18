Since the component is written in TypeScript, we can also provide the generated types. 

The GitHub repository contains a sample TypeScript application created with the Fiori Generator. You can find the example app in the [example folder](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/tree/main/examples/packages/ordersv4fets).

## Setup

Generate an app with the Fiori Tools Generator in TypeScript or use the [Easy UI5 TS Generator](https://github.com/ui5-community/generator-ui5-ts-app).

### ts-config.json

You can consume the types from the `@sapui5/ts-types-esm` and the `ui5-cc-spreadsheetimporter` package.

```json
    "types": ["@sapui5/ts-types-esm", "ui5-cc-spreadsheetimporter"],
    "typeRoots": ["./node_modules"]
```

### manifest.json 

Add the component usage and the resource roots to the manifest.json as described in the [Getting Started](GettingStarted.md) section.

!!! warning ""
    ⚠️ The `resourceRoots` path "./thirdparty/customcontrol/spreadsheetimporter/v1_4_2" changed from version 0.34.0 to lowercase. Please make sure to use the correct path.

```json
        "componentUsages": {
            "spreadsheetImporter": {
                "name": "cc.spreadsheetimporter.v1_4_2"
            }
        },
        "resourceRoots": {
            "cc.spreadsheetimporter.v1_4_2": "./thirdparty/customcontrol/spreadsheetimporter/v1_4_2"
        },
```

### Custom Action

This is an example of how you could create the component and attach an event handler to the `checkBeforeRead` event with the types `Component` and `Component$CheckBeforeReadEventParameters` for the event parameters with an OData V4 Fiori Elements Application and UI5 Version 1.116.

```typescript
import Component, { Component$ChangeBeforeCreateEvent, Component$CheckBeforeReadEvent, Component$UploadButtonPressEvent } from "cc/spreadsheetimporter/v1_4_2/Component";
import BaseController from "sap/fe/core/BaseController";
import ExtensionAPI from "sap/fe/core/ExtensionAPI";

export async function openSpreadsheetUploadDialog(this: ExtensionAPI) {
    const view = this.getRouting().getView();
    const controller = view.getController() as BaseController;
    view.setBusyIndicatorDelay(0);
    view.setBusy(true);
    const spreadsheetUpload = (await controller.getAppComponent().createComponent({
        usage: "spreadsheetImporter",
        async: true,
        componentData: {
            context: this,
            activateDraft: true
        }
    })) as Component;
    // event to check before uploaded to app
    spreadsheetUpload.attachCheckBeforeRead(function (event: Component$CheckBeforeReadEvent) {
        // example
        const sheetData = event.getParameter("sheetData") as any;
        event.getParameters().messages;
        let errorArray = [];
        for (const [index, row] of sheetData.entries()) {
            //check for invalid price
            for (const key in row) {
                if (key.endsWith("[price]") && row[key].rawValue > 100) {
                    const error = {
                        title: "Price too high (max 100)",
                        row: index + 2,
                        group: true,
                        rawValue: row[key].rawValue,
                        ui5type: "Error"
                    };
                    errorArray.push(error);
                }
            }
        }
        (event.getSource() as Component).addArrayToMessages(errorArray);
    }, this);

    // event example to prevent uploading data to backend
    spreadsheetUpload.attachUploadButtonPress(function (event: Component$UploadButtonPressEvent) {
        //event.preventDefault();
        //event.getParameter("payload");
    }, this);

    // event to change data before send to backend
    spreadsheetUpload.attachChangeBeforeCreate(function (event: Component$ChangeBeforeCreateEvent) {
        let payload = event.getParameter("payload");
		// round number from 12,56 to 12,6
		if (payload.price) {
			payload.price = Number(payload.price).toFixed(1)
		}
		return payload;
    }, this);
    spreadsheetUpload.openSpreadsheetUploadDialog();
    view.setBusy(false);
}
```