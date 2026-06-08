import Log from 'sap/base/Log';
import { Columns, Property, ListObject, PropertyArray } from '../../types';
import MetadataHandler from './MetadataHandler';
import ODataMetaModel from 'sap/ui/model/odata/ODataMetaModel';
/**
 * @namespace cc.spreadsheetimporter.XXXnamespaceXXX
 */
export default class MetadataHandlerV2 extends MetadataHandler {
  private _metaModel: ODataMetaModel | null = null;

  constructor(spreadsheetUploadController: any) {
    super(spreadsheetUploadController);
  }

  /**
   * Returns the cached ODataMetaModel, resolving it lazily from the view's model.
   */
  getMetaModel(): ODataMetaModel {
    if (!this._metaModel) {
      this._metaModel = this.spreadsheetUploadController.view.getModel().getMetaModel() as ODataMetaModel;
    }
    return this._metaModel;
  }

  /**
   * Stores the MetaModel reference for later use (e.g. from a binding).
   */
  setMetaModel(metaModel: ODataMetaModel): void {
    this._metaModel = metaModel;
  }

  public getLabelList(columns: Columns, odataType: string, odataEntityType: any, excludeColumns: Columns): ListObject {
    let listObject: ListObject = new Map();

    // get the property list of the entity for which we need to download the template
    const properties: PropertyArray = odataEntityType.property;
    const entityTypeLabel: string = odataEntityType['sap:label'];
    Log.debug('SpreadsheetUpload: Annotations', undefined, 'SpreadsheetUpload: MetadataHandlerV2', () =>
      this.spreadsheetUploadController.component.logger.returnObject(odataEntityType)
    );

    // check if file name is not set
    if (!this.spreadsheetUploadController.component.getSpreadsheetFileName() && entityTypeLabel) {
      this.spreadsheetUploadController.component.setSpreadsheetFileName(`${entityTypeLabel}.xlsx`);
    } else if (!this.spreadsheetUploadController.component.getSpreadsheetFileName() && !entityTypeLabel) {
      this.spreadsheetUploadController.component.setSpreadsheetFileName(`Template.xlsx`);
    }

    // excludeColumns will remove the columns from the list if columns are present
    if (columns.length > 0 && excludeColumns.length > 0) {
      columns = columns.filter(column => !excludeColumns.includes(column));
    }

    if (columns.length > 0) {
      for (const propertyName of columns) {
        const property = properties.find((property: any) => property.name === propertyName);
        if (property) {
          let propertyObject: Property = {} as Property;
          propertyObject.label = this.getLabel(odataEntityType, properties, property, propertyName);
          if (!propertyObject.label) {
            propertyObject.label = propertyName;
          }
          propertyObject.type = property['type'];
          propertyObject.maxLength = property['maxLength'];
          propertyObject.precision = property['precision'];
          propertyObject.scale = property['scale'];
          // Extract nullable from metadata, default to true if not specified
          propertyObject.nullable = property['nullable'] !== 'false';
          listObject.set(propertyName, propertyObject);
        } else {
          Log.warning(`SpreadsheetUpload: Property ${propertyName} not found`);
        }
      }
    } else if (columns.length === 0 && excludeColumns.length > 0) {
      for (const property of properties) {
        // if property is in excludeColumns, skip it
        if (excludeColumns.includes(property.name)) {
          continue;
        }
        let hiddenProperty = false;
        const propertyName = property.name;
        try {
          hiddenProperty = property['com.sap.vocabularies.UI.v1.Hidden'].Bool === 'true';
        } catch (error) {
          Log.debug(`No hidden property on ${property.name}`, undefined, 'SpreadsheetUpload: MetadataHandlerV2');
        }
        if (!hiddenProperty && !propertyName.startsWith('SAP__')) {
          let propertyObject: Property = {} as Property;
          propertyObject.label = this.getLabel(odataEntityType, properties, property, propertyName);
          propertyObject.type = property['type'];
          propertyObject.maxLength = property['maxLength'];
          propertyObject.precision = property['precision'];
          propertyObject.scale = property['scale'];
          // Extract nullable from metadata, default to true if not specified
          propertyObject.nullable = property['nullable'] !== 'false';
          listObject.set(propertyName, propertyObject);
        }
      }
    } else {
      for (const property of properties) {
        let hiddenProperty = false;
        const propertyName = property.name;
        try {
          hiddenProperty = property['com.sap.vocabularies.UI.v1.Hidden'].Bool === 'true';
        } catch (error) {
          Log.debug(`No hidden property on ${property.name}`, undefined, 'SpreadsheetUpload: MetadataHandlerV2');
        }
        if (!hiddenProperty && !propertyName.startsWith('SAP__')) {
          let propertyObject: Property = {} as Property;
          propertyObject.label = this.getLabel(odataEntityType, properties, property, propertyName);
          propertyObject.type = property['type'];
          propertyObject.maxLength = property['maxLength'];
          propertyObject.precision = property['precision'];
          propertyObject.scale = property['scale'];
          // Extract nullable from metadata, default to true if not specified
          propertyObject.nullable = property['nullable'] !== 'false';
          listObject.set(propertyName, propertyObject);
        }
      }
    }

    return listObject;
  }

  private getLabel(odataEntityType: { [x: string]: any }, properties: any, property: { [x: string]: any }, propertyName: string) {
    let label = '';
    if (property['sap:label']) {
      label = property['sap:label'];
    }
    try {
      const lineItemsAnnotations = odataEntityType['com.sap.vocabularies.UI.v1.LineItem'];
      label = lineItemsAnnotations.find((dataField: { Value: { Path: any } }) => dataField.Value.Path === propertyName).Label.String;
    } catch (error) {
      Log.debug(`SpreadsheetUpload: ${propertyName} not found as a LineItem Label`, undefined, 'SpreadsheetUpload: MetadataHandlerV2');
    }
    if (typeof label === 'string' && label.startsWith('{') && label.endsWith('}')) {
      try {
        label = this.parseI18nText(label, this.spreadsheetUploadController.view);
      } catch (error) {
        Log.debug(`SpreadsheetUpload: ${label} not found as a Resource Bundle and i18n text`, undefined, 'SpreadsheetUpload: MetadataHandlerV2');
      }
    }

    if (label === '') {
      label = propertyName;
    }
    return label;
  }

  /**
   * Creates a list of properties that are defined mandatory in the OData metadata V2
   * @param odataType
   **/
  getKeyList(odataEntityType: any): string[] {
    let keys: string[] = [];
    if (this.spreadsheetUploadController.component.getSkipMandatoryFieldCheck()) {
      return keys;
    }

    for (const property of odataEntityType.property) {
      // if property is mandatory, field should be in spreadsheet file
      const propertyName = property.name;
      // skip sap property
      if (propertyName.startsWith('SAP__')) {
        continue;
      }
      if (
        !this.spreadsheetUploadController.component.getSkipMandatoryFieldCheck() &&
        property['com.sap.vocabularies.Common.v1.FieldControl'] &&
        property['com.sap.vocabularies.Common.v1.FieldControl']['EnumMember'] &&
        property['com.sap.vocabularies.Common.v1.FieldControl']['EnumMember'] === 'com.sap.vocabularies.Common.v1.FieldControlType/Mandatory'
      ) {
        keys.push(propertyName);
      }
    }
    return keys;
  }

  getODataEntitiesRecursive(entityName: string, deepLevel: number): any {
    const metaModel = this.spreadsheetUploadController.view.getModel().getMetaModel() as ODataMetaModel;
    const entityType = metaModel.getODataEntityType(entityName);

    if (!entityType) {
      throw new Error(`Entity '${entityName}' not found`);
    }

    const mainEntity: any = Object.assign({}, entityType || {});

    // Find navigation properties and build entity structure recursively
    this._findEntitiesByNavigationProperty(metaModel, mainEntity, entityName, deepLevel);

    // Build expand structure for V2
    const expands: any = {};
    this._getExpandsRecursive(mainEntity, expands, undefined, undefined, 0, deepLevel);

    Log.debug(`V2 entity graph resolved for '${entityName}' (deepLevel ${deepLevel})`, undefined, 'SpreadsheetUpload: MetadataHandlerV2', () =>
      this.spreadsheetUploadController.component.logger.returnObject({ entityName, deepLevel, entityType, mainEntity, expands })
    );

    return { mainEntity, expands };
  }

  getKeys(binding: any, payload: any, IsActiveEntity?: boolean, excludeIsActiveEntity: boolean = false): Record<string, any> {
    const keys: Record<string, any> = {};
    const entityType = binding._getEntityType();

    // Get key properties from entity metadata
    if (entityType && entityType.key && entityType.key.propertyRef) {
      entityType.key.propertyRef.forEach((keyRef: any) => {
        const keyName = keyRef.name;
        // When the caller asks to exclude IsActiveEntity, skip it here too (not just in the
        // append block below). In draft-enabled V2 metadata IsActiveEntity is itself a key, so
        // copying the payload's status would produce contradictory filters once the caller adds
        // its own active/draft predicate (e.g. IsActiveEntity eq false AND IsActiveEntity eq true).
        if (excludeIsActiveEntity && keyName === 'IsActiveEntity') {
          return;
        }
        if (payload.hasOwnProperty(keyName)) {
          keys[keyName] = payload[keyName];
        }
      });
    }

    // Add IsActiveEntity if specified and not excluded
    if (IsActiveEntity !== undefined && !excludeIsActiveEntity) {
      keys.IsActiveEntity = IsActiveEntity;
    }

    return keys;
  }

  /**
   * Finds entities by navigation properties for OData V2
   */
  private _findEntitiesByNavigationProperty(metaModel: any, rootEntity: any, rootEntityName: string, deepLevel: number = 99): void {
    const queue: { entity: any; entityName: string; level: number }[] = [];
    const traversedEntities: Set<string> = new Set();

    queue.push({ entity: rootEntity, entityName: rootEntityName, level: 0 });
    traversedEntities.add(rootEntityName);

    while (queue.length > 0) {
      const { entity, entityName, level } = queue.shift()!;

      // Skip if we've reached the maximum depth level
      if (level >= deepLevel) {
        continue;
      }

      // Check for navigation properties in V2 metadata structure
      if (entity.navigationProperty) {
        entity.navigationProperty.forEach((navProp: any) => {
          // Resolve association end against the CURRENT entity (not rootEntity) so nested
          // navigation properties past the first hop resolve correctly during deep export.
          const assocEnd = metaModel.getODataAssociationEnd(entity, navProp.name);
          const targetFqn = assocEnd && assocEnd.type; // e.g. 'OrdersService.OrderItems'
          Log.debug(`V2 nav '${entityName}.${navProp.name}' → ${targetFqn || 'UNRESOLVED'}`, undefined, 'SpreadsheetUpload: MetadataHandlerV2', () =>
            this.spreadsheetUploadController.component.logger.returnObject({
              from: entityName,
              navProp: navProp.name,
              level,
              assocEnd,
              targetFqn,
              partner: assocEnd && assocEnd.partner
            })
          );
          if (!targetFqn) return;

          const targetEntity = metaModel.getODataEntityType(targetFqn);
          // Guard BOTH the marking and the queueing by traversedEntities. _getExpandsRecursive expands
          // every node carrying $XYZFetchableEntity, so marking a navigation whose target type was already
          // traversed (e.g. a back-reference/partner like Items→Orders) builds a cyclic $expand and
          // overflows the stack. (A genuine sibling duplicate-target nav being omitted is the lesser,
          // rare trade-off — a cycle-aware fix tracking the current expand path is a separate follow-up.)
          if (targetEntity && !traversedEntities.has(targetFqn)) {
            // Create a V4-like nav node on the entity for downstream processing
            const navNode: any = entity[navProp.name] || {};
            navNode.$XYZEntity = targetEntity;
            navNode.$XYZFetchableEntity = true;
            navNode.$Type = targetFqn;
            navNode.$Partner = assocEnd && assocEnd.partner;
            entity[navProp.name] = navNode;

            queue.push({ entity: targetEntity, entityName: targetFqn, level: level + 1 });
            traversedEntities.add(targetFqn);
          }
        });
      }
    }
  }

  /**
   * Builds expand structure recursively for OData V2
   */
  private _getExpandsRecursive(
    mainEntity: any,
    expands: any,
    parent?: string,
    parentExpand?: any,
    currentLevel: number = 0,
    deepLevel: number = 99
  ): void {
    if (currentLevel >= deepLevel) return;

    if (mainEntity.navigationProperty) {
      mainEntity.navigationProperty.forEach((navProp: any) => {
        // _findEntitiesByNavigationProperty stores the resolved nav node (carrying the
        // $XYZ* markers and the target entity type) on mainEntity[navProp.name], NOT on the
        // navigationProperty array element. Read it from there, otherwise no expand entries
        // are ever produced and the deep-export read goes out without $expand.
        const navNode = mainEntity[navProp.name];
        if (navNode && navNode.$XYZFetchableEntity) {
          const navPropName = navProp.name;

          if (parent) {
            if (!parentExpand.$expand) {
              parentExpand.$expand = {};
            }
            parentExpand.$expand[navPropName] = {};
            this._getExpandsRecursive(navNode.$XYZEntity, expands, navPropName, parentExpand.$expand[navPropName], currentLevel + 1, deepLevel);
          } else {
            if (!expands[navPropName]) {
              expands[navPropName] = {};
            }
            this._getExpandsRecursive(navNode.$XYZEntity, expands, navPropName, expands[navPropName], currentLevel + 1, deepLevel);
          }
        }
      });
    }
  }

  static getResolvedPath(binding: any): string {
    let path = binding.getPath();
    if (binding.getResolvedPath) {
      path = binding.getResolvedPath();
    } else {
      // workaround for getResolvedPath only available from 1.88
      path = (binding.getModel() as any).resolve(binding.getPath(), binding.getContext());
    }
    return path;
  }
}
