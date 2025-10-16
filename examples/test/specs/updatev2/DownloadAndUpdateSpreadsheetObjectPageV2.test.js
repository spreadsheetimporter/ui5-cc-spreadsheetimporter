const path = require("path");
const fs = require("fs");
const XLSX = require("xlsx");
const Base = require("./../Objects/Base");
const { wdi5 } = require("wdio-ui5-service");

const TEST_CONSTANTS = {
  FILE: {
    NAME: "OrderItems.xlsx",
    TIMEOUT: 20000,
    SHEET_NAME: "Sheet1"
  },
  ORDER: {
    ID: "64e718c9-ff99-47f1-8ca3-950c850777d4",
    NEW_QUANTITY: 777
  },
  SELECTORS: {
    OBJECT_PAGE_ROUTE_HASH: "#/Orders(ID=64e718c9-ff99-47f1-8ca3-950c850777d4)",
    OVERFLOW_BUTTON: "__toolbar2-overflowButton"
  },
  API: {
    BASE_URL: "http://localhost:4004/odata/v2/orders/Orders"
  }
};

describe("V2 FE: Download and Update Spreadsheet Object Page", () => {
  let BaseClass, downloadDir;

  before(async () => {
    BaseClass = new Base();
    downloadDir = path.resolve(__dirname, "../../downloads");
  });

  it("should navigate to V2 object page", async () => {
    // Non-draft OP nav (adjust if draft required)
    await wdi5.goTo(`#/Orders(${TEST_CONSTANTS.ORDER.ID})`);
    await BaseClass.dummyWait(1000);
  });

  it("should open overflow menu and download spreadsheet", async () => {
    // Press overflow button in OP toolbar
    const overflowButton = await browser.asControl({
      selector: {
        id: TEST_CONSTANTS.SELECTORS.OVERFLOW_BUTTON,
        searchOpenDialogs: true
      }
    });
    await overflowButton.press();

    // Find and press the download button
    const downloadButton = await browser.asControl({
      selector: {
        controlType: "sap.m.Button",
        searchOpenDialogs: true,
        properties: {
          text: "Download Data as Spreadsheet"
        }
      }
    });
    await downloadButton.press();

    if (!fs.existsSync(downloadDir)) {
      fs.mkdirSync(downloadDir, { recursive: true });
    }

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
  });

  it("should modify spreadsheet data", async () => {
    const filePath = path.join(downloadDir, TEST_CONSTANTS.FILE.NAME);
    const workbook = XLSX.readFile(filePath);
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(firstSheet);

    // Update quantity for all rows
    data.forEach(row => {
      // find header like "Quantity[quantity]" and set value
      const key = Object.keys(row).find(k => k.toLowerCase().includes("quantity"));
      if (key) {
        row[key] = TEST_CONSTANTS.ORDER.NEW_QUANTITY;
      }
    });

    const workbookNew = XLSX.utils.book_new();
    const worksheetNew = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(workbookNew, worksheetNew, TEST_CONSTANTS.FILE.SHEET_NAME);
    XLSX.writeFile(workbookNew, filePath);

    this.filePath = filePath;
  });

  it("should upload modified file and submit changes", async () => {
    // Open spreadsheet upload dialog configured for UPDATE in FE V2 app (assumes action wired in app)
    const uploadButton = await browser.asControl({
      selector: {
        controlType: "sap.m.Button",
        // Text/id might differ; adjust if needed in the app config
        properties: { text: "Spreadsheet Upload" },
        searchOpenDialogs: true
      }
    });
    await uploadButton.press();

    const fileUploader = await browser.$("//input[@type='file']");
    await fileUploader.setValue(this.filePath);

    const dialogUpload = await browser.asControl({
      selector: {
        controlType: "sap.m.Button",
        searchOpenDialogs: true,
        properties: { text: "Upload" }
      }
    });
    await dialogUpload.press();
  });
});


