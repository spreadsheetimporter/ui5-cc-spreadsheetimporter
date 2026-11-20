// query-string 7 calls require('decode-uri-component') directly.
module.exports = require('patched-uri-decoder').default;
