const path = require("path");
const fs = require("fs");
const XLSX = require("xlsx");
const Base = require("./../Objects/Base");
const { wdi5 } = require("wdio-ui5-service");

// Test Constants
const TEST_CONSTANTS = {
	FILE: {
		NAME: "Orders.xlsx",
		TIMEOUT: 20000
	},
	UPDATES: {
		ORDER_NUMBER: 100,
		USER_ID: "Customer 123"
	},
	DOWNLOAD: {
		WAIT_AFTER_UPLOAD: 4000,
		TIMEOUT: 20000,
		WAIT_AFTER_DOWNLOAD: 4000,
		WAIT_AFTER_UPLOAD_AGAIN: 4000,
		WAIT_AFTER_UPLOAD_AGAIN_2: 4000,
		WAIT_AFTER_UPLOAD_AGAIN_3: 4000
	},
	SELECTORS: {
		DOWNLOAD_BUTTON: ".*downloadButtonWithoutDialog$",
		UPLOAD_DIALOG: {
			BUTTON_ID: "container-ordersv4freestyle---OrdersTable--updatedButtonCode4",
			UPLOADER_ID: "__uploader1",
			UPLOAD_BUTTON_TEXT: "Upload"
		}
	},
	API: {
		BASE_URL: "http://localhost:4004/odata/v4/orders/Orders",
		ROW_1_ID: "64e718c9-ff99-47f1-8ca3-950c850777d4",
		ROW_2_ID: "64e718c9-ff99-47f1-8ca3-950c850777d5",
		ROW3_ID: "64e718c9-ff99-47f1-8ca3-950c850777d6",
		ROW4_ID: "64e718c9-ff99-47f1-8ca3-950c850777d7"
	}
};

describe("Download Spreadsheet List Report", () => {
	let downloadDir;

	before(async () => {
		BaseClass = new Base();
		scenario = global.scenario;
		downloadDir = path.resolve(__dirname, "../../downloads");

		await wdi5.goTo("#/orders");
	});

	it("should trigger download button", async () => {
		const object = await browser.asControl({
			forceSelect: true,
			selector: {
				id: new RegExp(TEST_CONSTANTS.SELECTORS.DOWNLOAD_BUTTON)
			}
		});
		await object.press();
	});

	it("Download spreadsheet and verify content", async () => {
		await browser.waitUntil(
			() => {
				const files = fs.readdirSync(downloadDir);
				return files.includes(TEST_CONSTANTS.FILE.NAME);
			},
			{
				timeout: TEST_CONSTANTS.FILE.TIMEOUT,
				timeoutMsg: `Expected ${TEST_CONSTANTS.FILE.NAME} to be downloaded within ${TEST_CONSTANTS.FILE.TIMEOUT}ms`
			}
		);

		this.filePath = path.join(downloadDir, TEST_CONSTANTS.FILE.NAME);
		expect(fs.existsSync(this.filePath)).toBeTruthy();

		const workbook = XLSX.readFile(this.filePath);
		expect(workbook.SheetNames.length).toBeGreaterThan(0);

		const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
		const data = XLSX.utils.sheet_to_json(firstSheet);
		expect(data.length).toBeGreaterThan(0);

		// check for every data row that IsActiveEntity[IsActiveEntity] should be available and true
		data.forEach((row) => {
			expect(row["IsActiveEntity[IsActiveEntity]"]).toBeDefined();
			expect(row["IsActiveEntity[IsActiveEntity]"]).toBe(true);
		});
		// change first row of Order Number[OrderNo] to 100
		data[0]["Order Number[OrderNo]"] = TEST_CONSTANTS.UPDATES.ORDER_NUMBER;
		// change second row of Benutzer-ID[buyer] to "Customer 123"
		data[1]["User ID[buyer]"] = TEST_CONSTANTS.UPDATES.USER_ID;

		// save the file
		const workbookNew = XLSX.utils.book_new();
		const worksheetNew = XLSX.utils.json_to_sheet(data);
		XLSX.utils.book_append_sheet(workbookNew, worksheetNew, "Sheet1");
		XLSX.writeFile(workbookNew, this.filePath);
	});

	it("upload file", async () => {
		await BaseClass.pressById(TEST_CONSTANTS.SELECTORS.UPLOAD_DIALOG.BUTTON_ID);
		const spreadsheetUploadDialog = await browser.asControl({
			selector: {
				controlType: "sap.m.Dialog",
				properties: {
					contentWidth: "40vw"
				},
				searchOpenDialogs: true
			}
		});
		expect(spreadsheetUploadDialog.isOpen()).toBeTruthy();

		// Remove block layer if present
		try {
			await browser.execute(() => {
				const blockLayerPopup = document.getElementById("sap-ui-blocklayer-popup");
				if (blockLayerPopup) {
					blockLayerPopup.remove();
				}
			});
		} catch (error) {
			console.log("sap-ui-blocklayer-popup removed");
		}

		// Fix: Correct file upload process
		const uploader = await browser.asControl({
			forceSelect: true,
			selector: {
				interaction: "root",
				controlType: "sap.ui.unified.FileUploader",
				id: TEST_CONSTANTS.SELECTORS.UPLOAD_DIALOG.UPLOADER_ID
			}
		});
		
		// Fix: Use the correct uploadFile syntax
		await browser.execute(
			function (filePath) {
				document.querySelector('input[type=file]').style.display = 'block';
			}
		);
		
		const input = await $('input[type=file]');
		await input.setValue(this.filePath);

		await browser
			.asControl({
				selector: {
					controlType: "sap.m.Button",
					properties: {
						text: TEST_CONSTANTS.SELECTORS.UPLOAD_DIALOG.UPLOAD_BUTTON_TEXT
					}
				}
			})
			.press();
	});

	it("check if the file is uploaded", async () => {
		await BaseClass.dummyWait(4000);

		const row1 = await fetch(`${TEST_CONSTANTS.API.BASE_URL}(ID=${TEST_CONSTANTS.API.ROW_1_ID},IsActiveEntity=true)`);
		const row2 = await fetch(`${TEST_CONSTANTS.API.BASE_URL}(ID=${TEST_CONSTANTS.API.ROW_2_ID},IsActiveEntity=true)`);
		const row1Data = await row1.json();
		const row2Data = await row2.json();

		expect(row1Data.OrderNo).toBe(TEST_CONSTANTS.UPDATES.ORDER_NUMBER.toString());
		expect(row2Data.buyer).toBe(TEST_CONSTANTS.UPDATES.USER_ID);
	});

	it("set entity to draft", async () => {
		try {
			// Make a POST request to create a draft version
			const url = `${TEST_CONSTANTS.API.BASE_URL}(ID=${TEST_CONSTANTS.API.ROW3_ID},IsActiveEntity=true)/OrdersService.draftEdit`;
			console.log(url);
			const response = await fetch(url, {
				method: "POST",
				headers: {
					'Accept': 'application/json;odata.metadata=minimal;IEEE754Compatible=true',
					'Content-Type': 'application/json;charset=UTF-8;IEEE754Compatible=true',
					'Accept-Language': 'en',
					'Prefer': 'handling=strict'
				},
				body: JSON.stringify({
					PreserveChanges: true
				})
			});

			if (!response.ok) {
				throw new Error(`Failed to set entity to draft: ${response.status} ${response.statusText}`);
			}

			await BaseClass.dummyWait(1000);
		} catch (error) {
			throw new Error(`Failed to set entity to draft: ${error.message}`);
		}
	});

	it("delete Orders.xlsx file", async () => {
		try {
			const filePath = path.join(downloadDir, TEST_CONSTANTS.FILE.NAME);
			if (fs.existsSync(filePath)) {
				fs.unlinkSync(filePath);
			}
			expect(fs.existsSync(filePath)).toBeFalsy();
		} catch (error) {
			throw new Error(`Failed to delete file: ${error.message}`);
		}
	});

	it("should trigger download button again", async () => {
		try {
			const object = await browser.asControl({
				forceSelect: true,
				selector: {
					id: new RegExp(TEST_CONSTANTS.SELECTORS.DOWNLOAD_BUTTON)
				}
			});
			await object.press();
		} catch (error) {
			throw new Error(`Failed to trigger download: ${error.message}`);
		}
	});

	it("change excel file and save", async () => {
		try {
			// Wait for download and verify file exists
			await browser.waitUntil(
				() => {
					const files = fs.readdirSync(downloadDir);
					return files.includes(TEST_CONSTANTS.FILE.NAME);
				},
				{
					timeout: TEST_CONSTANTS.DOWNLOAD.TIMEOUT,
					timeoutMsg: `Expected ${TEST_CONSTANTS.FILE.NAME} to be downloaded within ${TEST_CONSTANTS.DOWNLOAD.TIMEOUT}ms`
				}
			);

			this.filePath = path.join(downloadDir, TEST_CONSTANTS.FILE.NAME);
			const workbook = XLSX.readFile(this.filePath);
			const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
			const data = XLSX.utils.sheet_to_json(firstSheet);

			// Update the draft and active entities
			data.forEach((row) => {
				if (row["ID[ID]"] === TEST_CONSTANTS.API.ROW3_ID) {
					row["Order Number[OrderNo]"] = "999";
				}
				if (row["ID[ID]"] === TEST_CONSTANTS.API.ROW4_ID) {
					row["Order Number[OrderNo]"] = "888";
				}
			});

			// Save updated file
			const workbookNew = XLSX.utils.book_new();
			const worksheetNew = XLSX.utils.json_to_sheet(data);
			XLSX.utils.book_append_sheet(workbookNew, worksheetNew, TEST_CONSTANTS.FILE.SHEET_NAME);
			XLSX.writeFile(workbookNew, this.filePath);
		} catch (error) {
			throw new Error(`Failed to update excel file: ${error.message}`);
		}
	});

	it("upload file again", async () => {
		try {
			await BaseClass.pressById(TEST_CONSTANTS.SELECTORS.UPLOAD_DIALOG.BUTTON_ID);
			const spreadsheetUploadDialog = await browser.asControl({
				selector: {
					controlType: "sap.m.Dialog",
					properties: {
						contentWidth: "40vw"
					},
					searchOpenDialogs: true
				}
			});
			expect(spreadsheetUploadDialog.isOpen()).toBeTruthy();

			// Remove block layer if present
			await browser.execute(() => {
				const blockLayerPopup = document.getElementById("sap-ui-blocklayer-popup");
				if (blockLayerPopup) {
					blockLayerPopup.remove();
				}
			});

			// Upload the file
			const uploader = await browser.asControl({
				forceSelect: true,
				selector: {
					interaction: "root",
					controlType: "sap.ui.unified.FileUploader",
					id: TEST_CONSTANTS.SELECTORS.FILE_UPLOADER
				}
			});
			const remoteFilePath = await browser.uploadFile(this.filePath);
			const $uploader = await uploader.getWebElement();
			const $fileInput = await $uploader.$("input[type=file]");
			await $fileInput.setValue(remoteFilePath);

			// Click upload button
			await browser
				.asControl({
					selector: {
						controlType: "sap.m.Button",
						properties: {
							text: TEST_CONSTANTS.SELECTORS.UPLOAD_DIALOG.UPLOAD_BUTTON_TEXT
						}
					},
					forceSelect: true
				})
				.press();
		} catch (error) {
			throw new Error(`Failed to upload file: ${error.message}`);
		}
	});

	it("check if the file is correctly uploaded", async () => {
		try {
			await BaseClass.dummyWait(TEST_CONSTANTS.DOWNLOAD.WAIT_AFTER_UPLOAD);

			const urlRow3 = `${TEST_CONSTANTS.API.BASE_URL}(ID=${TEST_CONSTANTS.API.ROW3_ID},IsActiveEntity=false)`;
			const urlRow4 = `${TEST_CONSTANTS.API.BASE_URL}(ID=${TEST_CONSTANTS.API.ROW4_ID},IsActiveEntity=true)`;

			// Check both updated rows
			const [row3Draft, row4Active] = await Promise.all([
				fetch(urlRow3),
				fetch(urlRow4)
			]);

			const [row3Data, row4Data] = await Promise.all([row3Draft.json(), row4Active.json()]);

			expect(row3Data.OrderNo).toBe("999");
			expect(row4Data.OrderNo).toBe("888");
		} catch (error) {
			throw new Error(`Failed to verify uploaded data: ${error.message}`);
		}
	});

	after(async () => {
		const testFiles = [TEST_CONSTANTS.FILE.NAME];
		testFiles.forEach((file) => {
			const filePath = path.join(downloadDir, file);
			if (fs.existsSync(filePath)) {
				fs.unlinkSync(filePath);
			}
		});
	});
});
