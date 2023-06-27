Since the component is written in Typescript, we can also provide the generated types.
The GitHub repository contains a sample Typescript application created with the Fiori Generator.  
You can find the example app in the [example folder](https://github.com/marianfoo/ui5-cc-excelUpload/tree/main/examples/packages/ordersv4fets).

## Setup

Generate a app with the Fiori Tools Generator in Typescript or use the [Easy UI5 TS Generator](https://github.com/ui5-community/generator-ui5-ts-app).

### ts-config.json

You can consume the types from the `@sapui5/ts-types-esm` and the `ui5-cc-excelupload` package.

```json
    "types": [ "@sapui5/ts-types-esm", "ui5-cc-excelupload" ],
    "typeRoots": ["./node_modules"]
```

### manifest.json 

Add the component usage and the resource roots to the manifest.json as described in the [Getting Started](GettingStarted.md) Section.

```json
        "componentUsages": {
            "excelUpload": {
                "name": "cc.excelUpload.v0_19_1"
            }
        },
        "resourceRoots": {
            "cc.excelUpload.v0_19_1": "./thirdparty/customControl/excelUpload/v0_19_1",
            "cc.excelUploadButton.v0_7_1": "./thirdparty/customControl/excelUploadButton/v0_7_1"
        },
```
### Custom Action

This is a example how you could create the component and attach a event handler to the `checkBeforeRead` event with the types `Component` and `Component$CheckBeforeReadEventParameters` for the Event Parameters.


```typescript
import Component, { Component$CheckBeforeReadEventParameters } from "cc/excelUpload/v0_19_1/Component";

export async function openExcelUploadDialog(this: ExtensionAPI) {
    const view = this.getRouting().getView();
    const controller = view.getController()
	let excelUpload = controller.excelUpload as Component;
	view.setBusyIndicatorDelay(0);
	view.setBusy(true);
	if (!controller.excelUpload) {
		excelUpload = await this.getRouting()
			.getView()
			.getController()
			.getAppComponent()
			.createComponent({
				usage: "excelUpload",
				async: true,
				componentData: {
					context: this,
					activateDraft: true
				}
			});
		controller.excelUpload = excelUpload;
		// event to check before uploaded to app
		excelUpload.attachCheckBeforeRead(function (event: Event<Component$CheckBeforeReadEventParameters>) {
			// example
			const sheetData = event.getParameter("sheetData");
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
			(event.getSource() as ExcelUploadComponent).addArrayToMessages(errorArray);
		}, this);
	}
	excelUpload.openExcelUploadDialog();
	view.setBusy(false);
}
```