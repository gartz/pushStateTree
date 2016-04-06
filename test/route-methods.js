const PushStateTree = require('../src/pushStateTree');

describe('PushStateTree methods', function() {
  let pst;

  beforeEach(() => {
    pst = new PushStateTree();
  });

  it('should have the methods: pushState, replaceState, dispatch, assign, replace, navigate', () => {
    let methods = [];
    for (let method in pst) {
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
    ].forEach(method => expect(methods).to.contain(method));
  });

});
