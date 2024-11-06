import ManagedObject from "sap/ui/base/ManagedObject";
import Dialog from "sap/m/Dialog";
import { Messages } from "../../types";
import SpreadsheetUpload from "../SpreadsheetUpload";
import Fragment from "sap/ui/core/Fragment";
import JSONModel from "sap/ui/model/json/JSONModel";
import Util from "../Util";
import Log from "sap/base/Log";

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
	async displayMessages(messageData: any) {
		const messageModel = new JSONModel(messageData);
		if (!this.messageDialog) {
			this.messageDialog = (await Fragment.load({
				name: "cc.spreadsheetimporter.XXXnamespaceXXX.fragment.ODataMessagesDialog",
				type: "XML",
				controller: this
			})) as Dialog;
		}
		this.messageDialog.setModel(this.spreadsheetUploadController.componentI18n, "i18n");
		this.messageDialog.setModel(messageModel, "message");
		// this.messageDialog.setModel(Message, "message");
		this.messageDialog.open();
	}

	private async onCloseMessageDialog() {
		this.messageDialog.close();
		// reset message manager messages
		try {
			// sap.ui.core.Messaging is only available in UI5 version 1.118 and above, prefer this over sap.ui.getCore().getMessageManager() = Util.loadUI5RessourceAsync("sap/ui/core/Messaging");
			const Messaging = await Util.loadUI5RessourceAsync("sap/ui/core/Messaging");
			Messaging.removeAllMessages();
			return;
		} catch (error) {
			Log.debug("sap/ui/core/Messaging not found", undefined, "SpreadsheetUpload: checkForODataErrors");
		}
		// fallback for UI5 versions below 1.118
		sap.ui.getCore().getMessageManager().removeAllMessages();
	}
}
