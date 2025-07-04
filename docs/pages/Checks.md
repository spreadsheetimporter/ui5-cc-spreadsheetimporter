## Error Types

The following types of errors are handled by the UI5 Spreadsheet Upload Control:

- **Mandatory Fields** _(Available since: Initial release)_: The control ensures that all mandatory fields are filled in before submitting data. If a mandatory field is left blank, an error message is displayed.

- **Mandatory Fields Metadata** _(Available since: 0.15.0)_: The control parses the metadata of the entity set and checks if all mandatory fields are filled in before submitting data. If a mandatory field is left blank, an error message is displayed ([CAP Annotation](https://cap.cloud.sap/docs/guides/providing-services#mandatory)).

- **Column Names Mismatch** _(Available since: 0.9.0)_: The control checks if the column names in the uploaded file match the expected column names. If there is a mismatch, such as an additional column that shouldn't be there, an error message is displayed.

- **Data Type Mismatch** _(Available since: Initial release, improved in 0.12.0)_: The control checks if the data types in the uploaded file match the expected data types.

- **Custom Errors** _(Available since: Initial release)_: The control allows you to add custom errors to the error dialog. You can add errors to the `messages` property of the `SpreadsheetUpload` control. After the event, the upload is canceled and the errors are displayed in the Error Dialog (see [Events](./Events.md) for more information).

- **Backend Errors** _(Available since: 0.14.0)_: If the backend service returns an error, it is displayed. In the case of checks during saving (e.g. RAP or CAP), no error is displayed in the draft scenario in Fiori Element Apps as Fiori Element catches these errors.

- **Duplicate Columns** _(Available since: 0.31.0)_: The control checks if the uploaded file contains duplicate columns. If there is a duplicate column, an error message is displayed.

- **Max Length** _(Available since: 0.31.0)_: The control checks if the length of the data in the uploaded file does not exceed the maximum length of the corresponding field. If the length exceeds the maximum length, an error message is displayed.

- **Empty Headers** _(Available since: 1.2.0)_: The control checks if the uploaded spreadsheet contains empty headers (columns labeled "**EMPTY", "**EMPTY_1", etc.). These typically occur when Excel adds empty columns during import. When an empty header is detected, the control displays a warning message indicating the presence of empty columns and providing guidance on the expected start position for data. This check helps ensure data is properly aligned with column headers, especially when using custom start coordinates. This check can be disabled using the `skipEmptyHeadersCheck` configuration option.
