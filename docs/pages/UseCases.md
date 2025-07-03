# Use Cases

## Mass Creation

It is possible to use the Spreadsheet Component with big data sets and spreadsheet files.  
For example, we timed the upload of 10,000 rows.

| Scenario                                                               | Rows   | Time                  |
| ---------------------------------------------------------------------- | ------ | --------------------- |
| CAP, Object Page, Draft Mode, Remote CAP Server                        | 10,090 | 01 Minute 28 seconds  |
| CAP, Object Page, Draft Mode, Local CAP Server                         | 10,090 | 17 seconds            |
| CAP, List Report, Draft Mode incl. Draft Activation, Remote CAP Server | 10,153 | 03 Minutes 49 seconds |
| CAP, List Report, Draft Mode incl. Draft Activation, Local CAP Server  | 10,153 | 50 seconds            |

Obviously, the time depends on the network speed and the server performance.  
Also, if you use draft activation, the time will increase as the draft activation takes some time.  
The times are measured with the default batch size of 1000 rows. Changing the batch did not improve performance in our tests. Setting the batch size too high or disabling the batch upload can lead to memory issues and server errors.

## Quick Data Entry for Custom Tables with Fiori Elements

One of the advantages of the UI5 SpreadsheetUpload component is its ability to quickly add data to custom tables in combination with Fiori Elements.

With the template file in hand, users can simply fill in the necessary data in the Spreadsheet and then use the UI5 SpreadsheetUpload component to upload the data to the custom table in SAP. This can be a huge time-saver for projects that require frequent data entry, such as inventory management or order processing.

In addition to simplifying the data entry process, the UI5 SpreadsheetUpload component also allows for advanced data validation and manipulation. For example, developers can define event handlers to check data for errors before it is uploaded or to transform data to conform to the target data model.

## Data Migration

Data migration is a common scenario where the UI5 SpreadsheetUpload component can be useful. Companies often need to migrate data between systems, and a Spreadsheet is a common format for storing data. The component can simplify the process of uploading large Spreadsheet files containing data for migration. Especially useful is the export feature of tables in Fiori Elements, as the Spreadsheet export files can usually be uploaded again directly.

When using the UI5 SpreadsheetUpload component for data migration, there are a few things to keep in mind. First, since the component reads the Spreadsheet files on the frontend, it's important to ensure that the files are properly formatted and contain the correct data before uploading them to the system. Second, since the data is sent in batches, it's important to adjust the batch size accordingly to prevent the batch from becoming too large and causing issues during migration. Finally, it's important to ensure that the data is properly validated and processed on the backend to ensure that it is accurately and securely migrated to the target system.

## Data Validation and Reporting

In addition to data migration, the UI5 SpreadsheetUpload component can also be useful for data validation and reporting scenarios. Companies may need to validate data in Spreadsheet files before uploading it to the system or generate reports from data in Spreadsheet files. The component can allow users to upload Spreadsheet files containing data for validation or reporting purposes, and the data can be processed and validated on the backend to ensure accuracy and security.

## Data Entry

In some cases, users may prefer to enter data into a Spreadsheet file rather than using a web form or UI5 app. The UI5 SpreadsheetUpload component can be used to allow users to upload Spreadsheet files containing data for entry into the system. This can be useful in scenarios where users are more comfortable working with Spreadsheets or need to enter large amounts of data quickly.

## Custom Integrations

Finally, the UI5 SpreadsheetUpload component can be used to build custom integrations with other systems that use Spreadsheet files as a data interchange format. For example, the component could be used to allow users to upload Spreadsheet files to a cloud storage service like Dropbox or Google Drive or to integrate with other third-party systems that use Spreadsheet files for data exchange. With the ability to read and write Spreadsheet files in the frontend, the possibilities for custom integrations are nearly endless.
