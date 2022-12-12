sap.ui.define(["sap/ui/core/mvc/Controller", "sap/ui/core/Fragment", "sap/m/MessageToast", "sap/ui/model/json/JSONModel", "xlsx"], function (Controller, Fragment, MessageToast, JSONModel, XLSX) {
	"use strict";

	return Controller.extend("cc.excelUpload.ExcelUpload", {
		constructor: function (component) {
			this._excelSheetsData = [];
			this._pDialog = null;
			this._component = component;
			this._component.setErrorResults([]);
			this.setContext();
		},

		setContext: function () {
			this._context = this._component.getContext();
			if (this._context.base) {
				this._context = this._context.base;
			}
			this._isODataV4 = this._checkIfODataIsV4();
			if (this._isODataV4) {
				this._view = this._context._view;
				if (!this._view) {
					this._view = this._context.getView();
				}
				this._setContextV4();
			} else {
				this._view = this._context.getView();
				this._setContextV2();
			}
		},

		_setContextV4: function () {
			// try get object page table
			if (!this._component.getTableId()) {
				const domRef = this._view.getContent()[0].getDomRef();
				let tables = domRef.querySelectorAll("[id$='::LineItem-innerTable']");
				if (tables.length > 1) {
					console.error("Found more than one table on Object Page.\n Please specify table in option 'tableId'");
				} else {
					this._component.setTableId(tables[0].getAttribute("id"));
				}
			}
			// try get odata type from table
			const table = this._context.byId(this._component.getTableId());
			const tableBindingPath = table.getBindingPath("items");
			const metaModel = table.getModel().getMetaModel().getData();
			if (!this._component.getOdataType()) {
				for (const [key, value] of Object.entries(metaModel)) {
					if (value["$kind"] === "EntityType" && value[tableBindingPath]) {
						this._component.setOdataType(value[tableBindingPath]["$Type"]);
					}
				}
				if (!this._component.getOdataType()) {
					console.error("No OData Type found. Please specify 'odataType' in options");
				}
			}

			this.typeLabelList = this._createLabelListV4(this._component.getColumns());
		},

		_setContextV2: function () {
			// try get object page table
			if (!this._component.getTableId()) {
				const domRef = this._view.getContent()[0].getDomRef();
				// list report v2 responsive Table
				const tables = domRef.querySelectorAll("[id$='responsiveTable']");
				if (tables.length > 1) {
					console.error("Found more than one table on Object Page.\n Please specify table in option 'tableId'");
				} else {
					this._component.setTableId(tables[0].getAttribute("id"));
				}
			}
			// try get odata type from table
			const table = this._context.byId(this._component.getTableId());
			if (!this._component.getOdataType()) {
				this._component.setOdataType(table.getBinding("items")._getEntityType().entityType);
				if (!this._component.getOdataType()) {
					console.error("No OData Type found. Please specify 'odataType' in options");
				}
			}

			this.typeLabelList = this._createLabelListV2(this._component.getColumns());
		},

		openExcelUploadDialog: async function () {
			this._excelSheetsData = [];
			if (!this._pDialog || this._pDialog.isDestroyed()) {
				this._pDialog = await Fragment.load({
					name: "cc.excelUpload.fragment.ExcelUpload",
					type: "XML",
					controller: this,
				});
			}
			this._pDialog.open();
		},

		/**
		 * Uploading Excel File to the app and extracting data from excel file
		 * @param {*} oEvent
		 */
		onUploadSetComplete: async function (oEvent) {
			this._component.setErrorResults([]);
			let filePromise = new Promise((resolve, reject) => {
				var reader = new FileReader();
				reader.onload = async (e) => {
					try {
						var excelSheetsData = [];
						// getting the binary excel file content
						let xlsx_content = e.currentTarget.result;

						let workbook = XLSX.read(xlsx_content, { type: "binary" });

						// reading all sheets
						workbook.SheetNames.forEach(function (sheetName) {
							// appending the excel file data to the global variable
							excelSheetsData.push(XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]));
						});
						// use only first sheet
						var firstSheet = excelSheetsData[0];
						console.log("Excel Sheets Data", firstSheet);
						//remove empty spaces before and after every value
						for (const object of firstSheet) {
							for (const key in object) {
								object[key] = typeof object[key] === "string" ? object[key].trim() : object[key];
							}
						}
						// check if data is ok in extension method
						this._checkMandatoryFields(firstSheet, this._component.getErrorResults());
						this._component.fireCheckBeforeRead({ sheetData: firstSheet });
						if (this._component.getErrorResults().some((error) => error.counter > 0)) {
							// error found in excel
							// remove those errors not found
							const errorArray = this._component.getErrorResults().filter((error) => error.counter !== 0);
							reject(errorArray);
						} else {
							resolve(firstSheet);
						}
					} catch (error) {
						reject(error);
					}
				};
				reader.readAsBinaryString(oEvent.getParameter("files")[0]);
			});

			// Wait for all promises to be resolved
			try {
				this._excelSheetsData = await filePromise;
				MessageToast.show("Upload Successful");
			} catch (error) {
				this.errorDialog = await Fragment.load({
					name: "cc.excelUpload.fragment.ErrorDialog",
					type: "XML",
					controller: this,
				});
				this.errorDialog.setModel(new JSONModel(), "errorData");
				var fileUploader = this._pDialog.getContent()[0];
				fileUploader.setValue();
				this.errorDialog.getModel("errorData").setData(error);
				this.errorDialog.open();
			}
		},

		onCloseDialog: function (oEvent) {
			this._pDialog.destroy();
		},
		onCloseErrorDialog: function (oEvent) {
			this.errorDialog.close();
		},

		/**
		 * Sending extracted data to backend
		 * @param {*} oEvent
		 */
		onUploadSet: async function (oEvent) {
			// checking if excel file contains data or not
			if (!this._excelSheetsData.length) {
				MessageToast.show("Select file to Upload");
				return;
			}

			var that = this;
			var oSource = oEvent.getSource();

			oSource.getParent().setBusyIndicatorDelay(0);
			oSource.getParent().setBusy(true);
			await this._sleep(50);

			// creating a promise as the extension api accepts odata call in form of promise only
			var fnAddMessage = function () {
				return new Promise((fnResolve, fnReject) => {
					that.callOdata(fnResolve, fnReject);
				});
			};

			var mParameters = {
				busy: {
					set: true,
					check: false,
				},
				dataloss: {
					popup: true,
					navigation: false,
				},
				sActionLabel: "Uploading Excel File",
			};
			// calling the oData service using extension api
			if (this._isODataV4) {
				await this._context.editFlow.securedExecution(fnAddMessage, mParameters);
			} else {
				await this._context.extensionAPI.securedExecution(fnAddMessage, mParameters);
			}

			oSource.getParent().setBusy(false);
			this.onCloseDialog();
		},

		/**
		 * helper method to call OData
		 * @param {*} fnResolve
		 * @param {*} fnReject
		 */
		callOdata: function (fnResolve, fnReject) {
			// intializing the message manager for displaying the odata response messages
			try {
				// get binding of table to create rows
				const binding = this._context.byId(this._component.getTableId()).getBinding("items");

				// loop over data from excel files
				for (const row of this._excelSheetsData) {
					let payload = {};
					// check each specified column if availalble in excel data
					for (const [columnKey, metadataColumn] of Object.entries(this.typeLabelList)) {
						// depending on parse type
						const value = this._getValueFromRow(row, metadataColumn.label, columnKey);
						// depending on data type
						if (value) {
							if (metadataColumn.type === "Edm.Boolean") {
								payload[columnKey] = `${value || ""}`;
							} else if (metadataColumn.type === "Edm.Date") {
								let excelDate = new Date(Math.round((value - 25569) * 86400 * 1000));
								payload[columnKey] = `${excelDate.getFullYear()}-${("0" + (excelDate.getMonth() + 1)).slice(-2)}-${("0" + excelDate.getDate()).slice(-2)}`;
							} else if (metadataColumn.type === "Edm.DateTimeOffset" || metadataColumn.type === "Edm.DateTime") {
								payload[columnKey] = new Date(Math.round((value - 25569) * 86400 * 1000));
							} else if (metadataColumn.type === "Edm.TimeOfDay" || metadataColumn.type === "Edm.Time") {
								//convert to hh:mm:ss
								const secondsInADay = 24 * 60 * 60;
								const timeInSeconds = value * secondsInADay;
								payload[columnKey] = new Date(timeInSeconds * 1000).toISOString().substring(11, 16);
							} else if (metadataColumn.type === "Edm.Double" || metadataColumn.type === "Edm.Int32") {
								payload[columnKey] = value;
							} else {
								payload[columnKey] = `${value || ""}`;
							}
						}
					}
					this._payload = payload;

					// extension method to manipulate payload
					this._component.fireChangeBeforeCreate({ payload: this._payload });
					binding.create(this._payload);
				}

				fnResolve();
			} catch (error) {
				fnReject();
			}
		},

		/**
		 * Create Excel Template File with specific columns
		 */
		onTempDownload: function () {
			// create excel column list
			let fieldMatchType = this._component.getFieldMatchType();
			var excelColumnList = [{}];
			for (let [key, value] of Object.entries(this.typeLabelList)) {
				if (fieldMatchType === "label") {
					excelColumnList[0][value.label] = "";
				}
				if (fieldMatchType === "labelTypeBrackets") {
					excelColumnList[0][`${value.label}[${key}]`] = "";
				}
			}

			// initialising the excel work sheet
			const ws = XLSX.utils.json_to_sheet(excelColumnList);
			// creating the new excel work book
			const wb = XLSX.utils.book_new();
			// set the file value
			XLSX.utils.book_append_sheet(wb, ws, "Tabelle1");
			// download the created excel file
			XLSX.writeFile(wb, this._component.getExcelFileName());

			MessageToast.show("Template File Downloading...");
		},

		_createLabelListV2(colums) {
			var listObject = {};

			// get the property list of the entity for which we need to download the template
			const oDataEntityType = this._context.byId(this._component.getTableId()).getModel().getMetaModel().getODataEntityType(this._component.getOdataType());
			const properties = oDataEntityType.property;
			const entityTypeLabel = oDataEntityType["sap:label"];

			// check if file name is not set
			if (!this._component.getExcelFileName() && entityTypeLabel) {
				this._component.setExcelFileName(`${entityTypeLabel}.xlsx`);
			} else if (!this._component.getExcelFileName() && !entityTypeLabel) {
				this._component.setExcelFileName(`Template.xlsx`);
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

		_getLabelV2(oDataEntityType, properties, property, propertyName, options) {
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

		_createLabelListV4(colums) {
			var listObject = {};
			let entityTypeLabel;

			// get the property list of the entity for which we need to download the template
			var annotations = this._context.getModel().getMetaModel().getData()["$Annotations"];
			const properties = this._context.getModel().getMetaModel().getData()[this._component.getOdataType()];
			// try get facet label
			try {
				entityTypeLabel = annotations[this._component.getOdataType()]["@com.sap.vocabularies.UI.v1.Facets"][0].Label;
			} catch (error) {
				console.debug("Facet Label not found");
			}

			// check if file name is not set
			if (!this._component.getExcelFileName() && entityTypeLabel) {
				this._component.setExcelFileName(`${entityTypeLabel}.xlsx`);
			} else if (!this._component.getExcelFileName() && !entityTypeLabel) {
				this._component.setExcelFileName(`Template.xlsx`);
			}

			if (colums) {
				for (const propertyName of colums) {
					const property = properties[propertyName];
					if (property) {
						const propertyLabel = annotations[`${this._component.getOdataType()}/${propertyName}`];
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
					const propertyLabel = annotations[`${this._component.getOdataType()}/${propertyName}`];
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

		_getLabelV4(annotations, properties, propertyName, propertyLabel, options) {
			if (propertyLabel["@com.sap.vocabularies.Common.v1.Label"]) {
				return propertyLabel["@com.sap.vocabularies.Common.v1.Label"];
			}
			try {
				const lineItemsAnnotations = annotations[this._component.getOdataType()]["@com.sap.vocabularies.UI.v1.LineItem"];
				return lineItemsAnnotations.find((dataField) => dataField.Value.$Path === propertyName).Label;
			} catch (error) {
				console.debug(`${propertyName} not found as a LineItem Label`);
			}
			return propertyName;
		},

		_checkIfODataIsV4: function () {
			try {
				if (this._context.getModel().getODataVersion() === "4.0") {
					return true;
				}
			} catch (error) {
				return false;
			}
		},

		_sleep: function (ms) {
			return new Promise((resolve) => setTimeout(resolve, ms));
		},

		_setPayload: function (payload) {
			this._payload = payload;
		},

		_addToErrorsResults: function (errorResults) {
			this._component.setErrorResults(this._component.getErrorResults().concat(errorResults));
		},

		_checkMandatoryFields: function (data, errorArray) {
			// error cases
			if (this._component.getMandatoryFields()) {
				for (const mandatoryField of this._component.getMandatoryFields()) {
					const errorMessage = {
						title: `Pflichtfeld ${this.typeLabelList[mandatoryField].label} ist nicht gefüllt`,
						counter: 0,
					};
					for (const row of data) {
						let label;
						if (typeof this.typeLabelList[mandatoryField] !== "undefined" && mandatoryField in this.typeLabelList) {
							label = this.typeLabelList[mandatoryField]["label"];
						} else {
							console.error(`Mandatory Field ${mandatoryField} not found for checking mandatory fields`);
						}
						const value = this._getValueFromRow(row, label, mandatoryField);
						if (value === "" || value === undefined) {
							errorMessage.counter = errorMessage.counter + 1;
						}
					}
					errorArray.push(errorMessage);
				}
			}

			return errorArray;
		},

		_getValueFromRow: function (row, label, type) {
			const fieldMatchType = this._component.getFieldMatchType();
			let value;
			if (fieldMatchType === "label") {
				value = row[label];
			}
			if (fieldMatchType === "labelTypeBrackets") {
				try {
					value = Object.entries(row).find(([key]) => key.includes(`[${type}]`))[1];
				} catch (error) {
					console.debug(`Not found ${type}`);
				}
			}
			return value;
		},
	});
});
