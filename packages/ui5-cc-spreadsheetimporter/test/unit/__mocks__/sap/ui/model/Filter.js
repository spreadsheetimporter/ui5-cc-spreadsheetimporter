class Filter {
  constructor(config) {
    if (typeof config === 'object' && config.filters) {
      this.filters = config.filters;
      this.and = config.and;
    } else {
      this.path = arguments[0];
      this.operator = arguments[1];
      this.value = arguments[2];
    }
  }
}

module.exports = Filter;
module.exports.default = Filter;
