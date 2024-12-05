# Spreadsheet Deep Download

This feature downloads data from the backend and converts it to a Spreadsheet file. In the future, the feature will allow users to upload data in order to update the data in the backend.

The main difference between this feature and the integrated Spreadsheet Download is that it can download data from multiple entities at once.

For example, if you have Orders and OrderItems, you can download both entities at once and the data will be structured in the Spreadsheet file in a way that allows for easy data updates and re-uploading. It is also possible to recursively download data from multiple entities indefinitely.

- Orders
    - OrderItems
        - Info
    - ShippingInfos

This means that you can download all Orders, including the OrderItems, ShippingInfos, and the Info of the OrderItems.

## Technical Details

The download process involves several key components:

1. **Data Fetching**: The system fetches data recursively based on the configured deep level with expands, handling batch processing for large datasets.

2. **Data Assignment**: The DataAssigner handles:
   - Root entity data assignment
   - Column assignments
   - Recursive data assignment for nested entities
   - Handling of fetchable entities

3. **Spreadsheet Generation**: The SpreadsheetGenerator creates:
   - Multiple sheets for different entities
   - Proper column formatting based on data types
   - Sheet naming with collision handling
   - Column width optimization

## Configuration

| Option | Description | Default | Type |
| ------ | ----------- | ------- | ---- |
| `addKeysToExport` | Adds hidden keys to the export | `false` | boolean |
| `filename` | Defines the filename for the export XLSX file | Entity Name | string |
| `deepExport` | Also exports sibling entities | `false` | boolean |
| `deepLevel` | Defines the level of sibling entities to export | `1` | number |
| `showOptions` | Shows options dialog for users | `true` | boolean |
| `columns` | Defines the columns to export | `{}` | object |

### Sample Usage

The configuration is done in the `pro` section of the component data:

```json
componentData: {
    context: this,
    activateDraft: true,
    showDownloadButton: true,
    deepDownloadConfig: {
        deepLevel: 1,
        deepExport: false,
        addKeysToExport: false,
        showOptions: false,
        columns : {
            "OrderNo":{
                "order": 1
            },
            "buyer": {
                "order": 3
            },
            "Items": {
                "quantity" : {
                    "order": 2
                },
                "title": {
                    "order": 4
                }
            },
            "Shipping": {
                "address" : {
                    "order": 5
                },
            }
        }
    }
}
```

### columns

**default:** `{}`

This option defines the columns to export.  
By default, all columns are exported.
It is possible to define the order of the columns by using the `order` property but only for the flat structure.
To know which columns are available, it is possible to turn on `debug` as an option.
With this option, the `mainEntity` is logged and then you can use it as a reference.

### addKeysToExport

**default:** `false`

This option adds hidden keys to the export, such as GUIDs that are usually hidden in the UI. These keys are necessary for updating data from the file in the future.

### filename

**default:** Entity Name of Root Entity

This option defines the filename for the export XLSX file.

### deepExport

**default:** `false`

This option determines whether sibling entities should be exported as well.

### deepLevel

**default:** `1`

This option defines how deep sibling entities should be exported.

### showOptions

**default:** `true`

This option determines whether the options dialog should be shown to the user.

### flatSheet

**default:** `false`

This option determines whether the data should be exported in a flat structure.


## API

### triggerDownloadSpreadsheet

This method triggers the Spreadsheet Download without the need to open the spreadsheet upload dialog.  
The input parameter for `triggerDownloadSpreadsheet` is the same as the configuration for the `deepDownloadConfig`.  
You can overwrite the configuration from the component data by passing the configuration to the `triggerDownloadSpreadsheet` method.

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
                deepDownloadConfig: {
                    deepLevel: 1,
                    deepExport: true,
                    addKeysToExport: true
                }
            }
        });
    this.spreadsheetUpload.triggerDownloadSpreadsheet({
        deepLevel: 2,
        deepExport: true,
        addKeysToExport: true
    });
}
```