# How it Works

The major advantage of this UI5 component is its universal usability with minimal configuration, and it is independent of the backend implementation.  
This is achieved by reading the files that are already present in the frontend and utilizing the standard UI5 APIs.

## Technical Background

The UI5 SpreadsheetUpload is built on a reuse component, which requires the definition of componentUsages in the manifest and the usage of createComponent in the code.  
This allows for the use of i18n and a component-preload, which enhances the loading time performance.  
When the component is centrally deployed on an ABAP server, the setup is straightforward.

## Integration into UI5

Integrating the component is straightforward as long as the component has access to the context or the view, as without this access, it won't function.  
Upon creation of the component, it searches for a table in the view to utilize the binding for the upload. Other necessary details, such as metadata and draft activation actions, are also derived from the table. If no table or more than two tables are found, the table must be defined in the options.

## Creating the Template File

By utilizing the metadata, the component can identify the entity of the binding and generate a template file with labels.

## Extracting the Spreadsheet Files

To avoid sending the entire Spreadsheet file as binary data to the backend, the component utilizes the open-source library [SheetJS](https://sheetjs.com/) to read data from the file. Additionally, Spreadsheet formats are converted to OData formats. With the raw data at hand, the component can utilize the ODataListBinding and [`create`](https://ui5.sap.com/#/api/sap.ui.model.odata.v4.ODataListBinding%23methods/create) to send the data to the backend.  
Since the standard interfaces are used, the key advantage is the independence from the backend scenario, such as CAP or RAP.

The data is sent as a batch, and to prevent a batch from becoming too large, the data is sent in batches of 1,000 by default.  
The size of the batches can be adjusted in the options.