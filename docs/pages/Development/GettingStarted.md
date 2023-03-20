## Requirements
- Node.js Versions 16.18.0, 18.12.0, or later

### Install required NPM Packages

````sh
# Install pnpm if needed
npm i -g pnpm

# Install @sap/cds-dk if needed
npm i -g @sap/cds-dk
````

## Quick start

To quickly start the test environment, see here. See detailed information below.

````sh
git clone https://github.com/marianfoo/ui5-cc-excelUpload
pnpm i
# will run `build` and start CAP Server and FE Apps V4 1.108
npm start
````


## Setup `ui5-cc-excelUpload`

This is the basic setting-up to continue with the next steps.

````sh
# Clone GitHub Repo
git clone https://github.com/marianfoo/ui5-cc-excelUpload

# Install all packages including for test environment
pnpm i

# Build Control to consume via test environment
npm run build
````

## Start Developing

### Run build watch

To start develop, you first run the watch command, to rebuild everytime you change something in the `src` folder.  
The command will rebuild with the UI5 Tooling and place the result in the `dist` folder. The test apps will consume the control from there.  
This will not reload your app automatically, you have to reload the app manually.

````sh
# Run continuous build to watch for changes in `src` folder
npm run build:watch
````

### Start CAP server

The CAP Server is currently very basic and provide a Order Entity with OrderItems. All the apps will consume from this server.

````sh
# Start CAP Server (serves data for all Test Apps)
npm run start:server
````

### Start UI5 Apps

Under the folder `./examples/packages` are all the UI5 Apps that are setup for the Consumption of the Custom Control.  
There are five different apps for differenct scenarios (OData V2 Fiori Elements, V2 Freestyle, V2 FE Non Draft, V4 FE, V4 FPM).  
There are currently only with version `1.108`. For testing, these apps are copied and tested with other maintenance versions.  
If you want to test with lower maintenance versions, just run this command:  
`npm run copyTestApps`  
This will copy the apps according to this [json file](https://github.com/marianfoo/ui5-cc-excelUpload/blob/main/dev/testapps.json).

````sh
# Start Test Apps
npm run start:v4fe:108
npm run start:v2fe:108

# Alternative with pnpm
pnpm --filter ordersv2fe108 start
pnpm --filter ordersv4fe108 start

# Run other apps after coping
pnpm --filter ordersv2fe96 start
pnpm --filter ordersv2fe84 start
pnpm --filter ordersv2fe71 start
pnpm --filter ordersv4fe96 start
...
````

### Run wdi5 Tests

To run the wdi5 tests, the CAP server and the corresponding app must already be running.  
You can run the test for the OData V4 UI5 Version 108 with this command:  
````sh
npm run test:v4fe:108  
````

More Info on the [wdi5 Tests](./wdi5.md) site.

### Commit Message

To create a automatic changelog, we use the [angular commit message guidelines](https://github.com/angular/angular/blob/22b96b9/CONTRIBUTING.md#commit).

The commit starts with the `type` and a optional `scope` like `feat(api)`. Possible types are listed [here](https://github.com/angular/angular/blob/22b96b9/CONTRIBUTING.md#type). Scopes can be freely namend or omitted.

A few examples:

- `feat(api): add new create api for customer`
- `fix(api): edge case when customer is from EU`
- `chore(workflow): changed commiting username`
- `docs: typo in readme`