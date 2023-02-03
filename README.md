# UI5 custom control `ui5-cc-excelupload`

> :warning: **This control is still in beta**: Basic functionality is given, but bugs may still occur and APIs may change!

A UI5 Module to integrate a Excel Upload for Fiori Element Apps.  
This control simply enables the mass upload of data, independent of the backend, OData version and Fiori scenario.  
This is made possible by reading the Excel file and using the standard APIs.  
The control will submit not the file, but just the data from the Excel File.  
The integration of the control is designed to be as simple as possible and, in the best case, requires no configuration.

The aim is to support as many Fiori Scenarios and UI5 Versions as possibile.  
See here for all currently [supported Versions](https://marianfoo.github.io/ui5-cc-excelUpload/pages/SupportVersions/).

![Excel Upload Dialog](/images/ExcelUploadDialog.png "Excel Upload Dialog")


## Install

```bash
npm install ui5-cc-excelupload
```

## Getting Started

You can find the official documentation here:

https://marianfoo.github.io/ui5-cc-excelUpload/

## Development

### Commit Message

To create a automatic changelog, we use the [angular commit message guidelines](https://github.com/angular/angular/blob/22b96b9/CONTRIBUTING.md#commit).

The commit starts with the `type` and a optional `scope` like `feat(api)`. Possible types are listed [here](https://github.com/angular/angular/blob/22b96b9/CONTRIBUTING.md#type). Scopes can be freely namend or omitted.

A few examples:

- `feat(api): add new create api for customer`
- `fix(api): edge case when customer is from EU`
- `chore(workflow): changed commiting username`
- `docs: typo in readme`

### Release

**State**: everything is commited

1. [Update Version](https://docs.npmjs.com/cli/v9/commands/npm-version?v=true), create commit and add tag: `npm version  [<newversion> | major | minor | patch | premajor | preminor | prepatch | prerelease | from-git]`  
   1. For example from `0.1.1` to `0.1.2` with `npm version patch`
   2. For example from `0.1.1` to `0.2.0` with `npm version minor`
   3. For example from `0.1.1` to `0.3.4` with `npm version 0.3.3`  
3. push commit and tags to repo: `npm run version:publish`
4. GitHub Workflow will be triggered and npm package published

### Develop

Run `pnpm install`.  
For developing, you need to run `npm run build:watch` to have always the latest changes in the `dist` folder.  
Run the test app (CAP Server and the V4 Fiori Element UI5 App) with `npm start`.  
Look in the `package.json` for more start scripts.  
To use other versions than 1.108, you need to copy the apps with `npm run copyTestApps`.

#### Docs

To run the docs locally:

- `docker build . -t mkdocs`
- `docker run --rm -it -p 8000:8000 -v ${PWD}:/docs mkdocs`
