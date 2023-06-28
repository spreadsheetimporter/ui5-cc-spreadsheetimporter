# UI5 custom control `ui5-cc-spreadsheetimporter`

> :warning: **This control is still in beta**: Core functionality is given, but bugs may still occur and APIs may change!

A UI5 Module to integrate a Spreadsheet Upload for Fiori Element Apps.  
This control simply enables the mass upload of data, independent of the backend, OData version and Fiori scenario.  
This is made possible by reading the Spreadsheet file and using the standard APIs.  
The control will submit not the file, but just the data from the Spreadsheet File.  
The integration of the control is designed to be as simple as possible and, in the best case, requires no configuration.

The aim is to support as many Fiori Scenarios and UI5 Versions as possibile.  
See here for all currently [supported Versions](https://docs.spreadsheet-importer.com/pages/SupportVersions/).

![Spreadsheet Upload Dialog](/images/SpreadsheetUploadDialog.png "Spreadsheet Upload Dialog")

## Live Demo

It is possible to try this out directly at:  
https://livedemo.spreadsheet-importer.com/

The app is an OData V4 app with UI5 version 1.108 and a CAP backend.  
The data is reset every hour on the hour.


## Install

```bash
npm install ui5-cc-spreadsheetimporter
```

## Getting Started

You can find the official documentation here:

https://docs.spreadsheet-importer.com/

## Development

You find the documentation for the development here:

https://docs.spreadsheet-importer.com/pages/Development/GettingStarted/

## Changelog

See [CHANGELOG.md](CHANGELOG.md)