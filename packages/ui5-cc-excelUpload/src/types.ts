import { MessageType } from "sap/ui/core/library";

export enum FieldMatchType {
	/**
	 * Default match type, property names in square brackets
	 * @public
	 */
	LabelTypeBrackets = "labelTypeBrackets",

	/**
	 * match type with only labels
	 * @public
	 */
	Label = "label"
}

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

type CustomMessageType = {
	title: string;
	group: boolean;
}


export const CustomMessageTypes: { [key: string]: CustomMessageType } = {
	MandatoryFieldNotFilled: {
		title: "MandatoryFieldNotFilled",
		group: true,
	},
	ColumnNotFound: {
		title: "ColumnNotFound",
		group: false,
	},
	ParsingError: {
		title: "ParsingError",
		group: true,
	},
	CustomErrorGroup: {
		title: "CustomErrorGroup",
		group: true,
	},
	CustomError: {
		title: "CustomError",
		group: false,
	},
	Formatting: {
		title: "Formatting",
		group: true,
	}
}

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
export type SheetDataType = 'b' | 'e' | 'n' | 'd' | 's' | 'z';

export interface ValueData {
  rawValue: any;
  sheetDataType: SheetDataType;
  format: string;
  formattedValue: string;
}

export type ArrayData = {
  [key: string]: ValueData;
}[];

export type RowData = {
	[key: string]: ValueData;
};

export enum AvailableOptions {
	/**
	 * Option for `strict` mode
	 * @public
	 */
	Strict = "strict",

	/**
	 * Changing the field match type
	 * @public
	 */
	FieldMatchType = "fieldMatchType",

	/**
	 * Changing the decimal seperator for number fields
	 * @public
	 */
	DecimalSeperator = "decimalSeperator"
}

export type AvailableOptionsType = keyof typeof AvailableOptions;

export interface ComponentData {
    excelFileName?: string;
    context?: object;
    columns?: string[];
    tableId?: string;
    odataType?: string;
    mandatoryFields?: string[];
    fieldMatchType?: FieldMatchType;
    activateDraft?: boolean;
    batchSize?: number;
    standalone?: boolean;
    strict?: boolean;
    decimalSeparator?: string;
    hidePreview?: boolean;
    skipMandatoryFieldCheck?: boolean;
    showBackendErrorMessages?: boolean;
    showOptions?: boolean;
    availableOptions?: AvailableOptionsType[];
    debug?: boolean;
}

