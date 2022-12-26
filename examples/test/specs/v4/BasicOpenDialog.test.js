describe("Open Excel Upload dialog", () => {
	before(async () => {
		FioriElementsFacade = await browser.fe.initialize({
			onTheMainPage: {
				ListReport: {
					appId: "ui.v4.orders",
					componentId: "OrdersList",
					entitySet: "Orders"
				}
			},
			onTheDetailPage: {
				ObjectPage: {
					appId: "ui.v4.orders",
					componentId: "OrdersObjectPage",
					entitySet: "Orders"
				}
			},
			onTheShell: {
				Shell: {}
			}
		});
	});

	it("should trigger search on ListReport page", async () => {
		await FioriElementsFacade.execute((Given, When, Then) => {
			Given.onTheMainPage.onFilterBar().iExecuteSearch();
			Then.onTheMainPage.onTable().iCheckRows(2);
			Then.onTheMainPage.onTable().iCheckRows({ OrderNo: "2", buyer: "jane.doe@test.com" });
			When.onTheMainPage.onTable().iPressRow({ OrderNo: "2" });
		});
	});

	it("should see an object page", async () => {
		await FioriElementsFacade.execute((Given, When, Then) => {
			Then.onTheDetailPage.onHeader().iCheckEdit();
			When.onTheDetailPage.onHeader().iExecuteEdit();
			Then.onTheDetailPage.iSeeThisPage().and.iSeeObjectPageInEditMode();
			// Then.onTheDetailPage.onFooter().iCheckDraftStateSaved()
			// When.onTheDetailPage.onFooter().iExecuteSave()
		});
	});

	it("Open ExcelUpload Dialog V4", async () => {
		// open Object Page
		// await browser.$('//*[@id="ui.v4.orders::OrdersList--fe::table::Orders::LineItem-innerTableRow-__clone6_cell1"]').click();
		// // Open Edit Mode
		// await browser
		// 	.asControl({
		// 		selector: {
		// 			id: "ui.v4.orders::OrdersObjectPage--fe::StandardAction::Edit"
		// 		}
		// 	})
		// 	.press();
		// open Excel Dialog
		await browser
			.asControl({
				selector: {
					id: "ui.v4.orders::OrdersObjectPage--fe::CustomAction::excelUpload"
				}
			})
			.press();
		const excelUploadDialog = await browser.asControl({
			selector: {
				controlType: "sap.m.Dialog",
				properties: {
					title: "Excel Upload"
				},
				searchOpenDialogs: true
			}
		});
		expect(excelUploadDialog.isOpen()).toBeTruthy();
	});

	after(async () => {
		await browser
			.asControl({
				selector: {
					controlType: "sap.m.Button",
					properties: {
						text: "Cancel"
					},
					searchOpenDialogs: true
				}
			})
			.press();
		await browser
			.asControl({
				selector: {
					id: "ui.v4.orders::OrdersObjectPage--fe::FooterBar::StandardAction::Cancel"
				}
			})
			.press();
		// Get the current time
		const startTime = Date.now();

		// Wait until the specified amount of time has elapsed
		await browser.waitUntil(() => {
			// Get the current time
			const currentTime = Date.now();

			// Return true if the difference between the start time and the current time is greater than or equal to the desired wait time
			return currentTime - startTime >= 1000;
		});
	});
});
