

## class spreadsheetimporter Component

### Overview

The `spreadsheetimporter` component provides a way to import data from a spreadsheet into a table in the UI Builder application.

### Constructor

```javascript
createComponent({
    usage: "spreadsheetImporter",
    async: true,
    componentData: {
        context: this,
        tableId?,
        ...OTHER_OPTIONS
      },
});
```

### Properties

more info see [Configuration](./Configuration.md)

### Events

more info see [Events](./Events.md)

| Event                | Description                                                                                        |
| -------------------- | -------------------------------------------------------------------------------------------------- |
| `checkBeforeRead`    | Check data before it is uploaded to the UI5                                                        |
| `changeBeforeCreate` | Change data before it is sent to the backend                                                       |
| `requestCompleted`   | Event when the request is completed                                                                |
| `uploadButtonPress`  | Fired when the `Upload` button is pressed, possible to prevent data from being sent to the backend |

### Methods

#### openSpreadsheetUploadDialog

Opens the spreadsheet upload dialog.

##### Usage

You can use this method to open the spreadsheet upload dialog after creating the component.  
Optionally, you can pass the `options` object to customize the dialog.

##### Sample Code

```javascript
const options = {
    context: this,
    tableId: "ui.v4.ordersv4fe::OrdersObjectPage--fe::table::Shipping::LineItem-innerTable"
   }
this.spreadsheetUploadTableShipping = await this.editFlow.getView()
    .getController()
    .getAppComponent()
    .createComponent({
    usage: "spreadsheetImporter",
    async: true
    });
this.spreadsheetUploadTableShipping.setBatchSize(500)
this.spreadsheetUploadTableShipping.openSpreadsheetUploadDialog(options);
```

#### addArrayToMessages

Adds an array of messages inside a event.

##### Usage

You can use this method to add an array of messages to the event. The messages will be displayed in the error dialog after the execution of the event.

##### Sample Code

```javascript
this.spreadsheetUpload.attachCheckBeforeRead(function(event) {
    // example
    const sheetdata = event.getParameter("sheetData");
    let errorArray = [];
    for (const [index, row] of sheetData.entries()) {
        // Check for invalid price
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
    event.getSource().addArrayToMessages(errorArray);
}, this);
```

#### getMessages

Returns the messages array.

##### Usage

You can use this method to get the messages array from the message handler.
