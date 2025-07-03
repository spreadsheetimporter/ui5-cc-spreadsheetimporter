# Installing npm Package from GitHub

To install the `@spreadsheetimporter/ui5-cc-spreadsheetimporter-pro` package directly from a GitHub repository, you'll need a personal access token from GitHub and configure npm to use it. Below are the steps:

## 1. Be a member of the GitHub organization [``](https://github.com/)

1. After purchasing the Spreadsheet Importer package, you'll receive an invitation to join the GitHub organization.
2. If you did not receive an invitation, please contact us at [marian@marianzeis.de](mailto:marian@marianzeis.de).

## 2. Generating a Personal Access Token on GitHub

1. Navigate to **GitHub** and log in.
2. Click on your profile picture (top right) and choose **Settings**.
3. In the left sidebar, click on **Developer settings**.
4. Choose **Personal access tokens** from the left sidebar.
5. Click **Generate new token**.
6. Provide a descriptive name for the token in the **Note** field.
7. Under **scopes**, select the `repo` and `read:packages` checkboxes to allow access to private repositories and packages.
8. Click **Generate token**.
9. Copy the generated token. **Note**: This is your only chance to copy the token. If lost, you'll have to create a new one.

## 3. Configuring npm with `.npmrc`

More Information: [Configuring npm for use with GitHub Packages](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry)

You can either set up a project-specific `.npmrc` file or edit the global `~/.npmrc`.

### For Project-specific Configuration

1. Go to your project directory.
2. Create or open the `.npmrc` file.

```
@spreadsheetimporter:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=YOUR_PERSONAL_ACCESS_TOKEN
```

Replace YOUR_PERSONAL_ACCESS_TOKEN with the token you generated in step 2.

Now you can install the package:

```bash
npm install @spreadsheetimporter/ui5-cc-spreadsheetimporter-pro
```

### For Global Configuration

1. Open the `~/.npmrc` file.
2. Add the following line:

```
@spreadsheetimporter:registry=https://npm.pkg.github.com
```

3. Save the file.

Now you can install the package:

```bash
npm install @spreadsheetimporter/ui5-cc-spreadsheetimporter-pro
```

## 4. Using the Package

Now you can start using the package in your project.  
For more information, please refer to the [Getting Started Page](./../GettingStarted.md).

The documentation for pro features is here:

- [Spreadsheet Download](./spreadsheetdownload.md)
