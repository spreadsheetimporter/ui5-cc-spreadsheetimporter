// UI5 linter configuration.
//
// manifest.json intentionally keeps a low _version / minUI5Version: this control
// supports UI5 1.71+ (see the wdi5 test matrix), so the "manifest v2 migration"
// rules promoted to errors in newer @ui5/linter releases
// (no-outdated-manifest-version, no-legacy-ui5-version-in-manifest) do not apply.
// Exclude the manifest from linting until the control drops support for UI5 < 1.136.
module.exports = {
  ignores: ['**/manifest.json']
};
