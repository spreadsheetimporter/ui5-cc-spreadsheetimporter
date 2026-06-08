class MetadataHandlerV2 {
  constructor() {}
  getKeys(binding, payload, isActiveEntity, excludeIsActiveEntity) {
    // Default: extract keys from payload based on binding's key definition
    if (binding && binding._getEntityType) {
      const entityType = binding._getEntityType();
      if (entityType && entityType.key && entityType.key.propertyRef) {
        const keys = {};
        entityType.key.propertyRef.forEach(keyRef => {
          if (payload.hasOwnProperty(keyRef.name)) {
            keys[keyRef.name] = payload[keyRef.name];
          }
        });
        return keys;
      }
    }
    return {};
  }
}

module.exports = MetadataHandlerV2;
module.exports.default = MetadataHandlerV2;
