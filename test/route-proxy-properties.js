const PushStateTree = require('../src/pushStateTree');
import cleanHistoryAPI from './helper/cleanHistoryAPI';
const _ = require('underscore');

describe('PushStateTree', function () {
  cleanHistoryAPI();

  let pst;
  beforeEach(() => {
    pst = new PushStateTree();
  });

  it('should allow to access the history length', () => {
    expect(pst.length).to.be.equal(history.length);
  });

  it('should proxy the history.length', () => {
    history.pushState(null, '', _.uniqueId('new_url'));
    expect(pst).to.have.length(history.length);
  });

  it('should proxy the history.state', () => {
    let uniqueState = {uniqueState: _.uniqueId('state')};
    history.pushState(uniqueState, '', _.uniqueId('new_url'));
    assert.deepEqual(pst.state, uniqueState);
  });

});
