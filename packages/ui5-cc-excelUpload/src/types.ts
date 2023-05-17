import { MessageType } from "sap/ui/core/library";

export interface Tags {
	name: string;
	count: number;
	type: string;
}

export type FieldMatchType = 'label' | 'labelTypeBrackets';

export interface Property {
	type: string;
	label: string;
}
export type ListObject = { [key: string]: Property };
export type PropertyArray = { [key: string]: any }[];
export type Columns = string[];

export enum MessageTypes {
	MandatoryFieldNotFilled = {
		title: "MandatoryFieldNotFilled",
		group: true,
	},
	ColumnNotFound = {
		title: "ColumnNotFound",
		group: false,
	},
	ParsingError = {
		title: "ParsingError",
		group: true,
	},
	CustomErrorGroup = {
		title: "CustomErrorGroup",
		group: true,
	},
	CustomError = {
		title: "CustomError",
		group: false,
	},
	Formatting = {
		title: "Formatting",
		group: true,
	}
}

export interface Messages {
	title: string;
	type: MessageTypes;
	counter: number;
	row?: number;
	group?: boolean;
	rawValue?: any;
	formattedValue?: string;
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
