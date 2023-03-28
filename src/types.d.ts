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

export interface ErrorMessage {
	title: string;
	counter: number;
}