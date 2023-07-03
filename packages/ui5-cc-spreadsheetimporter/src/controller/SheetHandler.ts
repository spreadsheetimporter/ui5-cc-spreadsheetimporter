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

	static sheet_to_json(sheet: WorkSheet, opts?: Sheet2JSONOpts): ArrayData {
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
					case "n":
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
			Object.keys(obj).forEach((key) => {
				if (obj[key].hasOwnProperty("v")) {
					obj[key].rawValue = obj[key].v;
					delete obj[key].v;
				}
				if (obj[key].hasOwnProperty("t")) {
					obj[key].sheetDataType = obj[key].t;
					delete obj[key].t;
				}
				if (obj[key].hasOwnProperty("z")) {
					obj[key].format = obj[key].z;
					delete obj[key].z;
				}
				if (obj[key].hasOwnProperty("w")) {
					obj[key].formattedValue = obj[key].w;
					delete obj[key].w;
				}
			});
			return obj;
		};

		return dataArray.map(renameAttributesInObject);
	}
}
