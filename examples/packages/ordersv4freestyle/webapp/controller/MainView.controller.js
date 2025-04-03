sap.ui.define([
    "sap/ui/core/mvc/Controller"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller) {
        "use strict";

        return Controller.extend("ordersv4freestyle.controller.MainView", {
            onInit: function () {

            },

            goToSampleApp: function () {
                // open https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/tree/main/examples/packages/ordersv4freestyle
                window.open("https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/tree/main/examples/packages/ordersv4freestyle", "_blank");
            },

            onDownload: async function () {
                this.spreadsheetUpload = await this.getView().getController().getOwnerComponent()
                .createComponent({
                    usage: "spreadsheetImporter",
                    async: true,
                    componentData: {
                        context: this,
                        createActiveEntity: true,
                        debug: false,
                        deepDownloadConfig: {
                            deepLevel: 2,
                            deepExport: true,
                            addKeysToExport: true,
                            showOptions: false,
                            filename: "Orders123",
                            columns : {
                                "OrderNo":{
                                    "order": 1
                                },
                                "buyer": {
                                    "order": 3
                                },
                                "Items": {
                                    "quantity" : {
                                        "order": 2
                                    },
                                    "title": {
                                        "order": 4
                                    }
                                },
                                "Shipping": {
                                    "address" : {
                                        "order": 5
                                    },
                                }
                            }
                        }
                    }
                });

                // this.spreadsheetUpload.attachBeforeDownloadFileProcessing(this.onBeforeDownloadFileProcessing, this);
                // this.spreadsheetUpload.attachBeforeDownloadFileExport(this.onBeforeDownloadFileExport, this);

                this.spreadsheetUpload.triggerDownloadSpreadsheet();
            },

            // onBeforeDownloadFileProcessing: function (event) {
            //     event.getParameters().data.$XYZData[0].buyer = "Customer 123";
            // },

            // onBeforeDownloadFileExport: function (event) {
            //     event.getParameters().filename = "Orders123_modified";
            // },

            onNavToCDSPlugin: function() {
                var oRouter = this.getOwnerComponent().getRouter();
                oRouter.navTo("RouteCDSPlugin");
            },

            onNavToOrders: function() {
                var oRouter = this.getOwnerComponent().getRouter();
                oRouter.navTo("RouteOrdersTable");
            }
        });
    });
