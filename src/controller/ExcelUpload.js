sap.ui.define(
	[
		"sap/ui/base/ManagedObject",
		"sap/ui/core/Fragment",
		"sap/m/MessageToast",
		"sap/ui/model/json/JSONModel",
		"xlsx",
		"cc/excelUpload/XXXnamespaceSlashXXX/controller/MetadataHandler",
		"sap/ui/generic/app/transaction/DraftController",
	],
	function (ManagedObject, Fragment, MessageToast, JSONModel, XLSX, MetadataHandler, DraftController) {
		"use strict";

		return ManagedObject.extend("cc.excelUpload.XXXnamespaceXXX.controller.ExcelUpload", {
			constructor: function (component, componentI18n) {
				this._excelSheetsData = [];
				this._pDialog = null;
				this._component = component;
				this._component.setErrorResults([]);
				this._componentI18n = componentI18n;
				this._metadataHandler = new MetadataHandler(this);
				this.setContext();
			},

			setContext: async function () {
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
					await this._setContextV2();
				}
				this._model = this._tableObject.getModel();
				this._draftController = new DraftController(this._model);
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
				this._tableObject = this._context.byId(this._component.getTableId());
				const tableBindingPath = this._tableObject.getBindingPath("items");
				const metaModel = this._tableObject.getModel().getMetaModel();
				const metaModelData = this._tableObject.getModel().getMetaModel().getData();
				if (!this._component.getOdataType()) {
					// for list report
					try {
						const metaDataObject = metaModel.getObject(tableBindingPath);
						this._component.setOdataType(metaDataObject["$Type"]);
					} catch (error) {
						console.debug();
					}
					// for object page
					if (!this._component.getOdataType()) {
						for (const [key, value] of Object.entries(metaModelData)) {
							if (value["$kind"] === "EntityType" && value[tableBindingPath]) {
								this._component.setOdataType(value[tableBindingPath]["$Type"]);
							}
						}
					}
					if (!this._component.getOdataType()) {
						console.error("No OData Type found. Please specify 'odataType' in options");
					}
				}

				this.typeLabelList = this._metadataHandler._createLabelListV4(this._component.getColumns());
			},

			_setContextV2: async function () {
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
				this._tableObject = this._context.byId(this._component.getTableId());
				if (!this._component.getOdataType()) {
					this._component.setOdataType(this._tableObject.getBinding("items")._getEntityType().entityType);
					if (!this._component.getOdataType()) {
						console.error("No OData Type found. Please specify 'odataType' in options");
					}
					const metaModel = this._context.byId(this._component.getTableId()).getModel().getMetaModel();
					await metaModel.loaded();
					this._oDataEntityType = metaModel.getODataEntityType(this._component.getOdataType());
				}

				this.typeLabelList = this._metadataHandler._createLabelListV2(this._component.getColumns());
			},

			openExcelUploadDialog: async function () {
				this._excelSheetsData = [];
				if (!this._pDialog || this._pDialog.isDestroyed()) {
					this._pDialog = await Fragment.load({
						name: "cc.excelUpload.XXXnamespaceXXX.fragment.ExcelUpload",
						type: "XML",
						controller: this,
					});
					this._pDialog.setModel(this._componentI18n, "i18n");
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
					MessageToast.show(this._geti18nText("uploadSuccessful"));
				} catch (error) {
					this.errorDialog = await Fragment.load({
						name: "cc.excelUpload.XXXnamespaceXXX.fragment.ErrorDialog",
						type: "XML",
						controller: this,
					});
					this._pDialog.setModel(this._componentI18n, "i18n");
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
					MessageToast.show(this._geti18nText("selectFileUpload"));
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
					sActionLabel: this._geti18nText("uploadingFile"),
				};
				// calling the oData service using extension api
				if (this._isODataV4) {
					await this._context.editFlow.securedExecution(fnAddMessage, mParameters);
				} else {
					if (this._context.extensionAPI) {
						await this._context.extensionAPI.securedExecution(fnAddMessage, mParameters);
					} else {
						await fnAddMessage();
					}
				}

				oSource.getParent().setBusy(false);
				this.onCloseDialog();
			},

			test: async function (event) {
				console.log(event);
				const bindingContext = event.getParameter("context");
				await event.getParameter("context").created();
				console.log(event);

				// bindingContext.getModel().submitBatch(bindingContext.getModel().getUpdateGroupId());
				// this._context.editFlow.saveDocument(bindingContext)
			},

			/**
			 * helper method to call OData
			 * @param {*} fnResolve
			 * @param {*} fnReject
			 */
			callOdata: async function (fnResolve, fnReject) {
				// intializing the message manager for displaying the odata response messages
				try {
					// get binding of table to create rows
					const model = this._context.byId(this._component.getTableId()).getModel();
					const binding = this._context.byId(this._component.getTableId()).getBinding("items");
					let createPromises = [];
					let createContexts = [];
					let activateActions = [];
					let activateActionsPromises = [];

					// binding.attachCreateCompleted(this.test, this);

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
						if (this._isODataV4) {
							const context = binding.create(this._payload);
							createContexts.push(context);
							createPromises.push(context.created());
						} else {
							const context = binding.create(this._payload, /*bAtEnd*/ true, { inactive: false, expand: "" });
							createContexts.push(context);
							createPromises.push(context.created());
						}
					}
					// wait for all drafts to be created
					if (this._isODataV4) {
						await model.submitBatch(model.getUpdateGroupId());
						const resultsCreation = await Promise.all(createPromises);
					} else {
						await model.submitChanges();
						const resultsCreation = await Promise.all(createPromises);
					}

					// check for and activate all drafts
					if (this._isODataV4) {
						for (let index = 0; index < createContexts.length; index++) {
							const element = createContexts[index];
							// const operation = element.getModel().bindContext(this._activateActionName + "(...)", element, { $$inheritExpandSelect: true });
							const operationName = this._getActionName(element, "ActivationAction");
							if (operationName) {
								const operation = element.getModel().bindContext(`${operationName}(...)`, element, { $$inheritExpandSelect: true });
								activateActionsPromises.push(operation.execute("$auto", false, null, /*bReplaceWithRVC*/ true));
							}
						}
					} else {
						for (let index = 0; index < createContexts.length; index++) {
							const element = createContexts[index];
							if (this._draftController.getDraftContext().hasDraft(element)) {
								// this will fail i.e. in a Object Page Table, maybe better way to check, hasDraft is still true
								try {
									const checkImport = this._draftController.getDraftContext().getODataDraftFunctionImportName(element, "ActivationAction");
									if (checkImport !== null) {
										const activationPromise = this._draftController.activateDraftEntity(element, true);
										activateActionsPromises.push(activationPromise);
									}
								} catch (error) {
									console.debug("Activate Draft failed");
								}
							}
						}
					}
					// wait for all draft to be created
					const resultsActivations = await Promise.all(activateActionsPromises);
					try {
						binding.refresh();
					} catch (error) {
						console.debug(error);
					}
					fnResolve();
				} catch (error) {
					console.log(error);
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

				MessageToast.show(this._geti18nText("downloadingTemplate"));
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
							title: this._geti18nText("mandatoryFieldNotFilled", [this.typeLabelList[mandatoryField].label]),
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

			_geti18nText(text, array) {
				return this._componentI18n.getResourceBundle().getText(text, array);
			},

			_getActionName(oContext, sOperation) {
				var oModel = oContext.getModel(),
					oMetaModel = oModel.getMetaModel(),
					sEntitySetPath = oMetaModel.getMetaPath(oContext.getPath());
				return oMetaModel.getObject("".concat(sEntitySetPath, "@com.sap.vocabularies.Common.v1.DraftRoot/").concat(sOperation));
			},
		});
	}
);
