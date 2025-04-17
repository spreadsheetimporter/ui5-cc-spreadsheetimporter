# CAP CDS Plugin Integration

The UI5 Spreadsheet Importer provides integration with SAP CAP (Cloud Application Programming Model) applications through its CDS plugin. This plugin allows for efficient handling of large Excel files by uploading the entire file directly to the CAP backend for processing, rather than extracting and sending data via standard UI5 APIs.

## Overview

The CDS plugin offers the following benefits:

- **Server-side processing**: The entire Excel file is sent to the backend, where it's processed efficiently
- **Performance optimization**: Significantly improves performance for large Excel files
- **Reduced network traffic**: Only sends the Excel file once instead of multiple OData calls
- **Seamless integration**: Works with both UI5 Spreadsheet Importer components and direct file uploads

## Installation

To use the CDS plugin with your CAP application:

```bash
npm install cds-spreadsheetimporter-plugin --save
```

## Backend Implementation

### 1. Add as dependency in package.json

Make sure the plugin is added to your CAP project's package.json:

```json
{
  "dependencies": {
    "cds-spreadsheetimporter-plugin": "^1.0.3",
    "@sap/cds": "^8.x",
    // other dependencies
  }
}
```

### 2. Import the plugin in your CAP service

Add the plugin to your service CDS file:

```cds
using { sap.capire.orders as my } from '../db/schema';
using from 'cds-spreadsheetimporter-plugin';

service OrdersService {
  entity Orders as projection on my.Orders;
  ...
```

### 3. How the plugin works

The plugin adds a new service endpoint to your CAP application:

```
/odata/v4/importer/Spreadsheet(entity='<CDS_ENTITY_NAME>')/content
```

This endpoint:

1. Accepts Excel file uploads via PUT request
2. Processes the file server-side using the XLSX library
3. Maps spreadsheet columns to entity properties
4. Validates the data against the CDS entity model
5. Inserts the processed data into the database

The CDS definition for the service is:

```cds
service ImporterService {
  entity Spreadsheet {
    key entity: String;
    content: LargeBinary @Core.MediaType : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
  }
}
```

## Integration Methods

There are two ways to use the CDS plugin: via the **UI5 Spreadsheet Importer component** or with a **direct file upload**.

### Method 1: Using UI5 Spreadsheet Importer Component

The simplest approach is to use the UI5 Spreadsheet Importer with the `directUploadConfig` option:

```xml
<core:ComponentContainer
    id="spreadsheetToCAP"
    width="100%"
    usage="spreadsheetImporter"
    propagateModel="true"
    async="true"
    settings="{
        directUploadConfig:{
            enabled: true,
            localhostSupport: true,
            localhostPort: 4004,
            useCdsPlugin: true
        },
        componentContainerData:{
            buttonText:'Excel Upload with CDS Plugin',
            buttonId:'uploadButton'
        }
    }"
/>
```

### Method 2: Direct File Upload

You can also use a standard UI5 FileUploader to send the file directly to the CAP endpoint:

```xml
<u:FileUploader
    id="fileUploader"
    name="myFileUpload"
    uploadUrl="/odata/v4/importer/Spreadsheet(entity='OrdersService.Orders')/content"
    tooltip="Upload your file to the local server"
    httpRequestMethod="Put"
    sendXHR="true"
    uploadOnChange="true"
    style="Emphasized"
    fileType="xlsx"
    placeholder="Choose a file for Upload...">
</u:FileUploader>
```

## Configuration Options

### DirectUploadConfig Options

When using the UI5 Spreadsheet Importer component, the following `directUploadConfig` options are available:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `enabled` | Boolean | `false` | Enables direct upload to the CAP backend |
| `useCdsPlugin` | Boolean | `false` | Indicates that the CAP backend uses the CDS plugin |
| `localhostSupport` | Boolean | `false` | Enables support for localhost development |
| `localhostPort` | Number | `4004` | Port for localhost development |
| `prependPath` | String | `null` | Custom path to prepend to the upload URL |
| `entity` | String | Auto-detected | The CDS entity name for processing the upload |
| `collection` | String | Auto-detected | The collection path for the entity |
| `service` | String | Auto-detected | The service name |

### Backend Processing Options

When calling the endpoint directly, you can include additional parameters:

```
/odata/v4/importer/Spreadsheet(entity='OrdersService.Orders',action='UPDATE')/content
```

| Parameter | Description |
|-----------|-------------|
| `entity` | **Required**. CDS entity name to import data into |

## Complete Example

Here's a complete example using UI5 Spreadsheet Importer with CDS plugin integration:

```xml
<core:ComponentContainer
    id="spreadsheetToCAP"
    width="100%"
    usage="spreadsheetImporter"
    propagateModel="true"
    async="true"
    settings="{
        directUploadConfig:{
            enabled: true,
            useCdsPlugin: true,
            localhostSupport: true,
            localhostPort: 4004
        },
        componentContainerData:{
            buttonText:'Excel Upload with CDS Plugin',
            buttonId:'uploadButton'
        }
    }"
/>
```

## Backend Implementation Details

The plugin's backend implementation:

1. Receives the Excel file as a stream through the OData service
2. Processes the file using the XLSX library
3. Converts spreadsheet data to properly typed entity data
4. Handles associations and relationships based on the CDS model
5. Performs batch insertion into the database

The core processing logic:
- Extracts sheet data using `XLSX.read()`
- Processes data from all sheets or a specific sheet
- Maps column headers to CDS entity properties
- Validates data types against CDS model
- Inserts the processed data into the database