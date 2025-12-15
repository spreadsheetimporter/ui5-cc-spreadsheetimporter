import Controller from "sap/ui/core/mvc/Controller";
import MessageToast from "sap/m/MessageToast";
import ODataModel from "sap/ui/model/odata/v4/ODataModel";
import BusyIndicator from "sap/ui/core/BusyIndicator";
import Component from "../Component";
import FileUploader from "sap/ui/unified/FileUploader";
import Event from "sap/ui/base/Event";
import ODataListBinding from "sap/ui/model/odata/v4/ODataListBinding";

// Define a group ID for batch requests if explicit control is needed
const UPLOAD_GROUP_ID = "uploadGroup";

/**
 * @namespace ordersv4freestyle.controller
 */
export default class CDSPluginBackupController extends Controller {
	private oImporterModel: ODataModel;

	public onInit(): void {
		// Determine the base URL for services (different for localhost)
		let sServiceUrl = "/odata/v4/importer/";
		if (window.location.hostname === "localhost") {
			// When running UI locally but using a remote service on port 4004
			// uncomment below line and comment the next line if you need absolute URLs
			// sServiceUrl = "http://localhost:4004/odata/v4/importer/";

			// We're assuming server-relative URLs work because UI app and backend
			// are served from the same origin or proper CORS is configured
			console.log("Running on localhost, service URLs will be relative or configured in proxy");
		}

		// Create a dedicated model for the ImporterService
		// Using synchronizationMode "None" allows explicit batch control via submitBatch
		this.oImporterModel = new ODataModel({
			serviceUrl: sServiceUrl,
			synchronizationMode: "None",
			groupId: "$auto", // Default group for reads
			updateGroupId: UPLOAD_GROUP_ID, // Default group for updates (including setValue)
			operationMode: "Server"
		});

		// Log model configuration
		console.log("ImporterService model created with serviceUrl:", sServiceUrl);

		// Set the model on the view if you need to access it declaratively
		this.getView().setModel(this.oImporterModel, "importerService");
	}

	public onNavBack(): void {
		(this.getOwnerComponent() as Component).getRouter().navTo("RouteMainView", {}, true);
	}

	// Prevent default file uploader "Upload" button
	public uploadButtonPress(oEvent: Event): void {
		oEvent.preventDefault();
	}

	// File selected in FileUploader
	public preFileProcessing(oEvent: Event): void {
		oEvent.preventDefault(); // stop FileUploader's built-in upload
		const file = oEvent.getParameter("file" as never) as File;
		MessageToast.show("Selected file: " + file.name);

		// Send to CAP backend using the direct XMLHttpRequest approach
		this.sendFileToCAPBackend(file);
	}

	// Reads the file and uploads it directly using XMLHttpRequest (without OData APIs)
	public sendFileToCAPBackend(file: File): void {
		// Define the upload URL (base service URL + entity path + content property)
		const sEntityId = "OrdersService.Orders"; // Unique ID for the Spreadsheet entity

		// Get the serviceUrl from the model (handles localhost automatically based on onInit config)
		let sBaseUrl = "";
		if (this.oImporterModel && (this.oImporterModel as any).sServiceUrl) {
			// Remove trailing slash if present (oImporterModel.sServiceUrl often has it)
			sBaseUrl = ((this.oImporterModel as any).sServiceUrl as string).replace(/\/$/, "");
		}

		// Remove 'odata/v4/importer' from sBaseUrl if present, as it's already in the path below
		if (sBaseUrl.endsWith("odata/v4/importer")) {
			sBaseUrl = sBaseUrl.substring(0, sBaseUrl.length - "odata/v4/importer".length);
		}

		const sUploadUrl = sBaseUrl + "odata/v4/importer/Spreadsheet(entity='" + encodeURIComponent(sEntityId) + "')/content";

		console.log("Base URL:", sBaseUrl);
		console.log("Computed upload URL:", sUploadUrl);

		// First, ensure entity exists before attempting the upload
		this._ensureEntityExists(sEntityId)
			.then(() => {
				// Once entity exists, perform the direct upload using XMLHttpRequest
				this._uploadFileWithXHR(file, sUploadUrl);
			})
			.catch((oError: Error) => {
				console.error("Error ensuring spreadsheet entity exists:", oError);
				MessageToast.show("Upload preparation failed: " + (oError.message || oError));
			});
	}

	// Helper: Ensures the spreadsheet entity exists, creates it if it doesn't
	private _ensureEntityExists(sEntityId: string): Promise<void> {
		const sEntityPath = "/Spreadsheet(entity='" + encodeURIComponent(sEntityId) + "')";
		const oContext = this.oImporterModel.bindContext(sEntityPath).getBoundContext();

		return new Promise((resolve, reject) => {
			// Try to fetch the entity, resolves if it exists
			oContext
				.requestObject()
				.then(() => {
					console.log("Entity with ID", sEntityId, "exists.");
					resolve();
				})
				.catch((oError: any) => {
					// If entity doesn't exist (404), create it
					if (oError.status === 404 || (oError.getMessages && oError.getMessages().some((msg: any) => msg.getCode() === "404"))) {
						console.log("Entity with ID", sEntityId, "does not exist. Creating it...");

						// Create the entity using list binding with $count
						const oListBinding = this.oImporterModel.bindList("/Spreadsheet", undefined, undefined, undefined, { $count: true }) as ODataListBinding;
						oListBinding.create({ entity: sEntityId }, true);

						// Submit the batch to create the entity
						this.oImporterModel
							.submitBatch(UPLOAD_GROUP_ID)
							.then(() => {
								console.log("Entity creation successful:", sEntityId);
								resolve();
							})
							.catch((oCreateError: Error) => {
								console.error("Entity creation failed:", oCreateError);
								reject(oCreateError);
							});
					} else {
						// Some other error occurred
						reject(oError);
					}
				});
		});
	}

	// Helper: Uploads file using direct XHR PUT request (similar to sap.m.upload.Uploader)
	private _uploadFileWithXHR(oFile: File, sUploadUrl: string): void {
		const oXhr = new XMLHttpRequest();

		// Adjust URL for localhost development (port 4004)
		let sAdjustedUrl = sUploadUrl;
		if (window.location.hostname === "localhost") {
			// If the URL starts with a slash, it's a relative URL that needs the full server base
			if (sUploadUrl.startsWith("/")) {
				sAdjustedUrl = "http://localhost:4004" + sUploadUrl;
				console.log("Running on localhost, adjusted URL to:", sAdjustedUrl);
			}
		}

		// Show busy indicator
		BusyIndicator.show(0);

		// Configure the XHR request
		oXhr.open("PUT", sAdjustedUrl, true);

		// Set Content-Type header based on file type if available
		if (oFile.type) {
			oXhr.setRequestHeader("Content-Type", oFile.type);
		}

		// Add any additional headers if needed
		// If using CSRF protection, you might need to get a token first and add it here

		// Set up progress event handler (optional)
		oXhr.upload.addEventListener("progress", (oEvent: ProgressEvent) => {
			if (oEvent.lengthComputable) {
				const fPercentComplete = (oEvent.loaded / oEvent.total) * 100;
				console.log("Upload progress: " + Math.round(fPercentComplete) + "%");
			}
		});

		// Set up completion handler
		oXhr.onreadystatechange = () => {
			if (oXhr.readyState === XMLHttpRequest.DONE) {
				BusyIndicator.hide();

				if (oXhr.status >= 200 && oXhr.status < 300) {
					// Upload succeeded
					console.log("Upload completed successfully!");
					MessageToast.show("File uploaded successfully!");

					// Clear file uploader
					const oFileUploader = this.byId("fileUploader") as FileUploader;
					if (oFileUploader) {
						oFileUploader.clear();
					}
				} else {
					// Upload failed
					console.error("Upload failed with status:", oXhr.status, oXhr.statusText);
					console.error("Response:", oXhr.responseText);
					MessageToast.show("Upload failed: " + (oXhr.statusText || "Server error"));
				}
			}
		};

		// Handle network errors
		oXhr.onerror = () => {
			BusyIndicator.hide();
			console.error("Network error during upload");
			MessageToast.show("Network error during upload");
		};

		// Send the file
		try {
			oXhr.send(oFile);
			console.log("XHR upload started for file:", oFile.name);
		} catch (error) {
			BusyIndicator.hide();
			console.error("Error sending file:", error);
			MessageToast.show("Error starting upload: " + (error as Error).message);
		}
	}
}
