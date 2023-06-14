import ManagedObject from "sap/ui/base/ManagedObject";
import Dialog from "sap/m/Dialog";
import { Messages} from "../../types";
import ExcelUpload from "../ExcelUpload";
import Fragment from "sap/ui/core/Fragment";

/**
 * @namespace cc.excelUpload.XXXnamespaceXXX
 */
export default class ODataMessageHandler extends ManagedObject{
	private messages: Messages[] = [];
	private excelUploadController: ExcelUpload;
	private messageDialog: Dialog;

	constructor(excelUploadController: ExcelUpload) {
		super();
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
