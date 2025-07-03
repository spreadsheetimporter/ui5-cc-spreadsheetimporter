## Quick Setup with GitHub Codespaces

The `postCreateCommand` will automatically install all dependencies.  
This will take a few minutes.

[![Open Stable in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://github.com/codespaces/new?hide_repo_select=true&ref=main&repo=569313224&machine=basicLinux32gb&devcontainer_path=.devcontainer%2Fdevcontainer.json&location=WestEurope)

## Local Setup

### Requirements

- Node.js Versions 16.18.0, 18.12.0, or later

### Install required NPM Packages

```sh
# Install pnpm if needed
npm i -g pnpm

# Install @sap/cds-dk if needed
npm i -g @sap/cds-dk
```

### Quick start

To quickly start the test environment, see here. See detailed information below.

```sh
git clone https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter
pnpm i
# will run `build` and start CAP Server and FE Apps V4 1.108
npm start
```

### Setup `ui5-cc-spreadsheetimporter`

This is the basic setting-up to continue with the next steps.

```sh
# Clone GitHub Repo
git clone https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter

# Install all packages including for test environment
pnpm i
```

## Start Developing

### Start CAP server

The CAP Server is currently very basic and provides an Order Entity with OrderItems. All the apps will consume from this server.

```sh
# Start CAP Server (serves data for all Test Apps)
npm run start:server
```

### Build Step

The apps get the Spreadsheet Importer Component with the middleware `ui5-middleware-ui5`. With this, no build step is necessary.  
To make this work, in the `ui5-cc-spreadsheetimporter` folder, the dist folder should be empty with only the `.gitkeep` file. If a build step was executed and the dist folder is not empty, the app will only load the built version.

### Start UI5 Apps

Under the folder `./examples/packages` are all the UI5 Apps that are set up for the Consumption of the Custom Control.  
There are five different apps for different scenarios (OData V2 Fiori Elements, V2 Freestyle, V2 FE Non Draft, V4 FE, V4 FPM).  
There are currently only with version `1.136`. For testing, these apps are copied and tested with other maintenance versions including `1.120`, `1.108`, `1.96`, `1.84`, and `1.71`.  
If you want to test with lower maintenance versions, just run this command:  
`npm run copyTestApps`  
This will copy the apps according to this [json file](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/blob/main/dev/testapps.json).

```sh
# Start Test Apps
npm run start:v4fe:108
npm run start:v2fe:108

# Alternative with pnpm
pnpm --filter ordersv2fe108 start
pnpm --filter ordersv4fe108 start

# Run other apps after copying
pnpm --filter ordersv2fe96 start
pnpm --filter ordersv2fe84 start
pnpm --filter ordersv2fe71 start
pnpm --filter ordersv4fe96 start
...
```

### Run wdi5 Tests

To run the wdi5 tests, the CAP server and the corresponding app must already be running.  
You can run the test for the OData V4 UI5 Version 108 with this command:

```sh
npm run test:v4fe:108
```

More Info on the [wdi5 Tests](./wdi5.md) site.

### Commit Message

To create an automatic changelog, we use the [angular commit message guidelines](https://github.com/angular/angular/blob/22b96b9/CONTRIBUTING.md#commit).

The commit starts with the `type` and an optional `scope` like `feat(api)`. Possible types are listed [here](https://github.com/angular/angular/blob/22b96b9/CONTRIBUTING.md#type). Scopes can be freely named or omitted.

A few examples:

- `feat(api): add new create api for customer`
- `fix(api): edge case when customer is from EU`
- `chore(workflow): changed commiting username`
- `docs: typo in readme`
