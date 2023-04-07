sap.ui.define(["sap/m/Button"], (Button /*, marked */) => {
	return Button.extend("cc.excelUploadButton.v0_11_2.ExcelUpload", {
		metadata: {
			properties: {
				excelFileName: {
					type: "string",
					defaultValue: "Template.xlsx"
				},
				context: {
					type: "object"
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
				errorResults: {
					type: "object"
				},
				fieldMatchType: {
					type: "string",
					defaultValue: "label"
				},
				activateDraft: {
					type: "boolean",
					defaultValue: false
				},
				batchSize: {
					type: "int",
					defaultValue: 1000
				}
			},
			events: {
				press: function (e) {
					alert("clicked")
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
			oControl.excelUpload = await view.getOwnerComponent().createComponent({
				usage: "excelUpload",
				async: true,
				componentData: {
					context: view,
					tableId: oControl.getTableId()
				}
			})
		},
		press: function (event) {
			console.log("test")
			this.excelUpload.openExcelUploadDialog()
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
