import ManagedObject from "sap/ui/base/ManagedObject";
import Dialog from "sap/m/Dialog";
import { Messages, ListObject, ArrayData, PayloadArray, GroupedMessage, MessagesDetails, TransformedItem } from "../types";
import SpreadsheetUpload from "./SpreadsheetUpload";
import Util from "./Util";
import Fragment from "sap/ui/core/Fragment";
import JSONModel from "sap/ui/model/json/JSONModel";
import { MessageType, ValueState } from "sap/ui/core/library";
import Log from "sap/base/Log";
import { CustomMessageTypes, FieldMatchType } from "../enums";
import * as XLSX from "xlsx";

/**
 * @namespace cc.spreadsheetimporter.XXXnamespaceXXX
 */
export default class MessageHandler extends ManagedObject {
	private messages: Messages[] = [];
	private spreadsheetUploadController: SpreadsheetUpload;
	private messageDialog: Dialog;

	constructor(spreadsheetUploadController: any) {
		super();
		this.messages = [];
		this.spreadsheetUploadController = spreadsheetUploadController;
	}

	setMessages(messages: Messages[]) {
		this.messages = messages;
	}

	addArrayToMessages(messages: Messages[]) {
		Log.debug("addArrayToMessages", undefined, "SpreadsheetUpload: MessageHandler", () => this.spreadsheetUploadController.component.logger.returnObject(messages));
		this.messages = this.messages.concat(messages);
	}

	addMessageToMessages(message: Messages) {
		Log.debug("addMessageToMessages", undefined, "SpreadsheetUpload: MessageHandler", () => this.spreadsheetUploadController.component.logger.returnObject(message));
		this.messages.push(message);
	}

	getMessages() {
		return this.messages;
	}

	checkDuplicateColumns(columnNames: string[]) {
		const duplicateColumns = columnNames.filter((columnName, index) => columnNames.indexOf(columnName) !== index);
		if (duplicateColumns.length > 0) {
			const errorMessage = {
				title: this.spreadsheetUploadController.util.geti18nText("duplicateColumns", [duplicateColumns.join(", ")]),
				type: CustomMessageTypes.DuplicateColumns,
				ui5type: MessageType.Error,
				group: false
			} as Messages;
			this.addMessageToMessages(errorMessage);
		}
	}

	checkMandatoryColumns(data: PayloadArray, columnNames: string[], mandatoryFieldsUser: string[], mandatoryFieldsMetadata: string[], typeLabelList: ListObject) {
		// concat mandatory fields arrays and remove duplicates
		const mandatoryFields = [...new Set([...mandatoryFieldsUser, ...mandatoryFieldsMetadata])];
		// check if column is in the data list
		//const availableKeyColumns = this.checkKeyColumns(columnNames, mandatoryFields, typeLabelList);
		// check if data is filled in for available columns
		this.checkMandatoryFields(data, mandatoryFields, typeLabelList);
	}

	checkMandatoryFields(data: ArrayData, mandatoryFields: string[], typeLabelList: ListObject) {
		if (!mandatoryFields) {
			return;
		}
		for (const mandatoryField of mandatoryFields) {
			const fieldLabel = typeLabelList.get(mandatoryField)?.label;
			if (!fieldLabel) {
				Log.error(`Mandatory Field ${mandatoryField} not found for checking mandatory fields`, undefined, "SpreadsheetUpload: MessageHandler");
				continue;
			}

			for (const [index, row] of data.entries()) {
				const value = Util.getValueFromRow(row, fieldLabel, mandatoryField, this.spreadsheetUploadController.component.getFieldMatchType() as FieldMatchType);
				const errorMessage = {
					title: this.spreadsheetUploadController.util.geti18nText("mandatoryFieldNotFilled", [fieldLabel]),
					type: CustomMessageTypes.MandatoryFieldNotFilled,
					row: index + 2,
					counter: 1,
					ui5type: MessageType.Error
				} as Messages;
				// no value found or value is empty, create error message
				if (!value || value.rawValue === "" || value.rawValue === undefined) {
					this.addMessageToMessages(errorMessage);
				}
			}
		}
	}

	checkFormat(data: ArrayData) {
		for (const [index, row] of data.entries()) {
			Object.values(row).forEach(({ sheetDataType, format, rawValue, formattedValue }) => {
				if (sheetDataType === "n" && format !== "General" && rawValue !== Number(formattedValue)) {
					const warningMessage = {
						title: "Format",
						type: CustomMessageTypes.Formatting,
						row: index + 2,
						counter: 1,
						ui5type: MessageType.Warning,
						rawValue: rawValue,
						formattedValue: formattedValue
					} as Messages;
					this.addMessageToMessages(warningMessage);
				}
			});
		}
	}

	checkMaxLength(data: ArrayData, typeLabelList: ListObject, fieldMatchType: string) {
		for (const [index, row] of data.entries()) {
			for (const [key, valueTypeLabelList] of typeLabelList) {
				if (valueTypeLabelList.maxLength) {
					const value = Util.getValueFromRow(row, valueTypeLabelList.label, key, this.spreadsheetUploadController.component.getFieldMatchType() as FieldMatchType);
					// check if value is longer then max length
					if (value && value.rawValue && value.rawValue.length > valueTypeLabelList.maxLength) {
						// the length was exceeded by x characters
						const exceededLength = value.rawValue.length - valueTypeLabelList.maxLength;
						const errorMessage = {
							title: this.spreadsheetUploadController.util.geti18nText("maxLengthExceeded", [valueTypeLabelList.maxLength, valueTypeLabelList.label]),
							type: CustomMessageTypes.MaxLengthExceeded,
							row: index + 2,
							counter: 1,
							ui5type: MessageType.Error,
							rawValue: value.rawValue,
							maxLength: valueTypeLabelList.maxLength,
							excededLength: exceededLength
						} as Messages;
						this.addMessageToMessages(errorMessage);
					}
				}
			}
		}
	}

	checkColumnNames(columnNames: string[], fieldMatchType: string, typeLabelList: ListObject) {
		for (let index = 0; index < columnNames.length; index++) {
			const columnName = columnNames[index];
			let found = false;
			for (const [key, value] of typeLabelList) {
				if (fieldMatchType === "label") {
					if (value.label === columnName) {
						found = true;
						break;
					}
				}
				if (fieldMatchType === "labelTypeBrackets") {
					if (columnName.includes(`[${key}]`)) {
						found = true;
						break;
					}
				}
			}
			if (!found) {
				const errorMessage = {
					title: this.spreadsheetUploadController.util.geti18nText("columnNotFound", [columnName]),
					type: CustomMessageTypes.ColumnNotFound,
					counter: 1,
					ui5type: MessageType.Error
				} as Messages;
				this.addMessageToMessages(errorMessage);
			}
		}
	}

	checkKeyColumns(columnNames: string[], odataKeyList: string[], typeLabelList: ListObject) {
		const availableKeyColumns = [];
		for (let index = 0; index < odataKeyList.length; index++) {
			const columnName = odataKeyList[index];
			let found = false;
			for (const index in columnNames) {
				if (columnNames[index].includes(`[${columnName}]`)) {
					found = true;
					availableKeyColumns.push(columnName);
					break;
				}
			}
			if (!found) {
				const columnNameLabel = typeLabelList.get(columnName)?.label ? typeLabelList.get(columnName).label : columnName;
				const errorMessage: Messages = {
					title: this.spreadsheetUploadController.util.geti18nText("keyColumnNotFound", [columnNameLabel]),
					type: CustomMessageTypes.ColumnNotFound,
					counter: 1,
					ui5type: MessageType.Error
				};
				this.addMessageToMessages(errorMessage);
			}
		}
		return availableKeyColumns;
	}

	areMessagesPresent(): boolean {
		if (this.messages.some((message) => message.counter > 0)) {
			return true;
		}
		return false;
	}

	/**
	 * Display messages.
	 */
	async displayMessages(strict?: boolean) {
		this.messageDialog = (await Fragment.load({
			name: "cc.spreadsheetimporter.XXXnamespaceXXX.fragment.MessagesDialog",
			type: "XML",
			controller: this
		})) as Dialog;
		this.messageDialog.setModel(this.spreadsheetUploadController.componentI18n, "i18n");
		this.messageDialog.setModel(new JSONModel(), "messages");
		const messagesGrouped = this.groupMessages(this.messages);
		const sortedMessagesGrouped = this.sortMessagesByTitle(messagesGrouped);
		Log.debug("sortedMessagesGrouped", undefined, "SpreadsheetUpload: MessageHandler", () =>
			this.spreadsheetUploadController.component.logger.returnObject({ sortedMessagesGrouped: sortedMessagesGrouped })
		);
		(this.messageDialog.getModel("messages") as JSONModel).setData(sortedMessagesGrouped);
		const dialogState = this.getWorstType(sortedMessagesGrouped);
		const infoModel = new JSONModel({
			strict: this.spreadsheetUploadController.component.getStrict(),
			strictParameter: strict,
			dialogState: dialogState
		});
		this.messageDialog.setModel(infoModel, "info");
		this.messageDialog.setTitle(this.spreadsheetUploadController.component.getMessageDialogTitle());
		this.messageDialog.open();
	}

	groupMessages(messages: Messages[]): GroupedMessage[] {
		const counterLargerThanOne = messages.filter((message) => message.counter !== 0);
		const parsingMessages = counterLargerThanOne.filter((message) => message.type.group === true);

		const messageGroups = parsingMessages.reduce<{ [key: string]: MessagesDetails[] }>((groups, message) => {
			let messageText = "";
			if (!groups[message.title]) {
				groups[message.title] = [];
			}
			if (message.maxLength && message.excededLength) {
				messageText = this.spreadsheetUploadController.util.geti18nText("maxLengthExceededWithLength", [message.maxLength, message.excededLength, message.rawValue]);
			} else if (message.rawValue && message.formattedValue) {
				messageText = this.spreadsheetUploadController.util.geti18nText("errorInRowWithValueFormatted", [message.row, message.formattedValue, message.rawValue]);
			} else if (message.rawValue) {
				messageText = this.spreadsheetUploadController.util.geti18nText("errorInRowWithValue", [message.row, message.rawValue]);
			} else {
				messageText = this.spreadsheetUploadController.util.geti18nText("errorInRow", [message.row]);
			}
			groups[message.title].push({ description: messageText, row: message.row });
			return groups;
		}, {});

		const groupedMessages: GroupedMessage[] = [];
		for (const messageKeyTitle in messageGroups) {
			const messageArray = messageGroups[messageKeyTitle];
			const ui5type = messages.find((message) => message.title === messageKeyTitle)?.ui5type || ("" as MessageType);
			groupedMessages.push({
				title: messageKeyTitle,
				description: messageArray.map((message) => message.description).join("\n"),
				ui5type: ui5type,
				details: messageArray
			});
		}

		const allMessages = groupedMessages.concat(counterLargerThanOne.filter((message) => message.type.group === false));

		return allMessages;
	}

	private onCloseMessageDialog() {
		this.messageDialog.close();
		this.messageDialog.destroy();
		// rest file uploader content
		this.spreadsheetUploadController.resetContent();
	}

	private onContinue() {
		this.messageDialog.close();
		const spreadsheetUploadDialog = this.spreadsheetUploadController.getSpreadsheetUploadDialog();
		const payloadArrayLength = this.spreadsheetUploadController.payloadArray.length;
		(spreadsheetUploadDialog.getModel("info") as JSONModel).setProperty("/dataRows", payloadArrayLength);
	}

	onDownloadErrors() {
		const messages = (this.messageDialog.getModel("messages") as JSONModel).getData() as Messages[];

		// Define a mapping of original attribute names to custom headers
		const headerMapping = {
			title: this.spreadsheetUploadController.util.geti18nText("messageTitle"),
			description: this.spreadsheetUploadController.util.geti18nText("messageDescription"),
			ui5type: this.spreadsheetUploadController.util.geti18nText("messageType"),
			rowNumber: this.spreadsheetUploadController.util.geti18nText("messageRow")
		};
		const colWidth = [{ wch: 60 }, { wch: 40 }, { wch: 15 }, { wch: 20 }] as XLSX.ColInfo[];

		const flattenedData: any[] = [];

		messages.forEach((item) => {
			// if details are present, the messages are grouped
			if (item.details?.length > 0) {
				item.details?.forEach((detail) => {
					// Create a new object based on headerMapping
					const transformedItem: TransformedItem = {};
					for (const key in headerMapping) {
						if (key === "description") {
							transformedItem[headerMapping[key]] = detail.description;
						} else if (key === "rowNumber") {
							transformedItem[headerMapping[key]] = detail.row;
						} else if (item.hasOwnProperty(key)) {
							transformedItem[headerMapping[key]] = item[key];
						}
					}
					flattenedData.push(transformedItem);
				});
			} else {
				// no details, just add the message
				const transformedItem = {};
				for (const key in headerMapping) {
					if (key === "description") {
						transformedItem[headerMapping[key]] = item.title;
					} else if (key === "rowNumber") {
						transformedItem[headerMapping[key]] = item.row;
					} else if (item.hasOwnProperty(key)) {
						transformedItem[headerMapping[key]] = item[key];
					}
				}
				flattenedData.push(transformedItem);
			}
		});

		// Convert the flattened data to a worksheet
		const worksheet = XLSX.utils.json_to_sheet(flattenedData);
		worksheet["!cols"] = colWidth;

		// Convert the worksheet to a workbook and download it
		const workbook = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(workbook, worksheet, this.spreadsheetUploadController.util.geti18nText("sheetName"));
		XLSX.writeFile(workbook, this.spreadsheetUploadController.util.geti18nText("spreadsheetFilenameName") + ".xlsx");
	}

	private sortMessagesByTitle(messages: GroupedMessage[]) {
		return messages.sort((a, b) => {
			if (a.title < b.title) {
				return -1;
			}
			if (a.title > b.title) {
				return 1;
			}
			return 0;
		});
	}

	private getWorstType(messages: GroupedMessage[]): ValueState {
		let worstType = MessageType.None;

		// Map MessageType to severity levels
		const severity = {
			[MessageType.None]: 0,
			[MessageType.Information]: 1,
			[MessageType.Success]: 2,
			[MessageType.Warning]: 3,
			[MessageType.Error]: 4
		};

		for (const message of messages) {
			if (severity[message.ui5type] > severity[worstType]) {
				worstType = message.ui5type;
			}
		}

		// Convert MessageType to ValueState
		return worstType as unknown as ValueState;
	}
}
