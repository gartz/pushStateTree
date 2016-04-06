const PushStateTree = require('../src/push-state-tree');
import cleanHistoryAPI from './helper/cleanHistoryAPI';
const _ = require('underscore');

describe('PushStateTree methods', function() {
  let pst;
  cleanHistoryAPI();

  beforeEach(() => {
    pst = new PushStateTree();
  });

  it('should set the state when use pushState method', () => {
    let uniqueState = {uniqueState: _.uniqueId('state')};
    pst.pushState(uniqueState, '', _.uniqueId('new_url'));

    assert.deepEqual(pst.state, uniqueState);
  });

  it('should set the state to null when use navigate method', () => {
    let uniqueState = {uniqueState: _.uniqueId('state')};
    pst.pushState(uniqueState, '', _.uniqueId('new_url'));
    pst.navigate(_.uniqueId('new_url'));

    assert.isNull(pst.state, 'the state is empty');
  });

  it('should set the state to null when use assign method', () => {
    let uniqueState = {uniqueState: _.uniqueId('state')};
    pst.pushState(uniqueState, '', _.uniqueId('new_url'));
    pst.assign(_.uniqueId('new_url'));

    assert.isNull(pst.state, 'the state is empty');
  });

  it('should set the state when use replaceState method', () => {
    let uniqueState = {uniqueState: _.uniqueId('state')};
    pst.replaceState(uniqueState, '', _.uniqueId('new_url'));

    assert.deepEqual(pst.state, uniqueState);
  });

  it('should set the state to null when use replace method', () => {
    let uniqueState = {uniqueState: _.uniqueId('state')};
    pst.pushState(uniqueState, '', _.uniqueId('new_url'));
    pst.replace(_.uniqueId('new_url'));

    assert.isNull(pst.state, 'the state is empty');
  });

});
