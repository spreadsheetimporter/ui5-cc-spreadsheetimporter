/**
 * Unit tests for ODataV4RequestObjects — the V4 prefetch/row-matching logic, mirroring the
 * existing ODataV2RequestObjects suite for parity.
 *
 * Tests entity matching, draft fallback, not-found reporting, draft-state mismatch detection
 * and composite keys without a running OData service. The V4 model API (bindList ->
 * requestContexts -> context.getObject) is mocked; the two MetadataHandlerV4 path helpers are
 * stubbed. The first _getFilteredContexts call fetches active entities, the second inactive —
 * so the mocked bindList returns active contexts on call 0 and inactive on call 1.
 */

const { ODataV4RequestObjects } = require('../../src/controller/odata/ODataV4RequestObjects');
const MetadataHandlerV4 = require('../../src/controller/odata/MetadataHandlerV4').default;

// Binding carries the key names our injected metadataHandler.getKeys reads.
function createMockBinding(keyNames) {
  return {
    getPath: () => '/Orders',
    _keyNames: keyNames
  };
}

// getObjects fetches active entities first (call 0), then inactive (call 1).
function createMockModel(activeEntities, inactiveEntities) {
  let call = 0;
  return {
    getMetadata: () => ({ getName: () => 'mockModel' }),
    bindList: jest.fn(() => {
      const entities = call++ === 0 ? activeEntities : inactiveEntities;
      return {
        filter: jest.fn(),
        requestContexts: jest.fn(async () => entities.map(e => ({ getObject: () => e })))
      };
    })
  };
}

describe('ODataV4RequestObjects', () => {
  let requestObjects;
  let mockMetadataHandler;
  let mockMessageHandler;
  let mockUtil;
  let resolvedPathSpy;
  let keyPredicatesSpy;

  beforeEach(() => {
    // Stub the two static path helpers (they read a live binding/metamodel).
    resolvedPathSpy = jest.spyOn(MetadataHandlerV4, 'getResolvedPath').mockReturnValue('/Orders');
    keyPredicatesSpy = jest.spyOn(MetadataHandlerV4, 'formatKeyPredicates').mockReturnValue('');

    mockMetadataHandler = {
      getKeys: jest.fn((binding, payload) => {
        const keys = {};
        binding._keyNames.forEach(name => {
          if (payload.hasOwnProperty(name)) {
            keys[name] = payload[name];
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

    requestObjects = new ODataV4RequestObjects(mockMetadataHandler, mockMessageHandler, mockUtil);
  });

  afterEach(() => {
    resolvedPathSpy.mockRestore();
    keyPredicatesSpy.mockRestore();
  });

  describe('getObjects', () => {
    it('matches spreadsheet rows to active entities', async () => {
      const binding = createMockBinding(['product_ID']);
      const spreadsheetData = [
        { product_ID: 'P1', IsActiveEntity: true },
        { product_ID: 'P2', IsActiveEntity: true }
      ];
      const active = [
        { product_ID: 'P1', IsActiveEntity: true, HasDraftEntity: false },
        { product_ID: 'P2', IsActiveEntity: true, HasDraftEntity: false }
      ];

      const result = await requestObjects.getObjects(createMockModel(active, []), binding, spreadsheetData);

      expect(result).toHaveLength(2);
      expect(result.map(e => e.product_ID).sort()).toEqual(['P1', 'P2']);
    });

    it('matches inactive (draft) entities when the row is flagged draft', async () => {
      const binding = createMockBinding(['product_ID']);
      const spreadsheetData = [{ product_ID: 'P1', IsActiveEntity: false }];
      const inactive = [{ product_ID: 'P1', IsActiveEntity: false, HasDraftEntity: false }];

      const result = await requestObjects.getObjects(createMockModel([], inactive), binding, spreadsheetData);

      expect(result).toHaveLength(1);
      expect(result[0].IsActiveEntity).toBe(false);
    });

    it('reports ObjectNotFound and removes rows missing from the backend', async () => {
      const binding = createMockBinding(['product_ID']);
      const spreadsheetData = [{ product_ID: 'NONEXISTENT', IsActiveEntity: true }];

      const result = await requestObjects.getObjects(createMockModel([], []), binding, spreadsheetData);

      expect(spreadsheetData).toHaveLength(0);
      expect(result).toHaveLength(0);
      const notFound = mockMessageHandler.addMessageToMessages.mock.calls.filter(c => c[0].type === 'ObjectNotFound');
      expect(notFound.length).toBeGreaterThan(0);
    });

    it('returns the matched contexts via getContexts after a successful run', async () => {
      const binding = createMockBinding(['product_ID']);
      const spreadsheetData = [{ product_ID: 'P1', IsActiveEntity: true }];
      const active = [{ product_ID: 'P1', IsActiveEntity: true, HasDraftEntity: false }];

      expect(requestObjects.getContexts()).toEqual([]);
      await requestObjects.getObjects(createMockModel(active, []), binding, spreadsheetData);

      const contexts = requestObjects.getContexts();
      expect(contexts).toHaveLength(1);
      expect(contexts[0].payload.product_ID).toBe('P1');
      expect(contexts[0].keys).toContain('product_ID');
    });
  });

  describe('draft mismatch detection', () => {
    it('detects when the row says draft but the backend has only an active (no-draft) entity', async () => {
      const binding = createMockBinding(['product_ID']);
      const spreadsheetData = [{ product_ID: 'P1', IsActiveEntity: false }];
      // Active entity exists with no draft sibling.
      const active = [{ product_ID: 'P1', IsActiveEntity: true, HasDraftEntity: false }];

      await requestObjects.getObjects(createMockModel(active, []), binding, spreadsheetData);

      const mismatch = mockMessageHandler.addMessageToMessages.mock.calls.filter(c => c[0].type === 'DraftEntityMismatch');
      expect(mismatch.length).toBeGreaterThan(0);
    });

    it('does not report a mismatch when the requested active state is consistent', async () => {
      const binding = createMockBinding(['product_ID']);
      const spreadsheetData = [{ product_ID: 'P1', IsActiveEntity: true }];
      const active = [{ product_ID: 'P1', IsActiveEntity: true, HasDraftEntity: false }];

      await requestObjects.getObjects(createMockModel(active, []), binding, spreadsheetData);

      const mismatch = mockMessageHandler.addMessageToMessages.mock.calls.filter(c => c[0].type === 'DraftEntityMismatch');
      expect(mismatch).toHaveLength(0);
    });
  });

  describe('composite key matching', () => {
    it('matches entities with composite keys', async () => {
      const binding = createMockBinding(['OrderID', 'ItemID']);
      const spreadsheetData = [
        { OrderID: 'O1', ItemID: 'I1', IsActiveEntity: true },
        { OrderID: 'O1', ItemID: 'I2', IsActiveEntity: true }
      ];
      const active = [
        { OrderID: 'O1', ItemID: 'I1', IsActiveEntity: true, HasDraftEntity: false },
        { OrderID: 'O1', ItemID: 'I2', IsActiveEntity: true, HasDraftEntity: false }
      ];

      const result = await requestObjects.getObjects(createMockModel(active, []), binding, spreadsheetData);

      expect(result).toHaveLength(2);
      expect(result.map(e => e.ItemID).sort()).toEqual(['I1', 'I2']);
    });

    it('does not match when only part of a composite key matches', async () => {
      const binding = createMockBinding(['OrderID', 'ItemID']);
      const spreadsheetData = [{ OrderID: 'O1', ItemID: 'I_WRONG', IsActiveEntity: true }];
      const active = [{ OrderID: 'O1', ItemID: 'I1', IsActiveEntity: true, HasDraftEntity: false }];

      await requestObjects.getObjects(createMockModel(active, []), binding, spreadsheetData);

      expect(spreadsheetData).toHaveLength(0);
    });
  });
});
