This Wizard dialog is a alternative way to upload Spreadsheet files.

As developer you can choose what kind of dialog you want to open initially.

The wizard dialog contains all the processes to upload a Spreadsheet file.

1. Upload the file to the app
  1. Just a simple file upload just like in the standard dialog
  2. It will automatically go to the next step
2. Choose the starting cell if header is not on first row
  1. This step will trigger if a header as __EMPTY in the first row (first row is default header row), if no error continue to the next step automatically
4. Match the header columns the Entity fields if header were not able to be detected (import/export match configuration), if no error continue to the next step automatically
 1. this will show a list of columns found in the spreadsheet file, for each column there is a dropdown field with a available fields from the entity
5. Review validation warnings and errors
  1. With all the informations the process validating will be triggered and if any errors are visible the user will be notified in a dedicated step, if no error continue to the next step automatically
7. Preview the data
  1. This will show a simple sap.m.Table with all the parsed data
9. Send Data to backend with the finish button


Using the standard dialog the process would be like:

1. Upload file 
2. Choosing starting cell only if header not found
3. Match Header Cells only if unknown header fields unable to match
4. Review validation warnings and errors
5. Preview data and change data if needed on button press
6. Send data to backend

So the standard dialog would be the better choice if the format of the spreadsheet file is known and the data is valid.

The wizard dialog would be the better choice if the format of the spreadsheet file is unknown or the data is not valid.

graph TD
    A[Start: Standard Dialog] --> B[Upload File]
    B --> C{Header Found?}
    C -->|Yes| E{All Headers Matched?}
    C -->|No| D[Choose Starting Cell]
    D --> E
    E -->|Yes| G[Review Validation]
    E -->|No| F[Match Header Cells]
    F --> G
    G --> H[Preview Data]
    H --> I{Data Needs Changes?}
    I -->|Yes| J[Edit Data]
    I -->|No| K[Send to Backend]
    J --> K
    K --> L[End]

    M[Start: Wizard Dialog] --> N[Upload File]
    N --> O[Choose Starting Cell if Needed]
    O --> P[Match Headers if Needed]
    P --> Q[Review Validation]
    Q --> R[Preview and Edit Data]
    R --> S[Send to Backend]
    S --> T[End]







