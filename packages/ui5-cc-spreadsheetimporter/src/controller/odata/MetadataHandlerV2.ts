import Log from 'sap/base/Log';
import { Columns, Property, ListObject, PropertyArray } from '../../types';
import MetadataHandler from './MetadataHandler';
/**
 * @namespace cc.spreadsheetimporter.XXXnamespaceXXX
 */
export default class MetadataHandlerV2 extends MetadataHandler {
  constructor(spreadsheetUploadController: any) {
    super(spreadsheetUploadController);
  }

  public getLabelList(columns: Columns, odataType: string, odataEntityType: any, excludeColumns: Columns): ListObject {
    let listObject: ListObject = new Map();

    // get the property list of the entity for which we need to download the template
    const properties: PropertyArray = odataEntityType.property;
    const entityTypeLabel: string = odataEntityType['sap:label'];
    Log.debug('SpreadsheetUpload: Annotations', undefined, 'SpreadsheetUpload: MetadataHandler', () =>
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
          Log.debug(`No hidden property on ${property.name}`, undefined, 'SpreadsheetUpload: MetadataHandler');
        }
        if (!hiddenProperty && !propertyName.startsWith('SAP__')) {
          let propertyObject: Property = {} as Property;
          propertyObject.label = this.getLabel(odataEntityType, properties, property, propertyName);
          propertyObject.type = property['type'];
          propertyObject.maxLength = property['maxLength'];
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
          Log.debug(`No hidden property on ${property.name}`, undefined, 'SpreadsheetUpload: MetadataHandler');
        }
        if (!hiddenProperty && !propertyName.startsWith('SAP__')) {
          let propertyObject: Property = {} as Property;
          propertyObject.label = this.getLabel(odataEntityType, properties, property, propertyName);
          propertyObject.type = property['type'];
          propertyObject.maxLength = property['maxLength'];
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
    const metaModel = this.spreadsheetUploadController.view.getModel().getMetaModel();
    const entityType = metaModel.getODataEntityType(entityName);

    if (!entityType) {
      throw new Error(`Entity '${entityName}' not found`);
    }

    const mainEntity: any = { ...entityType };

    // Find navigation properties and build entity structure recursively
    this._findEntitiesByNavigationProperty(metaModel, mainEntity, entityName, deepLevel);

    // Build expand structure for V2
    const expands: any = {};
    this._getExpandsRecursive(mainEntity, expands, undefined, undefined, 0, deepLevel);

    return { mainEntity, expands };
  }

  getKeys(binding: any, payload: any, IsActiveEntity?: boolean, excludeIsActiveEntity: boolean = false): Record<string, any> {
    const keys: Record<string, any> = {};
    const entityType = binding._getEntityType();

    // Get key properties from entity metadata
    if (entityType && entityType.key && entityType.key.propertyRef) {
      entityType.key.propertyRef.forEach((keyRef: any) => {
        const keyName = keyRef.name;
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
          const targetEntityType = navProp.toRole;

          // Get the target entity type from metadata
          const targetEntity = metaModel.getODataEntityType(targetEntityType);

          if (targetEntity && !traversedEntities.has(targetEntityType)) {
            // Mark as fetchable navigation property
            navProp.$XYZEntity = targetEntity;
            navProp.$XYZFetchableEntity = true;
            navProp.$Type = targetEntityType;
            navProp.$Partner = navProp.fromRole;

            queue.push({ entity: targetEntity, entityName: targetEntityType, level: level + 1 });
            traversedEntities.add(targetEntityType);
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
        if (navProp.$XYZFetchableEntity) {
          const navPropName = navProp.name;

          if (parent) {
            if (!parentExpand.$expand) {
              parentExpand.$expand = {};
            }
            parentExpand.$expand[navPropName] = {};
            this._getExpandsRecursive(navProp.$XYZEntity, expands, navPropName, parentExpand.$expand[navPropName], currentLevel + 1, deepLevel);
          } else {
            if (!expands[navPropName]) {
              expands[navPropName] = {};
            }
            this._getExpandsRecursive(navProp.$XYZEntity, expands, navPropName, expands[navPropName], currentLevel + 1, deepLevel);
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
      path = binding.getModel().resolve(binding.getPath(), binding.getContext());
    }
    return path;
  }
}
