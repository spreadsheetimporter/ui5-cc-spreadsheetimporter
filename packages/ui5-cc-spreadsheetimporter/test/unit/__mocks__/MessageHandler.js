class MessageHandler {
  constructor() {
    this.messages = [];
  }
  addMessageToMessages(message) {
    this.messages.push(message);
  }
  areMessagesPresent() {
    return this.messages.length > 0;
  }
  async displayMessages() {
    // no-op in tests
  }
}

module.exports = MessageHandler;
module.exports.default = MessageHandler;
