const FEV2ND = require("../Objects/FEV2ND");
const Base = require("./../Objects/Base");
const FEV2 = require("./../Objects/FEV2");
const FEV4 = require("./../Objects/FEV4");
const { optionsLong, optionsShort } = require("./../Objects/types");
const path = require('path');
const fs = require('fs');
const XLSX = require('xlsx');

let FE = undefined;
let BaseClass = undefined;
let scenario = undefined;

describe("Download Spreadsheet List Report", () => {
    before(async () => {
        BaseClass = new Base();
        scenario = global.scenario;
        if (scenario.startsWith("ordersv2")) {
            FE = new FEV2();
        }
        if (scenario.startsWith("ordersv4")) {
            FE = new FEV4();
        }
        if (scenario.startsWith("ordersv2fenondraft")) {
            FE = new FEV2ND();
        }
    });

    it("should trigger search on ListReport page", async () => {
        try {
            await BaseClass.pressById(FE.listReportGoButton);
        } catch (error) {
            await BaseClass.pressById(FE.listReportDynamicPageTitle);
            await BaseClass.dummyWait(500);
            await BaseClass.pressById(FE.listReportGoButton);
        }
    });

    it("Open Spreadsheet Upload Dialog", async () => {
        await BaseClass.pressById(FE.listReportSpreadsheetuploadButton);
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
    });

    it("Download spreadsheet and verify content", async () => {
        // Click download button
        await browser.asControl({
            selector: {
                controlType: "sap.m.Button",
                properties: {
                    text: "Download Spreadsheet"
                },
                searchOpenDialogs: true
            }
        }).press();

        // Wait for download to complete
        await browser.pause(2000);

        // Get the downloaded file
        const downloadDir = browser.config.downloadDir;
        const files = fs.readdirSync(downloadDir);
        const downloadedFile = files.find(file => file.endsWith('.xlsx'));
        expect(downloadedFile).toBeDefined();

        // Read the Excel file
        const filePath = path.join(downloadDir, downloadedFile);
        const workbook = XLSX.readFile(filePath);

        // Verify workbook structure
        expect(workbook.SheetNames.length).toBeGreaterThan(0);

        // Read the first sheet
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(firstSheet);

        // Verify data
        expect(data.length).toBeGreaterThan(0);
        
        // Example verification - adjust according to your expected data structure
        if (data[0]) {
            expect(data[0]).toHaveProperty('OrderNo');
            // Add more specific checks based on your data structure
        }

        // Clean up - delete the downloaded file
        fs.unlinkSync(filePath);
    });

    it("Close SpreadsheetUpload Dialog", async () => {
        await browser.asControl({
            selector: {
                controlType: "sap.m.Button",
                properties: {
                    text: "Close"
                },
                searchOpenDialogs: true
            }
        }).press();
    });
}); 