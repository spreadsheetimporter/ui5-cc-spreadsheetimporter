# UI5 `ui5-cc-spreadsheetimporter`

This monorepo houses the UI5 Component `ui5-cc-spreadsheetimporter`.

`ui5-cc-spreadsheetimporter` is a UI5 Component designed for the integration of Spreadsheet Upload functionality into Fiori Elements and other UI5 Apps.  
It enables the bulk upload of data, independent of the backend, OData version, and Fiori scenario, by extracting data from an Spreadsheet file and leveraging standard APIs.  
Rather than submitting the file, the control only submits the extracted data.  
The control's integration aims for simplicity, requiring minimal to no configuration in the ideal scenario.

Our goal is to support as many Fiori Scenarios and UI5 Versions as possible. You can see the currently [supported versions here](https://docs.spreadsheet-importer.com/pages/SupportVersions/).

![Spreadsheet Upload Dialog](/images/SpreadsheetUploadDialog.png "Spreadsheet Upload Dialog")

## Getting Started

For documentation, please visit:

https://docs.spreadsheet-importer.com/

## Live Demo

Give this a try directly at:  
https://livedemo.spreadsheet-importer.com/

The demo app uses OData V4 and UI5 version 1.120 with a CAP backend. The data resets every hour on the hour.

# **Support**

If you encounter implementation issues or bugs, you can open an issue [here](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues/new/choose).  

# Development

The development documentation can be found here:

https://docs.spreadsheet-importer.com/pages/Development/GettingStarted/

## Quickstart

1. Clone the repository `git clone https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter`
2. Run `pnpm install`
3. Run server with `pnpm start:server`
4. Start Demo App for example a Fiori Elements App with OData V4 and UI5 1.120 with `pnpm --filter ordersv4fe120 start`

# Changelogs

## Changelog `ui5-cc-spreadsheetimporter`

See the [CHANGELOG.md](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/blob/main/packages/ui5-cc-spreadsheetimporter/CHANGELOG.md)

# License

Versions 1.x (including 1.7.x and below) are licensed under the Apache License 2.0 (see the [v1.x branch](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/tree/v1.x)).

Versions 2.0.0 and above are licensed under the SpreadsheetImporter Commercial License. Non-production use is free; production or resale requires a paid license.

For production or commercial usage, please see https://spreadsheet-importer.com/ or contact marian@marianzeis.de.

# Open in GitHub Codespaces

The postCreateCommand will automatically install all dependencies, which might take a few minutes.

[![Open Stable in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://github.com/codespaces/new?hide_repo_select=true&ref=main&repo=569313224&machine=basicLinux32gb&devcontainer_path=.devcontainer%2Fdevcontainer.json&location=WestEurope)  
