// Minimal stand-in for sap/m/MessageBox (imported by Util but not exercised on the fireEventAsync path).
const MessageBox = {
  show: () => {},
  alert: () => {},
  confirm: () => {},
  error: () => {},
  information: () => {},
  success: () => {},
  warning: () => {}
};

module.exports = MessageBox;
module.exports.default = MessageBox;
