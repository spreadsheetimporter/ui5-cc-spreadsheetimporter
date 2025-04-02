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
