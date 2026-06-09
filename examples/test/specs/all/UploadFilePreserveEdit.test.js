// Regression test for issue #231:
// An upload must NOT discard the user's unrelated pending changes.
//
// Scenario (OData V2, Fiori Elements, non-draft Object Page):
//   1. enter edit mode
//   2. make a manual change to an Order *header* field -> a pending change on the model
//   3. upload a spreadsheet that has validation errors -> the importer raises its "Upload Error"
//      dialog (nothing is created/submitted), and closing that dialog runs the importer's cleanup
//      (resetContent -> resetContexts)
//   4. the user's header pending change must still be there afterwards
//
// Before the fix, resetContexts() called model.resetChanges() (no args) and wiped ALL pending
// changes - including the user's edit. The fix resets ONLY the importer's own created/updated rows
// (here: none), so the user's edit survives.
//
// Why the error path (and not a successful upload): on a *successful* V2 upload the importer's
// submitChanges() flushes the whole model, so the user's edit is committed (not observably lost).
// The data loss only manifests when resetContexts() runs while the edit is still pending.
//
// Guarded to the ordersv2fenondraft scenario because the "all/**" glob is shared with v2fe/v4fe.
const { default: _ui5Service } = require("wdio-ui5-service");
const ui5Service = new _ui5Service();
const FEV2ND = require("../Objects/FEV2ND");
const Base = require("./../Objects/Base");

let FE = undefined;
let BaseClass = undefined;
let editedValue = undefined; // the unique value we write into the header field

// Read the header context's pending-change state from inside the browser (the repo's established
// pattern; avoids the unproven wdi5 model-method bridge). Returns plain, serializable data.
async function readHeaderPending(tableId, prop) {
	return browser.execute(
		function (tableId, prop) {
			function byId(id) {
				const E = sap.ui.require("sap/ui/core/Element");
				return E && E.getElementById ? E.getElementById(id) : sap.ui.getCore().byId(id);
			}
			const oTable = byId(tableId);
			if (!oTable) return { error: "table not found" };
			const oModel = oTable.getModel();
			const oHeaderCtx = oTable.getBindingContext();
			if (!oHeaderCtx) return { error: "no header binding context" };
			const key = oHeaderCtx.getPath().replace(/^\//, "");
			const pending = oModel.getPendingChanges() || {};
			const entry = pending[key];
			return {
				key: key,
				hasHeaderChange: Object.prototype.hasOwnProperty.call(pending, key),
				changedValue: entry ? entry[prop] : undefined,
				allKeys: Object.keys(pending)
			};
		},
		tableId,
		prop
	);
}

describe("Preserve user's pending changes on upload (#231)", () => {
	before(function () {
		const scenario = global.scenario;
		if (!scenario || !scenario.startsWith("ordersv2fenondraft")) {
			this.skip();
			return;
		}
		FE = new FEV2ND();
		BaseClass = new Base();
	});

	it("go to object page", async () => {
		const hash = `#/${FE.entitySet}(${FE.entityObjectPage})`;
		await browser.goTo({ sHash: hash });
		await BaseClass.dummyWait(1000);
		// Running this spec in isolation means a cold app: wait until the object page (edit button)
		// has actually rendered before interacting with it.
		await browser.waitUntil(
			async () => {
				const btn = await browser.asControl({ forceSelect: true, selector: { id: FE.objectPageEditButton } });
				return !!btn && !!btn._domId;
			},
			{ timeout: 90000, interval: 1000, timeoutMsg: "Object page edit button did not render" }
		);
	});

	it("go to edit mode", async () => {
		await BaseClass.pressById(FE.objectPageEditButton);
		await BaseClass.dummyWait(3000);

		// if the edit button is still visible, refresh the page and try again (mirrors UploadFileObjectPage)
		const object = await browser.asControl({ forceSelect: true, selector: { id: FE.objectPageEditButton } });
		if (object._domId) {
			await browser.refresh();
			await ui5Service.injectUI5();
			await browser.waitUntil(
				async () => {
					const btn = await browser.asControl({ forceSelect: true, selector: { id: FE.objectPageEditButton } });
					return !!btn && !!btn._domId;
				},
				{ timeout: 90000, interval: 1000, timeoutMsg: "Object page edit button did not render after refresh" }
			);
		}
		const object2 = await browser.asControl({ forceSelect: true, selector: { id: FE.objectPageEditButton } });
		if (object2._domId) {
			await BaseClass.pressById(FE.objectPageEditButton);
			await BaseClass.dummyWait(3000);
		}
		// confirm we actually entered edit mode (save button present) before continuing
		await browser.waitUntil(
			async () => {
				const save = await browser.asControl({ forceSelect: true, selector: { id: FE.objectPageSaveButton } });
				return !!save && !!save._domId;
			},
			{ timeout: 30000, interval: 1000, timeoutMsg: "Did not enter edit mode (save button not found)" }
		);
	});

	it("make an unrelated manual edit on the order header", async () => {
		// Set OrderNo to a value guaranteed to differ from the current one, so a pending change is
		// created regardless of the backend's current value.
		const result = await browser.execute(function (tableId) {
			function byId(id) {
				const E = sap.ui.require("sap/ui/core/Element");
				return E && E.getElementById ? E.getElementById(id) : sap.ui.getCore().byId(id);
			}
			const oTable = byId(tableId);
			const oModel = oTable.getModel();
			const oHeaderCtx = oTable.getBindingContext();
			const oldValue = oModel.getProperty("OrderNo", oHeaderCtx) || "";
			const newValue = oldValue + "-E231";
			oModel.setProperty("OrderNo", newValue, oHeaderCtx);
			return { newValue: newValue, headerPath: oHeaderCtx.getPath() };
		}, FE.objectPageOrderItems);
		editedValue = result.newValue;
		expect(result.headerPath).toBeDefined();

		// confirm the pending change is registered before we upload
		const before = await readHeaderPending(FE.objectPageOrderItems, "OrderNo");
		expect(before.hasHeaderChange).toBe(true);
		expect(before.changedValue).toBe(editedValue);
	});

	it("upload a file with validation errors (raises the Upload Error dialog)", async () => {
		await BaseClass.dummyWait(500);
		await BaseClass.pressById(FE.objectPageSpreadsheetuploadButton);
		await browser.asControl({
			selector: { controlType: "sap.m.Dialog", properties: { contentWidth: "40vw" }, searchOpenDialogs: true }
		});
		try {
			await browser.execute(function () {
				const b = document.getElementById("sap-ui-blocklayer-popup");
				if (b) b.remove();
			});
		} catch (e) {
			/* nothing */
		}

		const uploader = await browser.asControl({
			forceSelect: true,
			selector: { interaction: "root", controlType: "sap.ui.unified.FileUploader", searchOpenDialogs: true }
		});
		const remoteFilePath = await browser.uploadFile("test/testFiles/TwoRowsErrors.xlsx");
		const $uploader = await uploader.getWebElement();
		const $fileInput = await $uploader.$("input[type=file]");
		await $fileInput.setValue(remoteFilePath);

		await browser.asControl({ selector: { controlType: "sap.m.Button", properties: { text: "Upload" }, searchOpenDialogs: true } }).press();

		// the "Upload Error" messages dialog only opens when validation found errors -> nothing was
		// created or submitted; the user's pending edit is therefore still untouched at this point.
		await browser.waitUntil(
			async () => {
				const dlg = await browser.asControl({
					forceSelect: true,
					selector: { controlType: "sap.m.Dialog", properties: { title: "Upload Error" }, searchOpenDialogs: true }
				});
				return !!dlg && !!dlg._domId && (await dlg.isOpen());
			},
			{ timeout: 30000, interval: 500, timeoutMsg: "Upload Error dialog did not appear" }
		);
	});

	it("close the error dialog (runs the importer cleanup / resetContexts)", async () => {
		try {
			await browser.execute(function () {
				const b = document.getElementById("sap-ui-blocklayer-popup");
				if (b) b.remove();
			});
		} catch (e) {
			/* nothing */
		}
		// fire the press handler directly (the MessageView list can intercept a DOM click in headless):
		// Close -> onCloseMessageDialog -> spreadsheetUploadController.resetContent() -> resetContexts()
		const closeBtn = await browser.asControl({
			forceSelect: true,
			selector: { controlType: "sap.m.Button", properties: { text: "Close" }, searchOpenDialogs: true }
		});
		await closeBtn.firePress();
		await BaseClass.dummyWait(1500);
	});

	it("the manual header edit must still be pending after the cleanup (#231)", async () => {
		const after = await readHeaderPending(FE.objectPageOrderItems, "OrderNo");
		console.log("AFTER-CLEANUP PENDING: " + JSON.stringify(after));
		// Buggy code: resetChanges() wiped everything -> hasHeaderChange === false (RED).
		// Fixed code: only the importer's own rows are reset (here none) -> the edit survives (GREEN).
		expect(after.hasHeaderChange).toBe(true);
		expect(after.changedValue).toBe(editedValue);
	});

	after(async () => {
		// discard the manual edit so we don't pollute other specs / the backend
		try {
			await browser.execute(function (tableId) {
				function byId(id) {
					const E = sap.ui.require("sap/ui/core/Element");
					return E && E.getElementById ? E.getElementById(id) : sap.ui.getCore().byId(id);
				}
				const oTable = byId(tableId);
				const oModel = oTable && oTable.getModel();
				if (oModel && oModel.resetChanges) {
					oModel.resetChanges();
				}
			}, FE.objectPageOrderItems);
		} catch (error) {
			/* best-effort cleanup */
		}
	});
});
