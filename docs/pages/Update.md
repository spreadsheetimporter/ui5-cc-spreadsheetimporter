

!!! warning
    This feature is currently experimental and may not work as expected.  
    Also only available for OData V4.  
    Please provide feedback: https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues


## Usage

It is recommended, especially for Entities with GUID, to first download the data with the Spreadsheet Importer and include the keys.  

1. Download the data with the Spreadsheet Importer and include the keys.
2. Edit the spreadsheet
3. Upload the data with the Spreadsheet Importer.

## Getting started

The minimal configuration to update entities instead of creating is:

```js
this.spreadsheetUploadUpdate = await this.editFlow.getView().getController().getAppComponent()
.createComponent({
    usage: "spreadsheetImporter",
    async: true,
    componentData: {
        context: this,
        tableId: "ui.v4.ordersv4fe::OrdersObjectPage--fe::table::Items::LineItem-innerTable",
        action: "UPDATE",
        deepDownloadConfig: {
            addKeysToExport: true,
            showOptions: false,
            filename: "Items"
        },
        showDownloadButton: true
    }
});
```

This configuration will show the download button and download all the available data for the referenced table.  
When you press the download button, the data will be downloaded including the keys necessary for the update.  

You can then change the data in the spreadsheet and upload the data again.  
By default only the changed properties are updated. You can change this by setting the `fullUpdate` property to `true`.

## How it works

When you upload the file to the App, it will do the ususal checks if the columns are in the data model and the data is valid.  
When the user presses the upload button, it will fetch all the data in the batch. To make sure all the data is fetched, it will fetch the data for Active and Draft separately.  So for every batch a ListBinding is created and two requests are made with filter for the keys and for `IsActiveEntity` = `true` and `false` (needed because of the seperation of active and draft ([see](https://cap.cloud.sap/docs/get-started/troubleshooting#why-do-some-requests-fail-if-i-set-odata-draft-enabled-on-my-entity))).

This data is used to determine if the object is in draft or active mode, if the object exists at all and for partial updates if a field is changed.

For every change a ODataContextBinding is created and the data is updated.  

## Things to consider

Because of those extra requests, the update is slower than the create and for mass updates this will take some time.  
Also because of this reason, the batch size for update is limited to 100.

If you download the data with the Spreadsheet Importer, only the active entities are downloaded. If you then update the data, the object will be updated in the current state that the object is in.  
So if the object is in draft mode, the data from the active state will be used to update the draft object.

When exporting the data, currently all the data is exported. The filters in a List Report are currently not respected.

The column `IsActiveEntity` states the current state of the object (Draft or Active). In the spreadsheet file the current state must match the state of the object.  
If the state is wrong, a warning will be shown and the user can still continue. If the user continues, the object will be updated in the current state that the object is in.  
For example in the spreadsheet file the `IsActiveEntity` column is set to `true` but the object is in draft mode. A warning will be shown and the user and if the user continues, the draft object will be updated with the data from the spreadsheet.

## Configuration

| Option | Description | Details |
| ------ | --- | --- |
| `fullUpdate` | Update all properties of the object | boolean |
| `columns` | Columns to update | string[] |


## Full Update

If `fullUpdate` is set to `true`, the component will update all properties of the object.

If `fullUpdate` is set to `false`, the component will only update the properties that have changed.

## Columns

The `columns` property is an array of strings. The strings are the names of the columns that should be updated.  
Columns that are not in the array will not be updated.