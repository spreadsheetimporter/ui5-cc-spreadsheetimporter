# How it Works

The big advantage of this UI5 component is that it can be used universally with minimal configuration and is independent of the backend implementation.  
This is achieved by reading the files already in the frontend and using the standard UI5 APIs.

## Technical Background

The basis for UI5 ExcelUpload is a reuse component.  
Therefore it is also necessary to define `componentUsages` in the manifest and use `createComponent` in the code.  
This allows among other things that i18n can be used and a component-preload improves the performance of the loading time.  
Accordingly, the use is simple when the component is deployed centrally on an ABAP server.

## Integration into UI5

The component can be integrated very easily because certain things are required.
The most important thing is that the component has access to the context or the view. Without this access it cannot work.
When the component is created, it looks for a table in the view to use the binding of this for the upload.
Thereby also other things are derived like the metadata and the actions for the activation of the drafts.  
If no table or more than two tables are found, the table must be defined in the options.

## Creating Template File

With the metadata we can also find out the entity of the binding and thus create a template file with the labels.

## Extracting the Excel files

To avoid sending the whole file as binary data to the backend, the open source library "SheetJS" is used here to read the data from the Excel file.  
The Excel formats are also converted to OData formats.  
Now that we have the raw data, we can use the ODataListBinding and [`create`](https://ui5.sap.com/#/api/sap.ui.model.odata.v4.ODataListBinding%23methods/create) to send the data to the backend.
