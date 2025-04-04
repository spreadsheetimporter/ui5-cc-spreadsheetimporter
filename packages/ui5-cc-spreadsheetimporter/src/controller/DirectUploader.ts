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
     * @returns {Promise<any>} A promise that resolves with the server response.
     */
    async uploadFile(fileContent: ArrayBuffer, fileName: string): Promise<any> {
        if (!this.config.enabled) {
            const error = new Error(this.util.geti18nText("spreadsheetimporter.directUploadNotEnabled"));
            Log.error("Direct upload not enabled", error, "DirectUploader", () => this.component.logger.returnObject({ config: this.config }));
            throw error;
        }

        let uploadUrl: string;

        // If fullServiceUrl is provided, use it directly
        if (this.config.fullServiceUrl) {
            uploadUrl = this.config.fullServiceUrl;
            
            // Handle localhost support for development
            if (this.config.localhostSupport && window.location.hostname === "localhost") {
                const protocol = window.location.protocol;
                const port = this.config.localhostPort || 4004;
                
                // If fullServiceUrl is a relative path, prefix with localhost
                if (uploadUrl.startsWith('/')) {
                    uploadUrl = `${protocol}//localhost:${port}${uploadUrl}`;
                }
                
                Log.info("Using localhost URL with fullServiceUrl", undefined, "DirectUploader", () => ({
                    uploadUrl
                }));
            }
        } else {
            // Otherwise, build URL from serviceUrl and entityName
            if (!this.config.entityName) {
                const error = new Error(this.util.geti18nText("spreadsheetimporter.noEntityNameProvided"));
                Log.error("No entity name provided for direct upload", error, "DirectUploader", () => this.component.logger.returnObject({ config: this.config }));
                throw error;
            }

            let serviceUrl = this.config.serviceUrl;
            if (!serviceUrl) {
                const error = new Error(this.util.geti18nText("spreadsheetimporter.noServiceUrlProvided"));
                Log.error("No service URL provided for direct upload", error, "DirectUploader", () => this.component.logger.returnObject({ config: this.config }));
                throw error;
            }
            
            // Handle localhost support for development
            if (this.config.localhostSupport && window.location.hostname === "localhost") {
                const protocol = window.location.protocol;
                const port = this.config.localhostPort || 4004;
                serviceUrl = `${protocol}//localhost:${port}${serviceUrl.startsWith('/') ? serviceUrl : '/' + serviceUrl}`;
                Log.info("Using localhost URL for direct upload", undefined, "DirectUploader", () => this.component.logger.returnObject({ serviceUrl }));
            }

            let entityPath = this.config.entityName;
            let tokenPath = ""; // Path for CSRF token fetch (no /content)
            
            // For CDS plugins, we need to format the entity path differently
            if (this.config.useCdsPlugin) {
                // For CDS Plugin, entity path should be Spreadsheet(entity=EntityName)
                const entityName = this.config.entityName;
                
                // Format base path: Spreadsheet(entity='EntityName')
                tokenPath = `Spreadsheet(entity='${encodeURIComponent(entityName)}')`;
                
                // Add /content for the upload path
                entityPath = `${tokenPath}/content`;
            }
            
            const baseUrl = serviceUrl.endsWith('/') 
                ? serviceUrl.slice(0, -1)
                : serviceUrl;
                
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
            }
            // Otherwise, leave default application/octet-stream
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
            
            // Configure exactly like CDSPlugin.controller.js
            xhr.open('PUT', url, true);
            
            // Set Content-Type header exactly like CDSPlugin.controller.js
            // Use contentType from config, which was determined based on file extension
            xhr.setRequestHeader('Content-Type', this.config.contentType || 'application/octet-stream');
            
            // Log exactly what we're about to do
            Log.info("Starting direct upload with simplified approach", undefined, "DirectUploader", () => ({
                url: url,
                method: 'PUT',
                contentType: this.config.contentType || 'application/octet-stream'
            }));
            
            // IMPORTANT: Set withCredentials to false explicitly to avoid CORS issues
            xhr.withCredentials = false;
            
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
                    try {
                        const errorResponse = JSON.parse(xhr.responseText);
                        if (errorResponse && errorResponse.error && errorResponse.error.message) {
                            errorMessage = errorResponse.error.message;
                        }
                    } catch (e) {
                        // Use default error message if parsing fails
                    }
                    
                    const error = new Error(errorMessage);
                    Log.error("Direct upload failed", error, "DirectUploader", () => this.component.logger.returnObject({ 
                        status: xhr.status, 
                        statusText: xhr.statusText,
                        response: xhr.responseText
                    }));
                    reject(error);
                }
            };
            
            // Handle network errors
            xhr.onerror = () => {
                const error = new Error("Network error during upload");
                Log.error("Network error during direct upload", error, "DirectUploader", () => this.component.logger.returnObject({ 
                    url: xhr.responseURL
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
                xhr.send(fileContent);
                Log.info(`PUT request started for file: ${fileName}`, undefined, "DirectUploader");
            } catch (error) {
                Log.error("Error sending file", error as Error, "DirectUploader");
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
            serviceUrl: "",
            fullServiceUrl: "",
            useCsrf: true,
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