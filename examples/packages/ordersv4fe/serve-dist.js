const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  // Load the index.html file
  const filePath = path.join(__dirname, 'dist/index.html');
  const stream = fs.createReadStream(filePath);

  // Set the response headers
  res.writeHead(200, {'Content-Type': 'text/html'});

  // Pipe the file stream to the response object
  stream.pipe(res);
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
