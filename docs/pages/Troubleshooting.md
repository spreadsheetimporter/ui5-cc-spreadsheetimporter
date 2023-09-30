## Issues

If you have issues that are not covered in this documentation, suggestions or ideas for improvements, just create an issue in the GitHub repository:  
<https://github.com/marianfoo/ui5-cc-spreadsheetimporter/issues>

## Activate Debug Mode and Copy Error Messages

### Activate Debug Mode

To activate the debug mode, you have to add the following parameter to the URL:  
`?sap-ui-debug=true`

or set the [`debug`](Configuration.md#debug) parameter in the initialization of the Spreadsheet Upload component to `true`.  
This is only possible if the component can be opened at all, so please use the url parameter if possible.

```js
this.spreadsheetUpload = await this.getView().getController().getAppComponent().createComponent({
    usage: "spreadsheetImporter",
    async: true,
    componentData: {
      context: this,
      debug: true
    }
});
```

### Copy Console Messages

After you have activated the debug mode, you can copy the console messages from the browser console.  
Do this after you have reproduced the error.  

1. Open the browser console
2. Right on a message and select "Save as "

Use this file to report a issue.  
As a alternative, try to select all messages and copy them to a text file.

## Error: `script load error`

A error similar to the following:

`
ui5loader-dbg.js:1042 Uncaught (in promise) ModuleError: failed to load 'cc/spreadsheetimporter/v0_26_1/Component.js' from resources/cc/spreadsheetimporter/v0_26_1/Component.js: script load error
`

Since the component is designed to always use a specific version, this version must also be used after an update.  
Here it is likely that the installed version does not match the one defined in the manifest version.  
In this Example the application tries to load version "0.16.3", but installed is version "0.16.4".
See below the configurations for this version:

### package.json

```json
  "dependencies": {
    "ui5-cc-spreadsheetimporter": "0.16.4"
  },
```

### manifest.json

```json
"componentUsages": {
    "spreadsheetImporter": {
        "name": "cc.spreadsheetimporter.v0_26_1"
    }
},
"resourceRoots": {
      "cc.spreadsheetimporter.v0_26_1": "./thirdparty/customControl/spreadsheetImporter/v0_26_1"
    },
```
