# UI5 Excel Upload

!!! warning 
        **This control is still in beta**: Core functionality is given, but bugs may still occur and APIs may change!


This control enables the mass upload of data and quick creations of records. It supports standard identification.
The usage is independent of the backend, OData version, and Fiori scenario.
Import is made possible by reading the Excel Files and using standard UI5 APIs.  
The control will not submit the file but just the data from the Excel Files.  
The integration of the control is designed to be as simple as possible and, in the best case, requires no configuration.

[**Get Started**](./pages/GettingStarted.md){: .md-button .md-button--primary .sap-icon-initiative }

See all currently supported OData and UI5 Versions [here](./pages/SupportVersions.md).  
A quick screencast on YouTube how to integrate the control can be found [here](https://www.youtube.com/watch?v=dODt9ZWmi4A).

## Main Features

 - Upload from Fiori Elements Pages or Freestyle 
 - Uploading with or without draft
 - Check for mandatory fields
 - Extension Points for uploading to Apps and sending to the Backend
 - Multiversion support in Fiori Launchpad (multiple Component Versions side by side)

## Live Demo

It is possible to try this out directly at:  
https://excelupload.marianzeis.de/

The app is an OData V4 app with UI5 version 1.108 and a CAP backend.  
The data is reset every hour on the hour.

### Install

```sh
npm install ui5-cc-excelupload
```