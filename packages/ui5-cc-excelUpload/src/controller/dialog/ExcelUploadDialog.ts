import Fragment from "sap/ui/core/Fragment";
import JSONModel from "sap/ui/model/json/JSONModel";
import ExcelUpload from "../ExcelUpload";
import ExcelDialog from "../../control/ExcelDialog";
import ResourceModel from "sap/ui/model/resource/ResourceModel";
import Component from "../../Component";
import Event from "sap/ui/base/Event";
import Bar from "sap/m/Bar";
import FileUploader from "sap/ui/unified/FileUploader";
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

export default class ExcelUploadDialog {
	excelUploadController: ExcelUpload;
	excelUploadDialog: ExcelDialog;
    component: Component;
    previewHandler: Preview;
    util: Util;
    componentI18n: ResourceModel;
    optionsHandler: OptionsDialog;
    messageHandler: MessageHandler;

	constructor(excelUploadController: ExcelUpload, component: Component, componentI18n: ResourceModel, messageHandler: MessageHandler) {
		this.excelUploadController = excelUploadController;
        this.component = component;
        this.componentI18n = componentI18n;
        this.util = new Util(componentI18n.getResourceBundle() as ResourceBundle);
		this.previewHandler = new Preview(this.util);
        this.optionsHandler = new OptionsDialog(excelUploadController);
        this.messageHandler = messageHandler;
        
	}

	async createExcelUploadDialog() {
		if (!this.excelUploadDialog) {
            const infoModel = new JSONModel({
                dataRows: 0,
                strict: this.component.getStrict(),
                hidePreview: this.component.getHidePreview(),
                showOptions: this.component.getShowOptions(),
            });
			this.excelUploadDialog = (await Fragment.load({
				name: "cc.excelUpload.XXXnamespaceXXX.fragment.ExcelUpload",
				type: "XML",
				controller: this,
			})) as ExcelDialog;
			this.excelUploadDialog.setBusyIndicatorDelay(0);
			this.excelUploadDialog.setModel(this.componentI18n, "i18n");
			this.excelUploadDialog.setModel(infoModel, "info");
			this.excelUploadDialog.setModel(this.component.getModel("device"), "device");
			this.excelUploadDialog.attachDecimalSeparatorChanged(this.onDecimalSeparatorChanged.bind(this));
		}
        if (this.component.getStandalone() && this.component.getColumns().length === 0) {
			(this.excelUploadDialog.getSubHeader() as Bar).setVisible(false);
			(this.excelUploadDialog.getSubHeader() as Bar).getContentLeft()[0].setVisible(false);
		}
	}

    	/**
	 * Handles file upload event.
	 * @param {Event} event - The file upload event.
	 */
	async onFileUpload(event: Event) {
		try {
			this.messageHandler.setMessages([]);
			const file = event.getParameter("files")[0];

			const workbook = (await this._readWorkbook(file)) as XLSX.WorkBook;
			const sheetName = workbook.SheetNames[0];
			let excelSheetsData = SheetHandler.sheet_to_json(workbook.Sheets[sheetName]);
			let columnNames = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 })[0] as string[];

			Log.debug("columnNames of uploaded excel file", undefined, "ExcelUpload: onFileUpload", () => this.component.logger.returnObject({ columnNames: columnNames }));

			if (!excelSheetsData || excelSheetsData.length === 0) {
				throw new Error(this.util.geti18nText("emptySheet"));
			}

			//remove empty spaces before and after every value
			for (const object of excelSheetsData) {
				for (const key in object) {
					object[key].rawValue = typeof object[key].rawValue === "string" ? object[key].rawValue.trim() : object[key].rawValue;
				}
			}

			if (!this.component.getStandalone()) {
				this.messageHandler.checkFormat(excelSheetsData);
				this.messageHandler.checkMandatoryColumns(excelSheetsData,columnNames,this.excelUploadController.odataKeyList, this.component.getMandatoryFields(), this.excelUploadController.typeLabelList);
				this.messageHandler.checkColumnNames(columnNames, this.component.getFieldMatchType(), this.excelUploadController.typeLabelList);
			}
			this.excelUploadController.payload = excelSheetsData;
			this.component.fireCheckBeforeRead({ sheetData: excelSheetsData });
			if (!this.component.getStandalone()) {
				this.excelUploadController.payloadArray = [];
				this.excelUploadController.payloadArray = Parser.parseExcelData(this.excelUploadController.payload, this.excelUploadController.typeLabelList, this.component, this.messageHandler, this.util, this.excelUploadController.isODataV4);
			} else {
				this.excelUploadController.payloadArray = this.excelUploadController.payload;
			}

			if (this.messageHandler.areMessagesPresent()) {
				// show error dialog
				this.messageHandler.displayMessages();
				return;
			}
			this.setDataRows(this.excelUploadController.payloadArray.length);
		} catch (error) {
			Util.showError(error, "ExcelUpload.ts", "onFileUpload");
			this.resetContent();
		}
	}

    onUploadSet(event: Event) {
        this.excelUploadController.onUploadSet(event);
    }

    openExcelUploadDialog() {
        this.excelUploadDialog.open();
    }

	/**
	 * Closes the Excel upload dialog.
	 */
	onCloseDialog() {
		this.resetContent();
		this.excelUploadDialog.close();
	}

    onDecimalSeparatorChanged(event:Event) {
		this.component.setDecimalSeparator(event.getParameter("decimalSeparator"));
	}

    resetContent() {
        (this.excelUploadDialog.getModel("info") as JSONModel).setProperty("/dataRows", 0);
        var fileUploader = this.excelUploadDialog.getContent()[0].getItems()[1] as FileUploader;
		fileUploader.setValue();
    }

    setDataRows(length : number) {
		(this.excelUploadDialog.getModel("info") as JSONModel).setProperty("/dataRows", length);
	}

    getDialog(): ExcelDialog {
		return this.excelUploadDialog;
	}

    async showPreview() {
		this.previewHandler.showPreview(this.excelUploadController.getPayloadArray());
	}


	/**
	 * Create Excel Template File with specific columns
	 */
	onTempDownload() {
		// create excel column list
		let fieldMatchType = this.component.getFieldMatchType();
		var excelColumnList = [{}];
		if (this.component.getStandalone()) {
			// loop over this.component.getColumns
			for (let column of this.component.getColumns()) {
				excelColumnList[0][column] = "";
			}
		} else {
			for (let [key, value] of Object.entries(this.excelUploadController.typeLabelList)) {
				if (fieldMatchType === "label") {
					excelColumnList[0][value.label] = "";
				}
				if (fieldMatchType === "labelTypeBrackets") {
					excelColumnList[0][`${value.label}[${key}]`] = "";
				}
			}
		}

		// initialising the excel work sheet
		const ws = XLSX.utils.json_to_sheet(excelColumnList);
		// creating the new excel work book
		const wb = XLSX.utils.book_new();
		// set the file value
		XLSX.utils.book_append_sheet(wb, ws, "Tabelle1");
		// download the created excel file
		XLSX.writeFile(wb, this.component.getExcelFileName());

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
				let workbook = XLSX.read(data, {cellNF: true, cellDates: true, cellText: true, cellFormula: true});
				resolve(workbook);
			} catch (error) {
				Log.error("Error while reading the uploaded workbook", error as Error, "ExcelUpload: _readWorkbook");
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
}
