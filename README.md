# UI5 `ui5-cc-spreadsheetimporter`

This monorepo houses the UI5 Component `ui5-cc-spreadsheetimporter`, the Button `ui5-cc-spreadsheetimporter-button`, and the generator for seamless integration of the component into your app.

> :warning: **Beta Version**: While core functionality is provided, bugs may still occur and APIs may change!

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

The demo app uses OData V4 and UI5 version 1.108 with a CAP backend. The data resets every hour on the hour.

# **Support**

For discussions about the suitability of the component for your use case, you can schedule an appointment [here](https://outlook.office365.com/owa/calendar/UI5ExcelUploadComponent@marianzeis.de/bookings/) free of charge.

If you encounter implementation issues or bugs, you can open an issue [here](https://github.com/marianfoo/ui5-cc-spreadsheetimporter/issues/new/choose).  
For urgent assistance or special requirements, please schedule an appointment [here](https://outlook.office365.com/owa/calendar/UI5ExcelUploadComponent@marianzeis.de/bookings/) at a fixed rate.

# Development

The development documentation can be found here:

https://docs.spreadsheet-importer.com/pages/Development/GettingStarted/

## Quickstart

1. Clone the repository `git clone https://github.com/marianfoo/ui5-cc-spreadsheetimporter`
2. Run `pnpm install`
3. Run server with `pnpm start:server`
4. Start Demo App for example a Fiori Elements App with OData V4 and UI5 1.120 with `pnpm --filter ordersv4fe120 start`

# Changelogs

## Changelog `ui5-cc-spreadsheetimporter`

See the [CHANGELOG.md](https://github.com/marianfoo/ui5-cc-spreadsheetimporter/blob/main/packages/ui5-cc-spreadsheetimporter/CHANGELOG.md)

## Changelog `ui5-cc-spreadsheetimporter-button`

Refer to the [CHANGELOG.md](https://github.com/marianfoo/ui5-cc-spreadsheetimporter/blob/main/packages/ui5-cc-spreadsheetimporter-button/CHANGELOG.md)

## Changelog `generator-ui5-spreadsheetimporter`

Check the [CHANGELOG.md](https://github.com/marianfoo/ui5-cc-spreadsheetimporter/blob/main/packages/ui5-cc-spreadsheetimporter-generator/CHANGELOG.md)

# Open in GitHub Codespaces

The postCreateCommand will automatically install all dependencies, which might take a few minutes.

[![Open Stable in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://github.com/codespaces/new?hide_repo_select=true&ref=main&repo=569313224&machine=basicLinux32gb&devcontainer_path=.devcontainer%2Fdevcontainer.json&location=WestEurope)  
