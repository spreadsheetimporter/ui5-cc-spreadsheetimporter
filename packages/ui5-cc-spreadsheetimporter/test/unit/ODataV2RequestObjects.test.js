/**
 * Unit tests for ODataV2RequestObjects
 *
 * Tests the pure logic of entity matching, draft validation,
 * and error handling without requiring a running OData service.
 */

const { ODataV2RequestObjects } = require('../../src/controller/odata/ODataV2RequestObjects');

// Helper to create a mock binding with entity type keys
function createMockBinding(keyNames) {
  return {
    _getEntityType: () => ({
      key: {
        propertyRef: keyNames.map(name => ({ name }))
      }
    })
  };
}

// Helper to create a mock OData model
function createMockModel(readResults) {
  return {
    read: jest.fn((path, options) => {
      // Check if the filter is for active or draft entities
      const filterStr = JSON.stringify(options.filters);
      const isActiveFilter = filterStr.includes('"value":true');
      const results = isActiveFilter ? readResults.active : readResults.draft;
      options.success({ results: results || [] });
    })
  };
}

describe('ODataV2RequestObjects', () => {
  let requestObjects;
  let mockMetadataHandler;
  let mockMessageHandler;
  let mockUtil;

  beforeEach(() => {
    mockMetadataHandler = {
      getKeys: jest.fn((binding, payload, isActiveEntity, excludeIsActiveEntity) => {
        const entityType = binding._getEntityType();
        const keys = {};
        entityType.key.propertyRef.forEach(keyRef => {
          if (payload.hasOwnProperty(keyRef.name)) {
            keys[keyRef.name] = payload[keyRef.name];
          }
        });
        return keys;
      })
    };

    mockMessageHandler = {
      messages: [],
      addMessageToMessages: jest.fn(function (msg) {
        this.messages.push(msg);
      }),
      areMessagesPresent: jest.fn(function () {
        return this.messages.length > 0;
      }),
      displayMessages: jest.fn()
    };

    mockUtil = {
      geti18nText: jest.fn(key => key)
    };

    requestObjects = new ODataV2RequestObjects(mockMetadataHandler, mockMessageHandler, mockUtil);
  });

  describe('getObjects', () => {
    it('should match spreadsheet rows to active entities', async () => {
      const binding = createMockBinding(['product_ID']);
      const spreadsheetData = [
        { product_ID: 'P1', quantity: 10 },
        { product_ID: 'P2', quantity: 20 }
      ];

      const activeEntities = [
        { product_ID: 'P1', quantity: 5, IsActiveEntity: true },
        { product_ID: 'P2', quantity: 8, IsActiveEntity: true }
      ];

      const model = createMockModel({ active: activeEntities, draft: [] });
      const result = await requestObjects.getObjects(model, binding, spreadsheetData, 'OrderItems');

      expect(result).toHaveLength(2);
      expect(result[0].product_ID).toBe('P1');
      expect(result[1].product_ID).toBe('P2');
    });

    it('should match spreadsheet rows to draft entities when active not found', async () => {
      const binding = createMockBinding(['product_ID']);
      const spreadsheetData = [{ product_ID: 'P1', quantity: 10, IsActiveEntity: false }];

      const draftEntities = [{ product_ID: 'P1', quantity: 5, IsActiveEntity: false }];

      const model = createMockModel({ active: [], draft: draftEntities });
      const result = await requestObjects.getObjects(model, binding, spreadsheetData, 'OrderItems');

      expect(result).toHaveLength(1);
      expect(result[0].IsActiveEntity).toBe(false);
    });

    it('should report error for entities not found in backend', async () => {
      const binding = createMockBinding(['product_ID']);
      const spreadsheetData = [{ product_ID: 'NONEXISTENT', quantity: 10 }];

      const model = createMockModel({ active: [], draft: [] });
      const result = await requestObjects.getObjects(model, binding, spreadsheetData, 'OrderItems');

      // Entity not found - should have been removed from spreadsheetData
      expect(spreadsheetData).toHaveLength(0);
      expect(mockMessageHandler.addMessageToMessages).toHaveBeenCalled();
      const errorMsg = mockMessageHandler.addMessageToMessages.mock.calls[0][0];
      expect(errorMsg.type).toBe('ObjectNotFound');
    });

    it('should handle model.read errors gracefully', async () => {
      const binding = createMockBinding(['product_ID']);
      const spreadsheetData = [{ product_ID: 'P1', quantity: 10 }];

      const model = {
        read: jest.fn((path, options) => {
          options.error(new Error('Network error'));
        })
      };

      const result = await requestObjects.getObjects(model, binding, spreadsheetData, 'OrderItems');

      // Should not throw — entities treated as not found
      expect(spreadsheetData).toHaveLength(0);
      expect(mockMessageHandler.addMessageToMessages).toHaveBeenCalled();
    });
  });

  describe('getMatchedEntities', () => {
    it('should return empty array initially', () => {
      expect(requestObjects.getMatchedEntities()).toEqual([]);
    });

    it('should return matched entities after getObjects', async () => {
      const binding = createMockBinding(['product_ID']);
      const spreadsheetData = [{ product_ID: 'P1', quantity: 10 }];
      const activeEntities = [{ product_ID: 'P1', quantity: 5, IsActiveEntity: true }];

      const model = createMockModel({ active: activeEntities, draft: [] });
      await requestObjects.getObjects(model, binding, spreadsheetData, 'OrderItems');

      const matched = requestObjects.getMatchedEntities();
      expect(matched).toHaveLength(1);
      expect(matched[0].entitySetName).toBe('OrderItems');
      expect(matched[0].keys).toEqual({ product_ID: 'P1' });
    });
  });

  describe('draft mismatch detection', () => {
    it('should detect when spreadsheet says draft but backend is active-only', async () => {
      const binding = createMockBinding(['product_ID']);
      const spreadsheetData = [{ product_ID: 'P1', quantity: 10, IsActiveEntity: false }];

      // Active entity exists but has no draft
      const activeEntities = [{ product_ID: 'P1', quantity: 5, IsActiveEntity: true, HasDraftEntity: false }];

      const model = createMockModel({ active: activeEntities, draft: [] });
      await requestObjects.getObjects(model, binding, spreadsheetData, 'OrderItems');

      // Should have added a draft mismatch error
      const draftMismatchCalls = mockMessageHandler.addMessageToMessages.mock.calls.filter(call => call[0].type === 'DraftEntityMismatch');
      expect(draftMismatchCalls.length).toBeGreaterThan(0);
    });

    it('should not report error when draft status matches', async () => {
      const binding = createMockBinding(['product_ID']);
      const spreadsheetData = [{ product_ID: 'P1', quantity: 10, IsActiveEntity: true }];

      const activeEntities = [{ product_ID: 'P1', quantity: 5, IsActiveEntity: true, HasDraftEntity: false }];

      const model = createMockModel({ active: activeEntities, draft: [] });
      await requestObjects.getObjects(model, binding, spreadsheetData, 'OrderItems');

      const draftMismatchCalls = mockMessageHandler.addMessageToMessages.mock.calls.filter(call => call[0].type === 'DraftEntityMismatch');
      expect(draftMismatchCalls).toHaveLength(0);
    });
  });

  describe('composite key matching', () => {
    it('should match entities with composite keys', async () => {
      const binding = createMockBinding(['OrderID', 'ItemID']);
      const spreadsheetData = [
        { OrderID: 'O1', ItemID: 'I1', quantity: 10 },
        { OrderID: 'O1', ItemID: 'I2', quantity: 20 }
      ];

      const activeEntities = [
        { OrderID: 'O1', ItemID: 'I1', quantity: 5, IsActiveEntity: true },
        { OrderID: 'O1', ItemID: 'I2', quantity: 8, IsActiveEntity: true }
      ];

      const model = createMockModel({ active: activeEntities, draft: [] });
      const result = await requestObjects.getObjects(model, binding, spreadsheetData, 'OrderItems');

      expect(result).toHaveLength(2);
      expect(result[0].ItemID).toBe('I1');
      expect(result[1].ItemID).toBe('I2');
    });

    it('should not match when only partial key matches', async () => {
      const binding = createMockBinding(['OrderID', 'ItemID']);
      const spreadsheetData = [{ OrderID: 'O1', ItemID: 'I_WRONG', quantity: 10 }];

      const activeEntities = [{ OrderID: 'O1', ItemID: 'I1', quantity: 5, IsActiveEntity: true }];

      const model = createMockModel({ active: activeEntities, draft: [] });
      await requestObjects.getObjects(model, binding, spreadsheetData, 'OrderItems');

      // Should have been removed as not found
      expect(spreadsheetData).toHaveLength(0);
    });
  });
});
