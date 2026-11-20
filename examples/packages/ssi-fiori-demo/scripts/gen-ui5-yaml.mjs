// Generates ui5.yaml from ui5.yaml.tmpl, injecting BACKEND_URL from the gitignored .env so
// the backend host is never committed. Runs automatically via npm "prestart". Credentials
// (FIORI_TOOLS_USER / FIORI_TOOLS_PASSWORD) are read directly from .env by fiori-tools-proxy
// at runtime, so they don't need to be templated here.
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const envPath = join(root, ".env");

const env = {};
if (existsSync(envPath)) {
	for (const line of readFileSync(envPath, "utf8").split("\n")) {
		const t = line.trim();
		if (!t || t.startsWith("#") || !t.includes("=")) continue;
		const i = t.indexOf("=");
		env[t.slice(0, i).trim()] = t.slice(i + 1).trim();
	}
}

const url = env.BACKEND_URL || process.env.BACKEND_URL;
if (!url) {
	console.error("\n[gen-ui5-yaml] BACKEND_URL is not set.\n" + "  Copy .env.example to .env and set BACKEND_URL (+ FIORI_TOOLS_USER / FIORI_TOOLS_PASSWORD).\n");
	process.exit(1);
}

const tmpl = readFileSync(join(root, "ui5.yaml.tmpl"), "utf8");
writeFileSync(join(root, "ui5.yaml"), tmpl.replaceAll("__BACKEND_URL__", url));
console.log(`[gen-ui5-yaml] wrote ui5.yaml (backend ${url.replace(/\/\/[^/]+/, "//***")})`);
