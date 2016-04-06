const PushStateTree = require('../src/pushStateTree');
import cleanHistoryAPI from './helper/cleanHistoryAPI';
const _ = require('underscore');

describe('PushStateTree methods', function() {
  let pst;
  cleanHistoryAPI();

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

  it('should set the state when use pushState method', () => {
    let uniqueState = {uniqueState: _.uniqueId('state')};
    pst.pushState(uniqueState, '', _.uniqueId('new_url'));

    assert.deepEqual(pst.state, uniqueState);
  });

  it('should set the state to null when use navigate method', () => {
    let uniqueState = {uniqueState: _.uniqueId('state')};
    pst.navigate(_.uniqueId('new_url'));

    assert.isNull(pst.state, 'the state is empty');
  });

});
