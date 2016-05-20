export function AutoInjectHistory(Constructor, ...args) {
  this.create = function (router, options) {
    options.plugins = options.plugins || [];
    options.plugins.push(new Constructor(...args));

    if (typeof Constructor.prototype.create == 'function') {
      Constructor.prototype.create.apply(this, arguments);
    }
  }
}

export default AutoInjectHistory;