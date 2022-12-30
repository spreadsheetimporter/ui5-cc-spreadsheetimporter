describe("Open Excel Upload dialog", () => {
	const optionsLong = {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
		hour: 'numeric',
		minute: 'numeric',
		second: 'numeric',
		hour12: true
	  };
	  const optionsShort = {
		month: 'short',
		day: 'numeric',
		year: 'numeric'
	  };

	it("should trigger search on ListReport page", async () => {
		await browser.asControl({
			selector: {
				controlType: "sap.m.ColumnListItem",
				viewId: "ui.v2.ordersv2::sap.suite.ui.generic.template.ListReport.view.ListReport::Orders",
				bindingPath: {
					path: "/Orders(ID=guid'64e718c9-ff99-47f1-8ca3-950c850777d4',IsActiveEntity=true)",
					propertyPath: "IsActiveEntity",
				}
			}
		}).press();
	});

	// it("should see an object page", async () => {
	// 	await browser.asControl({
	// 		selector: {
	// 			id: "ui.v2.ordersv2::sap.suite.ui.generic.template.ObjectPage.view.Details::Orders--edit",
	// 		}
	// 	}).press();
	// });

	// it("Open ExcelUpload Dialog V4", async () => {
	// 	await browser.asControl({
	// 		selector: {
	// 			id: "ui.v2.ordersv2::sap.suite.ui.generic.template.ObjectPage.view.Details::Orders--action::excelUploadButton",
	// 		}
	// 	}).press();
	// 	const excelUploadDialog = await browser.asControl({
	// 		selector: {
	// 			controlType: "sap.m.Dialog",
	// 			properties: {
	// 				title: "Excel Upload"
	// 			},
	// 			searchOpenDialogs: true
	// 		}
	// 	});
	// 	expect(excelUploadDialog.isOpen()).toBeTruthy();
	// });

	// it("Upload file", async () => {
	// 	const uploader = await browser
	// 	.asControl({
	// 		forceSelect: true,
			
	// 		selector: {
	// 			interaction: "root",
	// 			controlType: "sap.ui.unified.FileUploader",
	// 			id: "__uploader0"
	// 		}
	// 	});
	// 	const fileName = "test/testFiles/TwoRowsNoErrors.xlsx" // relative to wdio.conf.(j|t)s
	// 	const remoteFilePath = await browser.uploadFile(fileName) // this also works in CI senarios!
	// 	// transition from wdi5 api -> wdio api
	// 	const $uploader = await uploader.getWebElement() // wdi5
	// 	const $fileInput = await $uploader.$("input[type=file]") // wdio
	// 	await $fileInput.setValue(remoteFilePath) // wdio
	// 	await browser.asControl({
	// 		selector: {
	// 			controlType: "sap.m.Button",
	// 			properties: {
	// 				text: "Upload"
	// 			}
	// 		}
	// 	}).press();
	// });

	// it("execute save", async () => {
	// 	await browser.asControl({
	// 		selector: {
	// 			id: "ui.v2.ordersv2::sap.suite.ui.generic.template.ObjectPage.view.Details::Orders--activate",
	// 		}
	// 	}).press();
	// });

	it("go to Sub Detail Page", async () => {
		const text = await browser.asControl({
			forceSelect: true,
			selector: {
				controlType: "sap.m.Text",
				viewId: "ui.v2.ordersv2::sap.suite.ui.generic.template.ObjectPage.view.Details::Orders",
				properties: {
					text: "254"
				}
			}
		});
		smartToggle = await text.getParent();
		columnListItem = await smartToggle.getParent()
		$columnListItem = await columnListItem.getWebElement()
		$columnListItem.click();
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
		const selector = {
			selector: {
			  controlType: "sap.ui.layout.form.FormElement",
			  descendant: {
				controlType: "sap.m.Label",
				properties: {
					text: "validFrom"
				  }
			  }
			}
		  }
		  const formElement = await browser.asControl(selector)
		  const fields = await formElement.getFields()
		  const field = fields[0]
		  const content = await field.getContentDisplay()
		  const binding = await content.getBinding("text")
		  const value =  await binding.getValue()
		  const date = new Date(value);
		  const formattedDate = date.toLocaleString('en-US', optionsLong);
		const fieldText = await browser.asControl({
			selector: {
				id: "ui.v2.ordersv2::sap.suite.ui.generic.template.ObjectPage.view.Details::OrderItems--com.sap.vocabularies.UI.v1.Identification::validFrom::Field-text",
			}
		})
		console.log(fieldText)
	});

	it("check Field: timestamp", async () => {
		const selector = {
			selector: {
			  controlType: "sap.ui.layout.form.FormElement",
			  descendant: {
				controlType: "sap.m.Label",
				properties: {
					text: "timestamp"
				  }
			  }
			}
		  }
		  const formElement = await browser.asControl(selector)
		  const fields = await formElement.getFields()
		  const field = fields[0]
		  const content = await field.getContentDisplay()
		  const binding = await content.getBinding("text")
		  const value =  await binding.getValue()
		  const date = new Date(value);
		  const formattedDate = date.toLocaleString('en-US', optionsLong);
		await FioriElementsFacade.execute((Given, When, Then) => {
			Then.onTheSubDetailPage.onForm("OrderItems").iCheckField({ property: "timestamp" }, { value: formattedDate});
		});
	});

	it("check Field: Quantity", async () => {
		const field = await browser.asControl({
			selector: {
				id: "ui.v2.ordersv2::sap.suite.ui.generic.template.ObjectPage.view.Details::OrderItems--com.sap.vocabularies.UI.v1.Identification::quantity::Field"
			}
		})
		const value = await field.getValue()
		expect(value).to.equal("3")
	});

	it("check Field: date", async () => {
		const selector = {
			selector: {
			  controlType: "sap.ui.layout.form.FormElement",
			  descendant: {
				controlType: "sap.m.Label",
				properties: {
					text: "date"
				  }
			  }
			}
		  }
		  const formElement = await browser.asControl(selector)
		  const fields = await formElement.getFields()
		  const field = fields[0]
		  const content = await field.getContentDisplay()
		  const binding = await content.getBinding("text")
		  const value =  await binding.getValue()
		  const date = new Date(value);
		  const formattedDate = date.toLocaleString('en-US', optionsShort);
		await FioriElementsFacade.execute((Given, When, Then) => {
			Then.onTheSubDetailPage.onForm("OrderItems").iCheckField({ property: "date" }, { value: formattedDate});
		});
	});

	it("check Field: time", async () => {
		await FioriElementsFacade.execute((Given, When, Then) => {
			Then.onTheSubDetailPage.onForm("OrderItems").iCheckField({ property: "time" }, { value: '4:00:00 PM'});
		});
	});
});