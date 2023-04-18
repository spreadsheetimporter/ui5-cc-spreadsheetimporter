sap.ui.define(["sap/m/Button"], (Button /*, marked */) => {
	return Button.extend("cc.excelUploadButton.v0_2_2.ExcelUpload", {
		metadata: {
			properties: {
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
				activateDraft: {
					type: "boolean",
					defaultValue: false
				},
				batchSize: {
					type: "int",
					defaultValue: 1000
				},
				standalone: { type: "boolean", defaultValue: false }
			},
			events: {
				checkBeforeRead: {
					parameters: {
						sheetData: { type: "object" },
						errorResults: { type: "object" }
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
						activateDraft: oControl.getActivateDraft(),
						batchSize: oControl.getBatchSize(),
						standalone: oControl.getStandalone()
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
						activateDraft: oControl.getActivateDraft(),
						batchSize: oControl.getBatchSize(),
						standalone: oControl.getStandalone()
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

		addToErrorsResults: function (errorArray) {
			this.excelUpload.addToErrorsResults(errorArray)
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
