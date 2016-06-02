import PushStateTree from '../../src/push-state-tree';
import BrowserAdapter from '../../src/adapter/browser';
import PluginInjector from '../../src/adapter/pluginInjector';
import BrowserHistory from '../../src/plugin/history';

let originalPrototype = PushStateTree.prototype;
export default function useBrowser() {

  before(() => {
    // Add adapters as extension of the prototype
    PushStateTree.addAdapter(BrowserAdapter);
    PushStateTree.addAdapter(PluginInjector, BrowserHistory);
  });

  after(() => {
    // Restore the original prototype
    PushStateTree.prototype = originalPrototype;
  });
}