/*globals PushStateTree, it, expect, beforeEach */
describe('PushStateTree should', function() {
  'use strict';

  beforeEach(function(){
    // Reset the URI before begin the tests
    history.pushState(null, null, '/');
  });

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
      expect(methods).toContain(method);
    });
  });

  it('ha', function(){

  });
});
