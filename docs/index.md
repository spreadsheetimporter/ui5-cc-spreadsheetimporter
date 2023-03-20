# UI5 Excel  Upload

!!! warning 
        **This control is still in beta**: Basic functionality is given, but bugs may still occur and APIs may change!


This control enables the mass upload of data and quick creations of records. It supports standard identification.
The usage is independent of the backend, OData version, and Fiori scenario.
Import is made possible by reading the Excel Files and using standard digital APIs.  
The control will not submit the file but just the data from the Excel Files.  
The integration of the control is designed to be as simple as possible and, in the best case, requires no configuration.

[**Get Started**](./pages/GettingStarted.md){: .md-button .md-button--primary .sap-icon-initiative }

See all currently supported OData and UI5 Versions [here](./pages/SupportVersions.md).

## Main Features

 - Upload from List Report/Object Page
 - Uploading with or without draft
 - Check for mandatory fields
 - Extension Points for uploading to Apps and sending to the Backend
 - Multiversion support in Fiori Launchpad (no central deployment necessary anymore)


### Install

```sh
npm install ui5-cc-excelupload
```