On the Page [Supported Versions](./../SupportVersions.md) you can see which versions are supported.  To make sure all those versions are supported, tests are run with the sample apps.  
I also make these sample apps available to you on the [Live Demo](https://livedemo.spreadsheet-importer.com/launchpad.html#Shell-home).

## Docker

To make the deployment of the sample apps to the server providing the Live Demo easier, I use Docker.  
The Dockerfile is available in the examples folder ([see Dockerfile](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/tree/main/examples/Dockerfile)).
The Dockerfile is created on every push to the main branch ([see GitHub Workflow](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/blob/main/.github/workflows/dockerfile-examples-deploy.yml)), pushed to [the Docker Hub](https://hub.docker.com/r/greatoceandrive/ui5-spreadsheet-importer-examples), and then deployed to the server.  
The Docker image is build for AMD64 and ARM64 platforms.

### How to use the Dockerfile

#### Pull the Docker Image

```sh
docker pull greatoceandrive/ui5-spreadsheet-importer-examples
```

#### Run the Docker Image

```sh
docker run -p 4004:4004 greatoceandrive/ui5-spreadsheet-importer-examples
```


#### Build the Docker Image yourself (optional)

```sh
git clone https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter
cd ui5-cc-spreadsheetimporter
docker build -t ui5-spreadsheet-importer-examples -f examples/Dockerfile .
docker run -p 4004:4004 ui5-spreadsheet-importer-examples
```