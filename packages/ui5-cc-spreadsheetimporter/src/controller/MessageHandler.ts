import ManagedObject from "sap/ui/base/ManagedObject";
import Dialog from "sap/m/Dialog";
import { Messages, ListObject, ArrayData, PayloadArray, GroupedMessage, MessagesDetails, TransformedItem } from "../types";
import SpreadsheetUpload from "./SpreadsheetUpload";
import Util from "./Util";
import Fragment from "sap/ui/core/Fragment";
import JSONModel from "sap/ui/model/json/JSONModel";
import { ValueState } from "sap/ui/core/library";
import Log from "sap/base/Log";
import { CustomMessageTypes, FieldMatchType, MessageType } from "../enums";
import * as XLSX from "xlsx";
import Text from "sap/m/Text";
import Button from "sap/m/Button";
import { DialogType, ButtonType } from "sap/m/library";
import MetadataHandlerV4 from "./odata/MetadataHandlerV4";

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
				title: this.spreadsheetUploadController.util.geti18nText("spreadsheetimporter.duplicateColumns", [duplicateColumns.join(", ")]),
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
					title: this.spreadsheetUploadController.util.geti18nText("spreadsheetimporter.mandatoryFieldNotFilled", [fieldLabel]),
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
							title: this.spreadsheetUploadController.util.geti18nText("spreadsheetimporter.maxLengthExceeded", [valueTypeLabelList.maxLength, valueTypeLabelList.label]),
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
			// Skip if columnName is undefined or not a string
			if (columnName === undefined || typeof columnName !== 'string') {
				continue;
			}
			
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
					title: this.spreadsheetUploadController.util.geti18nText("spreadsheetimporter.columnNotFound", [columnName]),
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
				const colName = columnNames[index];
				// Skip if column name is undefined or not a string
				if (colName === undefined || typeof colName !== 'string') {
					continue;
				}
				
				if (colName.includes(`[${columnName}]`)) {
					found = true;
					availableKeyColumns.push(columnName);
					break;
				}
			}
			if (!found) {
				const columnNameLabel = typeLabelList.get(columnName)?.label ? typeLabelList.get(columnName).label : columnName;
				const errorMessage: Messages = {
					title: this.spreadsheetUploadController.util.geti18nText("spreadsheetimporter.keyColumnNotFound", [columnNameLabel]),
					type: CustomMessageTypes.ColumnNotFound,
					counter: 1,
					ui5type: MessageType.Error
				};
				this.addMessageToMessages(errorMessage);
			}
		}
		return availableKeyColumns;
	}

	checkDuplicateKeys(data: ArrayData) {
		const keyNames = MetadataHandlerV4.getAnnotationProperties(this.spreadsheetUploadController.context, this.spreadsheetUploadController.getOdataType()).properties.$Key as string[];
		const seenKeys = new Map<string, number>();
		
		data.forEach((row, index) => {
			const keys = keyNames
				.filter(key => key !== "IsActiveEntity")
				.map(key => {
					const matchingColumn = Object.keys(row).find(col => col.includes(`[${key}]`));
					const value = matchingColumn ? row[matchingColumn].rawValue : undefined;
					return `${key}=${value}`;
				});
			const keyString = JSON.stringify(keys);
			
			if (seenKeys.has(keyString)) {
				const errorMessage = {
					title: this.spreadsheetUploadController.util.geti18nText("spreadsheetimporter.duplicateKeys"),
					type: CustomMessageTypes.DuplicateKeys,
					row: index + 2,
					counter: 1,
					ui5type: MessageType.Error,
					formattedValue: keys.join(", ")
				} as Messages;
				this.addMessageToMessages(errorMessage);
			} else {
				seenKeys.set(keyString, index);
			}
		});
	}

	checkMissingKeys(data: ArrayData) {
		// Get the key names from the metadata
		const keyNames = MetadataHandlerV4.getAnnotationProperties(
			this.spreadsheetUploadController.context,
			this.spreadsheetUploadController.getOdataType()
		).properties.$Key as string[];

		// Exclude "IsActiveEntity" property as it is not mandatory
		const mandatoryKeys = keyNames.filter(key => key !== "IsActiveEntity");

		data.forEach((row, index) => {
			// For each row, find which keys are missing or have empty values
			const missingKeys = mandatoryKeys.filter((key) => {
				const matchingColumn = Object.keys(row).find((col) => col.includes(`[${key}]`));
				if (!matchingColumn) {
					return true;
				}
				const value = row[matchingColumn].rawValue;
				return value === undefined || value === null || value === "";
			});

			// If any mandatory keys are missing, create an error message
			if (missingKeys.length > 0) {
				const errorMessage = {
					title: this.spreadsheetUploadController.util.geti18nText("spreadsheetimporter.missingKeys"), 
					type: CustomMessageTypes.MissingKeys,
					row: index + 2, // +2 because rows typically start at 2 in Excel
					counter: 1,
					ui5type: MessageType.Error
				} as Messages;
				this.addMessageToMessages(errorMessage);
			}
		});
	}

	checkEmptyHeaders(data: ArrayData, columnNames: string[]) {
		// First check column names
		const emptyColumnsFromHeaders = columnNames
			.filter(name => typeof name === 'string') // Ensure we only process strings
			.filter(name => name.includes("__EMPTY"));
		
		// Then check the actual data objects for keys starting with __EMPTY
		const emptyColumnsFromData = new Set<string>();
		
		for (const row of data) {
			for (const key in row) {
				// Check if key starts with __EMPTY and is not __rowNum__
				if (typeof key === 'string' && key.startsWith("__EMPTY") && key !== "__rowNum__") {
					emptyColumnsFromData.add(key);
				}
			}
		}
		
		// Combine both sources of empty column names
		const emptyColumns = [
			...emptyColumnsFromHeaders,
			...Array.from(emptyColumnsFromData)
		].filter((value, index, self) => self.indexOf(value) === index); // Remove duplicates
		
		if (emptyColumns.length > 0) {
			// Get the starting cell reference from the component or default to "A1"
			const startCell = this.spreadsheetUploadController.component.getReadSheetCoordinates() || "A1";
			
			// Calculate the data starting row (one row after the header row)
			let dataStartCell = "A2";
			if (startCell !== "A1") {
				// Extract the column and row from the start cell
				const cellMatch = startCell.match(/([A-Z]+)(\d+)/);
				if (cellMatch) {
					const column = cellMatch[1];
					const row = parseInt(cellMatch[2], 10);
					// Data starts one row after the header
					dataStartCell = `${column}${row + 1}`;
				}
			}
			
			const warningMessage = {
				title: this.spreadsheetUploadController.util.geti18nText("spreadsheetimporter.emptyHeadersFound", [emptyColumns.join(", ")]),
				description: this.spreadsheetUploadController.util.geti18nText("spreadsheetimporter.emptyHeadersDescription", [startCell, dataStartCell]),
				type: CustomMessageTypes.EmptyHeaders,
				counter: 1,
				ui5type: MessageType.Warning,
				group: false
			} as Messages;
			
			this.addMessageToMessages(warningMessage);
		}
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
	async displayMessages(strict?: boolean): Promise<void> {
		return new Promise((resolve, reject) => {
			Fragment.load({
				name: "cc.spreadsheetimporter.XXXnamespaceXXX.fragment.MessagesDialog",
				type: "XML",
				controller: {
					...this,
					onCloseMessageDialog: () => {
						this.messageDialog.close();
						this.messageDialog.destroy();
						// rest file uploader content
						this.spreadsheetUploadController.resetContent();
						reject(new Error("Operation cancelled by user"));
					},
					onContinue: async () => {
						// check if messages has type "ObjectNotFound"
						if (this.messages.some((message) => message.type.update)) {
							await this.showConfirmDialog();
							this.messageDialog.close();
						} else {
							this.messageDialog.close();
							const spreadsheetUploadDialog = this.spreadsheetUploadController.getSpreadsheetUploadDialog();
							const payloadArrayLength = this.spreadsheetUploadController.payloadArray.length;
							(spreadsheetUploadDialog.getModel("info") as JSONModel).setProperty("/dataRows", payloadArrayLength);
						}
						resolve();
					},
					onDownloadErrors: () => {
						this.onDownloadErrors();
					}
				}
			}).then((dialog: Dialog) => {
				this.messageDialog = dialog;
				this.messageDialog.setModel(this.spreadsheetUploadController.componentI18n, "i18n");
				this.messageDialog.setModel(new JSONModel(), "messages");
				const messagesGrouped = this.groupMessages(this.messages);
				const sortedMessagesGrouped = this.sortMessagesByTitle(messagesGrouped);
				(this.messageDialog.getModel("messages") as JSONModel).setData(sortedMessagesGrouped);
				const dialogState = this.getWorstType(sortedMessagesGrouped);
				const infoModel = new JSONModel({
					strict: this.spreadsheetUploadController.component.getStrict(),
					strictParameter: strict,
					dialogState: dialogState
				});
				this.messageDialog.setModel(infoModel, "info");
				this.messageDialog.open();
			});
		});
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
				messageText = this.spreadsheetUploadController.util.geti18nText("spreadsheetimporter.maxLengthExceededWithLength", [message.maxLength, message.excededLength, message.rawValue]);
			} else if (message.rawValue && message.formattedValue) {
				messageText = this.spreadsheetUploadController.util.geti18nText("spreadsheetimporter.errorInRowWithValueFormatted", [message.row, message.formattedValue, message.rawValue]);
			} else if (message.rawValue) {
				messageText = this.spreadsheetUploadController.util.geti18nText("spreadsheetimporter.errorInRowWithValue", [message.row, message.rawValue]);
			} else if (message.type === CustomMessageTypes.ObjectNotFound) {
				messageText = this.spreadsheetUploadController.util.geti18nText("spreadsheetimporter.objectNotFoundWithKeys", [message.formattedValue]);
			} else if (message.type === CustomMessageTypes.DraftEntityMismatch) {
				messageText = this.spreadsheetUploadController.util.geti18nText("spreadsheetimporter.draftEntityMismatchRow", message.formattedValue);
			} else if (message.type === CustomMessageTypes.DuplicateKeys) {
				messageText = this.spreadsheetUploadController.util.geti18nText("spreadsheetimporter.duplicateKeysRow", [message.formattedValue]);
			} else {
				messageText = this.spreadsheetUploadController.util.geti18nText("spreadsheetimporter.errorInRow", [message.row]);
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

	private async onContinue() {
		try {
			// check if messages has type "ObjectNotFound"
			if (this.messages.some((message) => message.type.update)) {
				await this.showConfirmDialog();
				// continue with successful fetched objects
			}
			
			this.messageDialog.close();
			const spreadsheetUploadDialog = this.spreadsheetUploadController.getSpreadsheetUploadDialog();
			const payloadArrayLength = this.spreadsheetUploadController.payloadArray.length;
			(spreadsheetUploadDialog.getModel("info") as JSONModel).setProperty("/dataRows", payloadArrayLength);
			
		} catch (error) {
			// Handle cancellation
			this.spreadsheetUploadController.resetContent();
		}
	}

	onDownloadErrors() {
		const messages = (this.messageDialog.getModel("messages") as JSONModel).getData() as Messages[];

		// Define a mapping of original attribute names to custom headers
		const headerMapping = {
			title: this.spreadsheetUploadController.util.geti18nText("spreadsheetimporter.messageTitle"),
			description: this.spreadsheetUploadController.util.geti18nText("spreadsheetimporter.messageDescription"),
			ui5type: this.spreadsheetUploadController.util.geti18nText("spreadsheetimporter.messageType"),
			rowNumber: this.spreadsheetUploadController.util.geti18nText("spreadsheetimporter.messageRow")
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
		XLSX.utils.book_append_sheet(workbook, worksheet, this.spreadsheetUploadController.util.geti18nText("spreadsheetimporter.sheetName"));
		XLSX.writeFile(workbook, this.spreadsheetUploadController.util.geti18nText("spreadsheetimporter.spreadsheetFilenameName") + ".xlsx");
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

	private showConfirmDialog(): Promise<void> {
		return new Promise((resolve, reject) => {
			const confirmDialog = new Dialog({
				type: DialogType.Message,
				title: this.spreadsheetUploadController.util.geti18nText("spreadsheetimporter.confirmTitle"),
				resizable: false,
				content: new Text({ 
					text: this.spreadsheetUploadController.util.geti18nText("spreadsheetimporter.confirmMessage") 
				}),
				beginButton: new Button({
					type: ButtonType.Emphasized,
					text: this.spreadsheetUploadController.util.geti18nText("spreadsheetimporter.continue"),
					press: () => {
						confirmDialog.close();
						resolve();
					}
				}),
				endButton: new Button({
					text: this.spreadsheetUploadController.util.geti18nText("spreadsheetimporter.cancel"),
					press: () => {
						confirmDialog.close();
						reject(new Error("Operation cancelled by user"));
					}
				}),
				afterClose: () => {
					confirmDialog.destroy();
				}
			});

			confirmDialog.open();
		});
	}
}
