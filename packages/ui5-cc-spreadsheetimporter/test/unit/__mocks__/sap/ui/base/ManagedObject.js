// Minimal stand-in for sap/ui/base/ManagedObject so classes that `extends ManagedObject`
// (e.g. Parser) can be required in unit tests without the full UI5 runtime.
class ManagedObject {}

module.exports = ManagedObject;
module.exports.default = ManagedObject;
