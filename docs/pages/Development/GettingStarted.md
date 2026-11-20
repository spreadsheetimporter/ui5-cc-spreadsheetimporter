## Quick Setup with GitHub Codespaces

The `postCreateCommand` will automatically install all dependencies.  
This will take a few minutes.

[![Open Stable in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://github.com/codespaces/new?hide_repo_select=true&ref=main&repo=569313224&machine=basicLinux32gb&devcontainer_path=.devcontainer%2Fdevcontainer.json&location=WestEurope)

## Local Setup

### Requirements

- Node.js Versions 16.18.0, 18.12.0, or later

### Install required NPM Packages

```sh
# npm is already available by default

# Install @sap/cds-dk if needed
npm i -g @sap/cds-dk
```

### Quick start

To quickly start the test environment, see here. See detailed information below.

```sh
git clone https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter
npm install --legacy-peer-deps
# will run `build` and start CAP Server and FE Apps V4 1.108
npm start
```

### Setup `ui5-cc-spreadsheetimporter`

This is the basic setting-up to continue with the next steps.

```sh
# Clone GitHub Repo
git clone https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter

# Install all packages including for test environment
npm install --legacy-peer-deps
```

## Start Developing

### Start everything in one Launchpad (recommended)

The fastest way to get going is a single command that starts the CAP server **and** serves all the main test apps behind a Fiori Launchpad — no separate terminals or per-app ports:

```sh
npm run start:launchpad
```

This boots `cds watch` and automatically opens the Launchpad at **<http://localhost:4004/launchpad.html>** (the CAP welcome page at <http://localhost:4004/> also gets a "Sandbox Launchpad" link). Every app is mounted into the same CAP process and starts together with the server.

How it works:

- [`cds-plugin-ui5`](https://www.npmjs.com/package/cds-plugin-ui5) mounts every UI5 app that is a (dev)dependency of the CAP server (`examples/packages/server`) at `/<sap.app.id>`.
- [`cds-launchpad-plugin`](https://www.npmjs.com/package/cds-launchpad-plugin) serves the Launchpad and auto-generates a tile for each app from its `sap.app.crossNavigation.inbounds` (the manual link tiles live in `examples/packages/server/app/appconfig.json`).
- The `start:launchpad` script sets `CDS_PLUGIN_UI5_MODULES={}`, which makes the apps serve **from source with live reload** (the regular `cds watch` / Docker live demo serves the pre-built `dist` instead — see [Sample Apps](./SampleApps.md)). As with the standalone flow, keep the `ui5-cc-spreadsheetimporter/dist` folder empty (only `.gitkeep`) so the importer is served live from source — see [Build Step](#build-step) below.

The apps shown in the Launchpad are the ones that are both a devDependency of `examples/packages/server` and have a `crossNavigation.inbounds` entry in their `manifest.json` (currently `ordersv2fe`, `ordersv4fe`, `ordersv4freestyle` and `anyupload`).

> The Launchpad flow is for interactive development. The wdi5 tests still launch each app standalone on its own port (see [Start UI5 Apps](#start-ui5-apps) and [wdi5 Tests](./wdi5.md)).

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

# Alternative with npm workspaces
npm run start --workspace=ordersv2fe108
npm run start --workspace=ordersv4fe108

# Run other apps after copying
npm run start --workspace=ordersv2fe96
npm run start --workspace=ordersv2fe84
npm run start --workspace=ordersv2fe71
npm run start --workspace=ordersv4fe96
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
