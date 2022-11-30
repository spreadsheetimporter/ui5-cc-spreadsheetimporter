sap.ui.define(
	["sap/ui/core/mvc/Controller", "sap/ui/core/Fragment", "sap/m/MessageToast", "sap/m/Button", "sap/m/ToolbarSpacer", "sap/m/MessageBox", "sap/ui/model/json/JSONModel", "xlsx"],
	function (Controller, Fragment, MessageToast, Button, ToolbarSpacer, MessageBox, JSONModel, XLSX) {
		"use strict";

		return Controller.extend("cc.excelUpload.ExcelUpload", {
			constructor: function () {
				this.excelSheetsData = [];
				this.pDialog = null;
			},

			setContext: function (options) {
				this._options = options;
				this.context = this._options["context"];
				this.isODataV4 = this._checkIfODataIsV4();
				if (this.isODataV4) {
					this.view = this.context._view;
				} else {
					this.view = this.context.getView();
				}

				if (this.isODataV4) {
					this._setContextV4();
				} else {
					this._setContextV2();
				}
			},

			_setContextV4: function () {
				// try get object page table
				if (!this._options.tableId) {
					const domRef = this.view.getContent()[0].getDomRef();
					let tables = domRef.querySelectorAll("[id$='::LineItem-innerTable']");
					if (tables.length > 1) {
						console.error("Found more than one table on Object Page.\n Please specify table in option 'tableId'");
					} else {
						this._options.tableId = tables[0].getAttribute("id");
					}
				}
				// try get odata type from table
				const table = this.context.byId(this._options.tableId);
				const tableBindingPath = table.getBindingPath("items");
				const metaModel = table.getModel().getMetaModel().getData();
				if (!this._options.odataType) {
					for (const [key, value] of Object.entries(metaModel)) {
						if (value["$kind"] === "EntityType" && value[tableBindingPath]) {
							this._options.odataType = value[tableBindingPath]["$Type"];
						}
					}
					if (!this._options.odataType) {
						console.error("No OData Type found. Please specify 'odataType' in options");
					}
				}

				this.typeLabelList = this._createLabelListV4(this._options["columns"]);
			},

			_setContextV2: function () {
				// try get object page table
				if (!this._options.tableId) {
					const domRef = this.view.getContent()[0].getDomRef();
					// list report v2 responsive Table
					const tables = domRef.querySelectorAll("[id$='responsiveTable']");
					if (tables.length > 1) {
						console.error("Found more than one table on Object Page.\n Please specify table in option 'tableId'");
					} else {
						this._options.tableId = tables[0].getAttribute("id");
					}
				}
				// try get odata type from table
				const table = this.context.byId(this._options.tableId);
				if (!this._options.odataType) {
					this._options.odataType = table.getBinding("items")._getEntityType().entityType;
					if (!this._options.odataType) {
						console.error("No OData Type found. Please specify 'odataType' in options");
					}
				}

				this.typeLabelList = this._createLabelListV2(this._options["columns"]);
			},

			openExcelUploadDialog: async function () {
				let errorData = new JSONModel();
				this.excelSheetsData = [];
				if (!this.pDialog || this.pDialog.isDestroyed()) {
					this.pDialog = await Fragment.load({
						name: "thirdparty.customControl.excelUpload.fragment.ExcelUpload",
						type: "XML",
						controller: this,
					});
				}
				if (!this.errorDialog || this.errorDialog.isDestroyed()) {
					this.errorDialog = await Fragment.load({
						name: "thirdparty.customControl.excelUpload.fragment.ErrorDialog",
						type: "XML",
						controller: this,
					});
					this.errorDialog.setModel(errorData, "errorData");
				}
				this.pDialog.open();
			},

			/**
			 * Uploading Excel File to the app and extracting data from excel file
			 * @param {*} oEvent
			 */
			onUploadSetComplete: async function (oEvent) {
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
							let errorArray = this._checkBeforeRead(firstSheet);
							errorArray = this._checkMandatoryFields(firstSheet, errorArray);
							if (errorArray.some((error) => error.counter > 0)) {
								// error found in excel
								// remove those errors not found
								errorArray = errorArray.filter((error) => error.counter !== 0);
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
					this.excelSheetsData = await filePromise;
					MessageToast.show("Upload Successful");
				} catch (error) {
					var fileUploader = this.pDialog.getContent()[0];
					fileUploader.setValue();
					this.errorDialog.getModel("errorData").setData(error);
					this.errorDialog.open();
				}
			},

			onCloseDialog: function (oEvent) {
				this.pDialog.destroy();
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
				if (!this.excelSheetsData.length) {
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
				if (this.isODataV4) {
					await this.context.editFlow.securedExecution(fnAddMessage, mParameters);
				} else {
					await this.context.extensionAPI.securedExecution(fnAddMessage, mParameters);
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
					const binding = this.context.byId(this._options["tableId"]).getBinding("items");

					// loop over data from excel files
					for (const row of this.excelSheetsData) {
						var payload = {};
						// check each specified column if availalble in excel data
						for (const [columnKey, metadataColumn] of Object.entries(this.typeLabelList)) {
							// depending on data type
							if (row[metadataColumn.label]) {
								if (metadataColumn.type === "Edm.Boolean") {
									payload[columnKey] = `${row[metadataColumn.label] || ""}`;
								} else if (metadataColumn.type === "Edm.Date") {
									var excelDate = new Date(Math.round((row[metadataColumn.label] - 25569) * 86400 * 1000));
									payload[columnKey] = `${excelDate.getFullYear()}-${("0" + (excelDate.getMonth() + 1)).slice(-2)}-${("0" + excelDate.getDate()).slice(-2)}`;
								} else if (metadataColumn.type === "Edm.Double'" || metadataColumn.type === "Edm.Int32") {
									payload[columnKey] = row[metadataColumn.label];
								} else {
									payload[columnKey] = `${row[metadataColumn.label] || ""}`;
								}
							}
						}
						// extension method to manipulate payload
						payload = this._changeBeforeCreate(payload);
						binding.create(payload);
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
				var excelColumnList = [{}];
				for (let [key, value] of Object.entries(this.typeLabelList)) {
					excelColumnList[0][value.label] = "";
				}

				// initialising the excel work sheet
				const ws = XLSX.utils.json_to_sheet(excelColumnList);
				// creating the new excel work book
				const wb = XLSX.utils.book_new();
				// set the file value
				XLSX.utils.book_append_sheet(wb, ws, "Tabelle1");
				// download the created excel file
				XLSX.writeFile(wb, this._options["excelFileName"]);

				MessageToast.show("Template File Downloading...");
			},

			_createLabelListV2(colums) {
				var listObject = {};

				// get the property list of the entity for which we need to download the template
				const oDataEntityType = this._options.context.byId(this._options.tableId).getModel().getMetaModel().getODataEntityType(this._options.odataType);
				const properties = oDataEntityType.property;
				const entityTypeLabel = oDataEntityType["sap:label"];

				// check if file name is not set
				if (!this._options["excelFileName"] && entityTypeLabel) {
					this._options["excelFileName"] = `${entityTypeLabel}.xlsx`;
				} else if (!this._options["excelFileName"] && !entityTypeLabel) {
					this._options["excelFileName"] = `Template.xlsx`;
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

				// get the property list of the entity for which we need to download the template
				var annotations = this.context.getModel().getMetaModel().getData()["$Annotations"];
				const properties = this.context.getModel().getMetaModel().getData()[this._options["odataType"]];

				// check if file name is not set
				// if (!this._options["excelFileName"] && entityTypeLabel) {
				// 	this._options["excelFileName"] = `${entityTypeLabel}.xlsx`
				// } else if(!this._options["excelFileName"] && !entityTypeLabel){
				// 	this._options["excelFileName"] = `Template.xlsx`
				// }

				if (colums) {
					for (const propertyName of colums) {
						const property = properties[propertyName];
						if (property) {
							const propertyLabel = annotations[`${this._options["odataType"]}/${propertyName}`];
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
						const propertyLabel = annotations[`${this._options["odataType"]}/${propertyName}`];
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
					const lineItemsAnnotations = annotations[this._options["odataType"]]["@com.sap.vocabularies.UI.v1.LineItem"];
					return lineItemsAnnotations.find((dataField) => dataField.Value.$Path === propertyName).Label;
				} catch (error) {
					console.debug(`${propertyName} not found as a LineItem Label`);
				}
				return propertyName;
			},

			_checkIfODataIsV4: function () {
				try {
					if (this.context.getModel().getODataVersion() === "4.0") {
						return true;
					}
				} catch (error) {
					return false;
				}
			},

			_sleep: function (ms) {
				return new Promise((resolve) => setTimeout(resolve, ms));
			},

			_changeBeforeCreate: function (payload) {
				return payload;
			},
			_checkBeforeRead: function (data) {
				// error cases
				let errorArray = [
					{
						title: "Test",
						counter: 0,
					},
				];
				for (const row of data) {
					// check for invalid date
					// if (row[this.typeLabelList["Date"].label] && new Date(Math.round((row[this.typeLabelList["Date"].label] - 25569) * 86400 * 1000)).toString() === "Invalid Date") {
					// 	errorArray[0]["counter"] = errorArray[0]["counter"] + 1;
					// }
				}
				return errorArray;
			},

			_checkMandatoryFields: function (data, errorArray) {
				// error cases
				if (this._options["mandatoryFields"]) {
					for (const mandatoryField of this._options["mandatoryFields"]) {
						const errorMessage = {
							title: `Pflichtfeld ${this.typeLabelList[mandatoryField].label} ist nicht gefüllt`,
							counter: 0,
						};
						for (const row of data) {
							if (
								!Object.prototype.hasOwnProperty.call(row, this.typeLabelList[mandatoryField].label) &&
								(row[this.typeLabelList[mandatoryField].label] === "" || row[this.typeLabelList[mandatoryField].label] === undefined)
							) {
								errorMessage.counter = errorMessage.counter + 1;
							}
						}
						errorArray.push(errorMessage);
					}
				}

				return errorArray;
			},
		});
	}
);
