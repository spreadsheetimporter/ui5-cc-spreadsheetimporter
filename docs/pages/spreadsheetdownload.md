# Spreadsheet Deep Download

<!-- prettier-ignore-start -->
!!! warning
    This new feature is available since version 1.5.0 and experimental and may change in the future and currently only available for OData V4.
    If you deep download data, the OData Service need to support `expand`.
<!-- prettier-ignore-end -->

This feature downloads data from the backend and converts it to a Spreadsheet file.

The main difference between this feature and the integrated Spreadsheet Download is that it can download data from multiple sub-entities at once.

For example, if you have Orders and OrderItems, you can download both entities at once and the data will be structured in the Spreadsheet. It is also possible to recursively download data from multiple entities indefinitely.

- Orders
  - OrderItems
    - Info
  - ShippingInfos

This means that you can download all Orders, including the OrderItems, ShippingInfos, and the Info of the OrderItems in one go.

## Configuration

| Option            | Description                                     | Default     | Type            |
| ----------------- | ----------------------------------------------- | ----------- | --------------- |
| `addKeysToExport` | Adds keys to the export file                    | `false`     | boolean         |
| `setDraftStatus`  | Sets the draft status in `IsActiveEntity`       | `false`     | boolean         |
| `filename`        | Defines the filename for the export file        | Entity Name | string          |
| `deepExport`      | Turn on to export of sibling entities           | `false`     | boolean         |
| `deepLevel`       | Defines the level of sibling entities to export | `0`         | number          |
| `showOptions`     | Shows options dialog for users                  | `false`     | boolean         |
| `columns`         | Defines the columns to export                   | `{}`        | object or array |

### Sample Usage

The configuration is done in the `deepDownloadConfig` section of the component data:

```json
componentData: {
    context: this,
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
It is possible to define the order of the columns by using the `order` property.  
To know which columns are available, it is possible to turn on `debug` as an option.
With this option, the `mainEntity` is logged and then you can use it as a reference.

It is also possible to define the columns as an array of strings but only if the deepLevel is 0.

### addKeysToExport

**default:** `false`

This option adds keys (which can be hidden in the UI) to the export, such as GUIDs.

### setDraftStatus

**default:** `true`

If the option `addKeysToExport` is set to `true` the keys, including the `IsActiveEntity` field, are added to the export.  
By default, the field `IsActiveEntity` is set to `false` if the field `HasDraftEntity` is set to `true`.  
This makes it easier to identify which rows have a draft entity for the reupload to update the entities.  
This option is only used if all the `IsActiveEntity` fields should be set to `true` in the export.

### filename

**default:** Entity Name of Root Entity

This option defines the filename for the export XLSX file.

### deepExport

**default:** `false`

This option determines whether sibling entities should be exported as well.  
If the deepExport is set to `false`, the deepLevel is set to `0`.

### deepLevel

**default:** `0`

This option defines how deep sibling entities should be exported.  
If the deepLevel is greater than 0, the columns option must a object.  
If the deepLevel is 0, `deepExport` is set to `false`.  
If the deepLevel is greater than 0, `deepExport` is set to `true`.

### showOptions

**default:** `true`

This option determines whether the options dialog should be shown to the user.

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

## Events

See more details at [Events](Events.md#event-beforedownloadfileprocessing)

### `beforeDownloadFileProcessing`

This event is fired before the data is converted to a spreadsheet file. Use this event to manipulate the data before it is converted.  
You can change directly the data parameter of the event as this is a reference to the data.

### `beforeDownloadFileExport`

This event is fired just before the file is downloaded. Use this event to manipulate the filename or other parameters before the file is downloaded.

## Download Button

Same as the [Button control](./Button.md), the Download Button can be used to trigger the Spreadsheet Download directly in the XML View.  
A sample usage can be found [here](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/tree/main/examples/packages/ordersv4freestyle).  
For the configuration options, see [componentContainerData Configuration](./Configuration.md#componentcontainerdata).

A usage can look like this:

```xml
<mvc:View controllerName="ordersv4freestyle.controller.MainView"
    xmlns:mvc="sap.ui.core.mvc" xmlns:core="sap.ui.core" displayBlock="true"
    xmlns="sap.m">
    <Page id="page" title="{i18n>title}">
        <content>
            <VBox>
                <core:ComponentContainer
                    id="test"
                    width="100%"
                    usage="spreadsheetImporter"
                    propagateModel="true"
                    async="true"
                    settings="{
                    componentContainerData:{uploadButtonPress:'uploadButtonPress',buttonText:'Excel Download',buttonId:'downloadButton',downloadButton:true},
                    deepDownloadConfig:{
                        deepLevel: 0,
                        deepExport: false,
                        addKeysToExport: true,
                        showOptions: false,
                        filename: 'Orders12',
                        columns : ["OrderNo"]
                      }
                    }
                  }"
                />
                <Button id="downloadButtonCode" text="Excel Download Code" press="onDownload"/>
                <Table id="ordersTable" items="{/Orders}">
                    <columns>
                        <Column>
                            <Text text="Order Number"/>
                        </Column>
                        <Column>
                            <Text text="Buyer"/>
                        </Column>
                        <Column>
                            <Text text="Created At"/>
                        </Column>
                    </columns>
                    <items>
                        <ColumnListItem>
                            <cells>
                                <Text text="{OrderNo}"/>
                                <Text text="{buyer}"/>
                                <Text text="{createdAt}"/>
                            </cells>
                        </ColumnListItem>
                    </items>
                </Table>
            </VBox>
        </content>
    </Page>
</mvc:View>

```
