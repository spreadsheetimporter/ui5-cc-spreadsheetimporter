import ManagedObject from "sap/ui/base/ManagedObject";
import Dialog from "sap/m/Dialog";
import { Messages } from "../../types";
import SpreadsheetUpload from "../SpreadsheetUpload";
import Fragment from "sap/ui/core/Fragment";

/**
 * @namespace cc.spreadsheetimporter.XXXnamespaceXXX
 */
export default class ODataMessageHandler extends ManagedObject {
	private messages: Messages[] = [];
	private spreadsheetUploadController: SpreadsheetUpload;
	private messageDialog: Dialog;

	constructor(spreadsheetUploadController: SpreadsheetUpload) {
		super();
		this.messages = [];
		this.spreadsheetUploadController = spreadsheetUploadController;
	}
	/**
	 * Display messages.
	 */
	async displayMessages() {
		if (!this.messageDialog) {
			this.messageDialog = (await Fragment.load({
				name: "cc.spreadsheetimporter.XXXnamespaceXXX.fragment.ODataMessagesDialog",
				type: "XML",
				controller: this
			})) as Dialog;
		}
		this.messageDialog.setModel(this.spreadsheetUploadController.componentI18n, "i18n");
		this.messageDialog.setModel(sap.ui.getCore().getMessageManager().getMessageModel(), "message");
		this.messageDialog.open();
	}

	private onCloseMessageDialog() {
		this.messageDialog.close();
		// reset message manager messages
		sap.ui.getCore().getMessageManager().removeAllMessages();
	}
}
