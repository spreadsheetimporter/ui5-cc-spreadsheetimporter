const Base = require("./../Objects/Base");

class BaseUpload {
	constructor() {
		this.base = new Base();
	}

	async uploadFile(filePath, uploadDialogButtonId, uploaderId, uploadButtonText = "Upload") {
		// Check if dialog is already open
		const spreadsheetUploadDialogFirstCheck = await browser.asControl({
			selector: {
				controlType: "sap.m.Dialog",
				properties: {
					contentWidth: "40vw"
				},
				searchOpenDialogs: true,
				
			},
			forceSelect: true
		});

		// Only open dialog if it's not already open
		if (!spreadsheetUploadDialogFirstCheck?._domId) {
			await this.base.pressById(uploadDialogButtonId);
		}

		const spreadsheetUploadDialog = await browser.asControl({
			selector: {
				controlType: "sap.m.Dialog",
				properties: {
					contentWidth: "40vw"
				},
				searchOpenDialogs: true
				
			},
			forceSelect: true
		});

		// Verify dialog is open
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

		// Make file input visible
		try {
			await browser.execute(() => {
				document.querySelector("input[type=file]").style.display = "block";
			});
		} catch (error) {}

		// Set file path
		const input = await $("input[type=file]");
		await input.setValue(filePath);

		// Click upload button
		await browser
			.asControl({
				selector: {
					controlType: "sap.m.Button",
					properties: {
						text: uploadButtonText
					}
				},
                forceSelect: true
			})
			.press();
	}
}

module.exports = BaseUpload;
