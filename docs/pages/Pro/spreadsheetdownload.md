This feature downloads the data from the backend and converts it to an Spreadsheet file.  
It is targeted for the future feature to upload the data to update the data in the backend.  
The main feature which distinguishes this from the integrated Spreadsheet Download is that it can download data from multiple entities at once.

So for example if you Orders and OrderItems you can download both entities at once and the data will be structured in the Spreadsheet file in a way that you can easily update the data and upload it again.  
It is possible to recursively download data from multiple entities indefinitely.

- Orders
    - OrderItems
        - Info
    - ShippingInfos

So it possible to download all Orders including the OrderItems and the ShippingInfos and the Info of the OrderItems.

## Configuration

| Option | Description | Details |
| ------ | --- | --- |
| `addKeysToExport` | Add the hidden keys to the export | object |
| `filename` | Define the filename for the export XLSX file | object |
| `deepExport` | Export also the sibling entities | object |
| `deepLevel` | Export siblings to a specific level | object |
| `showOptions` | Show options dialog for the user to change configurations | object |

### Sample Usage

The configuration is done in the `pro` section of the component data.

```json
componentData: {
    context: this,
    activateDraft: true,
    pro: {
        spreadsheetExportConfig: {
            deepLevel: 2,
            deepExport: true,
            addKeysToExport: true,
            filename: 'MyExport'
        }
    }
}
```

### addKeysToExport

**default:** `false`

This option adds the hidden keys to the export.  
For example if you have GUIDs in your data, those are usually hidden in the UI.  
For the later feature to update the data from the file it is necessary to have those keys in the file.

### filename

**default:** Entity Name of Root Entity

This option defines the filename for the export XLSX file.

### deepExport

**default:** `false`

This option defines if the sibling entities should be exported as well.

### deepLevel

**default:** `1`

This option defines how deep the sibling entities should be exported.

### showOptions

**default:** `true`

This option defines if the options dialog should be shown to the user.


## API

### triggerSpreadsheetDownload

This method triggers the Spreadsheet Download without the need to open the spreadsheet upload dialog.  
The input parameter for `triggerSpreadsheetDownload` is the same as the configuration for the `spreadsheetExportConfig` in the `pro` section of the component data.  
You can overwrite the configuration from the component data by passing the configuration to the `triggerSpreadsheetDownload` method.

```js
download: async function () {
    this.spreadsheetUpload = await this.editFlow
        .getView()
        .getController()
        .getAppComponent()
        .createComponent({
            usage: "spreadsheetImporter",
            async: true,
            componentData: {
                context: this,
                activateDraft: true,
                pro: {
                    spreadsheetExportConfig: {
                        deepLevel: 1,
                        deepExport: true,
                        addKeysToExport: true
                    }
                }
            }
        });
    this.spreadsheetUpload.triggerSpreadsheetDownload({
        deepExport: true,
        addKeysToExport: true
    });
}
```