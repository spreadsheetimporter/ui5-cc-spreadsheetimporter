// only requiring the service for late inject/init
const { default: _ui5Service } = require("wdio-ui5-service");
const ui5Service = new _ui5Service();
const Base = require("./../Objects/Base");
const FEV4 = require("./../Objects/FEV4");

let FE = undefined;
let BaseClass = undefined;

/**
 * Formatting warning coverage (issue #209).
 *
 * `MessageHandler.checkFormat` raises a grouped "Format" warning for every numeric
 * cell whose stored raw value differs from the value Excel displays (display ≠ import).
 * TwoRowsFormat.xlsx triggers exactly two such cells, both on the UnitPrice[price] column:
 *   - row 2: raw 12.56 shown as "1256.00%" (format 0.00%)
 *   - row 3: raw 13.68 shown as "14"       (format 0)
 * Date/time cells are read as dates (cellDates:true) and are intentionally NOT flagged.
 *
 * The warning is a Warning, not an Error: the dialog state is "Warning" and the action
 * button reads "Continue" (not "Continue Anyway").
 */
describe("Formatting Warning Object Page", () => {
	before(async () => {
		BaseClass = new Base();
		// V4-only spec (runs on ordersv4fe / ordersv4fets via specs/v4)
		FE = new FEV4();
	});

	it("go to object page", async () => {
		await BaseClass.dummyWait(1000);
		const hash = `#/${FE.entitySet}(${FE.entityObjectPageFormat})`;
		await browser.goTo({ sHash: hash });
		// force wait to stabelize tests
		await BaseClass.dummyWait(1000);
	});

	it("go to edit mode", async () => {
		await BaseClass.pressById(FE.objectPageEditButton);
		await BaseClass.dummyWait(3000);

		// check if edit button is still visible
		const object = await browser.asControl({
			forceSelect: true,
			selector: {
				id: FE.objectPageEditButton
			}
		});
		// if the edit button is still visible refresh the page and try again
		if (object._domId) {
			await browser.refresh();
			await ui5Service.injectUI5();
		}

		// check if edit button is still visible
		const object2 = await browser.asControl({
			forceSelect: true,
			selector: {
				id: FE.objectPageEditButton
			}
		});
		// if the edit button is still visible refresh the page and try again
		if (object2._domId) {
			await BaseClass.pressById(FE.objectPageEditButton);
			await BaseClass.dummyWait(3000);
		}
	});

	it("Open Spreadsheet Upload Dialog", async () => {
		await BaseClass.dummyWait(1000);
		await BaseClass.pressById(FE.objectPageSpreadsheetuploadButton);
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

	it("Upload file with formatting differences", async () => {
		const uploader = await browser.asControl({
			forceSelect: true,
			selector: {
				interaction: "root",
				controlType: "sap.ui.unified.FileUploader",
				searchOpenDialogs: true
			}
		});
		const fileName = "test/testFiles/TwoRowsFormat.xlsx"; // relative to wdio.conf.(j|t)s
		const remoteFilePath = await browser.uploadFile(fileName); // this also works in CI senarios
		// transition from wdi5 api -> wdio api
		const $uploader = await uploader.getWebElement(); // wdi5
		const $fileInput = await $uploader.$("input[type=file]"); // wdio
		await $fileInput.setValue(remoteFilePath); // wdio

		// Selecting the file auto-triggers validation -> the message dialog opens on its own
		await browser.waitUntil(
			async () => {
				try {
					const dialog = await browser.asControl({
						forceSelect: true,
						selector: {
							controlType: "sap.m.Dialog",
							properties: { title: "Upload Error" },
							searchOpenDialogs: true
						}
					});
					return dialog.isOpen();
				} catch (error) {
					return false;
				}
			},
			{
				timeout: 20000,
				timeoutMsg: "Formatting warning dialog did not open within 20 seconds"
			}
		);
	});

	it("shows exactly one grouped 'Format' warning for rows 2 and 3", async () => {
		const messageDialog = await browser.asControl({
			selector: {
				controlType: "sap.m.Dialog",
				properties: { title: "Upload Error" },
				searchOpenDialogs: true
			}
		});

		const model = await messageDialog.getModel("messages");
		const data = await model.getData();
		// wdi5 serializes the JSONModel array either as a plain array or wrapped in _baseObject
		const groups = Array.isArray(data) ? data : Object.values(data._baseObject || data);

		// only the format warnings are present -> a single grouped "Format" message
		expect(groups.length).toBe(1);

		const formatGroup = groups[0];
		expect(formatGroup.title).toBe("Format");
		expect(formatGroup.ui5type).toBe("Warning");

		// the grouped description reports the raw (imported) values, not the displayed ones
		expect(formatGroup.description).toContain("12.56");
		expect(formatGroup.description).toContain("13.68");
		// guard against reporting the *displayed* value instead of the raw one
		expect(formatGroup.description).toContain("1256.00%");
		expect(formatGroup.description).toContain("14");
	});

	it("severity is Warning and the action button is 'Continue' (not 'Continue Anyway')", async () => {
		const messageDialog = await browser.asControl({
			selector: {
				controlType: "sap.m.Dialog",
				properties: { title: "Upload Error" },
				searchOpenDialogs: true
			}
		});
		// a formatting issue is a warning, so the dialog state must be Warning (not Error)
		const state = await messageDialog.getProperty("state");
		expect(state).toBe("Warning");

		// for a non-error dialog the continue button reads "Continue" (Error -> "Continue Anyway")
		const continueButton = await browser.asControl({
			selector: {
				controlType: "sap.m.Button",
				properties: { text: "Continue" },
				searchOpenDialogs: true
			}
		});
		const continueButtonText = await continueButton.getProperty("text");
		expect(continueButtonText).toBe("Continue");
	});

	after(async () => {
		// clean up - ensure any open dialogs are closed (no save -> draft is discarded)
		try {
			await browser.keys(["Escape"]);
			await BaseClass.dummyWait(500);
			await browser.keys(["Escape"]);
			await BaseClass.dummyWait(500);
		} catch (error) {
			// Ignore cleanup errors
		}
	});
});
