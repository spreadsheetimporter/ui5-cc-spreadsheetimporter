# Central Deployment

The basic idea behind the development of the UI5 Excel upload was that the control always be deployed with each app.  
But there is also the possibility to deploy the control centrally on the backend.  
It should be noted that the control is consumed version indipendently. This makes it more independent and a new version can always be deployed.

Currently there is no automatic possibility to do this automatically. Therefore, here are the instructions on how to upload the UI5 Excel centrally in an ABAP on premise system.

## Deployment to On-Premise ABAP System

1\. Clone Repo

```sh
git clone https://github.com/marianfoo/ui5-cc-excelUpload
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

For the deployment, you have to change the default [`ui5-deploy.yaml`](https://github.com/marianfoo/ui5-cc-excelUpload/blob/main/packages/ui5-cc-excelUpload/ui5-deploy.yaml) to your settings.  
When deploying a new version, it is important to use a different app name. This is always done automatically with a new version.  
For this purpose, the variable `XXXnamespaceShortXXX` in the file `ui5-deploy-publish.yaml` must not be changed.  
If you want to use your own app name, it is important to change the name for newer versions, otherwise other versions will be overwritten.

4\. Set Up Enviroment Variables (Deployment from VS Code)

Remove `TEMPLATE` from the `.envTEMPLATE` file and enter your username and password for the ABAP System.  
If you deploy from BAS, remove the `credentials` section in the yaml file.

5\. Run Deployment

```sh
cd packages/ui5-cc-excelUpload
npm run deploy
```

## Consuming in Fiori App

Perform the same steps as you did in [Getting Started](./../pages/GettingStarted.md).  
It is not necessary to install the control using npm and the entry `resourceRoots` in the `manifest.json`.