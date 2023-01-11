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
					id: "ui.v4.ordersv4fe::OrdersList--fe::FilterBar::Orders-btnSearch"
				}
			})
			.press();
	});

	it("go to object page", async () => {
		const table = await browser.asControl({
			selector: {
				interaction: "root",
				id: "ui.v4.ordersv4fe::OrdersList--fe::table::Orders::LineItem-innerTable"
			}
		});
		const items = await table.getItems();
		for (let index = 0; index < items.length; index++) {
			const element = items[index];
			const binding = await element.getBindingContext();
			const object = await binding.getObject();
			if (object.OrderNo === "2") {
				const $element = await element.getWebElement();
				try {
					await $element.click();
				} catch (error) {
					// click failed, try again in a second
					console.log(error);
					try {
						await $("filtekuzfutkfk424214").waitForExist({ timeout: 1000 });
					} catch (error) {}
					await $element.click();
				}
				break;
			}
		}
		// force wait to stabelize tests
		try {
			await $("filtekuzfutkfk424214").waitForExist({ timeout: 1000 });
		} catch (error) {}
	});

	it("go to edit mode", async () => {
		await browser
			.asControl({
				selector: {
					id: "ui.v4.ordersv4fe::OrdersObjectPage--fe::StandardAction::Edit"
				}
			})
			.press();
	});

	it("Open ExcelUpload Dialog V4", async () => {
		await browser
			.asControl({
				selector: {
					id: "ui.v4.ordersv4fe::OrdersObjectPage--fe::CustomAction::excelUpload"
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
		// force wait to stabelize tests
		try {
			await $("filtekuzfutkfk424214").waitForExist({ timeout: 500 });
		} catch (error) {}
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
					id: "ui.v4.ordersv4fe::OrdersObjectPage--fe::FooterBar::StandardAction::Save"
				}
			})
			.press();
	});

	it("go to Sub Detail Page", async () => {
		// try {
		// 	await $("filtekuzfutkfk424214").waitForExist({ timeout: 1000 });
		// } catch (error) {}
		const table = await browser.asControl({
			selector: {
				interaction: "root",
				id: "ui.v4.ordersv4fe::OrdersObjectPage--fe::table::Items::LineItem-innerTable"
			}
		});
		const items = await table.getItems();
		for (let index = 0; index < items.length; index++) {
			const element = items[index];
			const binding = await element.getBindingContext();
			const object = await binding.getObject();
			if (object.product_ID === "254") {
				const $element = await element.getWebElement();
				await $element.scrollIntoView()
				try {
					await $element.click();
				} catch (error) {
					// click failed, try again in a second
					console.log(error);
					try {
						await $("filtekuzfutkfk424214").waitForExist({ timeout: 6000 });
					} catch (error) {}
					await $element.click();
				}
				break;
			}
		}
		// force wait to stabelize tests
		try {
			await $("filtekuzfutkfk424214").waitForExist({ timeout: 1000 });
		} catch (error) {}
	});

	it("check Field: Quantity", async () => {
		const field = await browser.asControl({
			selector: {
				id: "ui.v4.ordersv4fe::Orders_ItemsObjectPage--fe::FormContainer::Identification::FormElement::DataField::quantity::Field-content"
			}
		});
		const contentDisplay = await field.getContentDisplay();
		const value = await contentDisplay.getText();
		expect(value).toBe("3");
	});

	it("check Field: Product", async () => {
		const field = await browser.asControl({
			selector: {
				id: "ui.v4.ordersv4fe::Orders_ItemsObjectPage--fe::FormContainer::Identification::FormElement::DataField::title::Field-content"

			}
		});
		const contentDisplay = await field.getContentDisplay();
		const value = await contentDisplay.getText();
		expect(value).toBe("Product Test 2");
	});

	it("check Field: UnitPrice", async () => {
		const field = await browser.asControl({
			selector: {
				id: "ui.v4.ordersv4fe::Orders_ItemsObjectPage--fe::FormContainer::Identification::FormElement::DataField::price::Field-content"
			}
		});
		const contentDisplay = await field.getContentDisplay();
		const value = await contentDisplay.getText();
		expect(value).toBe("13.7");
	});

	it("check Field: validFrom", async () => {
		const field = await browser.asControl({
			selector: {
				id: "ui.v4.ordersv4fe::Orders_ItemsObjectPage--fe::FormContainer::Identification::FormElement::DataField::validFrom::Field-content"
			}
		});
		const binding = await field.getBindingContext();
		const object = await binding.getObject();
		const date = new Date(object.validFrom)
		const formattedDate = await date.toLocaleString("en-US", optionsLong);
		// check printend value
		const contentDisplay = await field.getContentDisplay();
		const valueText = await contentDisplay.getText();
		expect(valueText).toBe(formattedDate);
	});

	it("check Field: timestamp", async () => {
		const field = await browser.asControl({
			selector: {
				id: "ui.v4.ordersv4fe::Orders_ItemsObjectPage--fe::FormContainer::Identification::FormElement::DataField::timestamp::Field-content"
			}
		});
		const binding = await field.getBindingContext();
		const object = await binding.getObject();
		const date = new Date(object.timestamp)
		const formattedDate = await date.toLocaleString("en-US", optionsLong);
		// check printend value
		const contentDisplay = await field.getContentDisplay();
		const valueText = await contentDisplay.getText();
		expect(valueText).toBe(formattedDate);
	});

	it("check Field: date", async () => {
		const field = await browser.asControl({
			selector: {
				id: "ui.v4.ordersv4fe::Orders_ItemsObjectPage--fe::FormContainer::Identification::FormElement::DataField::date::Field-content"
			}
		});
		const binding = await field.getBindingContext();
		const object = await binding.getObject();
		const date = new Date(object.date)
		const formattedDate = await date.toLocaleString("en-US", optionsShort);
		// check printend value
		const contentDisplay = await field.getContentDisplay();
		const valueText = await contentDisplay.getText();
		expect(valueText).toBe(formattedDate);
	});

	it("check Field: time", async () => {
		const field = await browser.asControl({
			selector: {
				id: "ui.v4.ordersv4fe::Orders_ItemsObjectPage--fe::FormContainer::Identification::FormElement::DataField::time::Field-content"
			}
		});
		const contentDisplay = await field.getContentDisplay();
		const value = await contentDisplay.getText();
		expect(value).toBe("4:00:00 PM");
	});
});
