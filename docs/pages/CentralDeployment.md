# Central Deployment

the best way is to deploy the UI5 Spreadsheet Importer centrally on the system. Once deployed, it is much easier for the individual developer to use.

## Deployment to On-Premise ABAP System

The **best way** is to use a carrier UI5 app.  
This app contains all required versions of the Spreadsheet Importer component and with just one deployment all versions are available in the system.   
The components are available in the app index through the deployment.

### UI5 Carrier App

You can find the a sample carrier app [here](https://github.com/spreadsheetimporter/packed-deployment-abap).

Just follow the README.md file in the repository.

After the deployment, you can use the component in your Fiori app.

### Manual deployment

1\. Clone Repo

```sh
git clone https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter
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

For the deployment, you have to change the default [`ui5-deploy.yaml`](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/blob/main/packages/ui5-cc-spreadsheetimporter/ui5-deploy.yaml) to your settings.  
When deploying a new version, it is important to use a different app name. This is always done automatically with a new version.  
For this purpose, the variable `XXXnamespaceShortXXX` in the file `ui5-deploy-publish.yaml` must not be changed.  
If you want to use your own app name, it is important to change the name for newer versions, otherwise other versions will be overwritten.

4\. Set Up Environment Variables (Deployment from VS Code)

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
git clone https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter
```

2\. Install Dependencies

```sh
pnpm install
```

3\. **Optional** Change `mta.yaml`

The `mta.yaml` file is used for deployment to the HTML5 Repository on BTP. If you want to change some settings, you can do it here.

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

For the consuming app in BTP, I have created a [sample app](https://github.com/spreadsheetimporter/sample-full-btp) with the deployment to the HTML5 Repository on BTP.  

You can find more information in the blog posts from [Wouter Lemaire](https://community.sap.com/t5/user/viewprofilepage/user-id/9863):  
[Connecting UI5 Components in BTP CloudFoundry in the same space](https://blogs.sap.com/2023/11/09/connecting-ui5-components-in-btp-cloudfoundry-in-the-same-space/) and [Connecting UI5 Components in BTP CloudFoundry across spaces](https://blogs.sap.com/2023/11/09/connecting-ui5-components-in-btp-cloudfoundry-across-spaces/)