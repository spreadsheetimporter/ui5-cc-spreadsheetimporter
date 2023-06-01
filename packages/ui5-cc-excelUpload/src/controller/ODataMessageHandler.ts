import Dialog from "sap/m/Dialog";
import { Messages, MessageTypes, ListObject, ArrayData, PayloadArray } from "../types";
import ExcelUpload from "./ExcelUpload";
import Util from "./Util";
import Fragment from "sap/ui/core/Fragment";
import JSONModel from "sap/ui/model/json/JSONModel";
import { MessageType, ValueState } from "sap/ui/core/library";

export default class ODataMessageHandler {
	private messages: Messages[] = [];
	private excelUploadController: ExcelUpload;
	private messageDialog: Dialog;

	constructor(excelUploadController: ExcelUpload) {
		this.messages = [];
		this.excelUploadController = excelUploadController;
	}
	/**
	 * Display messages.
	 */
	async displayMessages() {
		if (!this.messageDialog) {
			this.messageDialog = (await Fragment.load({
				name: "cc.excelUpload.XXXnamespaceXXX.fragment.ODataMessagesDialog",
				type: "XML",
				controller: this,
			})) as Dialog;
		}
		this.messageDialog.setModel(this.excelUploadController.componentI18n, "i18n");
		this.messageDialog.setModel(sap.ui.getCore().getMessageManager().getMessageModel(), "message");
		this.messageDialog.open();
	}

	private onCloseMessageDialog() {
		this.messageDialog.close();
		// reset message manager messages
		sap.ui.getCore().getMessageManager().removeAllMessages()
	}
}
