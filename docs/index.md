# UI5 Excel Upload

!!! warning
        **This control is still in beta**: Core functionality is given, but bugs may still occur and APIs may change!

This control enables the mass upload of data and quick creations of records. It supports standard identification.
The usage is independent of the backend, OData version, and Fiori scenario.
Import is made possible by reading the Excel Files and using standard digital APIs.  
The control will not submit the file but just the data from the Excel Files.  
The integration of the control is designed to be as simple as possible and, in the best case, requires no configuration.

[**Get Started**](./pages/GettingStarted.md){: .md-button .md-button--primary .sap-icon-initiative }

See all currently supported OData and UI5 Versions [here](./pages/SupportVersions.md).  
A quick screencast on YouTube how to integrate the control can be found [here](https://www.youtube.com/watch?v=dODt9ZWmi4A).

## Feature Overview

- Upload from List Report/Object Page in Fiori Elements with or without draft
- Usable in all Fiori scenarios (Fiori Elements, Freestyle, OpenUI5, V2/V4)
- Severall frontend checks
- Download pregenerated Excel Template
- Extension Points for uploading to App or sending to backend
- Multiversion namespace support in Fiori Launchpad
- Multilanguage support (CN,DE,EN,ES,FR,IN,IT,JP)
- Send to Backend in batch or single requests (batch size can be configured)
- Standalone Mode (upload to app without sending to backend)
- Preview uploaded data
- automatic draft activation
- button control for easier integration
- generator for instant integration

## Live Demo

It is possible to try this out directly at:  
<https://excelupload.marianzeis.de/>

The app is an OData V4 app with UI5 version 1.108 and a CAP backend.  
The data is reset every hour on the hour.

## Blogs

Here are some blogs about the control:

- [Simplifying Excel Upload in Fiori Elements: The Open Source and Easy-to-Use UI5 Custom Control](https://blogs.sap.com/2023/02/17/simplifying-excel-upload-in-fiori-elements-the-open-source-and-easy-to-use-ui5-custom-control/)
- [Create a UI5 custom library with versioning using a multi version namespace](https://blogs.sap.com/2023/03/12/create-a-ui5-custom-library-with-versioning-using-a-multi-version-namespace/)
- [Automating UI5 Testing with GitHub Actions and wdi5 in multiple scenarios](https://blogs.sap.com/2023/04/05/automating-ui5-testing-with-github-actions-and-wdi5-in-multiple-scenarios/)
- [Load Data from a Excel File in UI5 and display the data in a Table with this Open Source Component](https://blogs.sap.com/2023/04/13/load-data-from-a-excel-file-in-ui5-and-display-the-data-in-a-table-with-this-open-source-component/)
