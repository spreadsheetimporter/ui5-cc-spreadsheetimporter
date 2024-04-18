import babelParser from "@babel/eslint-parser";
import js from "@eslint/js";	


export default [
	js.configs.recommended,
	{
	files: ["**/*.js", "**/*.ts", "**/*.tsx"],
	rules: {
		"prefer-const": "warn",
		"no-unused-vars": "warn",
		"no-undef": "warn",
		"no-prototype-builtins": "warn",
		"no-useless-escape": "warn"
	},
	ignores: ["node_modules", "dist", "webapp", "examples", "dev", "babel.config.js", "!*.js"],
	languageOptions: {
		parser: babelParser,
		ecmaVersion: 2020,
		sourceType: "module",
		globals: {
			"sap": true
		}
	}
}]
