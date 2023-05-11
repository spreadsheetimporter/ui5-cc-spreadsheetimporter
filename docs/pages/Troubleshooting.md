## Issues

If you have issues that are not covered in this documentation, suggestions or ideas for improvements, just create an issue in the GitHub repository:  
https://github.com/marianfoo/ui5-cc-excelUpload/issues


## Error: `script load error`

A error similar to the following:

`
ui5loader-dbg.js:1042 Uncaught (in promise) ModuleError: failed to load 'cc/excelUpload/v0_16_3/Component.js' from resources/cc/excelUpload/v0_16_3/Component.js: script load error
`

Since the component is designed to always use a specific version, this version must also be used after an update.  
Here it is likely that the installed version does not match the one defined in the manifest version.  
In this Example the application tries to load version "0.16.3", but installed is version "0.16.4".
See below the configurations for this version:

### package.json

```json
  "dependencies": {
    "ui5-cc-excelupload": "0.16.4"
  },
```

### manifest.json

```json
"componentUsages": {
    "excelUpload": {
        "name": "cc.excelUpload.v0_16_4"
    }
},
"resourceRoots": {
      "cc.excelUpload.v0_16_4": "./thirdparty/customControl/excelUpload/v0_16_4"
    },
```


### Button

In the button, the button and the component must also be defined in the resource roots for in-app deployment.  
In the package.json on npmjs.com you can check which version matches the button version.  
For example you can look it up here for version 0.4.2:  
https://www.npmjs.com/package/ui5-cc-excelupload-button/v/0.4.2?activeTab=code