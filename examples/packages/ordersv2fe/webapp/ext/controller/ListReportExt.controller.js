sap.ui.define([], function () {
	"use strict";
	return {
		openSpreadsheetUpload: async function (oEvent) {
			this.getView().setBusyIndicatorDelay(0);
			this.getView().setBusy(true);

			this.spreadsheetUpload = await this.getView()
				.getController()
				.getOwnerComponent()
				.createComponent({
					usage: "spreadsheetImporter",
					async: true,
					componentData: {
						context: this,
						activateDraft: true,
						showBackendErrorMessages: false
					}
				});

			// event to check before uploaded to app
			this.spreadsheetUpload.attachCheckBeforeRead(function (oEvent) {
				// example
				const sheetData = oEvent.getParameter("sheetData");
				let errorArray = [];
				for (const [index, row] of sheetData.entries()) {
					//check for invalid price
					for (const key in row) {
						if (key.endsWith("[price]") && row[key].rawValue > 100) {
							const error = {
								title: "Price too high (max 100)",
								row: index + 2,
								group: true,
								rawValue: row[key].rawValue,
								ui5type: "Error"
							};
							errorArray.push(error);
						}
					}
				}
				oEvent.getSource().addArrayToMessages(errorArray);
			}, this);

			// event to change data before send to backend
			this.spreadsheetUpload.attachChangeBeforeCreate(function (oEvent) {
				let payload = oEvent.getParameter("payload");
				// round number from 12,56 to 12,6
				if (payload.price) {
					payload.price = Number(payload.price).toFixed(1);
				}
				oEvent.getSource().setPayload(payload);
			}, this);

			this.spreadsheetUpload.attachRequestCompleted(function (oEvent) {
				const success = oEvent.getParameter("success");
				if (success) {
					console.log("Request Completed");
				} else {
					console.log("Request Failed");
				}
			}, this);

			this.spreadsheetUpload.openSpreadsheetUploadDialog();
			this.getView().setBusy(false);
		},
		submit: async function () {
			const type = "OrdersService.Orders";
			const payload = {
				OrderNo: "3",
				buyer: "test@test.de"
			};
			const model = this.getView().getModel();
			const binding = this.byId("ui.v2.ordersv2fe::sap.suite.ui.generic.template.ListReport.view.ListReport::Orders--responsiveTable").getBinding("items");
			const context = binding.create(payload, /*bAtEnd*/ true, { inactive: false, expand: "" });
			// const context2 = binding.create(payload);
			await model.submitChanges();
			await context.created();
			// await context2.created();

			const draftController = new sap.ui.generic.app.transaction.DraftController(model);
			await draftController.activateDraftEntity(context, true);
			binding.refresh();

			// const operation = context.getModel().bindContext("OrdersService.draftActivate" + "(...)", context, { $$inheritExpandSelect: true });
			// const operation2 = context2.getModel().bindContext("OrdersService.draftActivate" + "(...)", context2, { $$inheritExpandSelect: true });
			// operation.execute("$auto", false, null, /*bReplaceWithRVC*/ true);
			// operation2.execute("$auto", false, null, /*bReplaceWithRVC*/ true);
			console.log(context);
		}
	};
});
