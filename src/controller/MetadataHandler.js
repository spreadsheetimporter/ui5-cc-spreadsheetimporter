sap.ui.define(["sap/ui/base/Object"], function (UI5Object) {
	"use strict";

	return UI5Object.extend("cc.excelUpload.XXXnamespaceXXX.controller.MetadataHandler", {
		/**
		 * Handles application errors by automatically attaching to the model events and displaying errors when needed.
		 * @class
		 * @param {sap.ui.core.UIComponent} oComponent reference to the app's component
		 * @public
		 * @alias be.wl.CAPDemoUI.controller.ErrorHandler
		 */
		constructor: function (excelUploadController) {
			this._excelUploadController = excelUploadController;
		},

		/**
		 * Shows a {@link sap.m.MessageBox} when a service call has failed.
		 * Only the first error message will be display.
		 * @param {string} sDetails a technical error to be displayed on request
		 * @private
		 */
		_createLabelListV2: function (colums) {
			var listObject = {};

			// get the property list of the entity for which we need to download the template
			// binding.getModel().getMetaModel().getObject("/Orders")
			const oDataEntityType = this._excelUploadController._oDataEntityType;
			const properties = oDataEntityType.property;
			const entityTypeLabel = oDataEntityType["sap:label"];

			// check if file name is not set
			if (!this._excelUploadController._component.getExcelFileName() && entityTypeLabel) {
				this._excelUploadController._component.setExcelFileName(`${entityTypeLabel}.xlsx`);
			} else if (!this._excelUploadController._component.getExcelFileName() && !entityTypeLabel) {
				this._excelUploadController._component.setExcelFileName(`Template.xlsx`);
			}

			if (colums) {
				for (const propertyName of colums) {
					const property = properties.find((property) => property.name === propertyName);
					if (property) {
						listObject[propertyName] = {};
						listObject[propertyName].label = this._getLabelV2(oDataEntityType, properties, property, propertyName, this._options);
						if (!listObject[propertyName].label) {
							listObject[propertyName].label = propertyName;
						}
						listObject[propertyName].type = property["type"];
					} else {
						console.error(`ExcelUpload: Property ${propertyName} not found`);
					}
				}
			} else {
				for (const property of properties) {
					let hiddenProperty = false;
					try {
						hiddenProperty = property["com.sap.vocabularies.UI.v1.Hidden"].Bool === "true";
					} catch (error) {
						console.debug(`No hidden property on ${property.name}`);
					}
					if (!hiddenProperty) {
						const propertyName = property.name;
						listObject[propertyName] = {};
						listObject[propertyName].label = this._getLabelV2(oDataEntityType, properties, property, propertyName, this._options);
						listObject[propertyName].type = property["type"];
					}
				}
			}

			return listObject;
		},

		_getLabelV2: function (oDataEntityType, properties, property, propertyName, options) {
			if (property["sap:label"]) {
				return property["sap:label"];
			}
			try {
				const lineItemsAnnotations = oDataEntityType["com.sap.vocabularies.UI.v1.LineItem"];
				return lineItemsAnnotations.find((dataField) => dataField.Value.Path === propertyName).Label.String;
			} catch (error) {
				console.debug(`${propertyName} not found as a LineItem Label`);
			}
			return propertyName;
		},

		_createLabelListV4: function (colums) {
			var listObject = {};
			let entityTypeLabel;

			// get the property list of the entity for which we need to download the template
			var annotations = this._excelUploadController._context.getModel().getMetaModel().getData()["$Annotations"];
			const properties = this._excelUploadController._context.getModel().getMetaModel().getData()[this._excelUploadController._component.getOdataType()];
			// try get facet label
			try {
				entityTypeLabel = annotations[this._excelUploadController._component.getOdataType()]["@com.sap.vocabularies.UI.v1.Facets"][0].Label;
			} catch (error) {
				console.debug("Facet Label not found");
			}

			// check if file name is not set
			if (!this._excelUploadController._component.getExcelFileName() && entityTypeLabel) {
				this._excelUploadController._component.setExcelFileName(`${entityTypeLabel}.xlsx`);
			} else if (!this._excelUploadController._component.getExcelFileName() && !entityTypeLabel) {
				this._excelUploadController._component.setExcelFileName(`Template.xlsx`);
			}

			if (colums) {
				for (const propertyName of colums) {
					const property = properties[propertyName];
					if (property) {
						const propertyLabel = annotations[`${this._excelUploadController._component.getOdataType()}/${propertyName}`];
						listObject[propertyName] = {};
						listObject[propertyName].label = this._getLabelV4(annotations, properties, propertyName, propertyLabel, this._options);
						if (!listObject[propertyName].label) {
							listObject[propertyName].label = propertyName;
						}
						listObject[propertyName].type = property.$Type;
					} else {
						console.error(`ExcelUpload: Property ${propertyName} not found`);
					}
				}
			} else {
				const propertiesFiltered = Object.entries(properties).filter(([propertyName, propertyValue]) => propertyValue["$kind"] === "Property");
				for (const [propertyName, propertyValue] of propertiesFiltered) {
					const propertyLabel = annotations[`${this._excelUploadController._component.getOdataType()}/${propertyName}`];
					if (!propertyLabel["@com.sap.vocabularies.UI.v1.Hidden"]) {
						listObject[propertyName] = {};
						listObject[propertyName].label = this._getLabelV4(annotations, properties, propertyName, propertyLabel, this._options);
						if (!listObject[propertyName].label) {
							listObject[propertyName].label = propertyName;
						}
						listObject[propertyName].type = propertyValue.$Type;
					}
				}
			}

			return listObject;
		},

		_getLabelV4: function (annotations, properties, propertyName, propertyLabel, options) {
			if (propertyLabel["@com.sap.vocabularies.Common.v1.Label"]) {
				return propertyLabel["@com.sap.vocabularies.Common.v1.Label"];
			}
			try {
				const lineItemsAnnotations = annotations[this._excelUploadController._component.getOdataType()]["@com.sap.vocabularies.UI.v1.LineItem"];
				return lineItemsAnnotations.find((dataField) => dataField.Value.$Path === propertyName).Label;
			} catch (error) {
				console.debug(`${propertyName} not found as a LineItem Label`);
			}
			return propertyName;
		},
	});
});
