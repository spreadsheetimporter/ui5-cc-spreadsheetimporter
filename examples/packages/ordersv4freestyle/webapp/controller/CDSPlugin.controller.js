sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/model/odata/v4/ODataModel",
    "sap/ui/core/BusyIndicator"
  ], function (Controller, MessageToast, ODataModel, BusyIndicator) {
    "use strict";
  
    // Define a group ID for batch requests if explicit control is needed
    const UPLOAD_GROUP_ID = "uploadGroup"; 
  
    return Controller.extend("ordersv4freestyle.controller.CDSPlugin", {
  
      onInit: function () {
        // Determine the base URL for services (different for localhost)
        var sServiceUrl = "/odata/v4/importer/";
        if (window.location.hostname === "localhost") {
           // When running UI locally but using a remote service on port 4004
           // uncomment below line and comment the next line if you need absolute URLs
           // sServiceUrl = "http://localhost:4004/odata/v4/importer/";
           
           // We're assuming server-relative URLs work because UI app and backend
           // are served from the same origin or proper CORS is configured
           console.log("Running on localhost, service URLs will be relative or configured in proxy");
        }
        
        // Create a dedicated model for the ImporterService
        // Using synchronizationMode "None" allows explicit batch control via submitBatch
        this.oImporterModel = new ODataModel({
          serviceUrl: sServiceUrl,
          synchronizationMode: "None", 
          groupId: "$auto", // Default group for reads
          updateGroupId: UPLOAD_GROUP_ID, // Default group for updates (including setValue)
          operationMode: "Server"
        });
        
        // Log model configuration
        console.log("ImporterService model created with serviceUrl:", sServiceUrl);
        
        // Set the model on the view if you need to access it declaratively
        this.getView().setModel(this.oImporterModel, "importerService");
      },
  
      onNavBack: function () {
        this.getOwnerComponent().getRouter().navTo("RouteMainView", {}, true);
      },
  
      // Prevent default file uploader "Upload" button
      uploadButtonPress: function(oEvent) {
        oEvent.preventDefault();
      },
  
      // File selected in FileUploader
      preFileProcessing: function(oEvent) {
        oEvent.preventDefault(); // stop FileUploader's built-in upload
        var file = oEvent.getParameter("file");
        MessageToast.show("Selected file: " + file.name);
  
        // Send to CAP backend using the direct XMLHttpRequest approach
        this.sendFileToCAPBackend(file);
      },
  
      // Reads the file and uploads it directly using XMLHttpRequest (without OData APIs)
      sendFileToCAPBackend: function(file) {
        var that = this;
        // Define the upload URL (base service URL + entity path + content property)
        var sEntityId = "OrdersService.Orders"; // Unique ID for the Spreadsheet entity
        
        // Get the serviceUrl from the model (handles localhost automatically based on onInit config)
        var sBaseUrl = "";
        if (this.oImporterModel && this.oImporterModel.sServiceUrl) {
          // Remove trailing slash if present (oImporterModel.sServiceUrl often has it)
          sBaseUrl = this.oImporterModel.sServiceUrl.replace(/\/$/, "");
        }
        
        // Remove 'odata/v4/importer' from sBaseUrl if present, as it's already in the path below
        if (sBaseUrl.endsWith("odata/v4/importer")) {
          sBaseUrl = sBaseUrl.substring(0, sBaseUrl.length - "odata/v4/importer".length);
        }
        
        var sUploadUrl = sBaseUrl + "odata/v4/importer/Spreadsheet(ID='" + encodeURIComponent(sEntityId) + "')/content";
        
        console.log("Base URL:", sBaseUrl);
        console.log("Computed upload URL:", sUploadUrl);
        
        // First, ensure entity exists before attempting the upload
        this._ensureEntityExists(sEntityId).then(function() {
            // Once entity exists, perform the direct upload using XMLHttpRequest
            that._uploadFileWithXHR(file, sUploadUrl);
        }).catch(function(oError) {
            console.error("Error ensuring spreadsheet entity exists:", oError);
            MessageToast.show("Upload preparation failed: " + (oError.message || oError));
        });
      },
  
      // Helper: Ensures the spreadsheet entity exists, creates it if it doesn't
      _ensureEntityExists: function(sEntityId) {
        var that = this;
        var sEntityPath = "/Spreadsheet(ID='" + encodeURIComponent(sEntityId) + "')";
        var oContext = this.oImporterModel.bindContext(sEntityPath).getBoundContext();
        
        return new Promise(function(resolve, reject) {
          // Try to fetch the entity, resolves if it exists
          oContext.requestObject().then(function() {
            console.log("Entity with ID", sEntityId, "exists.");
            resolve();
          }).catch(function(oError) {
            // If entity doesn't exist (404), create it
            if (oError.status === 404 || (oError.getMessages && oError.getMessages().some(msg => msg.getCode() === "404"))) {
              console.log("Entity with ID", sEntityId, "does not exist. Creating it...");
              
              // Create the entity using list binding with $count
              var oListBinding = that.oImporterModel.bindList("/Spreadsheet", undefined, undefined, undefined, {$count : true});
              var oCreationContext = oListBinding.create({ ID: sEntityId }, true, UPLOAD_GROUP_ID, false);
              
              // Submit the batch to create the entity
              that.oImporterModel.submitBatch(UPLOAD_GROUP_ID).then(function() {
                console.log("Entity creation successful:", sEntityId);
                resolve();
              }).catch(function(oCreateError) {
                console.error("Entity creation failed:", oCreateError);
                reject(oCreateError);
              });
            } else {
              // Some other error occurred
              reject(oError);
            }
          });
        });
      },
  
      // Helper: Uploads file using direct XHR PUT request (similar to sap.m.upload.Uploader)
      _uploadFileWithXHR: function(oFile, sUploadUrl) {
        var that = this;
        var oXhr = new XMLHttpRequest();
        
        // Adjust URL for localhost development (port 4004)
        var sAdjustedUrl = sUploadUrl;
        if (window.location.hostname === "localhost") {
          // If the URL starts with a slash, it's a relative URL that needs the full server base
          if (sUploadUrl.startsWith("/")) {
            sAdjustedUrl = "http://localhost:4004" + sUploadUrl;
            console.log("Running on localhost, adjusted URL to:", sAdjustedUrl);
          }
        }
        
        // Show busy indicator
        BusyIndicator.show(0);
        
        // Configure the XHR request
        oXhr.open("PUT", sAdjustedUrl, true);
        
        // Set Content-Type header based on file type if available
        if (oFile.type) {
          oXhr.setRequestHeader("Content-Type", oFile.type);
        }
        
        // Add any additional headers if needed
        // If using CSRF protection, you might need to get a token first and add it here
        
        // Set up progress event handler (optional)
        oXhr.upload.addEventListener("progress", function(oEvent) {
          if (oEvent.lengthComputable) {
            var fPercentComplete = (oEvent.loaded / oEvent.total) * 100;
            console.log("Upload progress: " + Math.round(fPercentComplete) + "%");
          }
        });
        
        // Set up completion handler
        oXhr.onreadystatechange = function() {
          if (this.readyState === XMLHttpRequest.DONE) {
            BusyIndicator.hide();
            
            if (this.status >= 200 && this.status < 300) {
              // Upload succeeded
              console.log("Upload completed successfully!");
              MessageToast.show("File uploaded successfully!");
              
              // Clear file uploader
              var oFileUploader = that.byId("fileUploader");
              if (oFileUploader) {
                oFileUploader.clear();
              }
            } else {
              // Upload failed
              console.error("Upload failed with status:", this.status, this.statusText);
              console.error("Response:", this.responseText);
              MessageToast.show("Upload failed: " + (this.statusText || "Server error"));
            }
          }
        };
        
        // Handle network errors
        oXhr.onerror = function() {
          BusyIndicator.hide();
          console.error("Network error during upload");
          MessageToast.show("Network error during upload");
        };
        
        // Send the file
        try {
          oXhr.send(oFile);
          console.log("XHR upload started for file:", oFile.name);
        } catch (error) {
          BusyIndicator.hide();
          console.error("Error sending file:", error);
          MessageToast.show("Error starting upload: " + error.message);
        }
      }
  
    });
  });
  