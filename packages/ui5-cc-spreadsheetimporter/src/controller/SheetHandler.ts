// @ts-nocheck
import ManagedObject from "sap/ui/base/ManagedObject";
import * as XLSX from "xlsx";
import { Sheet2JSONOpts, WorkSheet } from "xlsx";
import { ArrayData } from "../types";
/**
 * @namespace cc.spreadsheetimporter.XXXnamespaceXXX
 */
export default class SheetHandler extends ManagedObject {
	constructor() {
		super();
	}

	static sheet_to_json(sheet: WorkSheet, opts?: Sheet2JSONOpts, readSheetCoordinates?: string): ArrayData {
		if (sheet == null || sheet["!ref"] == null) return [];
		var val = { t: "n", v: 0 },
			header = 0,
			offset = 1,
			hdr = [],
			v = 0,
			vv = "";
		var r = { s: { r: 0, c: 0 }, e: { r: 0, c: 0 } };
		var o = opts || {};
		var range = o.range != null ? o.range : sheet["!ref"];

		// Apply readSheetCoordinates if provided using the dedicated method
		if (readSheetCoordinates && typeof readSheetCoordinates === "string" && readSheetCoordinates !== "A1") {
			range = this.applyCoordinatesToRange(range, readSheetCoordinates);
		}

		if (o.header === 1) header = 1;
		else if (o.header === "A") header = 2;
		else if (Array.isArray(o.header)) header = 3;
		else if (o.header == null) header = 0;
		switch (typeof range) {
			case "string":
				r = this.safe_decode_range(range);
				break;
			case "number":
				r = this.safe_decode_range(sheet["!ref"]);
				r.s.r = range;
				break;
			default:
				r = range;
		}
		if (header > 0) offset = 0;
		var rr = XLSX.utils.encode_row(r.s.r);
		var cols = [];
		var out = [];
		var outi = 0,
			counter = 0;
		var dense = sheet["!data"] != null;
		var R = r.s.r,
			C = 0;
		var header_cnt = {};
		if (dense && !sheet["!data"][R]) sheet["!data"][R] = [];
		var colinfo = (o.skipHidden && sheet["!cols"]) || [];
		var rowinfo = (o.skipHidden && sheet["!rows"]) || [];
		for (C = r.s.c; C <= r.e.c; ++C) {
			if ((colinfo[C] || {}).hidden) continue;
			cols[C] = XLSX.utils.encode_col(C);
			val = dense ? sheet["!data"][R][C] : sheet[cols[C] + rr];
			switch (header) {
				case 1:
					hdr[C] = C - r.s.c;
					break;
				case 2:
					hdr[C] = cols[C];
					break;
				case 3:
					hdr[C] = o.header[C - r.s.c];
					break;
				default:
					if (val == null) val = { w: "__EMPTY", t: "s" };
					vv = v = XLSX.utils.format_cell(val, null, o);
					counter = header_cnt[v] || 0;
					if (!counter) header_cnt[v] = 1;
					else {
						do {
							vv = v + "_" + counter++;
						} while (header_cnt[vv]);
						header_cnt[v] = counter;
						header_cnt[vv] = 1;
					}
					hdr[C] = vv;
			}
		}
		for (R = r.s.r + offset; R <= r.e.r; ++R) {
			if ((rowinfo[R] || {}).hidden) continue;
			var row = this.make_json_row(sheet, r, R, cols, header, hdr, o);
			if (row.isempty === false || (header === 1 ? o.blankrows !== false : !!o.blankrows)) out[outi++] = row.row;
		}
		out.length = outi;
		const renamedOut = this.renameAttributes(out);
		return renamedOut;
	}

	static make_json_row(sheet: WorkSheet, r, R, cols, header, hdr, o) {
		var rr = XLSX.utils.encode_row(R);
		var defval = o.defval,
			raw = o.raw || !Object.prototype.hasOwnProperty.call(o, "raw");
		var isempty = true,
			dense = sheet["!data"] != null;
		var row = header === 1 ? [] : {};
		if (header !== 1) {
			if (Object.defineProperty)
				try {
					Object.defineProperty(row, "__rowNum__", { value: R, enumerable: false });
				} catch (e) {
					row.__rowNum__ = R;
				}
			else row.__rowNum__ = R;
		}
		if (!dense || sheet["!data"][R])
			for (var C = r.s.c; C <= r.e.c; ++C) {
				var val = dense ? (sheet["!data"][R] || [])[C] : sheet[cols[C] + rr];
				if (val === undefined || val.t === undefined) {
					if (defval === undefined) continue;
					if (hdr[C] != null) {
						row[hdr[C]] = defval;
					}
					continue;
				}
				var v = val.v;
				switch (val.t) {
					case "z":
						if (v == null) break;
						continue;
					case "e":
						v = v == 0 ? null : void 0;
						break;
					case "s":
					case "d":
					case "b":
						break;
					case "n":
						// Check if it's a date formatted as a number
						if (val.z && this.fmt_is_date(val.z)) {
							v = this.numdate(v);
							if (typeof v !== "number") {
								// Handle date conversion
								if (!(o && (o.UTC || o.raw === false))) {
									v = this.utc_to_local(new Date(v));
								}
							}
						}
						break;
					default:
						throw new Error("unrecognized type " + val.t);
				}
				if (hdr[C] != null) {
					if (v == null) {
						if (val.t == "e" && v === null) row[hdr[C]] = null;
						else if (defval !== undefined) row[hdr[C]] = defval;
						else if (raw && v === null) row[hdr[C]] = null;
						else continue;
					} else {
						//row[hdr[C]] = raw && (val.t !== "n" || (val.t === "n" && o.rawNumbers !== false)) ? v : XLSX.utils.format_cell(val,v,o);
						row[hdr[C]] = val;
					}
					if (v != null) isempty = false;
				}
			}
		return { row: row, isempty: isempty };
	}

	// Helper methods for date handling
	static fmt_is_date(fmt) {
		var i = 0,
			/*cc = 0,*/ c = "",
			o = "";
		while (i < fmt.length) {
			switch ((c = fmt.charAt(i))) {
				case "G":
					if (this.SSF_isgeneral(fmt, i)) i += 6;
					i++;
					break;
				case '"':
					for (; /*cc=*/ fmt.charCodeAt(++i) !== 34 && i < fmt.length; ) {
						/*empty*/
					}
					++i;
					break;
				case "\\":
					i += 2;
					break;
				case "_":
					i += 2;
					break;
				case "@":
					++i;
					break;
				case "B":
				case "b":
					if (fmt.charAt(i + 1) === "1" || fmt.charAt(i + 1) === "2") return true;
				/* falls through */
				case "M":
				case "D":
				case "Y":
				case "H":
				case "S":
				case "E":
				/* falls through */
				case "m":
				case "d":
				case "y":
				case "h":
				case "s":
				case "e":
				case "g":
					return true;
				case "A":
				case "a":
				case "上":
					if (fmt.substr(i, 3).toUpperCase() === "A/P") return true;
					if (fmt.substr(i, 5).toUpperCase() === "AM/PM") return true;
					if (fmt.substr(i, 5).toUpperCase() === "上午/下午") return true;
					++i;
					break;
				case "[":
					o = c;
					while (fmt.charAt(i++) !== "]" && i < fmt.length) o += fmt.charAt(i);
					if (o.match(SSF_abstime)) return true;
					break;
				case ".":
				/* falls through */
				case "0":
				case "#":
					while (i < fmt.length && ("0#?.,E+-%".indexOf((c = fmt.charAt(++i))) > -1 || (c == "\\" && fmt.charAt(i + 1) == "-" && "0#".indexOf(fmt.charAt(i + 2)) > -1))) {
						/* empty */
					}
					break;
				case "?":
					while (fmt.charAt(++i) === c) {
						/* empty */
					}
					break;
				case "*":
					++i;
					if (fmt.charAt(i) == " " || fmt.charAt(i) == "*") ++i;
					break;
				case "(":
				case ")":
					++i;
					break;
				case "1":
				case "2":
				case "3":
				case "4":
				case "5":
				case "6":
				case "7":
				case "8":
				case "9":
					while (i < fmt.length && "0123456789".indexOf(fmt.charAt(++i)) > -1) {
						/* empty */
					}
					break;
				case " ":
					++i;
					break;
				default:
					++i;
					break;
			}
		}
		return false;
	}

	static SSF_isgeneral(s, i) {
		i = i || 0;
		return (
			s.length >= 7 + i &&
			(s.charCodeAt(i) | 32) === 103 &&
			(s.charCodeAt(i + 1) | 32) === 101 &&
			(s.charCodeAt(i + 2) | 32) === 110 &&
			(s.charCodeAt(i + 3) | 32) === 101 &&
			(s.charCodeAt(i + 4) | 32) === 114 &&
			(s.charCodeAt(i + 5) | 32) === 97 &&
			(s.charCodeAt(i + 6) | 32) === 108
		);
	}

	static numdate(v) {
		if (v >= 60 && v < 61) return v;
		var out = new Date();
		out.setTime((v > 60 ? v : v + 1) * 24 * 60 * 60 * 1000 + dnthresh);
		return out;
	}

	static utc_to_local(utc) {
		return new Date(utc.getUTCFullYear(), utc.getUTCMonth(), utc.getUTCDate(), utc.getUTCHours(), utc.getUTCMinutes(), utc.getUTCSeconds(), utc.getUTCMilliseconds());
	}

	static safe_decode_range(range) {
		var o = { s: { c: 0, r: 0 }, e: { c: 0, r: 0 } };
		var idx = 0,
			i = 0,
			cc = 0;
		var len = range.length;
		for (idx = 0; i < len; ++i) {
			if ((cc = range.charCodeAt(i) - 64) < 1 || cc > 26) break;
			idx = 26 * idx + cc;
		}
		o.s.c = --idx;

		for (idx = 0; i < len; ++i) {
			if ((cc = range.charCodeAt(i) - 48) < 0 || cc > 9) break;
			idx = 10 * idx + cc;
		}
		o.s.r = --idx;

		if (i === len || cc != 10) {
			o.e.c = o.s.c;
			o.e.r = o.s.r;
			return o;
		}
		++i;

		for (idx = 0; i != len; ++i) {
			if ((cc = range.charCodeAt(i) - 64) < 1 || cc > 26) break;
			idx = 26 * idx + cc;
		}
		o.e.c = --idx;

		for (idx = 0; i != len; ++i) {
			if ((cc = range.charCodeAt(i) - 48) < 0 || cc > 9) break;
			idx = 10 * idx + cc;
		}
		o.e.r = --idx;
		return o;
	}

	static renameAttributes(dataArray) {
		const renameAttributesInObject = (obj) => {
			const newObj = {} as any;
			Object.keys(obj).forEach((key) => {
				const cell = obj[key];
				if (cell && typeof cell === "object") {
					const cloned = { ...cell } as any;
					if (cloned.hasOwnProperty("v")) {
						cloned.rawValue = cloned.v;
						delete cloned.v;
				}
					if (cloned.hasOwnProperty("t")) {
						cloned.sheetDataType = cloned.t;
						delete cloned.t;
				}
					if (cloned.hasOwnProperty("z")) {
						cloned.format = cloned.z;
						delete cloned.z;
				}
					if (cloned.hasOwnProperty("w")) {
						cloned.formattedValue = cloned.w;
						delete cloned.w;
					}
					newObj[key] = cloned;
				} else {
					newObj[key] = cell;
				}
			});
			return newObj;
		};

		return dataArray.map(renameAttributesInObject);
	}

	/**
	 * Applies coordinates from A1 notation to a range
	 * @param range The original range to modify
	 * @param cellReference The cell reference in A1 notation (e.g., "A1")
	 * @returns The modified range string
	 */
	static applyCoordinatesToRange(range: string | any, cellReference: string): string {
		try {
			// Parse the cell reference to get row and column indices
			// XLSX.utils.decode_cell converts A1 notation to {c: 0, r: 0} format
			const cellCoords = XLSX.utils.decode_cell(cellReference);

			let r: any;
			if (typeof range === "string") {
				r = this.safe_decode_range(range);
			} else {
				r = range;
			}

			// Set starting coordinates based on the cell reference
			r.s.r = cellCoords.r;
			r.s.c = cellCoords.c;

			// Create a new range string with adjusted coordinates
			return XLSX.utils.encode_range(r);
		} catch (e) {
			console.error("Invalid cell reference:", cellReference);
			return range; // Return original range if there's an error
		}
	}
}
