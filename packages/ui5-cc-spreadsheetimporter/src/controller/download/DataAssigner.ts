import ManagedObject from "sap/ui/base/ManagedObject";

/**
 * @namespace cc.spreadsheetimporter.download.XXXnamespaceXXX
 */
export default class DataAssigner extends ManagedObject {
    /**
     * Recursively assigns data to entities and their sub-entities
     * @param data - The data to be assigned
     * @param entity - The entity to assign data to
     */
    assignData(data: any, entity: any): void {
        // Iterate through properties of the current entity
        for (const property in entity) {
            // If the property signifies a fetchable entity
            if (entity[property].$XYZFetchableEntity) {
                let subEntityDataTotal = [];
                for (const row in data) {
                    const currentEntity = data[row];
                    const subEntityData = currentEntity[property];
                    if (subEntityData) {
                        subEntityDataTotal = subEntityDataTotal.concat(subEntityData);
                    }
                    delete currentEntity[property]; // remove the data
                }
                entity[property].$XYZData = subEntityDataTotal;

                // Recursive call to handle deeper levels
                this.assignData(subEntityDataTotal, entity[property].$XYZEntity);
            }
        }
    }

    /**
     * Assigns data to the root entity
     * @param data - The data to be assigned
     * @param entity - The root entity
     * @param deepLevel - The level of deep download
     */
    assignDataRoot(data: any, entity: any, deepLevel: number): void {
        // If deepLevel is 0 and data is an array, handle each string as a column
        if (deepLevel === 0 && Array.isArray(data)) {
            entity.$XYZData = [];
            let row = {};
            for (const column of data) {
                if (entity.hasOwnProperty(column) && !entity[column].$XYZFetchableEntity) {
                    if (!entity["$XYZColumns"]) entity["$XYZColumns"] = [];
                    // You can customize the value below as needed
                    row[column] = column;
                }
            }
            entity.$XYZData.push(row);
        } else {
            // Iterate through properties of the current entity (existing code)
            entity.$XYZData = [];
            let row = {};
            for (const column in data) {
                if (entity.hasOwnProperty(column) && !entity[column].$XYZFetchableEntity) {
                    if (!entity["$XYZColumns"]) entity["$XYZColumns"] = [];
                    row[column] = data[column];
                }
            }
            entity.$XYZData.push(row);
        }
    }

    /**
     * Assigns columns to the root entity
     * @param data - The data containing column information
     * @param entity - The root entity
     * @param deepLevel - The level of deep download
     */
    assignColumnsRoot(data: any, entity: any, deepLevel: number): void {
        // If deepLevel is 0 and data is an array, handle each string as a column
        if (deepLevel === 0 && Array.isArray(data)) {
            for (const column of data) {
                if (entity.hasOwnProperty(column) && !entity[column].$XYZFetchableEntity) {
                    if (!entity["$XYZColumns"]) entity["$XYZColumns"] = [];
                    entity["$XYZColumns"].push(column);
                }
            }
        } else {
            // If deepLevel is not 0, we expect data to be an object
            for (const column in data) {
                if (entity.hasOwnProperty(column) && !entity[column].$XYZFetchableEntity) {
                    if (!entity["$XYZColumns"]) entity["$XYZColumns"] = [];
                    entity["$XYZColumns"].push(column);
                }
            }
        }
    }

    /**
     * Recursively assigns columns to sub-entities
     * @param data - The data containing column information
     * @param entity - The entity to assign columns to
     * @param deepLevel - The level of deep download (if 0, we expect data to be a string array, not an object)
     */
    assignColumns(data: any, entity: any, deepLevel: number): void {
        // New check: if deepLevel is 0 and "data" is an object instead of a string array, throw error
        if (deepLevel !== 0 && Array.isArray(data)) {
            throw new Error("For deepLevel=0 (no deep download), 'data' must be an object, not an string array");
        }

        // Existing code - do not remove existing comments
        for (const property in entity) {
            // If the property signifies a fetchable entity
            if (entity[property].$XYZFetchableEntity && data.hasOwnProperty(property)) {
                let subEntity = entity[property].$XYZEntity;
                // Defined Columns in the pro config
                for (const column in data[property]) {
                    if (subEntity.hasOwnProperty(column) && !subEntity[column].$XYZFetchableEntity) {
                        if (!entity[property]["$XYZColumns"]) entity[property]["$XYZColumns"] = [];
                        entity[property]["$XYZColumns"].push(column);
                    }
                }
                this.assignColumns(data[property], entity[property].$XYZEntity, deepLevel);
            }
        }
    }
} 