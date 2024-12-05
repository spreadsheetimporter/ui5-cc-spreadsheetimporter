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
     */
    assignDataRoot(data: any, entity: any): void {
        // Iterate through properties of the current entity
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

    /**
     * Assigns columns to the root entity
     * @param data - The data containing column information
     * @param entity - The root entity
     */
    assignColumnsRoot(data: any, entity: any): void {
        for (const column in data) {
            if (entity.hasOwnProperty(column) && !entity[column].$XYZFetchableEntity) {
                if (!entity["$XYZColumns"]) entity["$XYZColumns"] = [];
                entity["$XYZColumns"].push(column);
            }
        }
    }

    /**
     * Recursively assigns columns to sub-entities
     * @param data - The data containing column information
     * @param entity - The entity to assign columns to
     */
    assignColumns(data: any, entity: any): void {
        for (const property in entity) {
            // If the property signifies a fetchable entity
            if (entity[property].$XYZFetchableEntity && data.hasOwnProperty(property)) {
                const subEntity = entity[property].$XYZEntity;
                // Defined Columns in the pro config
                for (const column in data[property]) {
                    if (subEntity.hasOwnProperty(column) && !subEntity[column].$XYZFetchableEntity) {
                        if (!entity[property]["$XYZColumns"]) entity[property]["$XYZColumns"] = [];
                        entity[property]["$XYZColumns"].push(column);
                    }
                }
                this.assignColumns(data[property], entity[property].$XYZEntity);
            }
        }
    }
} 