## Error Types
The following types of errors are handled by the UI5 Excel Upload Control:

- **Mandatory Fields**: The control ensures that all mandatory fields are filled in before submitting data. If a mandatory field is left blank, an error message is displayed.

- **Column Names Mismatch**: The control checks that the column names in the uploaded file match the expected column names. If there is a mismatch i.e. a additional column that should not be there, an error message is displayed.

- **Data Type Mismatch**: The control checks that the data types in the uploaded file match the expected data types. 
- **Custom Errors**: The control allows you to add custom errors to the error dialog. You can add errors to the `errorResults` property of the `ExcelUpload` control. After the event the upload is canceled and the errors are displayed in the Error Dialog (see [Events](./Events.md) for more information).
- **Backend Errors**: If the backend service returns an error, it is displayed. In case of checks during saving (e.g. RAP or CAP), no error is displayed in the draft scenario in Fiori Element Apps, as Fiori Element catches these errors.