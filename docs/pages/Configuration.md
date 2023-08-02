## Options

How to use them see [Example Code](#example-code)

These options are available and explained in detail below:

| Option | Description | Details |
| ------ | --- | --- |
| `context` | Context to access App APIs - **mandatory**  | object |
| `columns` | Defines which fields should only be taken into account | string[] |
| `spreadsheetFileName` | Defines the file name when a template is downloaded | string |
| `tableId` | ID of table to upload the data to  | string |
| `odataType` | OData Type of specified table | string |
| `mandatoryFields`  | The selected fields are checked to see if they are present | string[] |
| `fieldMatchType` | Defines what type of strategy is executed when matching spreadsheet columns | string |
| `activateDraft` | Determines whether a draft should be activated immediately  | boolean |
| `batchSize` | Determines bach sizes send to backend server  | integer |
| `standalone` | Mode if you do not have a table and want to do the processing yourself  | boolean |
| `strict` | The strict option controls the availability of the `Continue` button in the error dialog.  | boolean |
| `decimalSeparator` | Determines the decimal separator for numbers as string.  | string |
| `hidePreview` | Hide the button to preview the uploaded data in the table dialog.  | boolean |
| `skipMandatoryFieldCheck` | Skip check if fields with `mandatory` are not filled in spreadsheet file. | boolean |
| `showBackendErrorMessages` | Show Backend Error Messages | boolean |
| `showOptions` | Show Options Menu to change a few of these configurations in runtime. | boolean |
| `availableOptions` | List of available Options to show to the user. | string[] |
| `hideSampleData` | Leave the template file empty and do not add any sample data | boolean |
| `sampleData` | Add a array of objects with sample data for the template | object |
| `useTableChooser` | Open a table chooser dialog if multiple tables in view | boolean |
| `debug` | Option to show more console statements and set Log Level to Debug | boolean |

### `columns`

**default:** all fields  
This option defines which fields should only be taken into account during the upload.  
**example:**

````
columns: ["ID", "Birthday","FirstName","LastName"],
````

### `spreadsheetFileName`

**default:** Template.xlsx  
This option defines the file name when a template is downloaded.  
If not defined, code checks if Label for OData Type defined.

### `tableId`

This plugin checks first whether exactly one table exists in an object page.
If there is no table or more than one table, an error is returned.  
In case of error, the ID of the table can be specified.  
**example:**  

````
tableId: "ui5.isu.msb.createmeterread::RunObjectPage--fe::table::_Ableseauftrag::LineItem-innerTable
````

### `odataType`

This plugin attempts to read the OData type from the table.
In case of error, the OData Type can be specified.  
**example:**

````
odataType: com.sap.gateway.srvd.zui_mr_create_run.v0001.AbleseauftragType
````

### `mandatoryFields`

The selected fields are checked to see if they are present in the Spreadsheet file.
If not defined, they will not be checked.  
**example:**

````
mandatoryFields: ["product_ID", "quantity"]`
````

### `fieldMatchType`

**default:** `labelTypeBrackets`

Options:  

- `label`  
- `labelTypeBrackets`

In some cases, the labels of different attributes may be identical to each other.  
In order to assign the correct labels and types, there is an option to make the type visible in the header.  
This way a correct assignment can be made.

Default (with `label`) the header columns would look like this: `ID, Birthday, First Name, Last Name`  
With `labelTypeBrackets` the header columns would look like this: `ID[ID], Birthday[birth_day], First Name[FirstName], Last Name[LastName]`

### `activateDraft`

**default:** `false`

This option defines in draft scenarios whether a draft should be activated immediately or not.  
The option only defines whether the attempt should be started. If a draft activation is basically not possible, it will not be executed and may lead to errors.  
This is useful e.g. in a list report. If this option is set to `false`, all uploaded units have to be activated manually.

!!! warning
        Draft Activation for OData V2 in **OpenUI5** is not supported.

### `batchSize`

**default:** `1.000`

Options:  

- `0` : Payload will not be divided

For large files it is necessary to split batch requests and not to send them all at once. This batchSize option enables you to control the number of records processed in each batch request, which can help avoid memory issues and improve performance.

When the number of lines in the Spreadsheet file exceeds the specified batchSize, the payload array is divided into equal parts, with each part containing the maximum number of lines specified by the batchSize. The application then processes each part separately, sending batch requests to the backend server.

The default value is 1,000, which means that when the number of lines in the Spreadsheet file exceeds 1,000, the payload array will be divided into equal parts, and each part will be sent as a separate batch request.

If you set the batchSize to 0, the payload array will not be divided, and the entire array will be sent as a single batch request.

### `standalone`

**default:** `false`

This option defines whether the plugin should be used in standalone mode or not.  
If this option is set to `true`, no table is searched and therefore no context is needed.  
The mandatory parameter `context` and the parameter `tableId` is no longer necessary.

If you want to use the template download function, you have to set the parameter `columns`, otherwise the `Download Template` button will not be displayed.  
The `payload` will be a array of objects with the keys named like the `columns` parameter.

**Example:**

````javascript
this.spreadsheetUpload.attachUploadButtonPress(function (oEvent) {
        const model = this.getModel("tableData");
        model.setData(oEvent.getParameter("payload"));
}, this);
````

An example of an implementation to display data of an Spreadsheetupload in a freestyle app can be found here:

[UploadToTable.controller.js](https://github.com/marianfoo/ui5-cc-spreadsheetimporter/blob/main/examples/packages/ordersv2freestylenondraft/webapp/controller/UploadToTable.controller.js)  
[UploadToTable.view.xml](https://github.com/marianfoo/ui5-cc-spreadsheetimporter/blob/main/examples/packages/ordersv2freestylenondraft/webapp/view/UploadToTable.view.xml)

### `strict`

**default:** `false`

When strict is set to its default value (false), the "Continue" button is displayed in the error dialog, allowing users to proceed despite encountering errors in the uploaded data.  

This option defines whether the "Continue" button should be displayed in the error dialog or not. When set to true, the "Continue" button will not be displayed, and users must resolve the errors before proceeding with the next steps in the application.

### `decimalSeparator`

**default:** Browser Default

This option defines the decimal separator for numbers as string.  
This option is only needed if in the Spreadsheet File are numbers as strings or when importing a CSV. When the datatype in the Spreadsheet File is number, the decimal separator is automatically recognized.

### `hidePreview`

**default:** `false`

This option defines whether the button to preview the uploaded data in the table dialog should be hidden or not.

### `skipMandatoryFieldCheck`

**default:** `false`

This options defines wether mandatory fields defined in the metadata should be checked or not.  
Only the option `mandatoryFields` will be checked.

### `showBackendErrorMessages`

**default:** `false`

This option defines whether backend error messages should be displayed or not.  
In Fiori Elements scenarios, the error messages are displayed automatically. In FreeStyle scenarios, the error messages are not displayed automatically.  
If this option is set to `false`, only the error message `Error while uploading data` will be displayed.

### `showOptions`

**default:** `false`

This option defines whether the button to show the options dialog should be displayed or not.  
Currently, the menu is more for the development process.
Later, this should also be able to be used by the user.  
There are also only a few selected configurations available.

### `availableOptions`

**default:** `[]`

#### Available Options

- `strict`
- `fieldMatchType`
- `decimalSeperator`

This Option defines which option the user can influence.

### `hideSampleData`

**default:** `false`

Leave the template file empty and do not add any sample data.

### `sampleData`

**default:** Using generated sample data

This option defines the sample data that is displayed in the template file.  
If no sample data is defined, the sample data is generated automatically.  
Add a object array using the propeerty names as attribute.

**Example:**

```javascript
sampleData: [
        {
            product_ID: "HT-1000",
            quantity: 1,
            title: "Notebook Basic 15",
            price: 956,
            validFrom: new Date(),
            timestamp: new Date(),
            date: new Date(),
            time: new Date(),
            boolean: true,
            decimal: "1.1"
        }
    ]
```

### `useTableChooser`

**default:** `false`

This option defines whether the table chooser should be used or not.  
If set to true and multiple tables in the view, the user can choose the table to upload the data to.  
It is also possible to set different options for each table (see [TableChooser](TableChooser.md))

### `debug`

**default:** `false`

This option defines whether the debug mode should be activated or not.  
If set to true, it will set the log level to `debug` (Log.Level.DEBUG) and activate the options menu with all options available.

## Example Code

### All options

You can assign all the options when creating the component.  

```js
this.spreadsheetUpload = await this.getView().getController().getAppComponent().createComponent({
    usage: "spreadsheetImporter",
    async: true,
    componentData: {
        context: this,
        tableId: "ui.v4.ordersv4fe::OrdersObjectPage--fe::table::Items::LineItem-innerTable",
        columns: ["product_ID", "quantity", "title", "price", "validFrom", "timestamp", "date", "time", "boolean", "decimal"],
        mandatoryFields: ["product_ID", "quantity"],
        spreadsheetFileName: "Test.xlsx",
        odataType: "com.sap.gateway.srvd.zui_mr_create_run.v0001.AbleseauftragType",
        fieldMatchType: "label",
        activateDraft: false,
        batchSize: 1000,
        standalone: false,
        strict: false,
        decimalSeparator: ",",
        hidePreview: false,
        skipMandatoryFieldCheck: false,
        showBackendErrorMessages: false,
        showOptions: false,
        availableOptions: ["strict", "fieldMatchType", "decimalSeperator"],
        hideSampleData: false,
        debug: false
    }
});

```

### Change options after creating the component

You can also change the options after creating the component or pass them to the `openSpreadsheetUploadDialog` method.

```js
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

You can also just change a subset of the options or overwrite them.

```js
const options = {
    tableId: "ui.v4.ordersv4fe::OrdersObjectPage--fe::table::Shipping::LineItem-innerTable",
    hidePreview: true,
    skipMandatoryFieldCheck: true
   }
this.spreadsheetUploadTableShipping = await this.editFlow.getView()
    .getController()
    .getAppComponent()
    .createComponent({
    usage: "spreadsheetImporter",
    async: true,
    omponentData: {
    context: this,
    hidePreview: false
}
    });
this.spreadsheetUploadTableShipping.setBatchSize(500)
this.spreadsheetUploadTableShipping.openSpreadsheetUploadDialog(options);
```
