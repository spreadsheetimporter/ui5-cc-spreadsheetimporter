describe("Open Excel Upload dialog", () => {
	const optionsLong = {
		year: "numeric",
		month: "short",
		day: "numeric",
		hour: "numeric",
		minute: "numeric",
		second: "numeric",
		hour12: true
	};
	const optionsShort = {
		month: "short",
		day: "numeric",
		year: "numeric"
	};

	it("should trigger search on ListReport page", async () => {
		await browser
			.asControl({
				selector: {
					controlType: "sap.m.ColumnListItem",
					viewId: "ui.v2.ordersv2fe::sap.suite.ui.generic.template.ListReport.view.ListReport::Orders",
					bindingPath: {
						path: "/Orders(ID=guid'64e718c9-ff99-47f1-8ca3-950c850777d4',IsActiveEntity=true)",
						propertyPath: "IsActiveEntity"
					}
				}
			})
			.press();
	});

	it("should see an object page", async () => {
		await browser
			.asControl({
				selector: {
					id: "ui.v2.ordersv2fe::sap.suite.ui.generic.template.ObjectPage.view.Details::Orders--edit"
				}
			})
			.press();
	});

	it("Open ExcelUpload Dialog V2", async () => {
		await browser
			.asControl({
				selector: {
					id: "ui.v2.ordersv2fe::sap.suite.ui.generic.template.ObjectPage.view.Details::Orders--action::excelUploadButton"
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
		const uploader = await browser.asControl({
			forceSelect: true,

			selector: {
				interaction: "root",
				controlType: "sap.ui.unified.FileUploader",
				id: "__uploader0"
			}
		});
		const fileName = "test/testFiles/TwoRowsNoErrors.xlsx"; // relative to wdio.conf.(j|t)s
		const remoteFilePath = await browser.uploadFile(fileName); // this also works in CI senarios!
		// transition from wdi5 api -> wdio api
		const $uploader = await uploader.getWebElement(); // wdi5
		const $fileInput = await $uploader.$("input[type=file]"); // wdio
		await $fileInput.setValue(remoteFilePath); // wdio
		await browser
			.asControl({
				selector: {
					controlType: "sap.m.Button",
					properties: {
						text: "Upload"
					}
				}
			})
			.press();
	});

	it("execute save", async () => {
		await browser
			.asControl({
				selector: {
					id: "ui.v2.ordersv2fe::sap.suite.ui.generic.template.ObjectPage.view.Details::Orders--activate"
				}
			})
			.press();
	});

	it("go to Sub Detail Page", async () => {
		const text = await browser.asControl({
			forceSelect: true,
			selector: {
				controlType: "sap.m.Text",
				viewId: "ui.v2.ordersv2fe::sap.suite.ui.generic.template.ObjectPage.view.Details::Orders",
				properties: {
					text: "254"
				}
			}
		});
		smartToggle = await text.getParent();
		columnListItem = await smartToggle.getParent();
		$columnListItem = await columnListItem.getWebElement();
		$columnListItem.click();
	});

	it("fields quantity", async () => {
		const elements = await $$("[id*='quantity']")
		for (const element of elements) {
			console.log(await element.getHTML());
		}
	});

	it("check Field: Quantity", async () => {
		const field = await browser.asControl({
			selector: {
				id: "ui.v2.ordersv2fe::sap.suite.ui.generic.template.ObjectPage.view.Details::OrderItems--com.sap.vocabularies.UI.v1.Identification::quantity::Field"
			}
		});
		const value = await field.getText();
		expect(value).toBe("3");
	});

	it("check Field: Product", async () => {
		const field = await browser.asControl({
			selector: {
				id: "ui.v2.ordersv2fe::sap.suite.ui.generic.template.ObjectPage.view.Details::OrderItems--com.sap.vocabularies.UI.v1.Identification::title::Field"
			}
		});
		const value = await field.getText();
		expect(value).toBe("Product Test 2");
	});

	it("check Field: UnitPrice", async () => {
		const field = await browser.asControl({
			selector: {
				id: "ui.v2.ordersv2fe::sap.suite.ui.generic.template.ObjectPage.view.Details::OrderItems--com.sap.vocabularies.UI.v1.Identification::price::Field"
			}
		});
		const value = await field.getText();
		expect(value).toBe("13.7");
	});

	it("check Field: validFrom", async () => {
		const selector = {
			selector: {
				controlType: "sap.ui.comp.smartform.GroupElement",
				descendant: {
					controlType: "sap.ui.comp.smartfield.SmartLabel",
					properties: {
						text: "validFrom"
					}
				}
			}
		};
		const formElement = await browser.asControl(selector);
		const fields = await formElement.getFields();
		const field = fields[0];
		const binding = await field.getBinding("text");
		const date = await binding.getValue();
		const formattedDate = await date.toLocaleString("en-US", optionsLong);
		const valueText = await field.getText();
		expect(valueText).toBe(formattedDate);
	});

	it("check Field: timestamp", async () => {
		const selector = {
			selector: {
				controlType: "sap.ui.comp.smartform.GroupElement",
				descendant: {
					controlType: "sap.ui.comp.smartfield.SmartLabel",
					properties: {
						text: "timestamp"
					}
				}
			}
		};
		const formElement = await browser.asControl(selector);
		const fields = await formElement.getFields();
		const field = fields[0];
		const binding = await field.getBinding("text");
		const date = await binding.getValue();
		const formattedDate = await date.toLocaleString("en-US", optionsLong);
		const valueText = await field.getText();
		expect(valueText).toBe(formattedDate);
	});

	it("check Field: date", async () => {
		const selector = {
			selector: {
				controlType: "sap.ui.comp.smartform.GroupElement",
				descendant: {
					controlType: "sap.ui.comp.smartfield.SmartLabel",
					properties: {
						text: "date"
					}
				}
			}
		};
		const formElement = await browser.asControl(selector);
		const fields = await formElement.getFields();
		const field = fields[0];
		const binding = await field.getBinding("text");
		const date = await binding.getValue();
		const formattedDate = await date.toLocaleString("en-US", optionsShort);
		const valueText = await field.getText();
		expect(valueText).toBe(formattedDate);
	});

	it("check Field: time", async () => {
		const field = await browser.asControl({
			selector: {
				id: "ui.v2.ordersv2fe::sap.suite.ui.generic.template.ObjectPage.view.Details::OrderItems--com.sap.vocabularies.UI.v1.Identification::time::Field"
			}
		});
		const value = await field.getText();
		expect(value).toBe("4:00:00 PM");
	});
});
