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
			onTheSubDetailPage: {
				ObjectPage: {
					appId: "ui.v4.orders",
					componentId: "Orders_ItemsObjectPage",
					entitySet: "Orders_Items"
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

	it("Upload file", async () => {
		const uploader = await browser
		.asControl({
			forceSelect: true,
			
			selector: {
				interaction: "root",
				controlType: "sap.ui.unified.FileUploader",
				id: "__uploader0"
			}
		});
		const fileName = "test/TwoRowsNoErrors.xlsx" // relative to wdio.conf.(j|t)s
		const remoteFilePath = await browser.uploadFile(fileName) // this also works in CI senarios!
		// transition from wdi5 api -> wdio api
		const $uploader = await uploader.getWebElement() // wdi5
		const $fileInput = await $uploader.$("input[type=file]") // wdio
		await $fileInput.setValue(remoteFilePath) // wdio
		await browser.asControl({
			selector: {
				controlType: "sap.m.Button",
				properties: {
					text: "Upload"
				}
			}
		}).press();
	});

	it("execute save", async () => {
		await FioriElementsFacade.execute((Given, When, Then) => {
			When.onTheDetailPage.onFooter().iExecuteSave()
		});
	});

	it("go to Sub Detail Page", async () => {
		await FioriElementsFacade.execute((Given, When, Then) => {
			Then.onTheDetailPage.onTable({ property: "Items" }).iCheckRows({ ID: "254" });
			When.onTheDetailPage.onTable({ property: "Items" }).iPressRow({ ID: "254" });
		});
	});

	it("check Field: Quantity", async () => {
		await FioriElementsFacade.execute((Given, When, Then) => {
			Then.onTheSubDetailPage.iSeeThisPage();
			Then.onTheSubDetailPage.onForm("OrderItems").iCheckField({ property: "quantity" }, { value: "3"});
		});
	});

	it("check Field: Product", async () => {
		await FioriElementsFacade.execute((Given, When, Then) => {
			Then.onTheSubDetailPage.onForm("OrderItems").iCheckField({ property: "title" }, { value: 'Product Test 2'});
		});
	});

	it("check Field: UnitPrice", async () => {
		await FioriElementsFacade.execute((Given, When, Then) => {
			Then.onTheSubDetailPage.onForm("OrderItems").iCheckField({ property: "price" }, { value: '13.7'});
		});
	});

	it("check Field: validFrom", async () => {
		await FioriElementsFacade.execute((Given, When, Then) => {
			Then.onTheSubDetailPage.onForm("OrderItems").iCheckField({ property: "validFrom" }, { value: 'Nov 25, 2024, 1:00:00 AM'});
		});
	});

	it("check Field: timestamp", async () => {
		await FioriElementsFacade.execute((Given, When, Then) => {
			Then.onTheSubDetailPage.onForm("OrderItems").iCheckField({ property: "timestamp" }, { value: 'Nov 24, 2024, 1:00:00 AM'});
		});
	});

	it("check Field: date", async () => {
		await FioriElementsFacade.execute((Given, When, Then) => {
			Then.onTheSubDetailPage.onForm("OrderItems").iCheckField({ property: "date" }, { value: 'Nov 23, 2024'});
		});
	});

	it("check Field: time", async () => {
		await FioriElementsFacade.execute((Given, When, Then) => {
			Then.onTheSubDetailPage.onForm("OrderItems").iCheckField({ property: "time" }, { value: '4:00:00 PM'});
		});
	});

	



	// after(async () => {
	// 	it("should see an object page", async () => {
	// 		await FioriElementsFacade.execute((Given, When, Then) => {
	// 			When.onTheShell.iNavigateBack()
	// 			Then.onTheMainPage.iSeeThisPage()
	// 			Given.onTheMainPage.onFilterBar().iExecuteSearch()
	// 			Then.onTheMainPage.onTable().iCheckRows({ identifier: "inc_0002", title: "Password obliteration" })
	// 		})
	// 	})
	// 	await browser
	// 		.asControl({
	// 			selector: {
	// 				controlType: "sap.m.Button",
	// 				properties: {
	// 					text: "Cancel"
	// 				},
	// 				searchOpenDialogs: true
	// 			}
	// 		})
	// 		.press();
	// 	await browser
	// 		.asControl({
	// 			selector: {
	// 				id: "ui.v4.orders::OrdersObjectPage--fe::FooterBar::StandardAction::Cancel"
	// 			}
	// 		})
	// 		.press();
	// 	// Get the current time
	// 	const startTime = Date.now();

	// 	// Wait until the specified amount of time has elapsed
	// 	await browser.waitUntil(() => {
	// 		// Get the current time
	// 		const currentTime = Date.now();

	// 		// Return true if the difference between the start time and the current time is greater than or equal to the desired wait time
	// 		return currentTime - startTime >= 1000;
	// 	});
	// });
});
