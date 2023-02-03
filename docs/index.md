# UI5 Tooling

!!! warning 
        **This control is still in beta**: Basic functionality is given, but bugs may still occur and APIs may change!


This control simply enables the mass upload of data, independent of the backend, OData version and Fiori scenario.  
This is made possible by reading the Excel file and using the standard APIs.  
The control will submit not the file, but just the data from the Excel File.  
The integration of the control is designed to be as simple as possible and, in the best case, requires no configuration.

[**Get Started**](./pages/GettingStarted.md){: .md-button .md-button--primary .sap-icon-initiative }

See all currently supported OData and UI5 Versions [here](./pages/SupportVersions.md).

## Main Features

 - Upload from List Report/Object Page
 - Upload with or without draft
 - Check for mandatory fields
 - Extension Points for uploading to App or sending to backend
 - Multiversion support in Fiori Launchpad (no central deployment necessary anymore)


### Install

```sh
npm install ui5-cc-excelupload
```
