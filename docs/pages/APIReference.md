

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
| `preFileProcessing`  | Execute custom logic before processing the spreadsheet file starts                                 |
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

#### openWizard

Opens the wizard-based spreadsheet import dialog with guided step-by-step process.

** Available from version `2.2.0` **

##### Usage

You can use this method to open the wizard dialog after creating the component with `useImportWizard: true`.  
Optionally, you can pass the `options` object to override component configuration settings.

##### Parameters

- `options` (optional): Configuration object to override component settings
  - Type: `ComponentData`
  - All [configuration options](Configuration.md) are supported
  - Settings passed here will override the component's initial configuration

##### Return Value

- Returns: `Promise<object>`
  - Resolves with result object containing:
    - `canceled`: Boolean indicating if wizard was canceled
    - `coordinates`: String with final coordinates used
    - `workbook`: XLSX workbook object (if successful)
    - `sheetName`: String with sheet name used
    - `sheetData`: Array with imported data

##### Sample Code

**Basic Usage:**

```javascript
// Open wizard with component's default settings
this.spreadsheetWizard.openWizard().then(function(result) {
    if (!result.canceled) {
        MessageToast.show("Import completed successfully!");
    }
});
```

**With Options:**

```javascript
const options = {
    strict: false,                      // Allow continuing with errors
    mandatoryFields: ["ID", "Name"],    // Override mandatory fields
    batchSize: 100,                     // Override batch size
    showBackendErrorMessages: true,     // Show detailed backend errors
    continueOnError: true               // Continue processing despite errors
};

this.spreadsheetWizard.openWizard(options).then(function(result) {
    if (!result.canceled) {
        console.log("Import completed:", result);
        MessageToast.show(`Imported ${result.sheetData.length} records`);
    } else {
        MessageToast.show("Import was canceled by user");
    }
}).catch(function(error) {
    MessageToast.show("Error: " + error.message);
});
```

**Component Creation with Wizard:**

```javascript
// Create component with wizard enabled
this.spreadsheetWizard = await this.getView()
    .getController()
    .getAppComponent()
    .createComponent({
        usage: "spreadsheetImporter",
        async: true,
        componentData: {
            context: this,
            tableId: "myTableId",
            useImportWizard: true,    // Enable wizard mode
            debug: true
        }
    });

// Open wizard with runtime options
const wizardOptions = {
    columns: ["OrderNo", "buyer", "email"],
    fieldMatchType: "labelTypeBrackets",
    decimalSeparator: ","
};

this.spreadsheetWizard.openWizard(wizardOptions);
```

**ComponentContainer Usage:**

```xml
<core:ComponentContainer
    id="wizardSpreadsheetImporter"
    usage="spreadsheetImporter"
    settings="{
        useImportWizard: true,
        debug: true,
        createActiveEntity: true
    }"
/>
```

```javascript
// In controller
onOpenWizard: function() {
    var oComponent = this.byId("wizardSpreadsheetImporter").getComponentInstance();
    
    const options = {
        strict: true,
        mandatoryFields: ["OrderNo", "buyer"]
    };
    
    oComponent.openWizard(options).then(function(result) {
        // Handle result
    });
}
```

For more details about the wizard, see [Wizard Documentation](Wizard.md).

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

#### setArrayMessages

Sets the messages array, replacing any existing messages.

##### Usage

You can use this method to completely replace the current messages array with a new one. Unlike `addArrayToMessages` which appends messages, this method will overwrite any existing messages.

##### Sample Code

```javascript
this.spreadsheetUpload.attachCheckBeforeRead(function(event) {
    // Create a new messages array
    let messagesArray = [];
    
    // Add validation messages based on your custom logic
    const sheetdata = event.getParameter("sheetData");
    for (const [index, row] of sheetData.entries()) {
        if (someValidationCondition) {
            const message = {
                title: "Validation failed",
                row: index + 2,
                group: true,
                ui5type: "Error"
            };
            messagesArray.push(message);
        }
    }
    
    // Replace all existing messages with the new array
    event.getSource().setArrayMessages(messagesArray);
}, this);
```
