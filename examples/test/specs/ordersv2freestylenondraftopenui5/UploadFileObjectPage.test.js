const Base = require("./../Objects/Base");

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
						path: "/OrdersND(guid'7e2f2640-6866-4dcf-8f4d-3027aa831cad')",
						propertyPath: "OrderNo"
					}
				}
			})
			.press();
	});

	it("Open ExcelUpload Dialog", async () => {
		await browser
			.asControl({
				selector: {
					controlType: "sap.m.Button",
					viewId: "container-todo---detail",
					properties: {
						text: "Excel Upload"
					}
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
