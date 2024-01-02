## Static Site Generator

The documentation is set up with [MkDocs](https://www.mkdocs.org/) and [Material for MkDocs](https://squidfunk.github.io/mkdocs-material/).

## Usage

### Configuration

The configuration is in the [`mkdocs.yml`](https://github.com/marianfoo/ui5-cc-spreadsheetimporter/blob/main/mkdocs.yml) file.  
The pages and images are stored in the [`docs`](https://github.com/marianfoo/ui5-cc-spreadsheetimporter/tree/main/docs) folder.

### Local Setup

To run the docs locally, you can use Docker.  
To build the Docker image, run:  
```sh
docker build . -t mkdocs
```

To run the container:

```sh
docker run --rm -it -p 8000:8000 -v ${PWD}:/docs squidfunk/mkdocs-material
```

or 

```sh
pnpm runDocs
```

and then open http://localhost:8000.

### Prod Build

The Documentation is hosted on GitHub Pages and is rebuilt on every push to the `main` branch using the GitHub Action [`pushDocs.yml`](https://github.com/marianfoo/ui5-cc-spreadsheetimporter/blob/main/.github/workflows/pushDocs.yml) and forcefully pushed to the `gh-deploy` branch.  
The current URL is: https://docs.spreadsheet-importer.com/