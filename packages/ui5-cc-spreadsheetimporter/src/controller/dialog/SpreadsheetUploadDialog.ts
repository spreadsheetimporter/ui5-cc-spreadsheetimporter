import ManagedObject from "sap/ui/base/ManagedObject";
import Fragment from "sap/ui/core/Fragment";
import SpreadsheetUpload from "../SpreadsheetUpload";
import SpreadsheetDialog, { SpreadsheetDialog$AvailableOptionsChangedEvent, SpreadsheetDialog$DecimalSeparatorChangedEvent } from "../../control/SpreadsheetDialog";
import ResourceModel from "sap/ui/model/resource/ResourceModel";
import Component from "../../Component";
import Event from "sap/ui/base/Event";
import Bar from "sap/m/Bar";
import FileUploader, { FileUploader$ChangeEvent } from "sap/ui/unified/FileUploader";
import MessageToast from "sap/m/MessageToast";
import Preview from "../Preview";
import Util from "../Util";
import ResourceBundle from "sap/base/i18n/ResourceBundle";
import * as XLSX from "xlsx";
import OptionsDialog from "./OptionsDialog";
import MessageHandler from "../MessageHandler";
import Log from "sap/base/Log";
import SheetHandler from "../SheetHandler";
import Parser from "../Parser";
import Button from "sap/m/Button";
import { ArrayData, AvailableOptionsType } from "../../types";
import FlexBox from "sap/m/FlexBox";
import JSONModel from "sap/ui/model/json/JSONModel";

type InputType = {
	[key: string]: {
		rawValue: any;
		[additionalKeys: string]: any;
	};
};

/**
 * @namespace cc.spreadsheetimporter.XXXnamespaceXXX
 */
export default class SpreadsheetUploadDialog extends ManagedObject {
	spreadsheetUploadController: SpreadsheetUpload;
	spreadsheetUploadDialog: SpreadsheetDialog;
	component: Component;
	previewHandler: Preview;
	util: Util;
	componentI18n: ResourceModel;
	optionsHandler: OptionsDialog;
	messageHandler: MessageHandler;
	spreadsheetOptionsModel: JSONModel;

	constructor(spreadsheetUploadController: SpreadsheetUpload, component: Component, componentI18n: ResourceModel, messageHandler: MessageHandler) {
		super();
		this.spreadsheetUploadController = spreadsheetUploadController;
		this.component = component;
		this.componentI18n = componentI18n;
		this.util = new Util(componentI18n.getResourceBundle() as ResourceBundle);
		this.previewHandler = new Preview(this.util);
		this.optionsHandler = new OptionsDialog(spreadsheetUploadController);
		this.messageHandler = messageHandler;
	}

	async createSpreadsheetUploadDialog() {
		if (!this.spreadsheetUploadDialog) {
			this.spreadsheetOptionsModel = new JSONModel({
				dataRows: 0,
				strict: this.component.getStrict(),
				hidePreview: this.component.getHidePreview(),
				showOptions: this.component.getShowOptions()
			});
			this.spreadsheetUploadDialog = (await Fragment.load({
				name: "cc.spreadsheetimporter.XXXnamespaceXXX.fragment.SpreadsheetUpload",
				type: "XML",
				controller: this
			})) as SpreadsheetDialog;
			this.spreadsheetUploadDialog.setComponent(this.component);
			this.spreadsheetUploadDialog.setBusyIndicatorDelay(0);
			this.spreadsheetUploadDialog.setModel(this.componentI18n, "i18n");
			this.spreadsheetUploadDialog.setModel(this.spreadsheetOptionsModel, "info");
			this.spreadsheetUploadDialog.setModel(this.component.getModel("device"), "device");
			this.spreadsheetUploadDialog.attachDecimalSeparatorChanged(this.onDecimalSeparatorChanged.bind(this));
			this.spreadsheetUploadDialog.attachAvailableOptionsChanged(this.onAvailableOptionsChanged.bind(this));
		}
		if (this.component.getStandalone() && this.component.getColumns().length === 0) {
			(this.spreadsheetUploadDialog.getSubHeader() as Bar).setVisible(false);
			(this.spreadsheetUploadDialog.getSubHeader() as Bar).getContentLeft()[0].setVisible(false);
		}
	}

	/**
	 * Handles file upload event.
	 * @param {Event} event - The file upload event
	 */
	async onFileUpload(event: FileUploader$ChangeEvent) {
		try {
			this.messageHandler.setMessages([]);
			const file = event.getParameter("files")[0] as Blob;
			const workbook = (await this._readWorkbook(file)) as XLSX.WorkBook;

			const isStandalone = this.component.getStandalone();
			const readAllSheets = this.component.getReadAllSheets();

			let spreadsheetSheetsData: ArrayData = [];
			let columnNames: string[] = [];

			if (isStandalone && readAllSheets) {
				// Loop over the sheet names in the workbook
				for (const sheetName of Object.keys(workbook.Sheets)) {
					let currSheetData = SheetHandler.sheet_to_json(workbook.Sheets[sheetName]);
					for (const dataVal of currSheetData) {
						Object.keys(dataVal).forEach((key) => {
							dataVal[key].sheetName = sheetName;
						});
					}

					spreadsheetSheetsData = spreadsheetSheetsData.concat(currSheetData);
					columnNames = columnNames.concat(XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 })[0] as string[]);
				}
			} else {
				const sheetName = workbook.SheetNames[0];
				spreadsheetSheetsData = SheetHandler.sheet_to_json(workbook.Sheets[sheetName]);
				columnNames = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 })[0] as string[];
			}

			if (!spreadsheetSheetsData || spreadsheetSheetsData.length === 0) {
				throw new Error(this.util.geti18nText("emptySheet"));
			}

			//remove empty spaces before and after every value
			for (const object of spreadsheetSheetsData) {
				for (const key in object) {
					object[key].rawValue = typeof object[key].rawValue === "string" ? object[key].rawValue.trim() : object[key].rawValue;
				}
			}

			if (!isStandalone) {
				this.messageHandler.checkFormat(spreadsheetSheetsData);
				this.messageHandler.checkMandatoryColumns(
					spreadsheetSheetsData,
					columnNames,
					this.spreadsheetUploadController.odataKeyList,
					this.component.getMandatoryFields(),
					this.spreadsheetUploadController.typeLabelList
				);
				this.messageHandler.checkColumnNames(columnNames, this.component.getFieldMatchType(), this.spreadsheetUploadController.typeLabelList);
			}
			this.spreadsheetUploadController.payload = spreadsheetSheetsData;
			this.component.fireCheckBeforeRead({ sheetData: spreadsheetSheetsData });

			this.spreadsheetUploadController.payloadArray = isStandalone
				? this.spreadsheetUploadController.payload
				: Parser.parseSpreadsheetData(
						this.spreadsheetUploadController.payload,
						this.spreadsheetUploadController.typeLabelList,
						this.component,
						this.messageHandler,
						this.util,
						this.spreadsheetUploadController.isODataV4
				  );

			if (this.messageHandler.areMessagesPresent()) {
				// show error dialog
				this.messageHandler.displayMessages();
				return;
			}
			this.setDataRows(this.spreadsheetUploadController.payloadArray.length);
		} catch (error) {
			Util.showError(error, "SpreadsheetUpload.ts", "onFileUpload");
			this.resetContent();
		}
	}

	/**
	 * Sending extracted data to backend
	 * @param {*} event
	 */
	async onUploadSet(event: Event) {
		const isDefaultNotPrevented = this.component.fireUploadButtonPress({
			payload: this.spreadsheetUploadController.payloadArray,
			rawData: this._extractRawValues(this.spreadsheetUploadController.payloadArray),
			parsedData: this._extractParsedValues(this.spreadsheetUploadController.payloadArray)
		});
		if (!isDefaultNotPrevented || this.component.getStandalone()) {
			this.onCloseDialog();
			return;
		}
		// checking if spreadsheet file contains data or not
		if (!this.spreadsheetUploadController.payloadArray.length) {
			MessageToast.show(this.util.geti18nText("selectFileUpload"));
			return;
		}

		var that = this;
		const source = event.getSource() as Button;
		const sourceParent = source.getParent() as SpreadsheetDialog;

		sourceParent.setBusyIndicatorDelay(0);
		sourceParent.setBusy(true);
		await Util.sleep(50);

		// creating a promise as the extension api accepts odata call in form of promise only
		var fnAddMessage = function () {
			return new Promise((fnResolve, fnReject) => {
				that.spreadsheetUploadController.getODataHandler().callOdata(fnResolve, fnReject, that.spreadsheetUploadController);
			});
		};

		var mParameters = {
			busy: {
				set: true,
				check: false
			},
			dataloss: {
				popup: false,
				navigation: false
			},
			sActionLabel: this.util.geti18nText("uploadingFile")
		};
		// calling the oData service using extension api
		if (this.spreadsheetUploadController.isODataV4) {
			await this.spreadsheetUploadController.context.editFlow.securedExecution(fnAddMessage, mParameters);
		} else {
			try {
				if (this.spreadsheetUploadController.context.extensionAPI) {
					await this.spreadsheetUploadController.context.extensionAPI.securedExecution(fnAddMessage, mParameters);
				} else {
					await fnAddMessage();
				}
			} catch (error) {
				Log.error("Error while calling the odata service", error as Error, "SpreadsheetUpload: onUploadSet");
				this.resetContent();
			}
		}

		sourceParent.setBusy(false);

		this.onCloseDialog();
	}

	// onUploadSet(event: Event) {
	//     this.spreadsheetUploadController.onUploadSet(event);
	// }

	openSpreadsheetUploadDialog() {
		this.spreadsheetUploadDialog.open();
	}

	/**
	 * Closes the Spreadsheet upload dialog.
	 */
	onCloseDialog() {
		this.resetContent();
		this.spreadsheetUploadDialog.close();
	}

	onDecimalSeparatorChanged(event: SpreadsheetDialog$DecimalSeparatorChangedEvent) {
		this.component.setDecimalSeparator(event.getParameter("decimalSeparator"));
	}

	onAvailableOptionsChanged(event: SpreadsheetDialog$AvailableOptionsChangedEvent) {
		const availableOptions = event.getParameter("availableOptions") as AvailableOptionsType[];
		if (availableOptions.length > 0) {
			this.component.setShowOptions(true);
			this.spreadsheetOptionsModel.setProperty("/showOptions", true);
		} else {
			this.component.setShowOptions(false);
			this.spreadsheetOptionsModel.setProperty("/showOptions", true);
		}
		this.component.setAvailableOptions(availableOptions);
	}

	resetContent() {
		(this.spreadsheetUploadDialog.getModel("info") as JSONModel).setProperty("/dataRows", 0);
		var fileUploader = (this.spreadsheetUploadDialog.getContent()[0] as FlexBox).getItems()[1] as FileUploader;
		fileUploader.setValue();
	}

	setDataRows(length: number) {
		(this.spreadsheetUploadDialog.getModel("info") as JSONModel).setProperty("/dataRows", length);
	}

	getDialog(): SpreadsheetDialog {
		return this.spreadsheetUploadDialog;
	}

	async showPreview() {
		this.previewHandler.showPreview(this.spreadsheetUploadController.getPayloadArray());
	}

	onTempDownload() {
		// create spreadsheet column list
		let fieldMatchType = this.component.getFieldMatchType();
		var worksheet = {} as XLSX.WorkSheet;
		let colWidths: { wch: number }[] = []; // array to store column widths
		let sampleData = this.component.getSampleData() as any[];
		// if sampledata is empty add one row of empty data
		if (!sampleData || sampleData.length === 0) {
			sampleData = [{}];
		}
		const colWidthDefault = 15;
		const colWidthDate = 20;
		let col = 0;
		let rows = 1;
		if (this.component.getStandalone()) {
			// loop over this.component.getColumns
			for (let column of this.component.getColumns()) {
				worksheet[XLSX.utils.encode_cell({ c: col, r: 0 })] = { v: column, t: "s" };
				col++;
			}
		} else {
			for (let [key, value] of this.spreadsheetUploadController.typeLabelList.entries()) {
				let cell = { v: "", t: "s" } as XLSX.CellObject;
				let label = "";
				if (fieldMatchType === "label") {
					label = value.label;
				}
				if (fieldMatchType === "labelTypeBrackets") {
					label = `${value.label}[${key}]`;
				}
				worksheet[XLSX.utils.encode_cell({ c: col, r: 0 })] = { v: label, t: "s" };

				for (const [index, data] of sampleData.entries()) {
					let sampleDataValue;
					rows = index + 1;
					if (data[key]) {
						sampleDataValue = data[key];
					}
					if (value.type === "Edm.Boolean") {
						cell = {
							v: sampleDataValue ? sampleDataValue.toString() : "true",
							t: "b"
						};
						colWidths.push({ wch: colWidthDefault });
					} else if (value.type === "Edm.String") {
						let newStr;
						if (value.maxLength) {
							newStr = sampleDataValue ? sampleDataValue : "test string".substring(0, value.maxLength);
						} else {
							newStr = sampleDataValue ? sampleDataValue : "test string";
						}
						cell = { v: newStr, t: "s" };
						colWidths.push({ wch: colWidthDefault });
					} else if (value.type === "Edm.DateTimeOffset" || value.type === "Edm.DateTime") {
						let format;
						const currentLang = sap.ui.getCore().getConfiguration().getLanguage();
						if (currentLang.startsWith("en")) {
							format = "mm/dd/yyyy hh:mm AM/PM";
						} else {
							format = "dd.mm.yyyy hh:mm";
						}

						cell = { v: sampleDataValue ? sampleDataValue : new Date(), t: "d", z: format };
						colWidths.push({ wch: colWidthDate }); // set column width to 20 for this column
					} else if (value.type === "Edm.Date") {
						cell = {
							v: sampleDataValue ? sampleDataValue : new Date(),
							t: "d"
						};
						colWidths.push({ wch: colWidthDefault });
					} else if (value.type === "Edm.TimeOfDay" || value.type === "Edm.Time") {
						cell = {
							v: sampleDataValue ? sampleDataValue : new Date(),
							t: "d",
							z: "hh:mm"
						};
						colWidths.push({ wch: colWidthDefault });
					} else if (
						value.type === "Edm.UInt8" ||
						value.type === "Edm.Int16" ||
						value.type === "Edm.Int32" ||
						value.type === "Edm.Integer" ||
						value.type === "Edm.Int64" ||
						value.type === "Edm.Integer64"
					) {
						cell = {
							v: sampleDataValue ? sampleDataValue : 85,
							t: "n"
						};
						colWidths.push({ wch: colWidthDefault });
					} else if (value.type === "Edm.Double" || value.type === "Edm.Decimal") {
						const decimalSeparator = this.component.getDecimalSeparator();
						cell = {
							v: sampleDataValue ? sampleDataValue : `123${decimalSeparator}4`,
							t: "n"
						};
						colWidths.push({ wch: colWidthDefault });
					}

					if (!this.component.getHideSampleData()) {
						worksheet[XLSX.utils.encode_cell({ c: col, r: rows })] = cell;
					}
				}
				col++;
			}
		}
		worksheet["!ref"] = XLSX.utils.encode_range({ s: { c: 0, r: 0 }, e: { c: col, r: sampleData.length } });
		worksheet["!cols"] = colWidths; // assign the column widths to the worksheet

		// creating the new spreadsheet work book
		const wb = XLSX.utils.book_new();
		// set the file value
		XLSX.utils.book_append_sheet(wb, worksheet, "Tabelle1");
		// download the created spreadsheet file
		XLSX.writeFile(wb, this.component.getSpreadsheetFileName());

		MessageToast.show(this.util.geti18nText("downloadingTemplate"));
	}

	onOpenOptionsDialog() {
		this.optionsHandler.openOptionsDialog();
	}

	/**
	 * Read the uploaded workbook from the file.
	 * @param {File} file - The uploaded file.
	 * @returns {Promise} - Promise object representing the workbook.
	 */
	async _readWorkbook(file: Blob) {
		return new Promise(async (resolve, reject) => {
			try {
				const data = await this.buffer_RS(file.stream());
				let workbook = XLSX.read(data, { cellNF: true, cellDates: true, cellText: true, cellFormula: true });
				resolve(workbook);
			} catch (error) {
				Log.error("Error while reading the uploaded workbook", error as Error, "SpreadsheetUpload: _readWorkbook");
				reject(error);
			}
		});
	}

	async buffer_RS(stream: ReadableStream) {
		/* collect data */
		const buffers = [];
		const reader = stream.getReader();
		for (;;) {
			const res = await reader.read();
			if (res.value) buffers.push(res.value);
			if (res.done) break;
		}

		/* concat */
		const out = new Uint8Array(buffers.reduce((acc, v) => acc + v.length, 0));

		let off = 0;
		for (const u8 of buffers) {
			out.set(u8, off);
			off += u8.length;
		}

		return out;
	}

	_extractRawValues(data: InputType[]): any[] {
		return data.map((item) => {
			const newObj: { [key: string]: any } = {};

			for (const key in item) {
				if (item[key].hasOwnProperty("rawValue")) {
					newObj[key] = item[key].rawValue;
				}
			}

			return newObj;
		});
	}

	_extractParsedValues(data: InputType[]): any[] {
		return data.map((item) => {
			const newObj: { [key: string]: any } = {};

			for (const key in item) {
				if (item[key].hasOwnProperty("formattedValue")) {
					newObj[key] = item[key].formattedValue;
				}
			}

			return newObj;
		});
	}
}
