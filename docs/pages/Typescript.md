

## Setup

with Fiori Generator or easy ui5

### ts-config.json

```json
    "types": [ "@sapui5/ts-types-esm", "ui5-cc-excelupload" ],
    "typeRoots": ["./node_modules"]
```

### manifest.json 

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


```typescript
export async function openExcelUploadDialog(this: ExtensionAPI) {
    const view = this.getRouting().getView();
    const controller = view.getController()
	let excelUpload = controller.excelUpload as ExcelUploadComponent;
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
		excelUpload.attachCheckBeforeRead(function (event: Event<ExcelUploadComponent$CheckBeforeReadEventParameters>) {
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