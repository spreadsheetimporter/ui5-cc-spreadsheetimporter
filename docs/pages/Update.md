

!!! warning
    This feature is currently experimental and may not work as expected. Also only available for OData V4.


## Usage

It is recommended, especially for Entities with GUID, to first download the data with the Spreadsheet Importer and include the keys.  
Usually `IsActiveEntity` is included in the key but is not needed here as the Spreadsheet Importer will determine the state of the object.

1. Download the data with the Spreadsheet Importer and include the keys.
2. Edit the spreadsheet
3. Upload the data with the Spreadsheet Importer.

## Potential Problems

If you download the data with the Spreadsheet Importer, only the active entities are downloaded. If you then update the data, the object will be updated in the current state that the object is in.

## Configuration

| Option | Description | Details |
| ------ | --- | --- |
| `fullUpdate` | Update all properties of the object | boolean |


## Full Update

If `fullUpdate` is set to `true`, the component will update all properties of the object.

If `fullUpdate` is set to `false`, the component will only update the properties that have changed.