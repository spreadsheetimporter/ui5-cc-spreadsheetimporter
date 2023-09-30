const fs = require('fs');
const path = require('path');

function updateVersionInContent(content, spreadsheetUploadVersion, spreadsheetUploadButtonVersion) {
  const spreadsheetImporterRegex = /(cc\.spreadsheetimporter\.|customControl\/spreadsheetimporter\/)v\d+_\d+_\d+/g;
  const spreadsheetImporterButtonRegex = /(cc\.spreadsheetimporter.button\.|customControl\/spreadsheetimporter.button\/)v\d+_\d+_\d+/g;
  const thirdpartySpreadsheetImporterRegex = /(.\.\/thirdparty\/customControl\/spreadsheetImporter\/)v\d+_\d+_\d+/g;
  const ccSpreadsheetImporterRegex = /(cc\/spreadsheetimporter\/)v\d+_\d+_\d+/g;


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
      const fullPath = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        updateVersionInDir(fullPath, spreadsheetUploadVersion, spreadsheetUploadButtonVersion);
      } else if (entry.isFile() && (path.extname(fullPath) === '.md') || (path.extname(fullPath) === '.js') || (path.extname(fullPath) === '.ts')) {
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