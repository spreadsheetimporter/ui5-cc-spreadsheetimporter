import VBox from "sap/m/VBox";
import StepBase from "./StepBase";
import MatchWizard from "../MatchWizard";
import ColumnListItem from "sap/m/ColumnListItem";
import Table from "sap/m/Table";
import Column from "sap/m/Column";
import Text from "sap/m/Text";
import JSONModel from "sap/ui/model/json/JSONModel";
import Log from "sap/base/Log";

/**
 * HeaderSelectionStep – lets user pick the header row from the sheet preview.
 */
export default class HeaderSelectionStep extends StepBase {
    public readonly stepName = "headerSelectionStep";

    private matchWizard: MatchWizard;
    private rawSheetData: any[][];
    private onHeaderChosen: (rowIndex: number, coordinates: {
        a1Coordinates: string,
        objectCoordinates: any
    }) => void;

    constructor(matchWizard: MatchWizard,
        rawSheetData: any[][],
        onHeaderChosen: (rowIndex: number, coordinates: { a1Coordinates: string, objectCoordinates: any }) => void) {
        super();
        this.matchWizard = matchWizard;
        this.rawSheetData = rawSheetData;
        this.onHeaderChosen = onHeaderChosen;
    }

    public build(container: VBox): void {
        container.removeAllItems();

        const table = this.createHeaderSelectionTable(this.rawSheetData, 10);
        table.attachSelectionChange((e) => {
            const item = e.getParameter("listItem") as ColumnListItem;
            const context = item.getBindingContext();
            const rowData = context.getObject() as any;
            const rowIndex = rowData.__metadata__.rowNumber;
            const coords = this.matchWizard.calculateReadCoordinates(rowIndex, rowData, this.rawSheetData.length);
            if (coords) {
                this.onHeaderChosen(rowIndex, coords);
            }
        });

        container.addItem(table);
    }

    /**
     * Creates a table for header selection
     * Moved from MatchWizard to reduce its complexity
     */
    private createHeaderSelectionTable(rawSheetData: any[][], maxRows: number = 10): Table {
        try {
            // Prepare table data - only first X rows for header selection
            const preparedData = this.matchWizard.prepareTableData(rawSheetData, 0, maxRows);

            // Create a new table instance
            const table = new Table({
                mode: "SingleSelectMaster",
                growing: true,
                growingThreshold: 10
            });

            // Add row number column
            table.addColumn(new Column({
                width: "4rem",
                header: new Text({
                    text: this.matchWizard.getUtil().geti18nText("spreadsheetimporter.rowNumber")
                })
            }));

            // Add dynamic columns for each data column
            for (const column of preparedData.columns) {
                table.addColumn(new Column({
                    header: new Text({ text: column.title })
                }));
            }

            // Create a row template for the table
            const template = new ColumnListItem();

            // Add row number cell
            template.addCell(new Text({ text: "{__metadata__/rowNumber}" }));

            // Add cells for each column
            for (const column of preparedData.columns) {
                template.addCell(new Text({ text: `{${column.key}}` }));
            }

            // Create a JSON model with the data
            const model = new JSONModel();
            model.setData(preparedData.data);

            // Set the model and bind items
            table.setModel(model);
            table.bindItems({
                path: "/",
                template: template
            });

            return table;
        } catch (error) {
            Log.error("Error creating header selection table", error as Error, "HeaderSelectionStep");
            // Return an empty table as fallback
            return new Table();
        }
    }
}
