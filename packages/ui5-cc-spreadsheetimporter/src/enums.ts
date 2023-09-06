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
	}
};
