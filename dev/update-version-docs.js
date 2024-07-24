const fs = require('fs');
const path = require('path');

function updateVersionInContent(content, spreadsheetUploadVersion, spreadsheetUploadButtonVersion) {
  const spreadsheetImporterRegex = /(cc\.spreadsheetimporter\.|customControl\/spreadsheetimporter\/)v\d+_\d+_\d+/g;
  const spreadsheetImporterButtonRegex = /(cc\.spreadsheetimporter.button\.|customControl\/spreadsheetimporter.button\/)v\d+_\d+_\d+/g;
  // Updated regex to optionally match the leading "./" and ensure case insensitivity
  const thirdpartySpreadsheetImporterRegex = /(\.?\/?thirdparty\/customcontrol\/spreadsheetimporter\/)v\d+_\d+_\d+/ig;
  const mountPathRegex = /(mountPath: \/thirdparty\/customcontrol\/spreadsheetimporter\/)v\d+_\d+_\d+/;
  const ccSpreadsheetImporterRegex = /(cc\/spreadsheetimporter\/)v\d+_\d+_\d+/g;
  const newSpreadsheetImporterRegex = /spreadsheetimporter_v\d+_\d+_\d+/g;
  const ui5SpreadsheetImporterRegex = /(ui5-cc-spreadsheetimporter-)v\d+-\d+-\d+/g;

  content = content.replace(spreadsheetImporterRegex, (match, p1) => {
    return `${p1}${spreadsheetUploadVersion}`;
  });
  content = content.replace(spreadsheetImporterButtonRegex, (match, p1) => {
    return `${p1}${spreadsheetUploadButtonVersion}`;
  });
  content = content.replace(thirdpartySpreadsheetImporterRegex, (match, p1) => {
    return `${p1}${spreadsheetUploadVersion}`;
  });
  content = content.replace(ccSpreadsheetImporterRegex, (match, p1) => {
    return `${p1}${spreadsheetUploadVersion}`;
  });
  content = content.replace(mountPathRegex, (match, p1) => {
    return `${p1}${spreadsheetUploadVersion}`;
  });
  content = content.replace(newSpreadsheetImporterRegex, (match, p1) => {
    return `spreadsheetimporter_${spreadsheetUploadVersion}`;
  });
  content = content.replace(newSpreadsheetImporterRegex, `spreadsheetimporter_${spreadsheetUploadVersion}`);

  // New replacement for ui5-cc-spreadsheetimporter-v1-1-1
  content = content.replace(ui5SpreadsheetImporterRegex, (match, p1) => {
    return `${p1}${spreadsheetUploadVersion.replace(/_/g, '-')}`;
  });

  return content;
}

function updateVersionInFile(filePath, spreadsheetUploadVersion, spreadsheetUploadButtonVersion) {
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return;
    }

    const updatedContent = updateVersionInContent(data, spreadsheetUploadVersion, spreadsheetUploadButtonVersion);
    fs.writeFile(filePath, updatedContent, 'utf8', (err) => {
      if (err) {
        console.error(err);
        return;
      }
      console.log(`Updated version in ${filePath}`);
    });
  });
}

function updateVersionInDir(dirPath, spreadsheetUploadVersion, spreadsheetUploadButtonVersion) {
  fs.readdir(dirPath, { withFileTypes: true }, (err, entries) => {
    if (err) {
      console.error(err);
      return;
    }

    entries.forEach((entry) => {
      if (entry.name === 'node_modules') {
        return; // Skip the node_modules directory
      }

      const fullPath = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        updateVersionInDir(fullPath, spreadsheetUploadVersion, spreadsheetUploadButtonVersion);
      } else if (entry.isFile() && ['.md', '.js', '.ts'].includes(path.extname(fullPath))) {
        updateVersionInFile(fullPath, spreadsheetUploadVersion, spreadsheetUploadButtonVersion);
      }
    });
  });
}


function updateVersions(spreadsheetUploadVersion) {
  const docsPath = './docs';
  const examplesPath = './examples';
  updateVersionInDir(docsPath, spreadsheetUploadVersion);
  updateVersionInDir(examplesPath, spreadsheetUploadVersion);
}


module.exports.updateVersions = updateVersions;
module.exports.updateVersionInFile = updateVersionInFile;