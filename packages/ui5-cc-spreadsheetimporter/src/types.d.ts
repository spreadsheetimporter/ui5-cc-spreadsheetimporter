import { MessageType } from "sap/ui/core/library";
import { Action, AvailableOptions } from "./enums";

export interface Tags {
	name: string;
	count: number;
	type: string;
}

export interface Property {
	maxLength?: number;
	type: string;
	label: string;
	precision?: number;
	$XYZKey?: boolean;
}
export type ListObject = Map<string, Property>;
export type PropertyArray = { [key: string]: any }[];
export type Columns = string[];

export type CustomMessageType = {
	title: string;
	group: boolean;
	update?: boolean;
};

export interface Messages {
	title: string;
	type: CustomMessageType;
	counter: number;
	row?: number;
	group?: boolean;
	rawValue?: any;
	formattedValue?: string;
	ui5type: MessageType;
	description?: string;
	details?: MessagesDetails[];
	maxLength?: number;
	excededLength?: number;
}

export interface MessagesDetails {
	row?: number;
	description?: string;
}

export interface GroupedMessage {
	title: string;
	description?: string;
	ui5type?: MessageType;
	details?: MessagesDetails[];
}

export type TransformedItem = {
	[key in keyof typeof headerMapping]: string | number;
};

export type Payload = {
	[key: string]: any;
};
export type PayloadArray = Payload[];

// SheetHandler
export type SheetDataType = "b" | "e" | "n" | "d" | "s" | "z";

export interface ValueData {
	rawValue: any;
	sheetDataType: SheetDataType;
	format: string;
	formattedValue: string;
	sheetName: string;
}

export type ArrayData = {
	[key: string]: ValueData;
}[];

export type RowData = {
	[key: string]: ValueData;
};

export type AvailableOptionsType = keyof typeof AvailableOptions;

export interface ComponentData {
	spreadsheetFileName?: string;
	action?: Action;
	context?: object;
	columns?: string[];
	excludeColumns?: string[];
	tableId?: string;
	odataType?: string;
	mandatoryFields?: string[];
	fieldMatchType?: FieldMatchType;
	activateDraft?: boolean;
	batchSize?: number;
	standalone?: boolean;
	readAllSheets?: boolean;
	readSheet: number | string;
	spreadsheetRowPropertyName?: string;
	strict?: boolean;
	decimalSeparator?: string;
	hidePreview?: boolean;
	previewColumns?: string[];
	skipMandatoryFieldCheck?: boolean;
	skipColumnsCheck?: boolean;
	skipMaxLengthCheck?: boolean;
	skipEmptyHeadersCheck?: boolean;
	showBackendErrorMessages?: boolean;
	showOptions?: boolean;
	availableOptions?: AvailableOptionsType[];
	debug?: boolean;
	hideSampleData?: boolean;
	spreadsheetTemplateFile?: string;
	useTableSelector?: boolean;
	sampleData?: object;
	continueOnError?: boolean;
	componentContainerData?: object;
	createActiveEntity?: boolean;
	i18nModel?: object;
	bindingCustom?: object;
	showDownloadButton?: boolean;
	deepDownloadConfig?: DeepDownloadConfig;
	updateConfig?: UpdateConfig;
	readSheetCoordinates?: string;
	/**
	 * Configuration for direct file uploads to backend services
	 */
	directUploadConfig?: DirectUploadConfig;
}

export interface DeepDownloadConfig {
	addKeysToExport: boolean;
	setDraftStatus: boolean;
	deepExport: boolean;
	deepLevel: number;
	showOptions: boolean;
	columns: any;
	filename?: string;
}

export interface UpdateConfig {
	fullUpdate: boolean;
	columns: string[];
}

export interface DirectUploadConfig {
	/**
	 * Whether to use direct file upload instead of standard OData operations
	 */
	enabled: boolean;
	
	/**
	 * Target entity name for the direct upload (e.g., "my.bookshop.Authors")
	 */
	entityName: string;
	
	/**
	 * Complete URL to the upload endpoint
	 * Example: "/odata/v4/importer/Spreadsheet(entity='OrdersService.Orders')/content"
	 */
	uploadUrl?: string;
	
	/**
	 * The ID used to identify the spreadsheet entity (if not provided, a random one will be generated)
	 */
	entityId?: string;
	
	/**
	 * Whether to automatically adjust URLs for localhost environments
	 */
	localhostSupport?: boolean;
	
	/**
	 * Port to use for localhost requests (default: 4004)
	 */
	localhostPort?: number;
	
	/**
	 * Whether to use PUT (default) or POST for the upload
	 */
	usePost?: boolean;
	
	/**
	 * Whether to include CSRF token in the request
	 */
	useCsrf?: boolean;
	
	/**
	 * Additional request headers for the upload
	 */
	headers?: Record<string, string>;
	
	/**
	 * Content-Type header for the upload (default: application/octet-stream)
	 */
	contentType?: string;
	
	/**
	 * Whether to use Fetch API instead of XMLHttpRequest
	 */
	useFetchApi?: boolean;

	/**
	 * Whether to use CDS Plugin format for entity path
	 */
	useCdsPlugin?: boolean;
	
	/**
	 * Whether to append /content to the entity path (for CDS Plugin)
	 */
	appendContentPath?: boolean;
	
	/**
	 * Custom progress handler function for upload progress events
	 * @param percent - Upload progress percentage (0-100)
	 */
	onProgress?: (percent: number) => void;
	
	/**
	 * Custom error handler function for upload failures
	 */
	onError?: (error: any) => void;
	
	/**
	 * Custom success handler function for successful uploads
	 */
	onSuccess?: (response: any) => void;
}

export type FireEventReturnType = {
	bPreventDefault: boolean;
	mParameters: object;
	returnValue: object;
};

export type ListObject = Map<string, Property>;

export type PropertyObject = {
	propertyName: string;
	propertyValue: any; // Replace 'any' with a more specific type if possible.
	propertyLabel: [x: string];
};

interface EntityDefinition {
	$kind: string;
	$Key?: string[];
	[key: string]: PropertyDefinition | NavigationPropertyDefinition | any;
};

type EntityObject = {
	$kind: string;
	$Type?: string;
	$NavigationPropertyBinding?: Record<string, string>;
};

interface PropertyWithOrder {
	name: string;
	order: number;
}

// Pro Types
