!!! warning ""
    ⚠️ This is currently not in further development and might not work. Start on the [Getting Started](/pages/GettingStarted) page instead and use the Fiori [Guided Development](https://help.sap.com/docs/SAP_FIORI_tools/17d50220bcd848aa854c9c182d65b699/0c9e518ecf704b2f80a2bed0eaca60ae.html?locale=en-US).

To make integration easier, you can use a yo generator to avoid manual additional steps in your project.

## Installation

```shell
npm i -g yo
npm i -g generator-ui5-spreadsheetimporter
```

## Usage

Start from your UI5 app and then run:

```shell
yo ui5-spreadsheetimporter
```

## Support

Currently, the generator supports the following scenarios:

| OData Version | List Report | Object Page | Freestyle | Flexible Programming Model |
|--------------|-------------|-------------|-----------|---------------------------|
| V2           |             |             |           |                           |
| V4           |             | :white_check_mark: |           |                           |