## Issues

If you encounter any issues that are not covered in this documentation, have suggestions, or ideas for improvements, please create an issue in the GitHub repository:  
[https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues)

## Activate Debug Mode and Copy Error Messages

### Activate Debug Mode

To activate the debug mode, you need to add the following parameter to the URL:  
`?sap-ui-debug=true`

Alternatively, you can set the [`debug`](Configuration.md#debug) parameter to `true` during the initialization of the Spreadsheet Upload component.  
However, this can only be done if the component can be opened, so it's preferable to use the URL parameter if possible.

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

After activating the debug mode, you can copy the console messages from the browser console.  
Make sure to do this after reproducing the error.

1. Open the browser console
2. Right-click on a message and select "Save as"

Save the messages to a file and use it to report an issue.  
Alternatively, you can try selecting all the messages and copying them to a text file.

## Error: `script load error`

If you receive an error similar to the following:

```
ui5loader-dbg.js:1042 Uncaught (in promise) ModuleError: failed to load 'cc/spreadsheetimporter/v1_4_2/Component.js' from resources/cc/spreadsheetimporter/v1_4_2/Component.js: script load error
```

Since the component is designed to always use a specific version, you must ensure that the correct version is used after an update.  
In this example, it appears that the installed version does not match the version defined in the manifest file.  
The application is trying to load version "0.16.3", but the installed version is "0.16.4".
See the configurations for this version below:

### package.json

```json
  "dependencies": {
    "ui5-cc-spreadsheetimporter": "0.16.4"
  }
```

### manifest.json

!!! warning ""
    ⚠️ The `resourceRoots` path "./thirdparty/customcontrol/spreadsheetimporter/v1_4_2" changed from version 0.34.0 to lowercase. Please make sure to use the correct path.


```json
"componentUsages": {
    "spreadsheetImporter": {
        "name": "cc.spreadsheetimporter.v1_4_2"
    }
},
"resourceRoots": {
    "cc.spreadsheetimporter.v1_4_2": "./thirdparty/customcontrol/spreadsheetimporter/v1_4_2"
}
```