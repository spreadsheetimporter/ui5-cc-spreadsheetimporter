const fs = require('fs');
const path = require('path');

const filesToCopy = [
  {
    src: 'packages/ui5-cc-spreadsheetimporter/CHANGELOG.md',
    dest: 'docs/pages/CHANGELOGSPREADSHEETIMPORTER.md'
  }
];

filesToCopy.forEach(file => {
  fs.copyFile(file.src, file.dest, err => {
    if (err) {
      console.error(`Error while copying file: ${file.src} -> ${file.dest}. Error: ${err.message}`);
    } else {
      console.log(`File copied successfully: ${file.src} -> ${file.dest}`);
    }
  });
});
