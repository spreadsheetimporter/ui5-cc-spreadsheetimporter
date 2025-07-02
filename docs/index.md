# UI5 Spreadsheet Upload Component

![UI5 Spreadsheet Importer Logo](images/Logo_wide.png){ width="400" .logo-light }
![UI5 Spreadsheet Importer Logo Dark](images/Logo_wide_dark_grey.png){ width="400" .logo-dark }

This component provides functionality for the bulk upload of data and the quick creation of records, with support for standard identification. Its use is independent of the backend, OData version, and Fiori scenario. Importing data is achieved by reading Spreadsheet files and utilizing standard digital APIs. The component does not submit the file itself but instead submits the data extracted from the Spreadsheet files. Its integration is designed to be as simple as possible, ideally requiring no configuration.

[**Get Started**](./pages/GettingStarted.md){: .md-button .md-button--primary .sap-icon-initiative }
[**Live Demo**](https://livedemo.spreadsheet-importer.com/){: .md-button .md-button--secondary .sap-icon-initiative }

For information about the currently supported OData and UI5 Versions, click [here](./pages/SupportVersions.md).  
A quick integration tutorial for this component is available on YouTube [here](https://www.youtube.com/watch?v=dODt9ZWmi4A).

!!! danger "Commercial License Required"
    This component is licensed under the SpreadsheetImporter Commercial License since version 2.0.0. For details, see [LICENSE.md](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/blob/main/LICENSE.md). The version 1.x is licensed under the Apache License 2.0 and remains free of charge but no major updates will be provided.

## Feature Overview

- Supports upload from List Report/Object Page in Fiori Elements with or without draft
- Usable across all Fiori scenarios (Fiori Elements, Freestyle, OpenUI5, V2/V4)
- Includes several frontend checks
- Capability to download a pre-generated Spreadsheet template
- Extension Points for uploading to App or sending to the backend
- Supports multiversion namespace in Fiori Launchpad
- Provides multilanguage support (DE, EN, ES, FR, HI, IT, JA, ZH)
- Option to send to Backend in batch or single requests (batch size configurable)
- Standalone Mode (upload to app without sending to backend)
- Functionality to preview uploaded data
- Automatic draft activation
- Button control for simplified integration

## **Support**

For discussions about the suitability of the component for your use case, you can schedule an appointment [here](https://outlook.office365.com/owa/calendar/UI5ExcelUploadComponent@marianzeis.de/bookings/) free of charge.

If you encounter implementation issues or bugs, you can open an issue [here](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues/new/choose).  
For urgent assistance or special requirements, please schedule an appointment [here](https://outlook.office365.com/owa/calendar/UI5ExcelUploadComponent@marianzeis.de/bookings/) at a fixed rate.

## Live Demo

You can try this component live at:  
<https://livedemo.spreadsheet-importer.com/>

The demo app uses OData V4, UI5 version 1.136, and a CAP backend.  
Data is reset every hour on the hour.

## Blogs

Find a selection of blog posts about this control:

- [Simplifying Spreadsheet Upload in Fiori Elements: The Open Source and Easy-to-Use UI5 Custom Control](https://blogs.sap.com/2023/02/17/simplifying-excel-upload-in-fiori-elements-the-open-source-and-easy-to-use-ui5-custom-control/)
- [Create a UI5 Custom Library with Versioning Using a Multi-Version Namespace](https://blogs.sap.com/2023/03/12/create-a-ui5-custom-library-with-versioning-using-a-multi-version-namespace/)
- [Automating UI5 Testing with GitHub Actions and wdi5 in Multiple Scenarios](https://blogs.sap.com/2023/04/05/automating-ui5-testing-with-github-actions-and-wdi5-in-multiple-scenarios/)
- [Load Data from a Spreadsheet File in UI5 and Display the Data in a Table with this Open Source Component](https://blogs.sap.com/2023/04/13/load-data-from-an-excel-file-in-ui5-and-display-the-data-in-a-table-with-this-open-source-component/)
