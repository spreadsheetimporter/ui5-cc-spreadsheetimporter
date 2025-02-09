# Central Deployment of UI5 Spreadsheet Importer

Deploying the UI5 Spreadsheet Importer centrally is the recommended approach. Central deployment simplifies usage for individual developers, as the component becomes readily available across the system.


## Deployment to ABAP System

You can deploy the UI5 Spreadsheet Importer to an ABAP system using one of the following methods:

### Method 1: Using UI5 Carrier App

The **recommended method** is to use a UI5 carrier app. This app contains all required versions of the Spreadsheet Importer component. By deploying this carrier app, all versions become available in the system with a single deployment. The components are registered in the app index through the deployment.

#### Steps:

1\. **Clone the Sample Carrier App Repository**

   A sample carrier app is available [here](https://github.com/spreadsheetimporter/packed-deployment-abap). Clone this repository to your local machine:

   ```sh
   git clone https://github.com/spreadsheetimporter/packed-deployment-abap
   ```

2\. **Follow the Instructions**

   Navigate to the repository's `README.md` file and follow the detailed deployment instructions provided there.

3\. **Use the Component in Your Fiori App**

   After successful deployment, the Spreadsheet Importer component is available for use in your Fiori applications.

#### S/4HANA Public Cloud Considerations

For deployment to **S/4HANA Public Cloud**, you need to make the component available in the SAP Fiori Launchpad (FLP) and assign it to users.

- The `crossNavigation` configuration is already defined in the [carrier app's manifest.json](https://github.com/spreadsheetimporter/packed-deployment-abap/blob/main/webapp/manifest.json#L12-L25).
- Upon deployment, an FLP app descriptor is created.
- You need to create or update an IAM app, add the component to a catalog, and assign it to a role, as explained in this [SAP tutorial](https://developers.sap.com/tutorials/abap-environment-shell-plugin.html#bb4645a0-87b0-4eba-ba11-dd9321a8f781).
- **Important**: Ensure that users have the necessary role assigned; otherwise, they may encounter an error like `"Blocked by UCON"`.

### Method 2: Manual Deployment

If you prefer manual deployment, follow these steps:

1\. **Clone the Repository**

   ```sh
   git clone https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter
   ```

2\. **Install Dependencies**

   Navigate to the cloned directory and install the necessary dependencies:

   ```sh
   pnpm install
   ```

   *or*

   ```sh
   npm install
   ```

3\. **Configure `ui5-deploy.yaml`**

   Update the default [`ui5-deploy.yaml`](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/blob/main/packages/ui5-cc-spreadsheetimporter/ui5-deploy.yaml) file with your deployment settings.

   - **Version Management**: When deploying a new version, use a unique app name to avoid overwriting existing versions. This is automatically handled by the variable `XXXnamespaceShortXXX` in the `ui5-deploy-publish.yaml` file.
   - **Custom App Name**: If you choose to use your own app name, ensure you change it for newer versions to prevent overwriting.

4\. **Set Up Environment Variables**

   - **For Deployment from VS Code**: Rename `.envTEMPLATE` to `.env` and enter your ABAP system username and password.
   - **For Deployment from SAP Business Application Studio (BAS)**: Remove the `credentials` section from the `ui5-deploy.yaml` file.

5\. **Run Deployment**

   Navigate to the package directory and execute the deployment script:

   ```sh
   cd packages/ui5-cc-spreadsheetimporter
   npm run deploy
   ```

## Deployment to HTML5 Repository on BTP

To deploy the UI5 Spreadsheet Importer to the HTML5 Repository on SAP BTP, follow these steps:

1\. **Clone the Repository**

   ```sh
   git clone https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter
   ```

2\. **Install Dependencies**

   ```sh
   pnpm install
   ```

3\. **Optional: Modify `mta.yaml`**

   The `mta.yaml` file is used for deployment to the HTML5 Repository on BTP. If you need to customize deployment settings, you can modify this file accordingly.

4\. **Build the MTA Archive**

   ```sh
   pnpm build:mta
   ```

5\. **Deploy to Cloud Foundry**

   ```sh
   pnpm deploy:cf
   ```

## Consuming the Component in a UI5 App

After deploying the component centrally, you can consume it in your UI5 application without installing it via npm or modifying the `resourceRoots` in `manifest.json`.

- Follow the same steps outlined in the [Getting Started](./../pages/GettingStarted.md) guide, omitting the npm installation and `resourceRoots` configuration.

For consuming apps on SAP BTP, you can refer to this [sample app](https://github.com/spreadsheetimporter/sample-full-btp), which demonstrates deployment to the HTML5 Repository.

### Additional Resources

For more detailed information and guidance, consider reading the following blog posts by [Wouter Lemaire](https://community.sap.com/members/wouter.lemaire):

- [Connecting UI5 Components in BTP Cloud Foundry in the Same Space](https://blogs.sap.com/2023/11/09/connecting-ui5-components-in-btp-cloudfoundry-in-the-same-space/)
- [Connecting UI5 Components in BTP Cloud Foundry Across Spaces](https://blogs.sap.com/2023/11/09/connecting-ui5-components-in-btp-cloudfoundry-across-spaces/)

## Running the App Locally

When the component is deployed centrally, you can still run your app locally. This can be achieved by either installing the component as a development dependency or by consuming the centrally deployed component from the ABAP system.

### Consuming the Component as a Dev Dependency Locally

Simulate the centrally deployed component in your local environment by following these steps:

1\. **Install `cds-plugin-ui5` (If Using CAP Projects)**

   ```sh
   npm install cds-plugin-ui5 --save-dev
   ```

2\. **Install the Component as a Dev Dependency**

   Install the specific version of the component that your app uses:

   ```sh
   npm install ui5-cc-spreadsheetimporter --save-dev
   ```

3\. **Install `ui5-middleware-servestatic`**

   ```sh
   npm install ui5-middleware-servestatic --save-dev
   ```

4\. **Configure `ui5.yaml`**

   Add the following configuration to your `ui5.yaml` file (adjust the version number as needed):

   ```yaml
   server:
     customMiddleware:
       - name: ui5-middleware-servestatic
         afterMiddleware: compression
         mountPath: /resources/cc/spreadsheetimporter/v1_7_0/
         configuration:
           rootPath: "node_modules/ui5-cc-spreadsheetimporter/dist"
   ```

### Consuming the Centrally Deployed Component from ABAP System

To consume the centrally deployed component while developing locally in VS Code or BAS:

1\. **Determine the Component URL**

   Access the App Index to find the URL of the component:

   ```
   <SAP_SYSTEM_URL>/sap/bc/ui2/app_index/ui5_app_info?id=cc.spreadsheetimporter.v1_7_0
   ```

2\. **Configure Proxy Middleware**

   Depending on your setup, use either `fiori-tools-proxy` or `ui5-middleware-simpleproxy` in your `ui5.yaml` file.

   **Using `fiori-tools-proxy`:**

   ```yaml
   server:
     customMiddleware:
       - name: fiori-tools-proxy
         afterMiddleware: compression
         configuration:
           backend:
             - path: /sap
               url: <Cloud Connector or local URL>
               destination: <System Destination Name if in BAS>
             - path: /resources/cc/spreadsheetimporter/v1_7_0
               destination: <System Destination Name if in BAS>
               pathPrefix: /sap/bc/ui5_ui5/sap/<BSP_NAME>/thirdparty/customcontrol/spreadsheetimporter/v1_7_0/
               url: <Cloud Connector or local URL>
   ```

   **Using `ui5-middleware-simpleproxy`:**

   ```yaml
   server:
     customMiddleware:
       - name: ui5-middleware-simpleproxy
         afterMiddleware: compression
         mountPath: /resources/cc/spreadsheetimporter/v1_7_0/
         configuration:
           baseUri: "<SAP_SYSTEM_URL>/sap/bc/ui5_ui5/sap/<BSP_NAME>/thirdparty/customcontrol/spreadsheetimporter/v1_7_0/"
           username: <SAP_USERNAME>
           password: <SAP_PASSWORD>
           query:
             sap-client: '100'
   ```

   **Note**: Replace placeholders like `<SAP_SYSTEM_URL>`, `<BSP_NAME>`, `<SAP_USERNAME>`, and `<SAP_PASSWORD>` with your actual system details.