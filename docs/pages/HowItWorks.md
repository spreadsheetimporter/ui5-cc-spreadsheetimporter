# How it Works

The big advantage of this UI5 component is that it can be used universally with minimal configuration and is independent of the backend implementation. This is achieved by reading the files already in the frontend and using the standard UI5 APIs.

## Technical Background

The UI5 ExcelUpload is built on a reuse component, which means that componentUsages must be defined in the manifest and createComponent must be used in the code. This allows for the use of i18n and a component-preload, which improves loading time performance. When the component is deployed centrally on an ABAP server, the setup is straightforward.

## Integration into UI5

Integrating the component is straightforward as long as the component has access to the context or the view. Without this access, it won't work. When the component is created, it looks for a table in the view to use the binding for the upload. Other necessary details, such as metadata and draft activation actions, are also derived from the table. If no table or more than two tables are found, the table must be defined in the options.

## Creating Template File

Using the metadata, the component can identify the entity of the binding and create a template file with labels.

## Extracting the Excel files

To avoid sending the entire Excel file as binary data to the backend, the component uses the open source library [SheetJS](https://sheetjs.com/) to read data from the file. Excel formats are converted to OData formats as well. With the raw data in hand, the component can use the ODataListBinding and [`create`](https://ui5.sap.com/#/api/sap.ui.model.odata.v4.ODataListBinding%23methods/create) to send the data to the backend. Since the standard interfaces are used here, the big advantage is also the independence from the backend scenario (e.g. CAP or RAP).

The data is sent as a batch. To prevent a batch from becoming too large, data is sent in 1,000 batches by default.
The size of the batches can be adjusted in the options.