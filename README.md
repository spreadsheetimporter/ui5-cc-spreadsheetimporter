# UI5 custom control `ui5-cc-excelupload`

> :warning: **This control is still in beta**: It fundamently works, but the APIs are still changing and lot of bugs still be there!

A UI5 Module to integrate a Excel Upload for Fiori Element Apps.  
The module focuses on making integration into existing Fiori element apps as easy as possible, with as little code and configuration as possible.
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

Run `npm install` and `cd examples && pnpm install`.  
For developing, you need to run `npm run build:watch` to have always the latest changes in the `dist` folder.  
Run the test app with `npm run start:sample`

#### Docs

To run the docs locally:

- `docker build . -t mkdocs`
- `docker run --rm -it -p 8000:8000 -v ${PWD}:/docs mkdocs`
