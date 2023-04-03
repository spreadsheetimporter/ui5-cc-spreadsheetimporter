export interface Tags {
	name: string;
	count: number;
	type: string;
}

export interface Property {
	type: string;
	label: string;
}
export type ListObject = { [key: string]: Property };
export type PropertyArray = { [key: string]: any }[];
export type Columns = string[];

export enum ErrorTypes {
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
}

export interface ErrorMessage {
	title: string;
	type: ErrorTypes;
	counter: number;
	row?: number;
}
