# Excel Import Wizard

The Excel Import Wizard provides a guided, step-by-step interface for importing Excel files into your UI5 application. It offers enhanced user experience with automatic step progression, header validation, error handling, and data preview capabilities.

## Overview

The wizard replaces the traditional single-dialog approach with a multi-step guided process that:

- **Guides users** through each import step with clear instructions
- **Validates headers** automatically and allows manual header selection if needed
- **Shows validation messages** in a dedicated step for better error handling
- **Provides data preview** before final import
- **Automatically progresses** between steps based on file validation results

## Key Features

### Automatic Step Progression
- Wizard automatically advances after successful file upload
- Conditional step display based on validation results
- Smart routing between upload → header selection → messages → preview

### Enhanced Error Handling
- Dedicated messages step for validation errors
- Clear error categorization and display
- Options to continue with errors or fix them

### Improved User Experience
- Visual progress indication
- Step-by-step guidance
- Responsive design with 80% screen coverage

!!! info "Not available in UI5 versions below 1.84"
    The `sap.m.Wizard` used here is using the `Page` render mode, which is not available in UI5 versions below 1.84.

## Wizard Steps

### 1. Upload File Step
- **Purpose**: Select and upload Excel file
- **Auto-progression**: Automatically advances to next appropriate step after file upload
- **Features**: Drag & drop support, file validation

### 2. Header Selection Step (Conditional)
- **Purpose**: Map/fix column headers when header issues are detected
- **When shown**: Only appears when automatic header validation fails
- **Features**: Interactive table for header row selection, real-time validation

### 3. Messages Step (Conditional) 
- **Purpose**: Review and handle validation messages
- **When shown**: When validation errors exist (but headers are valid)
- **Features**: Categorized error display, continue anyway option, error download

### 4. Preview Data Step
- **Purpose**: Review data before final import
- **Features**: Data table preview, final import confirmation

## Getting Started

### 1. Enable Wizard Mode

To use the wizard instead of the traditional dialog, set the `useImportWizard` property to `true`:

```xml
<core:ComponentContainer
    id="wizardSpreadsheetImporter"
    width="100%"
    usage="spreadsheetImporter"
    propagateModel="true"
    async="true"
    settings="{
        useImportWizard: true,
        debug: true,
        createActiveEntity: true
    }"
/>
```

### 2. Configuration Options

The wizard supports all standard spreadsheet importer [configuration options](Configuration.md), plus:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `useImportWizard` | `boolean` | `false` | Enables wizard mode instead of single dialog |

## Using the Wizard Programmatically

### openWizard() Method

You can open the wizard programmatically using the `openWizard()` method:

```javascript
/**
 * Opens the wizard programmatically
 */
openWizard: function () {
    // Get the spreadsheet importer component
    var oSpreadsheetUpload = this.byId("wizardSpreadsheetImporter");

    if (oSpreadsheetUpload) {
        // Get the component instance
        var oComponent = oSpreadsheetUpload.getComponentInstance();

        if (oComponent) {
            // Open the wizard
            oComponent.openWizard().then(function(result) {
                if (!result.canceled) {
                    MessageToast.show("Wizard completed successfully!");
                } else {
                    MessageToast.show("Wizard was canceled");
                }
            }).catch(function(error) {
                MessageToast.show("Error opening wizard: " + error.message);
            });
        }
    }
}
```

### openWizard() with Options

You can pass configuration options to override component settings:

```javascript
openWizard: function () {
    var oComponent = this.byId("wizardSpreadsheetImporter").getComponentInstance();
    
    // Configuration options to override component settings
    const wizardOptions = {
        strict: true,                    // Enable strict mode
        batchSize: 500,                 // Override batch size
        mandatoryFields: ["ID", "Name"], // Set mandatory fields
        columns: ["ID", "Name", "Email"], // Limit columns
        debug: true                      // Enable debug mode
    };
    
    oComponent.openWizard(wizardOptions).then(function(result) {
        if (!result.canceled) {
            // Handle successful completion
            console.log("Import completed:", result);
        }
    });
}
```

### Component Creation and Usage

```javascript
// Create component dynamically
this.spreadsheetWizard = await this.getView()
    .getController()
    .getAppComponent()
    .createComponent({
        usage: "spreadsheetImporter",
        async: true,
        componentData: {
            context: this,
            tableId: "myTable",
            useImportWizard: true  // Enable wizard mode
        }
    });

// Open wizard with custom options
const options = {
    strict: false,
    showBackendErrorMessages: true,
    continueOnError: true
};

this.spreadsheetWizard.openWizard(options);
```

## Wizard Flow Examples

### 1. Happy Path (No Issues)
```
User uploads file → Wizard validates → Auto-advance to Preview → User clicks Upload → Success
```

### 2. Header Issues Path
```
User uploads file → Header validation fails → Header Selection step → User fixes headers → Preview → Upload
```

### 3. Validation Errors Path
```
User uploads file → Headers OK but data errors → Messages step → User chooses to continue → Preview → Upload
```

### 4. Complex Error Recovery
```
User uploads file → Header issues → Fix headers → Data errors found → Messages step → Continue → Preview → Upload
```

## Events and Error Handling

The wizard supports all standard [events](Events.md):

```javascript
// Attach events before opening wizard
oComponent.attachUploadButtonPress(function(event) {
    // Handle upload completion
    const payload = event.getParameter("payload");
    console.log("Data uploaded:", payload);
});

oComponent.attachCheckBeforeRead(function(event) {
    // Validate data before processing
    const sheetData = event.getParameter("sheetData");
    // Add custom validation logic
});
```

## Complete Example

### Controller (Wizard.controller.js)
```javascript
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast"
], function (Controller, MessageToast) {
    "use strict";

    return Controller.extend("myapp.controller.Wizard", {

        onInit: function () {
            // Initialize wizard component
            this._initializeWizard();
        },

        _initializeWizard: function() {
            var oComponent = this.byId("wizardSpreadsheetImporter").getComponentInstance();
            
            if (oComponent) {
                // Attach events
                oComponent.attachUploadButtonPress(this._onUploadComplete, this);
                oComponent.attachCheckBeforeRead(this._onCheckBeforeRead, this);
            }
        },

        /**
         * Open wizard with custom options
         */
        onOpenWizard: function () {
            var oComponent = this.byId("wizardSpreadsheetImporter").getComponentInstance();

            if (oComponent) {
                const options = {
                    strict: false,
                    mandatoryFields: ["OrderNo", "buyer"],
                    batchSize: 100,
                    showBackendErrorMessages: true
                };

                oComponent.openWizard(options).then(function(result) {
                    if (!result.canceled) {
                        MessageToast.show("Import completed successfully!");
                    } else {
                        MessageToast.show("Import was canceled");
                    }
                }).catch(function(error) {
                    MessageToast.show("Error: " + error.message);
                });
            }
        },

        _onUploadComplete: function(event) {
            const payload = event.getParameter("payload");
            MessageToast.show(`Uploaded ${payload.length} records`);
        },

        _onCheckBeforeRead: function(event) {
            // Custom validation logic
            const sheetData = event.getParameter("sheetData");
            console.log("Validating sheet data:", sheetData);
        }
    });
});
```

### View (Wizard.view.xml)
```xml
<mvc:View controllerName="myapp.controller.Wizard"
    xmlns:mvc="sap.ui.core.mvc" 
    xmlns:core="sap.ui.core" 
    xmlns="sap.m">
    
    <Page title="Excel Import Wizard">
        <content>
            <VBox class="sapUiMediumMargin">
                
                <!-- Wizard Component Container -->
                <core:ComponentContainer
                    id="wizardSpreadsheetImporter"
                    width="100%"
                    usage="spreadsheetImporter"
                    propagateModel="true"
                    async="true"
                    settings="{
                        componentContainerData: {
                            buttonText: 'Excel Upload Wizard',
                            buttonId: 'uploadButton'
                        },
                        useImportWizard: true,
                        debug: true,
                        createActiveEntity: true,
                        strict: false,
                        showBackendErrorMessages: true
                    }"
                />

                <!-- Manual Wizard Trigger -->
                <Button 
                    text="Open Wizard Manually" 
                    press="onOpenWizard" 
                    type="Emphasized"
                    class="sapUiMediumMarginTop"
                />

            </VBox>
        </content>
    </Page>
</mvc:View>
```

## Best Practices

### 1. Error Handling
- Always handle the promise returned by `openWizard()`
- Provide user feedback for both success and error cases
- Use appropriate error messages for different scenarios

### 2. Configuration
- Use `debug: true` during development for detailed logging
- Set appropriate `batchSize` for your data volume
- Configure `mandatoryFields` for data validation

### 3. User Experience
- Provide clear instructions about expected data format
- Use the template download feature for users
- Consider using `strict: false` to allow users to continue with warnings

### 4. Performance
- Use `continueOnError: true` for large datasets
- Consider `createActiveEntity: true` for better performance in draft scenarios
- Optimize `batchSize` based on your backend capabilities

## Migration from Classic Dialog

To migrate from the classic dialog to the wizard:

1. **Add the wizard flag**:
   ```xml
   settings="{
       useImportWizard: true,
       // ... other existing settings
   }"
   ```

2. **Update method calls** (optional):
   ```javascript
   // Old way
   oComponent.openSpreadsheetUploadDialog(options);
   
   // New way (both work)
   oComponent.openWizard(options);
   ```

3. **Test the new flow**: The wizard provides better error handling and user guidance while maintaining compatibility with existing configurations.

## Troubleshooting

### Common Issues

1. **Wizard doesn't open**
   - Ensure `useImportWizard: true` is set
   - Check component initialization
   - Verify component instance is available

2. **Steps not progressing**
   - Check browser console for validation errors
   - Verify file format is supported
   - Ensure headers match expected format

3. **Options not applied**
   - Verify options object format
   - Check for typos in option names
   - Use browser developer tools to inspect settings

For more troubleshooting information, see [Troubleshooting](Troubleshooting.md).
