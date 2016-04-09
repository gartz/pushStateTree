const PushStateTree = require('../../src/push-state-tree');

export default function cleanHistoryAPI() {

  let enabledInstances = [];
  
  before(() => {
    let cache = PushStateTree.prototype.startGlobalListeners;
    PushStateTree.prototype.startGlobalListeners = function () {
      enabledInstances.push(this);
      return cache.apply(this, arguments);
    }
  });

  afterEach(() => {
    // Reset the URI before begin the tests
    history.pushState(null, null, '/');
    while (enabledInstances.length) {
      enabledInstances.shift().disabled = true;
    }
  });
}