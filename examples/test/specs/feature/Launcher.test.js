const Base = require("../Objects/Base");

let BaseClass = undefined;

/**
 * Freestyle harness: the Launcher / feature-test console (#/feature).
 *
 * Lists every feature page (one row per feature view) and navigates to it on press. Doubles as the
 * manual-test console. App-agnostic, so it validates the console on both the V2 and V4 harness apps.
 */
describe("Feature: Launcher (console)", () => {
	before(async () => {
		BaseClass = new Base();
		await browser.goTo({ sHash: "#/feature" });
		await BaseClass.dummyWait(1000);
	});

	it("lists the feature pages", async () => {
		const list = await browser.asControl({ forceSelect: true, selector: { id: new RegExp("featureList$") } });
		const items = await list.getAggregation("items");
		expect(items.length).toBeGreaterThanOrEqual(3);
	});

	it("navigates to a feature page when a row is pressed", async () => {
		const list = await browser.asControl({ forceSelect: true, selector: { id: new RegExp("featureList$") } });
		const items = await list.getAggregation("items");
		await items[0].press();
		await BaseClass.dummyWait(1000);
		const hash = await browser.execute(() => window.location.hash);
		expect(hash).toContain("feature/upload");
	});
});
