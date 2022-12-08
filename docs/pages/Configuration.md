## Options

These options are available:

| Option | Description | Details |
| ------ | --- | --- |
| `context` | Context to access App APIs - **mandatory**  | object |
| `columns` | Defines which fields should only be taken into account | string[] |
| `excelFileName` | Defines the file name when a template is downloaded | string |
| `tableId` | ID of table to upload the data to  | string |
| `odataType` | OData Type of specified table | string |
| `mandatoryFields`  | The selected fields are checked to see if they are present | string[] |
| `fieldMatchType` | Defines what type of strategy is executed when matching excel columns | string |

### `columns`

**default:** all fields  
This option defines which fields should only be taken into account during the upload.  
**example:** `columns: ["ID", "Birthday","FirstName","LastName"],`

### `excelFileName`

**default:** Template.xlsx  
This option defines the file name when a template is downloaded.  
If not defined, code checks if Label for OData Type defined.

### `tableId`

Currently it is checked if exactly one table exists in an Object page.
If there is none or more then one, a error is returned.  
In case of error, the ID of the table can be specified.  
**example:** `tableId: "ui5.isu.msb.createmeterread::RunObjectPage--fe::table::_Ableseauftrag::LineItem-innerTable`

### `odataType`

An attempt is currently being made to read the OData type from the table found.
In case of error, the OData Type can be specified.  
**example:** `odataType: com.sap.gateway.srvd.zui_mr_create_run.v0001.AbleseauftragType`

### `mandatoryFields`

The selected fields are checked to see if they are present in Excel.
If not defined, they will not be checked.  
**example:** `mandatoryFields: ["product_ID", "quantity"]`

### `fieldMatchType`

**default:** `label`

Options:  
- `label`  
- `labelTypeBrackets`



It is possible that the labels of different attributes have the same label.  
In order to assign the correct labels and types, there is an option to make the type visible in the header.  
This way a correct assignment can be made.

Default (with `label`) the header columns would like this: `ID, Birthday, First Name, Last Name`  
With `labelTypeBrackets` the header columns would look like this: `ID[ID], Birthday[birth_day], First Name[FirstName], Last Name[LastName]`