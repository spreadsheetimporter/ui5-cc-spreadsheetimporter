import ManagedObject from "sap/ui/base/ManagedObject";
import Component from "../Component";
import { DirectUploadConfig } from "../types";
import Log from "sap/base/Log";
import Util from "./Util";
import MessageHandler from "./MessageHandler";
import ResourceBundle from "sap/base/i18n/ResourceBundle";
import Device from "sap/ui/Device";

/**
 * @namespace cc.spreadsheetimporter.XXXnamespaceXXX
 */
export default class DirectUploader extends ManagedObject {
    private component: Component;
    private config: DirectUploadConfig;
    private util: Util;

    /**
     * Initializes DirectUploader instance.
     * @param {Component} component - The component to be used.
     * @param {MessageHandler} messageHandler - The message handler instance.
     * @param {ResourceBundle} resourceBundle - The i18n resource bundle.
     */
    constructor(component: Component, messageHandler: MessageHandler, resourceBundle: ResourceBundle) {
        super();
        this.component = component;
        this.util = new Util(resourceBundle);
        this.config = component.getDirectUploadConfig() || {
            enabled: false,
            entityName: "",
            useCsrf: true,
            localhostSupport: true,
            localhostPort: 4004,
            useCdsPlugin: false,
            appendContentPath: true
        };
    }


    /**
     * Uploads the spreadsheet file directly to the backend service.
     * @param {ArrayBuffer} fileContent - The file content as ArrayBuffer.
     * @param {string} fileName - The file name.
     * @param {string} odataType - The OData type for the entity.
     * @returns {Promise<any>} A promise that resolves with the server response.
     */
    async uploadFile(fileContent: ArrayBuffer, fileName: string, entityNameBinding: string): Promise<any> {
        if (!this.config.enabled) {
            const error = new Error(this.util.geti18nText("spreadsheetimporter.directUploadNotEnabled"));
            Log.error("Direct upload not enabled", error, "DirectUploader", () => this.component.logger.returnObject({ config: this.config }));
            throw error;
        }

        // Log the upload attempt with detailed information
        Log.info("Starting file upload", undefined, "DirectUploader", () => ({
            fileName,
            fileSize: fileContent.byteLength,
            odataType: odataType || "Not provided",
            uploadConfig: this.config
        }));

        let uploadUrl: string;

        // If uploadUrl is provided, use it directly
        if (this.config.uploadUrl) {
            uploadUrl = this.config.uploadUrl;
            
            // Handle localhost support for development
            if (this.config.localhostSupport && window.location.hostname === "localhost") {
                const protocol = window.location.protocol;
                const port = this.config.localhostPort || 4004;
                
                // If uploadUrl is a relative path, prefix with localhost
                if (uploadUrl.startsWith('/')) {
                    uploadUrl = `${protocol}//localhost:${port}${uploadUrl}`;
                }
                
                Log.info("Using localhost URL with uploadUrl", undefined, "DirectUploader", () => ({
                    uploadUrl
                }));
            }
        } else {
            // Otherwise, build URL from entityName
            if (!this.config.entityName && !entityNameBinding) {
                const error = new Error(this.util.geti18nText("spreadsheetimporter.noEntityNameProvided"));
                Log.error("No entity name provided for direct upload", error, "DirectUploader", () => this.component.logger.returnObject({ config: this.config }));
                throw error;
            }

            let baseUrl = "";
            
            // Handle localhost support for development
            if (this.config.localhostSupport && window.location.hostname === "localhost") {
                const protocol = window.location.protocol;
                const port = this.config.localhostPort || 4004;
                baseUrl = `${protocol}//localhost:${port}/odata/v4/importer`;
                Log.info("Using localhost URL for direct upload", undefined, "DirectUploader", () => this.component.logger.returnObject({ baseUrl }));
            } else {
                baseUrl = "/odata/v4/importer";
            }

            let entityPath = this.config.entityName;
            let tokenPath = ""; // Path for CSRF token fetch (no /content)
            
            // For CDS plugins, we need to format the entity path differently
            if (this.config.useCdsPlugin) {
                // For CDS Plugin, entity path should be Spreadsheet(entity=EntityName)
                const entityName = this.config.entityName || entityNameBinding;
                
                // Format base path: Spreadsheet(entity='EntityName')
                tokenPath = `Spreadsheet(entity='${encodeURIComponent(entityName)}')`;
                
                // Add /content for the upload path
                entityPath = `${tokenPath}/content`;
            }
                
            uploadUrl = `${baseUrl}/${entityPath}`;
        }
        
        // Detect content type based on filename if not explicitly set
        if (!this.config.contentType) {
            const lowerFileName = fileName.toLowerCase();
            if (lowerFileName.endsWith(".xlsx")) {
                this.config.contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
            } else if (lowerFileName.endsWith(".xls")) {
                this.config.contentType = "application/vnd.ms-excel";
            } else if (lowerFileName.endsWith(".csv")) {
                this.config.contentType = "text/csv";
            } else {
                // Default for unknown files
                this.config.contentType = "application/octet-stream";
            }
        }
        
        Log.info(`Upload URL: ${uploadUrl}`, undefined, "DirectUploader");

        try {
            // Use XMLHttpRequest for all uploads
            return await this.uploadWithXHR(uploadUrl, fileContent, fileName);
        } catch (error) {
            Log.error("Error during direct upload", error as Error, "DirectUploader", () => this.component.logger.returnObject({ error }));
            
            // Call onError callback if provided
            if (this.config.onError && typeof this.config.onError === 'function') {
                this.config.onError(error);
            }
            
            throw error;
        }
    }

    /**
     * Uploads the file using XMLHttpRequest.
     * @param {string} url - The upload URL.
     * @param {ArrayBuffer} fileContent - The file content as ArrayBuffer.
     * @param {string} fileName - The file name.
     * @returns {Promise<any>} A promise that resolves with the server response.
     */
    private uploadWithXHR(url: string, fileContent: ArrayBuffer, fileName: string): Promise<any> {
        return new Promise((resolve, reject) => {
            // For direct upload without token like CDSPlugin.controller.js
            const xhr = new XMLHttpRequest();
            
            // Determine HTTP method - Use POST if specified, otherwise default to PUT
            const method = this.config.usePost ? 'POST' : 'PUT';
            
            // Configure XMLHttpRequest
            xhr.open(method, url, true);
            
            // Set Content-Type header exactly like CDSPlugin.controller.js
            // Use contentType from config, which was determined based on file extension
            xhr.setRequestHeader('Content-Type', this.config.contentType || 'application/octet-stream');
            
            // Log exactly what we're about to do
            Log.info("Starting direct upload with simplified approach", undefined, "DirectUploader", () => ({
                url: url,
                method: method,
                contentType: this.config.contentType || 'application/octet-stream',
                fileSize: fileContent.byteLength,
                fileName: fileName
            }));
            
            // IMPORTANT: Set withCredentials to false explicitly to avoid CORS issues
            xhr.withCredentials = false;
            
            // Debug headers
            xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
            
            // Handle completion
            xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    let response;
                    try {
                        response = JSON.parse(xhr.responseText);
                    } catch (e) {
                        response = xhr.responseText;
                    }
                    
                    Log.info("Direct upload successful", undefined, "DirectUploader", () => this.component.logger.returnObject({ response }));
                    
                    // Call onSuccess callback if provided
                    if (this.config.onSuccess && typeof this.config.onSuccess === 'function') {
                        this.config.onSuccess(response);
                    }
                    
                    resolve(response);
                } else {
                    // Try to extract more detailed error message
                    let errorMessage = `Upload failed with status ${xhr.status}: ${xhr.statusText}`;
                    let errorDetails = '';
                    
                    try {
                        const errorResponse = JSON.parse(xhr.responseText);
                        if (errorResponse && errorResponse.error && errorResponse.error.message) {
                            errorMessage = errorResponse.error.message;
                        }
                        errorDetails = JSON.stringify(errorResponse, null, 2);
                    } catch (e) {
                        // If response isn't valid JSON, use the raw response text
                        errorDetails = xhr.responseText;
                    }
                    
                    const error = new Error(errorMessage);
                    Log.error("Direct upload failed", error, "DirectUploader", () => this.component.logger.returnObject({ 
                        status: xhr.status, 
                        statusText: xhr.statusText,
                        responseHeaders: xhr.getAllResponseHeaders(),
                        errorDetails: errorDetails
                    }));
                    reject(error);
                }
            };
            
            // Handle network errors
            xhr.onerror = () => {
                const error = new Error("Network error during upload");
                Log.error("Network error during direct upload", error, "DirectUploader", () => this.component.logger.returnObject({ 
                    url: xhr.responseURL,
                    withCredentials: xhr.withCredentials,
                    contentType: this.config.contentType
                }));
                reject(error);
            };
            
            // Set up progress event handler
            xhr.upload.onprogress = (event) => {
                if (event.lengthComputable && this.config.onProgress && typeof this.config.onProgress === 'function') {
                    const percentComplete = Math.round((event.loaded / event.total) * 100);
                    this.config.onProgress(percentComplete);
                }
            };
            
            // Send the file
            try {
                // Ensure we're sending the raw ArrayBuffer directly
                xhr.send(fileContent);
                Log.info(`${method} request started for file: ${fileName}`, undefined, "DirectUploader", () => ({
                    fileSize: fileContent.byteLength,
                    url: url
                }));
            } catch (error) {
                Log.error("Error sending file", error as Error, "DirectUploader", () => ({
                    fileSize: fileContent.byteLength,
                    fileName: fileName,
                    contentType: this.config.contentType
                }));
                reject(error);
            }
        });
    }

    /**
     * Gets the current configuration.
     * @returns {DirectUploadConfig} The current configuration.
     */
    public getConfig(): DirectUploadConfig {
        return this.config;
    }

    /**
     * Updates the configuration.
     * @param {DirectUploadConfig} config - The new configuration.
     */
    public setConfig(config: DirectUploadConfig): void {
        this.config = {...this.config, ...config};
    }

    /**
     * Creates a default configuration object.
     * @returns {DirectUploadConfig} The default configuration.
     */
    public static createDefaultConfig(): DirectUploadConfig {
        return {
            enabled: false,
            entityName: "",
            uploadUrl: "",
            useCsrf: false,
            usePost: false,
            localhostSupport: true,
            localhostPort: 4004,
            useCdsPlugin: false,
            appendContentPath: true,
            entityId: "",
            contentType: "application/octet-stream"
        };
    }
} 