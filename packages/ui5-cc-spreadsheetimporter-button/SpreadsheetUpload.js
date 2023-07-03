sap.ui.define(["sap/m/Button"], (Button) => {
	return Button.extend("cc.spreadsheetimporter.button.v0_9_2.SpreadsheetUpload", {
		metadata: {
			properties: {
				text: { type: "string", defaultValue: "Spreadsheet Upload" },
				spreadsheetFileName: {
					type: "string",
					defaultValue: "Template.xlsx"
				},
				columns: {
					type: "string[]"
				},
				tableId: {
					type: "string"
				},
				odataType: {
					type: "string"
				},
				mandatoryFields: {
					type: "string[]"
				},
				fieldMatchType: {
					type: "string",
					defaultValue: "labelTypeBrackets"
				},
				activateDraft: {
					type: "boolean",
					defaultValue: false
				},
				batchSize: {
					type: "int",
					defaultValue: 1000
				},
				standalone: { type: "boolean", defaultValue: false },
				strict: { type: "boolean", defaultValue: false },
				decimalSeparator: { type: "string" },
				hidePreview: { type: "boolean", defaultValue: false },
				skipMandatoryFieldCheck: { type: "boolean", defaultValue: false },
				showBackendErrorMessages: { type: "boolean", defaultValue: true },
				showOptions: { type: "boolean", defaultValue: false },
				availableOptions: { type: "string[]", defaultValue: [] },
				hideSampleData: { type: "boolean", defaultValue: false },
				debug: { type: "boolean", defaultValue: false }
			},
			events: {
				checkBeforeRead: {
					parameters: {
						sheetData: { type: "object" },
						messages: { type: "object" }
					}
				},
				changeBeforeCreate: {
					parameters: {
						payload: { type: "object" }
					}
				},
				uploadButtonPress: {
					allowPreventDefault: true,
					parameters: {
						payload: { type: "object" }
					}
				}
			}
		},
		init() {
			console.debug(`[${this.getMetadata().getName()}] > init`)
			this.attachPress(this.press)
		},
		renderer: async function (oRm, oControl) {
			sap.m.ButtonRenderer.render(oRm, oControl)
			const view = oControl._getViewControllerOfControl(oControl)
			if (view.getAppComponent) {
				oControl.spreadsheetUpload = await view.getAppComponent().createComponent({
					usage: "spreadsheetImporter",
					async: true,
					componentData: {
						context: view,
						spreadsheetFileName: oControl.getSpreadsheetFileName(),
						columns: oControl.getColumns(),
						tableId: oControl.getTableId(),
						odataType: oControl.getOdataType(),
						mandatoryFields: oControl.getMandatoryFields(),
						fieldMatchType: oControl.getFieldMatchType(),
						activateDraft: oControl.getActivateDraft(),
						batchSize: oControl.getBatchSize(),
						standalone: oControl.getStandalone(),
						strict: oControl.getStrict(),
						decimalSeparator: oControl.getDecimalSeparator(),
						hidePreview: oControl.getHidePreview(),
						skipMandatoryFieldCheck: oControl.getSkipMandatoryFieldCheck(),
						showBackendErrorMessages: oControl.getShowBackendErrorMessages(),
						showOptions: oControl.getShowOptions(),
						debug: oControl.getDebug(),
						availableOptions: oControl.getAvailableOptions(),
						hideSampleData: oControl.getHideSampleData()
					}
				})
			} else {
				oControl.spreadsheetUpload = await view.getOwnerComponent().createComponent({
					usage: "spreadsheetImporter",
					async: true,
					componentData: {
						context: view,
						spreadsheetFileName: oControl.getSpreadsheetFileName(),
						columns: oControl.getColumns(),
						tableId: oControl.getTableId(),
						odataType: oControl.getOdataType(),
						mandatoryFields: oControl.getMandatoryFields(),
						fieldMatchType: oControl.getFieldMatchType(),
						activateDraft: oControl.getActivateDraft(),
						batchSize: oControl.getBatchSize(),
						standalone: oControl.getStandalone(),
						strict: oControl.getStrict(),
						decimalSeparator: oControl.getDecimalSeparator(),
						hidePreview: oControl.getHidePreview(),
						skipMandatoryFieldCheck: oControl.getSkipMandatoryFieldCheck(),
						showBackendErrorMessages: oControl.getShowBackendErrorMessages(),
						showOptions: oControl.getShowOptions(),
						debug: oControl.getDebug(),
						availableOptions: oControl.getAvailableOptions(),
						hideSampleData: oControl.getHideSampleData()
					}
				})
			}
			oControl.spreadsheetUpload.attachCheckBeforeRead(function (oEvent) {
				this.fireCheckBeforeRead({ sheetData: oEvent.getParameter("sheetData") })
			}, oControl)
			oControl.spreadsheetUpload.attachChangeBeforeCreate(function (oEvent) {
				this.fireChangeBeforeCreate({ payload: oEvent.getParameter("payload") })
			}, oControl)
			oControl.spreadsheetUpload.attachUploadButtonPress(function (oEvent) {
				const isDefaultNotPrevented = this.fireUploadButtonPress({ payload: oEvent.getParameter("payload") })
				if (!isDefaultNotPrevented) {
					oEvent.preventDefault()
				}
			}, oControl)
		},
		press: function (event) {
			this.spreadsheetUpload.openSpreadsheetUploadDialog()
		},

		addArrayToMessages: function (errorArray) {
			this.spreadsheetUpload.addArrayToMessages(errorArray)
		},
		setPayload: function (payload) {
			this.spreadsheetUpload.setPayload(payload)
		},
		_getViewControllerOfControl(oControl) {
			var oView = null
			while (oControl && !(oControl instanceof sap.ui.core.mvc.View)) {
				oControl = oControl.getParent()
			}

			if (oControl) {
				oView = oControl
				var oController = oView.getController()
				return oController
			} else {
				return null
			}
		}
	})
})
