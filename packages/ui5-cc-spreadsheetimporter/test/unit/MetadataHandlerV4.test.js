/**
 * Unit tests for MetadataHandlerV4.getLabelList — the export column/label derivation.
 *
 * Focus: the property FILTERING the deep export relies on — in particular the $isCollection
 * exclusion that keeps the draft-internal DraftMessages property out of the export (the
 * regression that broke CI on UI5 >= 1.120), plus Hidden / SAP__ filtering, NavigationProperty
 * exclusion, and the `$Nullable ?? true` default.
 *
 * getAnnotationProperties (which reads the live V4 metamodel) is stubbed, so the test
 * exercises only the pure filtering logic, not metamodel access.
 */

const MetadataHandlerV4 = require('../../src/controller/odata/MetadataHandlerV4').default;

const ODATA_TYPE = 'OrdersService.Orders';
const LABEL = '@com.sap.vocabularies.Common.v1.Label';
const HIDDEN = '@com.sap.vocabularies.UI.v1.Hidden';

function makeController() {
  return {
    context: {},
    view: {},
    component: {
      getSpreadsheetFileName: () => 'Orders.xlsx', // truthy -> no setSpreadsheetFileName side effect
      setSpreadsheetFileName: jest.fn(),
      logger: { returnObject: o => o }
    }
  };
}

// A representative V4 metamodel: scalar props, a collection (DraftMessages), a navigation
// property, a SAP__ technical prop, and a Hidden-annotated prop.
function makeMetadata() {
  const properties = {
    ID: { $kind: 'Property', $Type: 'Edm.Guid', $Nullable: false },
    quantity: { $kind: 'Property', $Type: 'Edm.Int32' }, // no $Nullable -> defaults to true
    price: { $kind: 'Property', $Type: 'Edm.Decimal', $Nullable: true, $Precision: 9, $Scale: 2 },
    hiddenField: { $kind: 'Property', $Type: 'Edm.String' },
    DraftMessages: { $kind: 'Property', $Type: 'OrdersService.Message', $isCollection: true },
    SAP__Messages: { $kind: 'Property', $Type: 'Edm.String' },
    Items: { $kind: 'NavigationProperty', $Type: 'OrdersService.Items', $isCollection: true }
  };
  const annotations = {
    [`${ODATA_TYPE}/ID`]: { [LABEL]: 'ID' },
    [`${ODATA_TYPE}/quantity`]: { [LABEL]: 'Quantity' },
    [`${ODATA_TYPE}/price`]: { [LABEL]: 'Price' },
    [`${ODATA_TYPE}/hiddenField`]: { [HIDDEN]: true }
    // DraftMessages / SAP__Messages / Items: intentionally no annotation entry
  };
  return { annotations, properties };
}

describe('MetadataHandlerV4.getLabelList', () => {
  let handler;
  let spy;

  beforeEach(() => {
    handler = new MetadataHandlerV4(makeController());
    spy = jest.spyOn(MetadataHandlerV4, 'getAnnotationProperties').mockReturnValue(makeMetadata());
  });

  afterEach(() => {
    spy.mockRestore();
  });

  describe('export-all (no columns, no excludeColumns)', () => {
    let list;
    beforeEach(() => {
      list = handler.getLabelList([], ODATA_TYPE, []);
    });

    it('excludes the collection-valued DraftMessages property (the CI regression lock)', () => {
      expect(list.has('DraftMessages')).toBe(false);
    });

    it('excludes SAP__ technical properties', () => {
      expect(list.has('SAP__Messages')).toBe(false);
    });

    it('excludes UI-Hidden properties', () => {
      expect(list.has('hiddenField')).toBe(false);
    });

    it('excludes navigation properties', () => {
      expect(list.has('Items')).toBe(false);
    });

    it('includes the regular scalar properties with their labels and type metadata', () => {
      expect([...list.keys()].sort()).toEqual(['ID', 'price', 'quantity']);
      expect(list.get('quantity').label).toBe('Quantity');
      expect(list.get('price').type).toBe('Edm.Decimal');
      expect(list.get('price').scale).toBe(2);
    });

    it('defaults nullable to true when $Nullable is absent and respects an explicit false', () => {
      expect(list.get('quantity').nullable).toBe(true); // no $Nullable -> default
      expect(list.get('ID').nullable).toBe(false); // $Nullable: false
      expect(list.get('price').nullable).toBe(true); // $Nullable: true
    });
  });

  describe('excludeColumns', () => {
    it('removes excluded columns but still filters DraftMessages / SAP__ / Hidden', () => {
      const list = handler.getLabelList([], ODATA_TYPE, ['price']);
      expect(list.has('price')).toBe(false); // explicitly excluded
      expect(list.has('DraftMessages')).toBe(false); // still filtered out
      expect([...list.keys()].sort()).toEqual(['ID', 'quantity']);
    });
  });

  describe('explicit columns', () => {
    it('returns exactly the requested columns with type metadata', () => {
      const list = handler.getLabelList(['quantity', 'price'], ODATA_TYPE, []);
      expect([...list.keys()].sort()).toEqual(['price', 'quantity']);
      expect(list.get('quantity').type).toBe('Edm.Int32');
    });
  });
});
