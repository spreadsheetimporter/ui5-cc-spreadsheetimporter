const fs = require('fs');
const path = require('path');

function updateVersionInContent(content, excelUploadVersion, excelUploadButtonVersion) {
  const excelUploadRegex = /(cc\.excelUpload\.|customControl\/excelUpload\/)v\d+_\d+_\d+/g;
  const excelUploadButtonRegex = /(cc\.excelUploadButton\.|customControl\/excelUploadButton\/)v\d+_\d+_\d+/g;

  content = content.replace(excelUploadRegex, (match, p1) => {
    return `${p1}${excelUploadVersion}`;
  });

  content = content.replace(excelUploadButtonRegex, (match, p1) => {
    return `${p1}${excelUploadButtonVersion}`;
  });

  return content;
}

function updateVersionInFile(filePath, excelUploadVersion, excelUploadButtonVersion) {
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return;
    }

    const updatedContent = updateVersionInContent(data, excelUploadVersion, excelUploadButtonVersion);
    fs.writeFile(filePath, updatedContent, 'utf8', (err) => {
      if (err) {
        console.error(err);
        return;
      }
      console.log(`Updated version in ${filePath}`);
    });
  });
}

function updateVersionInDir(dirPath, excelUploadVersion, excelUploadButtonVersion) {
  fs.readdir(dirPath, { withFileTypes: true }, (err, entries) => {
    if (err) {
      console.error(err);
      return;
    }

    entries.forEach((entry) => {
      const fullPath = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        updateVersionInDir(fullPath, excelUploadVersion, excelUploadButtonVersion);
      } else if (entry.isFile() && path.extname(fullPath) === '.md') {
        updateVersionInFile(fullPath, excelUploadVersion, excelUploadButtonVersion);
      }
    });
  });
}

function updateVersions(excelUploadVersion, excelUploadButtonVersion) {
  const docsPath = './docs';
  updateVersionInDir(docsPath, excelUploadVersion, excelUploadButtonVersion);
}


module.exports.updateVersions = updateVersions;