# Wizard Test Specifications

## Overview

This document defines all possible user paths and test scenarios for the Spreadsheet Importer Wizard component. It serves as:

- **Test specification** for automated and manual testing
- **Developer documentation** for understanding wizard flow
- **Requirements specification** for bug fixes and feature development

## Wizard Flow Architecture

### Core Steps

1. **Upload File Step** - Select and upload file (automatic progression to next step)
2. **Header Selection Step** - Map/fix column headers (conditional - only shown when header issues detected)
3. **Preview Data Step** - Review data before import
4. **Final Import** - Data import execution (triggered by "Upload" button)

### Automatic Flow Progression

- **File Upload → Preview**: Wizard automatically advances to preview step after successful file upload
- **File Upload → Header Selection**: Only triggered when header validation fails
- **Header Selection → Preview**: After fixing headers, wizard proceeds to preview
- **Preview → Import**: User clicks "Upload" button to execute final import

### State Management

- Dialog maintains state across steps
- Header mappings persist until dialog is closed
- Error states should be revisitable but cleared when user uploads a new file
- File selection triggers automatic step progression

## Test Scenarios

### 1. Happy Path Scenarios

#### 1.1 Standard Success Flow (No Header Issues)

**Path**: Upload File → **Auto-advance** → Preview Data → Import

```
GIVEN user clicks "Excel Upload Wizard" button
WHEN user selects a valid file with correct headers
THEN wizard automatically advances to Preview Data step
AND preview shows correct data with proper column mapping
WHEN user clicks "Upload" button
THEN data is successfully imported
AND wizard closes with success message
```

#### 1.2 File Replacement in Same Dialog

**Path**: Upload File → Preview → Back to Upload → New File → **Auto-advance** → Preview → Import

```
GIVEN user is on Preview Data step
WHEN user navigates back to Upload File step
AND selects a different valid file
THEN wizard automatically advances to Preview Data step
AND preview updates with new file data
AND previous file state is cleared
WHEN user clicks "Upload" button
THEN new file data is imported successfully
```

### 2. Header Error Scenarios

#### 2.1 Wrong Header - Fixed Path

**Path**: Upload File → **Auto-advance** → Header Selection → Fix Headers → Preview → Import

```
GIVEN user clicks "Excel Upload Wizard" button
WHEN user selects a file with incorrect/missing headers
THEN wizard automatically advances but detects header issues
AND Header Selection step is automatically shown
WHEN user maps/fixes the headers correctly
AND proceeds to next step
THEN Preview Data step shows data with corrected headers
WHEN user clicks "Upload" button
THEN data is successfully imported with correct mapping
```

#### 2.2 Wrong Header - Not Fixed (File Replacement)

**Path**: Upload File → Header Selection → Back to Upload → New File → **Auto-advance** → Preview → Import

```
GIVEN user is on Header Selection step with unmapped headers
WHEN user navigates back to Upload File step
AND selects a different file with correct headers
THEN wizard automatically advances to Preview Data step
AND Header Selection step is skipped
AND previous header error state is cleared
WHEN user clicks "Upload" button
THEN new file data is imported successfully
```

#### 2.3 Wrong Header - Dialog Restart

**Path**: Upload File → Header Selection → Cancel → Reopen Wizard → New File → **Auto-advance** → Preview

```
GIVEN user is on Header Selection step with errors
WHEN user clicks "Abbrechen" (Cancel) to close dialog
AND clicks "Excel Upload Wizard" button to reopen
THEN wizard starts fresh with no previous state
WHEN user selects a file with correct headers
THEN wizard automatically advances to Preview Data step
AND proceeds normally
```

### 3. Complex Error Recovery Scenarios

#### 3.1 Header Fixed But Additional Data Errors

**Path**: Upload File → Header Selection → Fix Headers → Preview → Data Errors → Back to Upload → New File → **Auto-advance** → Preview

```
GIVEN user has fixed header mappings in Header Selection step
WHEN wizard advances to Preview Data step
AND data validation errors are discovered in preview
THEN user can navigate back to Upload File step
AND header mappings are preserved
WHEN user uploads a new file
THEN wizard automatically advances
AND fixed headers are applied if compatible
IF new file has no data errors
THEN Preview Data step shows clean data
ELSE error handling continues
```

#### 3.2 Multiple File Upload Attempts

**Path**: Upload File → Error → Upload File → Error → Upload File → **Auto-advance** → Success

```
GIVEN user is attempting to resolve data issues
WHEN user uploads multiple files in succession
THEN each file upload triggers automatic advancement
AND wizard maintains consistent state management
UNTIL successful file with valid data is uploaded
```

### 4. Edge Cases and Boundary Scenarios

#### 4.1 File Upload Auto-Progression

```
GIVEN user is on Upload File step
WHEN file upload completes successfully
THEN wizard should automatically advance to next appropriate step
AND user should not need to manually click "Next"
AND loading states should be shown during processing
```

#### 4.2 Drag & Drop Functionality

```
GIVEN user is on Upload File step
WHEN user drags a file to the drop zone
AND drops the file
THEN file should be processed automatically
AND wizard should advance to next step
AND same behavior as "Choose a spreadsheet" button
```

#### 4.3 Invalid File Format Handling

```
GIVEN user selects unsupported file format
WHEN upload is attempted
THEN appropriate error message is shown
AND wizard remains on Upload File step
AND user can select a different file
```

#### 4.4 Large File Processing

```
GIVEN user selects a large spreadsheet file
WHEN file is being processed
THEN loading indicators are shown
AND automatic advancement waits for processing completion
AND timeout handling prevents indefinite loading
```

### 5. Dialog State and Navigation

#### 5.1 Cancel Button Behavior

```
GIVEN user is on any wizard step
WHEN user clicks "Abbrechen" (Cancel) button
THEN dialog closes completely
AND all wizard state is cleared
AND user returns to main application
```

#### 5.2 Back Navigation with Auto-Advancement

```
GIVEN user is on Preview Data step
WHEN user navigates back to Upload File step
AND selects a new file
THEN wizard automatically advances based on file validation
AND maintains consistent navigation behavior
```

## Developer Implementation Notes

### Auto-Advancement Logic

1. **File Upload Success**: Automatically trigger validation and advance
2. **Header Validation**: If fails, show Header Selection step; if passes, go to Preview
3. **Loading States**: Show progress indicators during automatic transitions
4. **Error Handling**: Graceful fallback when auto-advancement fails

### State Management Requirements

1. **Header Mappings**: Must persist until dialog close
2. **File Selection**: Should reset validation state
3. **Error States**: Should be revisitable but cleared when user uploads a new file
4. **Step Navigation**: Must maintain data integrity during auto-advancement

### UI/UX Considerations

1. **Auto-Advancement Feedback**: Clear indication when wizard is processing and advancing
2. **Error Messages**: Clear, actionable error descriptions that don't interfere with auto-flow
3. **Cancel Behavior**: Consistent dialog closure and state cleanup
4. **File Upload UX**: Both button click and drag-drop should behave identically

### 6. Validation Error Counting Scenarios

#### 6.1 Error File Upload and Message Count Verification

**Path**: Upload File → **Auto-advance** → Messages Step → Count Errors

```
GIVEN user clicks "Excel Upload Wizard" button
WHEN user selects a file with validation errors (ListReportOrdersErros.xlsx)
THEN wizard automatically advances to Messages Step due to validation failures
AND Messages Step displays validation messages in MessageView
WHEN user examines the message count
THEN the number of displayed errors matches the expected validation failures
AND error types include data validation, format, and business rule violations
AND user can see Continue/Continue Anyway and Download buttons for error handling
```

## Automated Test Implementation

### Test Categories

1. **Auto-Advancement Tests**: Verify automatic step progression works correctly
2. **File Upload Tests**: Both button and drag-drop functionality
3. **Error Recovery Tests**: Header errors and file replacement scenarios
4. **State Management Tests**: Persistence and cleanup across wizard usage
5. **Error Count Validation Tests**: Verify correct error counting and display in Messages Step

### Key Test Points

- Auto-advancement timing and reliability
- File validation and step routing logic
- Error state handling with auto-progression
- Dialog state cleanup on cancel/close
- Loading state management during auto-advancement
- Error message counting and verification in Messages Step
- Message type categorization (Error, Warning, Information)

### Implemented Tests

#### Current Test Files:

1. **Upload.test.js** - Tests standard success flow with clean data file
2. **UploadCoordinates.test.js** - Tests coordinate-based data selection and upload
3. **UploadErrorsCount.test.js** - Tests error file upload and validation message counting

#### Test File Mapping:

- `ListReportOrdersNoErros.xlsx` - Clean data for success flow testing
- `ListReportOrdersNoErrosCoordinates.xlsx` - Clean data with coordinate selection
- `ListReportOrdersErros.xlsx` - Data with validation errors for error counting tests

## Success Criteria

Each test scenario should verify:

- ✅ Correct automatic step progression after file upload
- ✅ Appropriate conditional step display (Header Selection when needed)
- ✅ Error handling that doesn't break auto-advancement flow
- ✅ State persistence and cleanup behavior
- ✅ User experience consistency across all paths
- ✅ Import result correctness
- ✅ Accurate error counting and display in Messages Step
- ✅ Proper error categorization and user action availability

---

_This document reflects the current wizard implementation with automatic step progression and should be updated as features evolve._
