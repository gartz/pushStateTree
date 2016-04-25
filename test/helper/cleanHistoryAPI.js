import BrowserHistory from '../../src/plugin/history';
let globalListeners = [];

let cache = BrowserHistory.prototype.globalListeners;
BrowserHistory.prototype.globalListeners = function () {
  let listeners = cache.apply(this, arguments);
  globalListeners.push(listeners);
  return listeners;
};

export default function cleanHistoryAPI() {

  beforeEach(() => {
    history.pushState(null, null, '/');
  });

  afterEach(() => {
    // Reset the URI before begin the tests
    history.pushState(null, null, '/');
    while (globalListeners.length) {
      let disableGlobalListener = globalListeners.shift();
      disableGlobalListener();
    }
  });
}