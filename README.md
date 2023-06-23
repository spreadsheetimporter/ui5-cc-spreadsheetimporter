# UI5 `ui5-cc-excelupload`

This is a monorepo for the UI5 Component `ui5-cc-excelupload`, the Button `ui5-cc-excelupload-button` and the generator to easy integrate the component into your app.

> :warning: **This control is still in beta**: Core functionality is given, but bugs may still occur and APIs may change!

A UI5 Component to integrate Excel Upload for Fiori Element and other UI5 Apps.  
This control simply enables the mass upload of data, independent of the backend, OData version and Fiori scenario.  
This is made possible by extracting the data of the Excel file and using the standard APIs.  
The control will submit not the file, but just the data from the Excel File.  
The integration of the control is designed to be as simple as possible and, in the best case, requires no configuration.

The aim is to support as many Fiori Scenarios and UI5 Versions as possibile.  
See here for all currently [supported Versions](https://marianfoo.github.io/ui5-cc-excelUpload/pages/SupportVersions/).

![Excel Upload Dialog](/images/ExcelUploadDialog.png "Excel Upload Dialog")

## Getting Started

You can find the documentation here:

https://marianfoo.github.io/ui5-cc-excelUpload/

## Live Demo

It is possible to try this out directly at:  
https://excelupload.marianzeis.de/

The app is an OData V4 app with UI5 version 1.108 and a CAP backend.  
The data is reset every hour on the hour.

# **Support**

If you have a use case and just want to discuss whether the component is suitable for it, you can make an appointment [here](https://outlook.office365.com/owa/calendar/UI5ExcelUploadComponent@marianzeis.de/bookings/) free of charge.

If you have problems with the implementation or found a bug, you can always open an issue [here](https://github.com/marianfoo/ui5-cc-excelUpload/issues/new/choose).  
If you need urgent help or have a special requirement, you can make an appointment [here](https://outlook.office365.com/owa/calendar/UI5ExcelUploadComponent@marianzeis.de/bookings/) for a fixed rate.

# Development

You find the documentation for the development here:

https://marianfoo.github.io/ui5-cc-excelUpload/pages/Development/GettingStarted/

## Changelog `ui5-cc-excelupload`

See [CHANGELOG.md](https://github.com/marianfoo/ui5-cc-excelUpload/blob/main/packages/ui5-cc-excelUpload/CHANGELOG.md)

## Changelog `ui5-cc-excelupload-button`

See [CHANGELOG.md](https://github.com/marianfoo/ui5-cc-excelUpload/blob/main/packages/ui5-cc-excelUpload-Button/CHANGELOG.md)

## Changelog `generator-ui5-excelupload`

See [CHANGELOG.md](https://github.com/marianfoo/ui5-cc-excelUpload/blob/main/packages/ui5-cc-excelUpload-Generator/CHANGELOG.md)

## Open in GitHub Codespaces

The postCreateCommand will automatically install all dependencies.  
This will take a few minutes.

[![Open Stable in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://github.com/codespaces/new?hide_repo_select=true&ref=main&repo=569313224&machine=basicLinux32gb&devcontainer_path=.devcontainer%2Fdevcontainer.json&location=WestEurope) 