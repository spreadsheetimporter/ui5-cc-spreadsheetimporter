!!! danger "Commercial License Required"
    This component is licensed under the SpreadsheetImporter Commercial License since version 2.0.0. For details, see [LICENSE.md](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/blob/main/LICENSE.md). Version 1.x remains Apache 2.0 and free of charge.

# Getting Started

This page shows the quickest way to try the Spreadsheet Importer in your UI5 application. Detailed deployment instructions are available on the [Central Deployment](CentralDeployment.md) page.
For a full integration walkthrough, see [Detailed Setup](DetailedSetup.md).


## Requirements

- Node.js v16.18.0, v18.12.0 or higher
- npm v8.0.0 or higher
- UI5 CLI v3.0.0 or higher

## Installation

### Option A: install from npm

```sh
npm install ui5-cc-spreadsheetimporter
```

Add `resourceRoots` to the `sap.ui5` section of your `manifest.json`:

```json
"resourceRoots": {
  "cc.spreadsheetimporter.v2_1_0": "./thirdparty/customcontrol/spreadsheetimporter/v2_1_0"
}
```

Update your build script to include `--all`:

```json
"scripts": {
  "build": "ui5 build --config=ui5.yaml --all --clean-dest --dest dist"
}
```

### Option B: use jsDelivr CDN

Add the CDN resource path to your `index.html` bootstrap:

```html
<script
  id="sap-ui-bootstrap"
  src="https://sapui5.hana.ondemand.com/resources/sap-ui-core.js"
  data-sap-ui-theme="sap_horizon"
  data-sap-ui-resourceroots='{
    "your.app.namespace": "./",
    "cc.spreadsheetimporter.v2_1_0": "https://cdn.jsdelivr.net/npm/ui5-cc-spreadsheetimporter@1.7.3/dist"
  }'
  data-sap-ui-oninit="module:sap/ui/core/ComponentSupport"
  data-sap-ui-async="true"
  data-sap-ui-frameOptions="trusted">
</script>
```

Always specify the exact version in the CDN URL to ensure consistent behavior.

### Option C: central deployment

For ABAP systems or scenarios where the component should be deployed once for multiple applications, follow the steps in [Central Deployment](CentralDeployment.md).

## Integrate the Component

Add `componentUsages` to your `manifest.json`:

```json
"componentUsages": {
  "spreadsheetImporter": {
    "name": "cc.spreadsheetimporter.v2_1_0"
  }
}
```

If the component is not found during deployment, ensure the `resourceRoots` path is correct or add an entry under `sap.app.embeds`.

### Opening the Upload Dialog

Add a button to your view or object page and call the component as shown below:

```javascript
openSpreadsheetUploadDialog: async function () {
  const uploader = await this.getOwnerComponent().createComponent({
    usage: "spreadsheetImporter",
    async: true,
    componentData: { context: this }
  });
  uploader.openSpreadsheetUploadDialog();
}
```

A live demo and example applications can be found in the [examples folder](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/tree/main/examples).
