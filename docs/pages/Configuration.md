## Options

How to use them see [Example Code](#example-code)

## Configuration Options

The table below summarizes the options available for the UI5 Spreadsheet Importer Component. Detailed explanations and examples for each option are provided in the linked sections.

### File Handling Options

| Option                                        | Description                                                  | Default            | Type                      |
|-----------------------------------------------|--------------------------------------------------------------|--------------------|---------------------------|
| [`columns`](#columns)                         | Defines columns to import and display in the template.       | All fields         | `string[]`                |
| [`excludeColumns`](#excludecolumns)           | Specifies columns to exclude from import and template.       | `[]`               | `string[]`                |
| [`spreadsheetFileName`](#spreadsheetfilename) | Sets the file name when downloading the template.            | `"Template.xlsx"`  | `string`                  |
| [`spreadsheetTemplateFile`](#spreadsheettemplatefile)| Uses a custom template file instead of generating one.      | `""`               | `string` or `ArrayBuffer` |
| [`readAllSheets`](#readallsheets)             | Reads all sheets in standalone mode.                         | `false`            | `boolean`                 |
| [`readSheet`](#readsheet)                     | Reads a specific sheet or shows a sheet selector.            | `0`                | `number` or `string`      |

### UI Customization Options

| Option                                              | Description                                           | Default | Type       |
|-----------------------------------------------------|-------------------------------------------------------|---------|------------|
| [`hidePreview`](#hidepreview)                       | Hides the button to preview uploaded data.            | `false` | `boolean`  |
| [`previewColumns`](#previewcolumns)                 | Specifies columns to display in the preview dialog.   | `[]`    | `string[]` |
| [`showBackendErrorMessages`](#showbackenderrormessages)| Displays backend error messages in the UI.          | `false` | `boolean`  |
| [`showOptions`](#showoptions)                       | Shows a menu to change configurations at runtime.     | `false` | `boolean`  |

### Data Processing Options

| Option                                              | Description                                           | Default         | Type       |
|-----------------------------------------------------|-------------------------------------------------------|-----------------|------------|
| [`batchSize`](#batchsize)                           | Controls the size of batches sent to the backend.     | `1000`          | `number`   |
| [`strict`](#strict)                                 | Controls availability of the "Continue" button in error dialogs. | `false` | `boolean`  |
| [`decimalSeparator`](#decimalseparator)             | Sets the decimal separator for numbers.               | Browser default | `string`   |
| [`mandatoryFields`](#mandatoryfields)               | Specifies mandatory fields to check in the spreadsheet.| Not defined     | `string[]` |
| [`skipMandatoryFieldCheck`](#skipmandatoryfieldcheck)| Skips the check for mandatory fields.                | `false`         | `boolean`  |
| [`skipColumnsCheck`](#skipcolumnscheck)             | Skips the check for unknown columns not in metadata.  | `false`         | `boolean`  |
| [`continueOnError`](#continueonerror)               | Continues processing next batches even after errors.  | `false`         | `boolean`  |

### Advanced Configuration Options

| Option                                            | Description                                               | Default            | Type       |
|---------------------------------------------------|-----------------------------------------------------------|--------------------|------------|
| [`fieldMatchType`](#fieldmatchtype)               | Strategy for matching spreadsheet columns to fields.      | `"labelTypeBrackets"` | `string` |
| [`activateDraft`](#activatedraft)                 | Activates a draft immediately if possible.                | `false`            | `boolean`  |
| [`createActiveEntity`](#createactiveentity)       | Directly creates an active entity in draft scenarios.     | `false`            | `boolean`  |
| [`standalone`](#standalone)                       | Uses the component in standalone mode without a table.    | `false`            | `boolean`  |
| [`useTableSelector`](#usetableselector)           | Allows choosing a table when multiple tables are present. | `false`            | `boolean`  |
| [`hideSampleData`](#hidesampledata)               | Omits sample data in the template file.                   | `false`            | `boolean`  |
| [`sampleData`](#sampledata)                       | Adds custom sample data to the template file.             | Auto-generated     | `object[]` |
| [`debug`](#debug)                                 | Enables debug mode with additional console logs.          | `false`            | `boolean`  |
| [`componentContainerData`](#componentcontainerdata)| Special options for using the component in a `ComponentContainer`.| Not specified     | `object`   |
| [`bindingCustom`](#bindingcustom)                 | Uses a custom OData binding instead of a table binding.   | Not specified      | `object`   |
| [`i18nModel`](#i18nmodel)                         | Uses a custom i18n model to override default texts.       | Not specified      | `object`   |

---

### `columns`

**default:** all fields  
This option defines which fields should only be taken into account during the upload.  
**example:**

````
columns: ["ID", "Birthday","FirstName","LastName"],
````

### `excludeColumns`

**default:** []

You can specify columns to exclude from the import and the template.  
If you have already defined the [`columns`](#columns) property in your configuration, any columns listed in `excludeColumns` will be omitted from the final display.  
This allows you to focus on including only the relevant columns, rather than individually removing each unwanted column

### `spreadsheetFileName`

**default:** Template.xlsx  
This option defines the file name when a template is downloaded.  
If not defined, the code checks if Label for OData Type defined.

### `tableId`

This plugin first checks whether exactly one table exists on an object page.
If there is no table or more than one table, an error is returned.  
In case of an error, the ID of the table can be specified.  
**example:**  

````
tableId: "ui5.isu.msb.createmeterread::RunObjectPage--fe::table::_Ableseauftrag::LineItem-innerTable
````

### `odataType`

With this option, it is possible to upload the data to a different Entity Set in the Service.  
This is helpful when the service from the table is not the actual service where the data should be uploaded.

**example:**

````
odataType: com.sap.gateway.srvd.zui_mr_create_run.v0001.AbleseauftragType
````

````
odataType: Orderservice.OrdersND
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
This way, a correct assignment can be made.

Default (with `label`), the header columns would look like this: `ID, Birthday, First Name, Last Name`  
With `labelTypeBrackets`, the header columns would look like this: `ID[ID], Birthday[birth_day], First Name[FirstName], Last Name[LastName]`

### `activateDraft`

**default:** `false`

This option defines in draft scenarios whether a draft should be activated immediately or not.  
The option only defines whether the attempt should be started. If a draft activation is basically not possible, it will not be executed and may lead to errors.  
This is useful in a list report. If this option is set to `false`, all uploaded units have to be activated manually.  
Will be overwritten by the `createActiveEntity` option.

!!! warning
    Draft Activation for OData V2 in **OpenUI5** is not supported.

### `createActiveEntity`

**default:** `false`

This option defines whether the `IsActiveEntity` property should be inserted into the payload sent to the backend.  
In draft scenarios, you can use this option to create an active entity instead of a draft.  
Check if your backend system supports this.

**ABAP Backend**

There is no information about which backend OData implementation is supported, but a test with RAP on S/4HANA 2021 worked.

**CAP Backend**

The feature to support `IsActiveEntity` was introduced in [`@sap/cds`](https://www.npmjs.com/package/@sap/cds) Version `7.5.3`.  
<https://cap.cloud.sap/docs/releases/changelog/#dec-23-added>  
<https://cap.cloud.sap/docs/releases/archive/2023/dec23#sapui5-mass-edit>  

#### When to use `activateDraft` or `createActiveEntity`

- `activateDraft`: First create a draft and then activate it in two separate requests.
- `createActiveEntity`: Create an active entity directly.

If you create a draft, the determinations are not triggered in the RAP framework, for example. These are only executed when creating directly.
So if you now pass "IsActiveEntity", the entity is created directly and therefore the determinations are also executed.

Of course, creating the draft entity and the subsequent activation takes longer because this is an additional network request.

Together with the option `continueOnError`, it is also possible to create all entities and try to activate the other entities if the draft activation fails.
This means that at least all drafts are available.

### `batchSize`

**default:** `1.000`

Options:  

- `0` : Payload will not be divided

For large files, it is necessary to split batch requests and not to send them all at once. This `batchSize` option enables you to control the number of records processed in each batch request, which can help avoid memory issues and improve performance.

When the number of lines in the Spreadsheet file exceeds the specified `batchSize`, the payload array is divided into equal parts, with each part containing the maximum number of lines specified by the `batchSize`. The application then processes each part separately, sending batch requests to the backend server.

The default value is 1,000, which means that when the number of lines in the Spreadsheet file exceeds 1,000, the payload array will be divided into equal parts, and each part will be sent as a separate batch request.

If you set the `batchSize` to 0, the payload array will not be divided, and the entire array will be sent as a single batch request.

### `standalone`

**default:** `false`

This option defines whether the plugin should be used in standalone mode or not.  
If this option is set to `true`, no table is searched, and therefore no context is needed.  
The mandatory parameter `context` and the parameter `tableId` are no longer necessary.

If you want to use the template download function, you have to set the parameter `columns`, otherwise the `Download Template` button will not be displayed.  
The `payload` will be an array of objects with the keys named like the `columns` parameter.

**Example:**

````javascript
this.spreadsheetUpload.attachUploadButtonPress(function (event) {
        const model = this.getModel("tableData");
        model.setData(event.getParameter("payload"));
}, this);
````

An example of an implementation to display data of a Spreadsheetupload in a freestyle app can be found here:

[UploadToTable.controller.js](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/blob/main/examples/packages/ordersv2freestylenondraft/webapp/controller/UploadToTable.controller.js)  
[UploadToTable.view.xml](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/blob/main/examples/packages/ordersv2freestylenondraft/webapp/view/UploadToTable.view.xml)

### `readAllSheets`

**default:** `false`

This option defines whether all sheets in the Spreadsheet file should be read or not.  
If this option is set to `true`, the `payload` returns an additional parameter with the sheet name.

You can access all the sheet names in the `uploadButtonPress` event.

```javascript
this.spreadsheetUpload.attachUploadButtonPress(function (event) {
    const model = this.getModel("tableData");
    model.setData(event.getParameter("payload")); // <-- example payload
    event.preventDefault();
   }, this);
```

**Example Payload:**

```json
[
    {
        "product_ID": {
            "rawValue": 253,
            "sheetDataType": "n",
            "format": "General",
            "formattedValue": "253",
            "sheetName": "Table1"
        },
        "username": {
            "r": "<t>testUser</t>",
            "h": "testUser",
            "rawValue": "testUser",
            "sheetDataType": "s",
            "format": "General",
            "formattedValue": "testUser",
            "sheetName": "Table1"
        }
    },
    {
        "product_ID": {
            "rawValue": 253,
            "sheetDataType": "n",
            "format": "General",
            "formattedValue": "253",
            "sheetName": "Table2"
        },
        "username": {
            "r": "<t>testUser</t>",
            "h": "testUser",
            "rawValue": "testUser",
            "sheetDataType": "s",
            "format": "General",
            "formattedValue": "testUser",
            "sheetName": "Table2"
        }
    }
]
```

### `readSheet`

**default:** `0`

By default, the first spreadsheet is read.  
With this option, you can specify which spreadsheet should be read with a number (0-based) or a name.  
If the name or number is not found, the first spreadsheet is read.  
Or you can set the option to `XXSelectorXX` to show a selector dialog to choose a sheet.  
If the option `readAllSheets` is set to `true`, this option is ignored.  

- `0` : First Sheet
- `1` : Second Sheet
- `Order` : Sheet with the name `Order`
- `Items` : Sheet with the name `Items`
- `XXSelectorXX` : Selector Dialog to choose a sheet

### `strict`

**default:** `false`

When strict is set to its default value (false), the "Continue" button is displayed in the error dialog, allowing users to proceed despite encountering errors in the uploaded data.  

This option defines whether the "Continue" button should be displayed in the error dialog or not. When set to true, the "Continue" button will not be displayed, and users must resolve the errors before proceeding with the next steps in the application.

### `decimalSeparator`

**default:** Browser Default

This option defines the decimal separator for numbers as a string.  
This option is only needed if there are numbers as strings in the Spreadsheet File or when importing a CSV. When the datatype in the Spreadsheet File is a number, the decimal separator is automatically recognized.

### `hidePreview`

**default:** `false`

This option defines whether the button to preview the uploaded data in the table dialog should be hidden or not.

### `previewColumns`

**default:** `[]`

This option defines which columns should be shown in the preview dialog. This is an array of strings with the property names.

### `skipMandatoryFieldCheck`

**default:** `false`

This option defines whether the mandatory fields defined in the metadata should be checked or not.  
Only the option `mandatoryFields` will be checked.

### `skipColumnsCheck`

**default:** `false`

This option determines whether or not the columns in the Spreadsheet File should be verified.  
For instance, if there is a column named `Test column` in the Spreadsheet File, and this particular column name is absent from the metadata, an error will occur by default.  
However, if there are columns that are not being uploaded to the backend, you can configure this option to `true` in order to bypass the verification process.

### `skipMaxLengthCheck`

**default:** `false`

This option determines whether or not the max length of the columns in the Spreadsheet File should be verified.  
If there is a `maxLength` defined in the metadata, the value in the Spreadsheet File will be checked.

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

This option defines whether the template file should be empty and not have any sample data.  
This will overwrite the [`sampleData`](#sampledata) option.

### `sampleData`

**default:** Using generated sample data

This option defines the sample data that is displayed in the template file.  
If no sample data is defined, the sample data is generated automatically.  
Add an object array using the property names as attributes.  
Only sample data will be visible in the template file, no other generated data.

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

### `spreadsheetTemplateFile`

**default:** `""`

**possible values:**

- local file in the application
- URL to file
- ArrayBuffer

By default, the template is generated with all properties or those defined in the [`columns`](#columns) option.  
If you want to use your own template file, you can use this option to add columns that are not being uploaded to the backend.  
It is recommended to use the [`skipColumnsCheck`](#skipcolumnscheck) option in this case; otherwise, you will get errors.  

For the local file or URL, the filename is used for the download. The config [`spreadsheetFileName`](#spreadsheetfilename) will overwrite this.  
The config [`spreadsheetFileName`](#spreadsheetfilename) will be used for ArrayBuffer value.

**Example:**

**local file in the application**

It will use `sap.ui.require.toUrl` to get the file. So make sure use the correct path, including the namespace of your application.  
Here the namespace is `ui.v4.ordersv4fe`, and the file is located in the `webapp/ext` folder.

`spreadsheetTemplateFile: "ui/v4/ordersv4fe/ext/ListReportOrdersTemplate.xlsx"`

**URL to file**

`spreadsheetTemplateFile: "https://example.com/ListReportOrdersTemplate.xlsx"`

**ArrayBuffer**

```javascript
const path = "https://example.com/ListReportOrdersTemplate.xlsx";

const response = await fetch(sPath);
if (!response.ok) {
    throw new Error("Network response was not ok " + response.statusText);
}
const arrayBuffer = await response.arrayBuffer();

// prettier-ignore
this.spreadsheetUpload = await this.editFlow.getView()
        .getController()
        .getAppComponent()
        .createComponent({
            usage: "spreadsheetImporter",
            async: true,
            componentData: {
                context: this,
                spreadsheetTemplateFile: arrayBuffer
            }
        });
```

### `useTableSelector`

**default:** `false`

This option defines whether the Table Selector should be used or not.  
If set to true and multiple tables in the view, the user can choose the table to upload the data to.  
It is also possible to set different options for each table (see [TableSelector](TableSelector.md))

### `spreadsheetRowPropertyName`

If you want to send the spreadsheet row to the backend, you can define a property name here.  
When the property name is defined, the payload will include the spreadsheet row as an integer with the defined property name.

### `componentContainerData`

The ComponentContainer is a special control that can be used to embed the spreadsheet importer in a view without the need to instantiate it in the controller.  
These are special options that can be used in the ComponentContainer.

#### Configuration

For the event, the method from your view controller is attached to the event.

| Option | Description | Details |
| ------ | --- | --- |
| `buttonText` | Text to be displayed on the button | string |
| `uploadButtonPress` | Event after the upload button is pressed | string |
| `changeBeforeCreate` | Event before data sent to the backend | string |
| `checkBeforeRead` | Event before data is uploaded to the app | string |

#### Example

The method name in my controller belongs to the view and is called `uploadButtonPress`.

````xml
<core:ComponentContainer width="100%" 
usage="spreadsheetImporter" propagateModel="true" async="true" 
settings="{
  standalone:true,
  columns: ['product_ID', 'username'],
  componentContainerData:{
    uploadButtonPress:'uploadButtonPress',
    buttonText:'Excel Upload'
    }
  }" />
````

### `bindingCustom`

**default:** Not specified  
This option allows you to provide custom binding settings for the component. It can be used to override default behavior to search for a table and to use the binding of the table.  
Binding must be a OData binding, either V2 or V4.

**example:**

```javascript
this.spreadsheetUpload = await this.editFlow.getView()
     .getController()
     .getAppComponent()
     .createComponent({
      usage: "spreadsheetImporter",
      async: true,
      componentData: {
       context: this,
       createActiveEntity: false,
       i18nModel: this.getModel("i18n"),
       bindingCustom: this.getView().byId("ui.v4.ordersv4fe::OrdersList--fe::table::Orders::LineItem-innerTable").getBinding("items")
      }
     });
```

### `i18nModel`

You can use your own i18n model to overwrite texts.  

You can see all the available texts in the [i18n files](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/blob/main/packages/ui5-cc-spreadsheetimporter/src/i18n/i18n_en.properties).

You don't have to overwrite all texts, only the ones you want to change. If you don't overwrite a text, the default text will be used.

**Example:**

```javascript
this.spreadsheetUpload = await this.editFlow.getView()
     .getController()
     .getAppComponent()
     .createComponent({
      usage: "spreadsheetImporter",
      async: true,
      componentData: {
       context: this,
       i18nModel: this.getModel("i18n")
      }
     });
```

### `continueOnError`

**default:** `false`

This option defines whether the batch processing should continue if an error occurs.  
If you have, for example, set `batchSize` to 2 and have 4 rows, and an error occurs in the first batch of two rows, the processing will stop. If you set this flag to `true`, the processing will continue, and the second batch of two rows will be processed.  
This may lead to errors in the backend because the first batch of two rows was not processed correctly.  
Use this option with caution.

### `debug`

**default:** `false`

This option defines whether the debug mode should be activated or not.  
If set to true, it will set the log level to `debug` (Log.Level.DEBUG) and activate the options menu with all available options.

## Example Code

### All options

You can assign all the options when creating the component.  

```javascript
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

You can also just change a subset of the options or overwrite them.

```javascript
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
    componentData: {
    context: this,
    hidePreview: false
}
    });
this.spreadsheetUploadTableShipping.setBatchSize(500)
this.spreadsheetUploadTableShipping.openSpreadsheetUploadDialog(options);
```
