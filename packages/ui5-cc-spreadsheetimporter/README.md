# UI5 custom control `ui5-cc-spreadsheetimporter`

<div align="left">
  <img src="../../docs/images/Logo_wide.png" alt="UI5 Spreadsheet Importer Logo" width="400">
</div>

A UI5 Module to integrate a Spreadsheet Upload for Fiori Element Apps.  
This control simply enables the mass upload of data, independent of the backend, OData version and Fiori scenario.  
This is made possible by reading the Spreadsheet file and using the standard APIs.  
The control will submit not the file, but just the data from the Spreadsheet File.  
The integration of the control is designed to be as simple as possible and, in the best case, requires no configuration.
****
The aim is to support as many Fiori Scenarios and UI5 Versions as possible.  
See here for all currently [supported Versions](https://docs.spreadsheet-importer.com/pages/SupportVersions/).

![Spreadsheet Upload Dialog](/images/SpreadsheetUploadDialog.png "Spreadsheet Upload Dialog")

## Live Demo

It is possible to try this out directly at:  
https://livedemo.spreadsheet-importer.com/

The app is an OData V4 app with UI5 version 1.136 and a CAP backend.  
The data is reset every hour on the hour.

## Install

```bash
npm install ui5-cc-spreadsheetimporter
```

## Getting Started

You can find the official documentation here:

https://docs.spreadsheet-importer.com/

## Development

You can find the documentation for development here:

https://docs.spreadsheet-importer.com/pages/Development/GettingStarted/

## Changelog

See [CHANGELOG.md](CHANGELOG.md)

## License

Versions 1.x are licensed under Apache License 2.0.

From version 2.0.0 onward, this software is provided under the SpreadsheetImporter Commercial License. Non-production usage (testing/evaluation) is free; production use or embedding/reselling requires a paid license.

For details, visit https://spreadsheet-importer.com/ or contact marian@marianzeis.de.

Note about SheetJS:
This project uses SheetJS Community Edition for processing spreadsheet data:

SheetJS Community Edition -- https://sheetjs.com/

Copyright (C) 2012-present SheetJS LLC

Licensed under the Apache License, Version 2.0 (the "License");  
you may not use this file except in compliance with the License.  
You may obtain a copy of the License at  
http://www.apache.org/licenses/LICENSE-2.0  

Unless required by applicable law or agreed to in writing, software  
distributed under the License is distributed on an "AS IS" BASIS,  
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.  
See the License for the specific language governing permissions and limitations under the License.
