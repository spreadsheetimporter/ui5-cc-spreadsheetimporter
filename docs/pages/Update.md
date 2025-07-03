<!-- prettier-ignore-start -->

!!! warning
This feature is available since version 1.7.0 and currently experimental and may not work as expected.  
 Also only available for OData V4.  
 Please provide feedback: https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues

<!-- prettier-ignore-end -->

## Usage

It is recommended, especially for Entities with GUID, to first download the data with the Spreadsheet Importer and include the keys.

1. Download the data with the Spreadsheet Importer and include the keys.
2. Edit the spreadsheet
3. Upload the data with the Spreadsheet Importer.

## Getting started

The minimal configuration to update entities instead of creating is:

```js
this.spreadsheetUploadUpdate = await this.editFlow
  .getView()
  .getController()
  .getAppComponent()
  .createComponent({
    usage: 'spreadsheetImporter',
    async: true,
    componentData: {
      context: this,
      tableId: 'ui.v4.ordersv4fe::OrdersObjectPage--fe::table::Items::LineItem-innerTable',
      action: 'UPDATE',
      deepDownloadConfig: {
        addKeysToExport: true,
        showOptions: false,
        filename: 'Items'
      },
      showDownloadButton: true
    }
  });
this.spreadsheetUploadUpdate.openSpreadsheetUploadDialog();
```

This configuration will show the download button and download all the available data for the referenced table.  
When you press the download button, the data will be downloaded including the keys necessary for the update.

You can then change the data in the spreadsheet and upload the data again.  
By default, only the changed properties are updated (partial update). You can change this by setting the `fullUpdate` property to `true` (see [Configuration](#configuration) below).

## How it works

When you upload the file to the App, it will do the usual checks if the columns are in the data model and the data is valid (see [Checks](./Checks.md)).  
When the user presses the upload button, it will fetch all the data in the batch. To make sure all the data is fetched, it will fetch the data for active and draft separately. So for every batch a ListBinding is created and two requests are made with filters for the keys and for `IsActiveEntity = true` and `IsActiveEntity = false`. This is needed because of the separation of active and draft (see [why requests fail in CAP with OData draft enabled](https://cap.cloud.sap/docs/get-started/troubleshooting#why-do-some-requests-fail-if-i-set-odata-draft-enabled-on-my-entity)).

This data is used to determine if the object is in draft or active mode, if the object exists at all, and for partial updates whether a field is changed.

For every change, an `ODataContextBinding` is created and the data is updated.

## Things to consider / Drawbacks

### IsActiveEntity handling

The column `IsActiveEntity` states the current state of the object (Draft or Active). In the spreadsheet file, the current state must match the state of the object.

• If the state is wrong, a warning is shown and the user can still continue. If the user continues, the object will be updated in the current state that the object is actually in.  
 For example, if in the spreadsheet file the `IsActiveEntity` column is set to `true` but the object is in draft mode, a warning will be shown, and if the user continues, the draft object will be updated with the data from the spreadsheet.

### Download only Active Entities

If you download the data with the Spreadsheet Importer, only the active entities are downloaded. If you then update the data, the object will be updated in the current state that the object is in.  
So if the object is in draft mode, the data from the active state will still be used to update the draft object.

### Performance and batch size

Because the update needs extra requests (fetch of active and draft objects, plus partial updates), the update is slower than a create operation. For mass updates, this can take some time.  
Because of the performance considerations, the batch size for update is limited to 100 per batch.

### Filter Limitations

When exporting the data, currently all the data is exported. Any filters in a List Report are not respected at the moment.

## Configuration

Below is a brief overview of the main configuration options relevant to updating. For the complete list, see the [Configuration documentation](./Configuration.md).

| Option       | Description                                                                                | Default |
| ------------ | ------------------------------------------------------------------------------------------ | ------- |
| `fullUpdate` | Update all properties of the object (true). If false, only changed properties are updated. | false   |
| `columns`    | Columns to update.                                                                         | all     |

### fullUpdate

If `fullUpdate` is set to `true`, the component updates all properties of the object.  
If `fullUpdate` is set to `false` (default), only the properties that have changed are updated (partial update).

### columns

The `columns` property is an array of strings. The strings are the names of the columns that should be updated.  
Columns that are not in the array will not be updated at all. This is useful if you only want to update a subset of properties.

When using `fullUpdate = true`, the system will still honor `columns`—only those columns listed will be sent in the update request. For unlisted columns, no updates will be sent.
