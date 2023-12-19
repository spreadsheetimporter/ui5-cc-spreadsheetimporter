# Central Deployment


The foundational concept of the UI5 Spreadsheet upload control's development emphasizes its individual deployment alongside each application. However, an alternative deployment strategy exists, allowing for the control to be centrally hosted on the backend.

Key Points:

- **Version Independence**: The control operates independently of specific versions, enhancing its autonomy and facilitating seamless updates with new versions.
  - **Centralized Deployment Options**:
    1. **ABAP On-Premise System**: Instructions for centralized uploading in an ABAP on-premise environment.
    2. **HTML5 Repository on BTP**: Steps for deploying in an HTML5 repository on SAP Business Technology Platform (BTP).

**Note**: As of the current state, there is no automated process for central deployment. Detailed below are manual instructions for implementing centralized deployment of the UI5 Spreadsheet control.


## Deployment to On-Premise ABAP System

1\. Clone Repo

```sh
git clone https://github.com/marianfoo/ui5-cc-spreadsheetimporter
```

2\. Install Dependencies

```sh
pnpm install
```

or 

```sh
npm install
```

3\. Change `ui5-deploy.yaml`

For the deployment, you have to change the default [`ui5-deploy.yaml`](https://github.com/marianfoo/ui5-cc-spreadsheetimporter/blob/main/packages/ui5-cc-spreadsheetimporter/ui5-deploy.yaml) to your settings.  
When deploying a new version, it is important to use a different app name. This is always done automatically with a new version.  
For this purpose, the variable `XXXnamespaceShortXXX` in the file `ui5-deploy-publish.yaml` must not be changed.  
If you want to use your own app name, it is important to change the name for newer versions, otherwise other versions will be overwritten.

4\. Set Up Enviroment Variables (Deployment from VS Code)

Remove `TEMPLATE` from the `.envTEMPLATE` file and enter your username and password for the ABAP System.  
If you deploy from BAS, remove the `credentials` section in the yaml file.

5\. Run Deployment

```sh
cd packages/ui5-cc-spreadsheetimporter
npm run deploy
```

## Deployment to HTML5 Repository on BTP

1\. Clone Repo

```sh
git clone https://github.com/marianfoo/ui5-cc-spreadsheetimporter
```

2\. Install Dependencies

```sh
pnpm install
```

3\. **Optional** Change `mta.yaml`

The mta.yaml file is used for deployment to the HTML5 Repository on BTP. If you want to change somee settings, you can do it here.

4\. Build MTA

```sh
pnpm build:mta
```

5\. Deploy to Cloud Foundry

```sh
pnpm deploy:cf
```

## Consuming in Fiori App

Perform the same steps as you did in [Getting Started](./../pages/GettingStarted.md).  
It is not necessary to install the control using npm and the entry `resourceRoots` in the `manifest.json`.

For the consuming app in BTP, i have created a [sample app](https://github.com/marianfoo/spreadsheetimporter-btp-example) with the deployment to the HTML5 Repository on BTP.