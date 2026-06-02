/**
 * Unit tests for MetadataHandlerV2.getLabelList — the V2 export column/label derivation.
 *
 * The real handler is required by full path so jest's `./MetadataHandlerV2` manual mock
 * (used by sibling modules) does not shadow it. Unlike V4, V2 reads the entity type passed
 * in (odataEntityType.property[]) directly, so no metamodel stubbing is needed.
 *
 * Focus: Hidden / SAP__ filtering, the string-valued `nullable !== 'false'` default, label
 * resolution from `sap:label`, and the columns / excludeColumns branches.
 */

const MetadataHandlerV2 = require('../../src/controller/odata/MetadataHandlerV2').default;

const ODATA_TYPE = 'OrdersService.Orders';

function makeController() {
  return {
    view: {},
    component: {
      getSpreadsheetFileName: () => 'Orders.xlsx', // truthy -> no setSpreadsheetFileName side effect
      setSpreadsheetFileName: jest.fn(),
      logger: { returnObject: o => o }
    }
  };
}

// A representative cov2ap-translated V2 entity type: scalar props with string `nullable`,
// a Hidden-annotated prop, and a SAP__ technical prop. (V2 keeps navigation props in a
// separate array, so there is no DraftMessages-style collection to filter here.)
function makeEntityType() {
  return {
    'sap:label': 'Orders',
    property: [
      { name: 'ID', type: 'Edm.Guid', nullable: 'false', 'sap:label': 'ID' },
      { name: 'quantity', type: 'Edm.Int32', 'sap:label': 'Quantity' }, // nullable absent -> true
      { name: 'price', type: 'Edm.Decimal', nullable: 'true', precision: '9', scale: '2', 'sap:label': 'Price' },
      { name: 'hiddenField', type: 'Edm.String', 'com.sap.vocabularies.UI.v1.Hidden': { Bool: 'true' } },
      { name: 'SAP__Messages', type: 'Edm.String' }
    ]
  };
}

describe('MetadataHandlerV2.getLabelList', () => {
  let handler;
  let entityType;

  beforeEach(() => {
    handler = new MetadataHandlerV2(makeController());
    entityType = makeEntityType();
  });

  describe('export-all (no columns, no excludeColumns)', () => {
    let list;
    beforeEach(() => {
      list = handler.getLabelList([], ODATA_TYPE, entityType, []);
    });

    it('excludes UI-Hidden properties', () => {
      expect(list.has('hiddenField')).toBe(false);
    });

    it('excludes SAP__ technical properties', () => {
      expect(list.has('SAP__Messages')).toBe(false);
    });

    it('includes the regular scalar properties with their labels and type metadata', () => {
      expect([...list.keys()].sort()).toEqual(['ID', 'price', 'quantity']);
      expect(list.get('quantity').label).toBe('Quantity');
      expect(list.get('price').type).toBe('Edm.Decimal');
      expect(list.get('price').scale).toBe('2');
    });

    it('treats nullable as a string: only "false" is non-nullable, absent defaults to true', () => {
      expect(list.get('ID').nullable).toBe(false); // nullable: 'false'
      expect(list.get('quantity').nullable).toBe(true); // nullable absent
      expect(list.get('price').nullable).toBe(true); // nullable: 'true'
    });
  });

  describe('excludeColumns', () => {
    it('removes excluded columns but still filters Hidden / SAP__', () => {
      const list = handler.getLabelList([], ODATA_TYPE, entityType, ['price']);
      expect(list.has('price')).toBe(false);
      expect(list.has('hiddenField')).toBe(false);
      expect([...list.keys()].sort()).toEqual(['ID', 'quantity']);
    });
  });

  describe('explicit columns', () => {
    it('returns exactly the requested columns with type metadata', () => {
      const list = handler.getLabelList(['quantity', 'price'], ODATA_TYPE, entityType, []);
      expect([...list.keys()].sort()).toEqual(['price', 'quantity']);
      expect(list.get('quantity').type).toBe('Edm.Int32');
    });

    it('falls back to the property name when a requested column has no label', () => {
      entityType.property.push({ name: 'noLabel', type: 'Edm.String' });
      const list = handler.getLabelList(['noLabel'], ODATA_TYPE, entityType, []);
      expect(list.get('noLabel').label).toBe('noLabel');
    });
  });
});
