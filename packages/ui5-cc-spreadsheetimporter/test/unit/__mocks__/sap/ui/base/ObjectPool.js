// Minimal stand-in for sap/ui/base/ObjectPool used by Util.fireEventAsync.
// borrowObject() returns a lightweight event object compatible with what consumer
// handlers use: getParameter()/getParameters()/getSource()/preventDefault().
class ObjectPool {
  constructor(ObjType) {
    this._ObjType = ObjType;
  }
  borrowObject(eventName, source, parameters) {
    return {
      _eventName: eventName,
      mParameters: parameters,
      bPreventDefault: false,
      getId: () => eventName,
      getSource: () => source,
      getParameter: key => (parameters ? parameters[key] : undefined),
      getParameters: () => parameters,
      preventDefault() {
        this.bPreventDefault = true;
      }
    };
  }
  returnObject() {}
}

module.exports = ObjectPool;
module.exports.default = ObjectPool;
