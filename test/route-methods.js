const PushStateTree = require('../src/pushStateTree');
import cleanHistoryAPI from './helper/cleanHistoryAPI';

describe('PushStateTree methods should', function() {

  cleanHistoryAPI();

  it('have the methods: pushState, replaceState, dispatch, assign, replace, navigate', function() {
    var pst = new PushStateTree();
    var methods = [];
    for (var method in pst) {
      if (typeof pst[method] === 'function') {
        methods.push(method);
      }
    }

    // Methods that should exist:
    [
      'pushState',
      'replaceState',
      'dispatch',
      'assign',
      'replace',
      'navigate'
    ].forEach(function(method){
      expect(methods).to.contain(method);
    });
  });

});
