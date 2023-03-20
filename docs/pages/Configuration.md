## Options

These options are available and explained in detail below:

| Option | Description | Details |
| ------ | --- | --- |
| `context` | Context to access App APIs - **mandatory**  | object |
| `columns` | Defines which fields should only be taken into account | string[] |
| `excelFileName` | Defines the file name when a template is downloaded | string |
| `tableId` | ID of table to upload the data to  | string |
| `odataType` | OData Type of specified table | string |
| `mandatoryFields`  | The selected fields are checked to see if they are present | string[] |
| `fieldMatchType` | Defines what type of strategy is executed when matching excel columns | string |
| `activateDraft` | Determines whether a draft should be activated immediately  | boolean |
| `batchSize` | Determines bach sizes send to backend server  | boolean |

### `columns`

**default:** all fields  
This option defines which fields should only be taken into account during the upload.  
**example:**

````
columns: ["ID", "Birthday","FirstName","LastName"],
````

### `excelFileName`

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

The selected fields are checked to see if they are present in Excel.
If not defined, they will not be checked.  
**example:**

````
mandatoryFields: ["product_ID", "quantity"]`
````

### `fieldMatchType`

**default:** `label`

Options:  

- `label`  
- `labelTypeBrackets`

In some cases, the labels of different attributes may be identical to each other.  
In order to assign the correct labels and types, there is an option to make the type visible in the header.  
This way a correct assignment can be made.

Default (with `label`) the header columns would like this: `ID, Birthday, First Name, Last Name`  
With `labelTypeBrackets` the header columns would look like this: `ID[ID], Birthday[birth_day], First Name[FirstName], Last Name[LastName]`

### `activateDraft`

**default:** `false`

This option defines in draft scenarios whether a draft should be activated immediately or not.  
The option only defines whether the attempt should be started. If a draft activation is basically not possible, it will not be executed and may lead to errors.  
This is useful e.g. in a list report. If this option is set to `false`, all uploaded units have to be activated manually.

### `batchSize`

**default:** `1.000`

Options:  

- `0` : Payload will not be divided

For large files, it is necessary to split batch requests and not send them all at once. The batchSize option enables you to control the number of records processed in each batch request, which can help prevent memory problems and improve performance.

When the number of lines in the Excel file exceeds the specified batchSize, the payload array is divided into equal parts, with each part containing the maximum number of lines specified by the batchSize. The application then processes each part separately, sending batch requests to the backend server.

The default value is 1,000, which means that when the number of lines in the Excel file exceeds 1,000, the payload array will be divided into equal parts, and each part will be sent as a separate batch request.

If you set the batchSize to 0, the payload array will not be divided, and the entire array will be sent as a single batch request.
