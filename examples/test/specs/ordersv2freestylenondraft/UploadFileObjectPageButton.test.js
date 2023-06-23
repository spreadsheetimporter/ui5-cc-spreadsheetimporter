const Base = require("../Objects/Base");
let BaseClass = undefined;

describe("Upload File Object Page", () => {
	before(async () => {
		BaseClass = new Base();
	});

	it("go to object page", async () => {
		await browser
			.asControl({
				selector: {
					controlType: "sap.m.ObjectListItem",
					viewId: "container-todo---list",
					bindingPath: {
						path: "/OrdersND(guid'64e718c9-ff99-47f1-8ca3-950c850777d4')",
						propertyPath: "OrderNo"
					}
				}
			})
			.press();
		await BaseClass.dummyWait(1000);
	});

	it("Open ExcelUpload Dialog", async () => {
		const buttonSelector = {
			selector: {
				controlType: "sap.m.Button",
				viewId: "container-todo---detail",
				properties: {
					text: "Excel Upload Button"
				}
			}
		};
		const dialogSelector = {
			selector: {
				controlType: "sap.m.Dialog",
				properties: {
					contentWidth: "40vw"
				},
				searchOpenDialogs: true
			}
		};
		await browser.asControl(buttonSelector).press();
		await BaseClass.dummyWait(1000);
		try {
			await browser.waitUntil(
				async () => {
					excelUploadDialog = await browser.asControl(dialogSelector);
					return excelUploadDialog.isOpen();
				},
				{
					timeout: 5000,
					timeoutMsg: "ExcelUpload Dialog did not appear within 20 seconds"
				}
			);
		} catch (error) {}
		let excelUploadDialog = await browser.asControl(dialogSelector);
		if (!excelUploadDialog.isOpen()) {
			await browser.asControl(buttonSelector).press();
			await browser.waitUntil(
				async () => {
					excelUploadDialog = await browser.asControl(dialogSelector);
					return excelUploadDialog.isOpen();
				},
				{
					timeout: 20000,
					timeoutMsg: "ExcelUpload Dialog did not appear within 20 seconds"
				}
			);
		}
		expect(excelUploadDialog.isOpen()).toBeTruthy();
		try {
			browser.execute(function () {
				const blockLayerPopup = document.getElementById("sap-ui-blocklayer-popup");
				if (blockLayerPopup) {
					blockLayerPopup.remove();
				}
			});
		} catch (error) {
			console.log("sap-ui-blocklayer-popup removed");
		}
	});

	it("Upload file", async () => {
		const uploader = await browser.asControl({
			forceSelect: true,

			selector: {
				interaction: "root",
				controlType: "sap.ui.unified.FileUploader"
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

	it("Check for upload", async () => {
		await BaseClass.dummyWait(500);
		const textControl = await browser.asControl({
			selector: {
				controlType: "sap.m.Text",
				viewId: "container-todo---detail",
				properties: {
					text: "254"
				}
			}
		});
		const actualText = await textControl.getProperty("text");
		expect(actualText).toEqual("254");
	});
});
