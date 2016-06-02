export function AutoInjectHistory(Constructor, ...args) {
  this.create = function (router, options) {
    options.plugins = options.plugins || [];
    options.plugins.push(new Constructor(...args));

    if (typeof AutoInjectHistory.prototype.create == 'function') {
      AutoInjectHistory.prototype.create.apply(this, arguments);
    }
  }
}

export default AutoInjectHistory;