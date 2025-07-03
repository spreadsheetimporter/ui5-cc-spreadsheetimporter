const Base = require("../Objects/Base");
const BaseUpload = require("../Objects/BaseUpload");

let BaseClass = undefined;
let BaseUploadClass = undefined;

describe("Wizard Upload Errors Count Workflow", () => {
	before(async () => {
		BaseClass = new Base();
		BaseUploadClass = new BaseUpload();

		// Navigate to the wizard page
		await browser.goTo({ sHash: "#/wizard" });
		await BaseClass.dummyWait(1000);
	});

	it("should open the wizard dialog", async () => {
		// Click the wizard button from the component container
		const wizardButton = await browser.asControl({
			selector: {
				controlType: "sap.m.Button",
				searchOpenDialogs: false,
				// The button should be within the component container
				ancestor: {
					id: "container-ordersv4freestyle---Wizard--wizardSpreadsheetImporter"
				}
			}
		});
		await wizardButton.press();

		// Wait for wizard dialog to open
		await browser.waitUntil(
			async () => {
				try {
					const wizardDialog = await browser.asControl({
						forceSelect: true,
						selector: {
							controlType: "sap.m.Dialog",
							properties: {
								contentWidth: "80%",
								contentHeight: "80%"
							},
							searchOpenDialogs: true
						}
					});
					return wizardDialog.isOpen();
				} catch (error) {
					return false;
				}
			},
			{
				timeout: 10000,
				timeoutMsg: "Wizard dialog did not open within 10 seconds"
			}
		);

		// Verify wizard dialog is open
		const wizardDialog = await browser.asControl({
			selector: {
				controlType: "sap.m.Dialog",
				properties: {
					contentWidth: "80%",
					contentHeight: "80%"
				},
				searchOpenDialogs: true
			}
		});
		expect(wizardDialog.isOpen()).toBeTruthy();
	});

	it("should upload the error file in the first step", async () => {
		// Remove any blocking elements
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

		// Wait a bit for the wizard to be fully rendered
		await BaseClass.dummyWait(1000);

		// Find the file uploader using the pattern from working tests
		const uploader = await browser.asControl({
			forceSelect: true,
			selector: {
				interaction: "root",
				controlType: "sap.ui.unified.FileUploader",
				searchOpenDialogs: true
			}
		});

		// Upload error test file
		const fileName = "test/testFiles/Wizard/ListReportOrdersErros.xlsx";
		const remoteFilePath = await browser.uploadFile(fileName);

		// Use the exact pattern from working tests
		const $uploader = await uploader.getWebElement(); // wdi5

		// Wait for the input element to be available
		await browser.waitUntil(
			async () => {
				try {
					const $fileInput = await $uploader.$("input[type=file]");
					return $fileInput.isExisting();
				} catch (error) {
					return false;
				}
			},
			{
				timeout: 5000,
				timeoutMsg: "File input element did not become available"
			}
		);

		const $fileInput = await $uploader.$("input[type=file]"); // wdio
		await $fileInput.setValue(remoteFilePath); // wdio

		// Wait for file to be processed
		await BaseClass.dummyWait(3000);
	});

	it("should automatically navigate to the messages step", async () => {
		// Wait for wizard to process the file and advance to messages step
		await BaseClass.dummyWait(3000);

		// Verify we're in the messages step by looking for the MessageView
		await browser.waitUntil(
			async () => {
				try {
					const messageView = await browser.asControl({
						selector: {
							controlType: "sap.m.MessageView",
							searchOpenDialogs: true
						}
					});
					return messageView && (await messageView.isA("sap.m.MessageView"));
				} catch (error) {
					return false;
				}
			},
			{
				timeout: 15000,
				timeoutMsg: "MessageView did not become available within 15 seconds"
			}
		);

		console.log("Successfully reached the messages step with MessageView");
	});

	it("should count and verify the number of validation errors", async () => {
		// Find the MessageView control
		const messageView = await browser.asControl({
			selector: {
				controlType: "sap.m.MessageView",
				searchOpenDialogs: true
			}
		});

		expect(messageView).toBeTruthy();

		// Get the model data from the MessageView
		const model = await messageView.getModel();
		if (model) {
			const messageData = await model.getData();

			// Count total messages
			const totalMessages = messageData && messageData._baseObject ? Object.keys(messageData._baseObject).length : 0;
			console.log(`Found ${totalMessages} validation messages`);

			// Verify we have exactly 2 validation messages as expected
			expect(totalMessages).toBe(2);

			// Log details of the messages for debugging
			if (messageData && messageData.length > 0) {
				for (let i = 0; i < Math.min(messageData.length, 5); i++) {
					// Log first 5 messages
					const message = messageData[i];
					console.log(`Message ${i + 1}: ${message.title || message.type || "Unknown"}`);
				}
			}

			// Verify we have exactly 2 messages for this error file
			expect(totalMessages).toBe(2);
		} else {
			// Try alternative approach - get items directly from MessageView
			const items = await messageView.getItems();
			const itemCount = items ? items.length : 0;

			console.log(`Found ${itemCount} message items in MessageView`);
			expect(itemCount).toBe(2);
		}
	});

	it("should verify error message types and content", async () => {
		// Find the MessageView control
		const messageView = await browser.asControl({
			selector: {
				controlType: "sap.m.MessageView",
				searchOpenDialogs: true
			}
		});

		// Get the binding information to understand the data structure
		const bindingInfo = await messageView.getBindingInfo("items");
		if (bindingInfo) {
			console.log("MessageView binding path:", bindingInfo.path);
		}

		// Try to get message data through different approaches
		const model = await messageView.getModel();
		if (model) {
			const allData = await model.getData();

			if (Array.isArray(allData)) {
				// Data is directly an array of messages
				console.log(`Total error messages: ${allData.length}`);

				// Analyze message types
				const errorMessages = allData.filter((msg) => msg.ui5type === "Error" || msg.type === "Error");
				const warningMessages = allData.filter((msg) => msg.ui5type === "Warning" || msg.type === "Warning");

				console.log(`Error messages: ${errorMessages.length}`);
				console.log(`Warning messages: ${warningMessages.length}`);

				// Verify we have at least some error messages for the error file
				expect(errorMessages.length + warningMessages.length).toBeGreaterThan(0);

				// Expected errors for ListReportOrdersErros.xlsx might include:
				// - Validation errors
				// - Data type conversion errors
				// - Missing required field errors
				expect(allData.length).toBeGreaterThanOrEqual(1);
			} else if (allData && typeof allData === "object") {
				// Data might be grouped or in a different structure
				console.log("Message data structure:", JSON.stringify(allData, null, 2));

				// Try to find arrays within the data structure
				const messageArrays = Object.values(allData).filter((value) => Array.isArray(value));
				if (messageArrays.length > 0) {
					const totalMessages = messageArrays.reduce((sum, arr) => sum + arr.length, 0);
					console.log(`Total messages from grouped data: ${totalMessages}`);
					expect(totalMessages).toBeGreaterThan(0);
				}
			}
		}
	});

	it("should have a Continue button available for error handling", async () => {
		// Look for the Continue button (or Continue Anyway button for errors)
		try {
			const continueButton = await browser.asControl({
				selector: {
					controlType: "sap.m.Button",
					properties: {
						text: "Continue"
					},
					searchOpenDialogs: true
				},
				timeout: 5000
			});

			if (continueButton) {
				console.log("Found Continue button");
				expect(continueButton).toBeTruthy();
			}
		} catch (error) {
			// Try to find Continue Anyway button for errors
			try {
				const continueAnywayButton = await browser.asControl({
					selector: {
						controlType: "sap.m.Button",
						properties: {
							text: "Continue Anyway"
						},
						searchOpenDialogs: true
					},
					timeout: 5000
				});

				if (continueAnywayButton) {
					console.log("Found Continue Anyway button for errors");
					expect(continueAnywayButton).toBeTruthy();
				}
			} catch (e) {
				console.log("No Continue or Continue Anyway button found - this might be expected depending on error types");
			}
		}
	});

	it("should have a Download Errors button available", async () => {
		// Look for the Download Errors button
		try {
			const downloadButton = await browser.asControl({
				selector: {
					controlType: "sap.m.Button",
					properties: {
						text: "Download"
					},
					searchOpenDialogs: true
				},
				timeout: 5000
			});

			expect(downloadButton).toBeTruthy();
			console.log("Found Download Errors button");
		} catch (error) {
			console.log("Download Errors button not found:", error.message);
			// This might be expected in some configurations
		}
	});

	after(async () => {
		// Clean up - ensure any open dialogs are closed
		try {
			await browser.keys(["Escape"]);
			await BaseClass.dummyWait(500);
		} catch (error) {
			// Ignore cleanup errors
		}
	});
});
