import { CustomMessageType } from "./types";

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

export const CustomMessageTypes: { [key: string]: CustomMessageType } = {
	MandatoryFieldNotFilled: {
		title: "MandatoryFieldNotFilled",
		group: true
	},
	ColumnNotFound: {
		title: "ColumnNotFound",
		group: false
	},
	ParsingError: {
		title: "ParsingError",
		group: true
	},
	CustomErrorGroup: {
		title: "CustomErrorGroup",
		group: true
	},
	CustomError: {
		title: "CustomError",
		group: false
	},
	Formatting: {
		title: "Formatting",
		group: true
	},
	DuplicateColumns: {
		title: "DuplicateColumns",
		group: false
	},
	MaxLengthExceeded: {
		title: "MaxLengthExceeded",
		group: true
	},
	ObjectNotFound: {
		title: "ObjectNotFound",
		group: true,
		update: true
	},
	DraftEntityMismatch: {
		title: "DraftEntityMismatch",
		group: true,
		update: true
	}
};

export enum MessageType {
    /**
     * Message is an error
     */
    Error = "Error",
    /**
     * Message should be just an information
     */
    Information = "Information",
    /**
     * Message has no specific level
     */
    None = "None",
    /**
     * Message is a success message
     */
    Success = "Success",
    /**
     * Message is a warning
     */
	Warning = "Warning"
}

export enum Action {
	Create = "CREATE",
	Update = "UPDATE",
	Delete = "DELETE"
}
