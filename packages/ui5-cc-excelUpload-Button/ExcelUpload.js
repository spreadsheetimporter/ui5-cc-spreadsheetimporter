sap.ui.define(["sap/m/Button"], (Button) => {
	return Button.extend("cc.excelUploadButton.v0_6_1.ExcelUpload", {
		metadata: {
			properties: {
				text : { type: "string", defaultValue: "Excel Upload" },
				excelFileName: {
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
				oControl.excelUpload = await view.getAppComponent().createComponent({
					usage: "excelUpload",
					async: true,
					componentData: {
						context: view,
						excelFileName: oControl.getExcelFileName(),
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
						showOptions: oControl.getShowOptions()
					}
				})
			} else {
				oControl.excelUpload = await view.getOwnerComponent().createComponent({
					usage: "excelUpload",
					async: true,
					componentData: {
						context: view,
						excelFileName: oControl.getExcelFileName(),
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
						showOptions: oControl.getShowOptions()
					}
				})
			}
			oControl.excelUpload.attachCheckBeforeRead(function (oEvent) {
				this.fireCheckBeforeRead({ sheetData: oEvent.getParameter("sheetData") })
			}, oControl)
			oControl.excelUpload.attachChangeBeforeCreate(function (oEvent) {
				this.fireChangeBeforeCreate({ payload: oEvent.getParameter("payload") })
			}, oControl)
			oControl.excelUpload.attachUploadButtonPress(function (oEvent) {
				const isDefaultNotPrevented = this.fireUploadButtonPress({ payload: oEvent.getParameter("payload") })
				if (!isDefaultNotPrevented) {
					oEvent.preventDefault()
				}
			}, oControl)
		},
		press: function (event) {
			this.excelUpload.openExcelUploadDialog()
		},

		addArrayToMessages: function (errorArray) {
			this.excelUpload.addArrayToMessages(errorArray)
		},
		setPayload: function (payload) {
			this.excelUpload.setPayload(payload)
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
