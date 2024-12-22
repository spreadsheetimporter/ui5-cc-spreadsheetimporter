const path = require("path");
const fs = require("fs");
const XLSX = require("xlsx");
const Base = require("./../Objects/Base");
const { wdi5 } = require("wdio-ui5-service")

describe("Download Spreadsheet List Report", () => {
	let downloadDir;

	before(async () => {
		BaseClass = new Base();
		scenario = global.scenario;
		downloadDir = path.resolve(__dirname, "../../downloads");

		await wdi5.goTo("#/orders")
	});

	it("should trigger download button", async () => {
		// Trigger the download
		const object = await browser.asControl({
			forceSelect: true,
			selector: {
				id: new RegExp(".*downloadButtonWithoutDialog$")
			}
		});
		await object.press();
	});

	it("Download spreadsheet and verify content", async () => {
		const expectedFileName = "Orders.xlsx";

		// Wait until the specific file is downloaded
		await browser.waitUntil(
			() => {
				const files = fs.readdirSync(downloadDir);
				return files.includes(expectedFileName);
			},
			{
				timeout: 20000,
				timeoutMsg: `Expected ${expectedFileName} to be downloaded within 20s`
			}
		);

		this.filePath = path.join(downloadDir, expectedFileName);
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
		data[0]["Order Number[OrderNo]"] = 100;
		// change second row of Benutzer-ID[buyer] to "Customer 123"
		data[1]["User ID[buyer]"] = "Customer 123";

		// save the file
		const workbookNew = XLSX.utils.book_new();
		const worksheetNew = XLSX.utils.json_to_sheet(data);
		XLSX.utils.book_append_sheet(workbookNew, worksheetNew, "Sheet1");
		XLSX.writeFile(workbookNew, this.filePath);
	});

	it("upload file", async () => {
		// Open upload dialog
		await BaseClass.pressById("container-ordersv4freestyle---OrdersTable--updatedButtonCode4");
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
			browser.execute(function () {
				const blockLayerPopup = document.getElementById("sap-ui-blocklayer-popup");
				if (blockLayerPopup) {
					blockLayerPopup.remove();
				}
			});
		} catch (error) {
			console.log("sap-ui-blocklayer-popup removed");
		}

		// Upload the file
		const uploader = await browser.asControl({
			forceSelect: true,
			selector: {
				interaction: "root",
				controlType: "sap.ui.unified.FileUploader",
				id: "__uploader1"
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
						text: "Upload"
					}
				}
			})
			.press();
		await BaseClass.dummyWait(1000);
	});

	it("check if the file is uploaded", async () => {
		// check if the file is uploaded
		const row1 = await fetch("http://localhost:4004/odata/v4/orders/Orders(ID=64e718c9-ff99-47f1-8ca3-950c850777d4,IsActiveEntity=true)");
		const row2 = await fetch("http://localhost:4004/odata/v4/orders/Orders(ID=64e718c9-ff99-47f1-8ca3-950c850777d5,IsActiveEntity=true)");
		const row1Data = await row1.json();
		const row2Data = await row2.json();
		expect(row1Data.OrderNo).toBe("100");
		expect(row2Data.buyer).toBe("Customer 123");
	});

	after(async () => {
		// Clean up
		let files = fs.readdirSync(downloadDir);
		const downloadedFile = files.find((file) => file.endsWith(".xlsx"));
		const filePath = path.join(downloadDir, downloadedFile);
		fs.unlinkSync(filePath);
		// remove content in download dir
		files = fs.readdirSync(downloadDir);
		files.forEach((file) => {
			fs.unlinkSync(path.join(downloadDir, file));
		});
	});
});
