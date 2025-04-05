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
      },
  
      onNavBack: function () {
        this.getOwnerComponent().getRouter().navTo("RouteMainView", {}, true);
      },
  
    });
  });
  