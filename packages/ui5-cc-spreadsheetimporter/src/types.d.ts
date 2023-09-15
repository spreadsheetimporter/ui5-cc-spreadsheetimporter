import { MessageType } from "sap/ui/core/library";
import { AvailableOptions } from "./enums";

export interface Tags {
	name: string;
	count: number;
	type: string;
}

export interface Property {
	maxLength: number;
	type: string;
	label: string;
}
export type ListObject = Map<string, Property>;
export type PropertyArray = { [key: string]: any }[];
export type Columns = string[];

export type CustomMessageType = {
	title: string;
	group: boolean;
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
}

export interface GroupedMessage {
	title: string;
	description?: string;
	ui5type: MessageType;
}

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
	context?: object;
	columns?: string[];
	tableId?: string;
	odataType?: string;
	mandatoryFields?: string[];
	fieldMatchType?: FieldMatchType;
	activateDraft?: boolean;
	batchSize?: number;
	standalone?: boolean;
	readAllSheets?: boolean;
	strict?: boolean;
	decimalSeparator?: string;
	hidePreview?: boolean;
	skipMandatoryFieldCheck?: boolean;
	showBackendErrorMessages?: boolean;
	showOptions?: boolean;
	availableOptions?: AvailableOptionsType[];
	debug?: boolean;
	hideSampleData?: boolean;
	useTableSelector?: boolean;
	sampleData?: object;
}

// Pro Types
