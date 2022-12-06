sap.ui.define(
	[
		"jquery.sap.global",
		"sap/m/Button",
		"sap/ui/core/UIComponent",
		"sap/ui/model/json/JSONModel",
		"sap/ui/Device",
		"sap/ui/model/Filter",
		"sap/ui/model/FilterOperator",
		"sap/ui/core/Fragment",
		"cc/excelUpload/controller/ExcelUpload.controller",
	],
	function (jQuery, Button, UIComponent, JSONModel, Device, Filter, FilterOperator, Fragment, ExcelUpload) {
		"use strict";

		var Component = UIComponent.extend("cc.excelUpload.Component", {
			metadata: {
				manifest: "json",
				properties: {
					excelFileName: { type: "string", defaultValue: "Template.xlsx" },
					context: { type: "object" },
					columns: { type: "string[]" },
					tableId: { type: "string" },
					odataType: { type: "string" },
					mandatoryFields: { type: "string[]" },
					errorResults: { type: "object" },
				},
				aggregations: {
					rootControl: {
						type: "sap.ui.core.Control",
						multiple: false,
						visibility: "hidden",
					},
				},
				events: {
					checkBeforeRead: {
						parameters: {
							sheetData: { type: "object" },
							errorResults: { type: "object" },
						},
					},
					changeBeforeCreate: {
						parameters: {
							payload: { type: "object" },
						},
					},
				},
			},
		});

		//=============================================================================
		//LIFECYCLE APIS
		//=============================================================================

		Component.prototype.init = async function () {
			var oModel, oCompData;

			oCompData = this.getComponentData();
			// if (typeof oCompData.renderButton === "boolean"){
			// 	this.setRenderButton(oCompData.renderButton);
			// }
			this.setContext(oCompData.context);
			this.setColumns(oCompData.columns);
			this.setTableId(oCompData.tableId);
			this.setOdataType(oCompData.odataType);
			this.setMandatoryFields(oCompData.mandatoryFields);

			// // call the init function of the parent - ATTENTION: this triggers createContent()
			UIComponent.prototype.init.apply(this, arguments);

			// this.excelUpload = await sap.ui.core.mvc.Controller.create({ name:"cc.excelUpload.ExcelUpload"})
			// //now this here would work:
			// //var oRoot = this.getRootControl();

			// // we could create a device model and use it
			oModel = new JSONModel(Device);
			oModel.setDefaultBindingMode("OneWay");
			this.setModel(oModel, "device");
		};

		// Component.prototype.setContextPublic = function(options) {
		//     this.excelUpload.setContext(options)
		// };

		Component.prototype.createContent = function () {
			this.excelUpload = new ExcelUpload(this);

			// var oBtn, oTSD;

			// oTSD = this._getCustomerSelectDialog();

			// if (this.getRenderButton()) {
			// 	oBtn = this._getOpenButton();
			// 	oBtn.addDependent(oTSD);
			// 	return oBtn;
			// }
			// return oTSD;
		};

		//=============================================================================
		//OVERRIDE SETTERS
		//=============================================================================

		// /**
		//  * Overrides method <code>getErrorResults</code> of the component to set this text in the button.
		//  * @override
		//  */
		// Component.prototype.getErrorResults = function (array) {
		// 	return this.excelUpload.getErrorResults();
		// };
		// /**
		//  * Overrides method <code>setErrorResults</code> of the component to set this text in the button.
		//  * @override
		//  */
		// Component.prototype.setErrorResults = function (array) {
		// 	this.excelUpload.setErrorResults(array)
		// 	return this;
		// };

		//=============================================================================
		//PUBLIC APIS
		//=============================================================================

		/**
		 * Opens the dialog for selecting a customer.
		 * @public
		 */
		Component.prototype.openExcelUploadDialog = function () {
			this.excelUpload.openExcelUploadDialog();
		};

		/**
		 * Set Payload for Event
		 * @public
		 */
		Component.prototype.setPayload = function (payload) {
			this.excelUpload._setPayload(payload);
		};

		/**
		 * add to error array
		 * @public
		 */
		Component.prototype.addToErrorsResults = function (errorArray) {
			this.excelUpload._addToErrorsResults(errorArray);
		};

		//=============================================================================
		//EVENT HANDLERS
		//=============================================================================

		// Component.prototype.onCheckBeforeRead = function (firstSheet) {
		// 		this.fireCheckBeforeRead({sheetData:firstSheet})
		// };

		Component.prototype.onChangeBeforeCreate = function (oEvent) {
			var aContexts, oCustomer;

			aContexts = oEvent.getParameter("selectedContexts");
			if (aContexts.length) {
				oCustomer = jQuery.extend({}, aContexts[0].getObject()); //clone
				this.fireCustomerSelected({
					customer: oCustomer,
				});
			}
		};

		//=============================================================================
		//PRIVATE APIS
		//=============================================================================

		/**
		 * This method can be called to determine whether the sapUiSizeCompact or sapUiSizeCozy
		 * design mode class should be set, which influences the size appearance of some controls.
		 * @private
		 * @return {string} css class, either 'sapUiSizeCompact' or 'sapUiSizeCozy' - or an empty string if no css class should be set
		 */
		Component.prototype.getContentDensityClass = function () {
			if (this._sContentDensityClass === undefined) {
				// check whether FLP has already set the content density class; do nothing in this case
				if (jQuery(document.body).hasClass("sapUiSizeCozy") || jQuery(document.body).hasClass("sapUiSizeCompact")) {
					this._sContentDensityClass = "";
				} else if (!Device.support.touch) {
					// apply "compact" mode if touch is not supported
					this._sContentDensityClass = "sapUiSizeCompact";
				} else {
					// "cozy" in case of touch support; default for most sap.m controls, but needed for desktop-first controls like sap.ui.table.Table
					this._sContentDensityClass = "sapUiSizeCozy";
				}
			}
			return this._sContentDensityClass;
		};

		return Component;
	}
);
