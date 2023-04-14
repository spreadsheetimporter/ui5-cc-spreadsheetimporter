import Button from "sap/m/Button";
import Column from "sap/m/Column";
import ColumnListItem from "sap/m/ColumnListItem";
import Dialog from "sap/m/Dialog";
import Table from "sap/m/Table";
import JSONModel from "sap/ui/model/json/JSONModel";
import Text from "sap/m/Text";
import Util from "./Util";

export default class Preview {
    dialog: Dialog;
    constructor() {

	}

    showPreview(payload: any) {
        const table = this.createDynamicTable(payload);
        if (typeof table === "undefined") {
            return;
        }
        this.dialog = new Dialog({
            title: "Dynamic Table",
            content: [table],
            buttons: [
              new Button({
                text: "Close",
                press: () => {
                    this.dialog.close();
                },
              }),
            ],
            afterClose: () => {
                this.dialog.destroy();
            },
          });

          this.dialog.open();
    }


    createDynamicTable(data: any[]) {
        const table = new Table();
    
        // Create table columns and cells based on the first object's keys
        if (typeof data !== "undefined" && data !== null && data.length > 0) {
          const firstObject = data[0];
          const aColumns = Object.keys(firstObject);
    
          aColumns.forEach((column) => {
            const oColumn = new Column({
              header: new Text({ text: column }),
            });
    
            table.addColumn(oColumn);
          });
    
          // Create a template for table rows
          const oTemplate = new ColumnListItem();
          aColumns.forEach((column) => {
            const oCell = new Text({ text: "{" + column + "}" });
            oTemplate.addCell(oCell);
          });
    
          // Bind the data to the table
          const oModel = new JSONModel();
          oModel.setData(data);
          table.setModel(oModel);
          table.bindItems({path:"/", template: oTemplate});
          return table;
        } else {
            // No data
            Util.showError(new Error("No data to preview"), "Preview.ts","createDynamicTable");
            return undefined;
        }

        
      }
}



