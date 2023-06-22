import ManagedObject from "sap/ui/base/ManagedObject";
import Fragment from "sap/ui/core/Fragment";
import ExcelUpload from "../ExcelUpload";
import ExcelDialog from "../../control/ExcelDialog";
import ResourceModel from "sap/ui/model/resource/ResourceModel";
import Component from "../../Component";
import Event from "sap/ui/base/Event";
import Bar from "sap/m/Bar";
import FileUploader, { $FileUploaderChangeEventParameters } from "sap/ui/unified/FileUploader";
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
import { AvailableOptionsType } from "../../types";
import FlexBox from "sap/m/FlexBox";
import JSONModel from "sap/ui/model/json/JSONModel";

/**
 * @namespace cc.excelUpload.XXXnamespaceXXX
 */
export default class ExcelUploadDialog extends ManagedObject {
	excelUploadController: ExcelUpload;
	excelUploadDialog: ExcelDialog;
	component: Component;
	previewHandler: Preview;
	util: Util;
	componentI18n: ResourceModel;
	optionsHandler: OptionsDialog;
	messageHandler: MessageHandler;
	infoModel: JSONModel;

	constructor(excelUploadController: ExcelUpload, component: Component, componentI18n: ResourceModel, messageHandler: MessageHandler) {
		super();
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
			this.infoModel = new JSONModel({
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
			this.excelUploadDialog.setComponent(this.component);
			this.excelUploadDialog.setBusyIndicatorDelay(0);
			this.excelUploadDialog.setModel(this.componentI18n, "i18n");
			this.excelUploadDialog.setModel(this.infoModel, "info");
			this.excelUploadDialog.setModel(this.component.getModel("device"), "device");
			this.excelUploadDialog.attachDecimalSeparatorChanged(this.onDecimalSeparatorChanged.bind(this));
			this.excelUploadDialog.attachAvailableOptionsChanged(this.onAvailableOptionsChanged.bind(this));
		}
		if (this.component.getStandalone() && this.component.getColumns().length === 0) {
			(this.excelUploadDialog.getSubHeader() as Bar).setVisible(false);
			(this.excelUploadDialog.getSubHeader() as Bar).getContentLeft()[0].setVisible(false);
		}
	}

	/**
	 * Handles file upload event.
	 * @param {Event} event - The file upload event
	 */
	async onFileUpload(event: Event<$FileUploaderChangeEventParameters>) {
		try {
			this.messageHandler.setMessages([]);
			const file = event.getParameter("files")[0] as Blob;

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
				this.messageHandler.checkMandatoryColumns(
					excelSheetsData,
					columnNames,
					this.excelUploadController.odataKeyList,
					this.component.getMandatoryFields(),
					this.excelUploadController.typeLabelList
				);
				this.messageHandler.checkColumnNames(columnNames, this.component.getFieldMatchType(), this.excelUploadController.typeLabelList);
			}
			this.excelUploadController.payload = excelSheetsData;
			this.component.fireCheckBeforeRead({ sheetData: excelSheetsData });
			if (!this.component.getStandalone()) {
				this.excelUploadController.payloadArray = [];
				this.excelUploadController.payloadArray = Parser.parseExcelData(
					this.excelUploadController.payload,
					this.excelUploadController.typeLabelList,
					this.component,
					this.messageHandler,
					this.util,
					this.excelUploadController.isODataV4
				);
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

	/**
	 * Sending extracted data to backend
	 * @param {*} event
	 */
	async onUploadSet(event: Event) {
		const isDefaultNotPrevented = this.component.fireUploadButtonPress({ payload: this.excelUploadController.payloadArray });
		if (!isDefaultNotPrevented || this.component.getStandalone()) {
			this.onCloseDialog();
			return;
		}
		// checking if excel file contains data or not
		if (!this.excelUploadController.payloadArray.length) {
			MessageToast.show(this.util.geti18nText("selectFileUpload"));
			return;
		}

		var that = this;
		const source = event.getSource() as Button;
		const sourceParent = source.getParent() as ExcelDialog;

		sourceParent.setBusyIndicatorDelay(0);
		sourceParent.setBusy(true);
		await Util.sleep(50);

		// creating a promise as the extension api accepts odata call in form of promise only
		var fnAddMessage = function () {
			return new Promise((fnResolve, fnReject) => {
				that.excelUploadController.getODataHandler().callOdata(fnResolve, fnReject, that.excelUploadController);
			});
		};

		var mParameters = {
			busy: {
				set: true,
				check: false,
			},
			dataloss: {
				popup: false,
				navigation: false,
			},
			sActionLabel: this.util.geti18nText("uploadingFile"),
		};
		// calling the oData service using extension api
		if (this.excelUploadController.isODataV4) {
			await this.excelUploadController.context.editFlow.securedExecution(fnAddMessage, mParameters);
		} else {
			try {
				if (this.excelUploadController.context.extensionAPI) {
					await this.excelUploadController.context.extensionAPI.securedExecution(fnAddMessage, mParameters);
				} else {
					await fnAddMessage();
				}
			} catch (error) {
				Log.error("Error while calling the odata service", error as Error, "ExcelUpload: onUploadSet");
				this.resetContent();
			}
		}

		sourceParent.setBusy(false);

		this.onCloseDialog();
	}

	// onUploadSet(event: Event) {
	//     this.excelUploadController.onUploadSet(event);
	// }

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

	onDecimalSeparatorChanged(event: Event) {
		// TODO: add custom event for decimal separator like at onFileUpload
		// @ts-ignore
		this.component.setDecimalSeparator(event.getParameter("decimalSeparator"));
	}

	onAvailableOptionsChanged(event: Event) {
		// TODO: add custom event for decimal separator like at onFileUpload
		// @ts-ignore
		const availableOptions = event.getParameter("availableOptions") as AvailableOptionsType[];
		if (availableOptions.length > 0) {
			this.component.setShowOptions(true);
			this.infoModel.setProperty("/showOptions", true);
		} else {
			this.component.setShowOptions(false);
			this.infoModel.setProperty("/showOptions", true);
		}
		this.component.setAvailableOptions(availableOptions);
	}

	resetContent() {
		(this.excelUploadDialog.getModel("info") as JSONModel).setProperty("/dataRows", 0);
		var fileUploader = (this.excelUploadDialog.getContent()[0] as FlexBox).getItems()[1] as FileUploader;
		fileUploader.setValue();
	}


	setDataRows(length: number) {
		(this.excelUploadDialog.getModel("info") as JSONModel).setProperty("/dataRows", length);
	}


	getDialog(): ExcelDialog {
		return this.excelUploadDialog;
	}

	async showPreview() {
		this.previewHandler.showPreview(this.excelUploadController.getPayloadArray());
	}

	/**
	 * Create Excel Template File with specific column
	 */
	onTempDownload() {
		// create excel column list
		let fieldMatchType = this.component.getFieldMatchType();
		var excelColumnList: { [key: string]: string }[] = [{}];
		if (this.component.getStandalone()) {
			// loop over this.component.getColumns
			for (let column of this.component.getColumns()) {
				excelColumnList[0][column] = "";
			}
		} else {
			for (let [key, value] of this.excelUploadController.typeLabelList.entries()) {
				if (fieldMatchType === "label") {
					excelColumnList[0][value.label] = "";
				}
				if (fieldMatchType === "labelTypeBrackets") {
					excelColumnList[0][`${value.label}[${key}]`] = "";
				}
				// option to add line of data
				if (value.type === "Edm.Boolean") {
				} else if (value.type === "Edm.String") {
					let newStr;
					if (value.maxLength) {
						newStr = "test string".substring(0, value.maxLength);
					} else {
						newStr = "test string";
					}
					excelColumnList[0][`${value.label}[${key}]`] = newStr;
				} else if (value.type === "Edm.Date") {
					excelColumnList[0][`${value.label}[${key}]`] = new Date().toLocaleDateString();
				} else if (value.type === "Edm.DateTimeOffset" || value.type === "Edm.DateTime") {
					excelColumnList[0][`${value.label}[${key}]`] = new Date().toLocaleDateString();
				} else if (value.type === "Edm.TimeOfDay" || value.type === "Edm.Time") {
					excelColumnList[0][`${value.label}[${key}]`] = new Date().toLocaleDateString();
				} else if (
					value.type === "Edm.UInt8" ||
					value.type === "Edm.Int16" ||
					value.type === "Edm.Int32" ||
					value.type === "Edm.Integer" ||
					value.type === "Edm.Int64" ||
					value.type === "Edm.Integer64"
				) {
					excelColumnList[0][`${value.label}[${key}]`] = "123";
				} else if (value.type === "Edm.Double" || value.type === "Edm.Decimal") {
					// get the decimal separator from browser
					excelColumnList[0][`${value.label}[${key}]`] = "123,4";
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
				let workbook = XLSX.read(data, { cellNF: true, cellDates: true, cellText: true, cellFormula: true });
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
