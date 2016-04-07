const PushStateTree = require('../src/push-state-tree');
import cleanHistoryAPI from './helper/cleanHistoryAPI';

describe('PushStateTree hash-navigation should', function() {

  cleanHistoryAPI();

  let cacheVal;

  before(() => {
    cacheVal = PushStateTree.hasPushState;
    PushStateTree.hasPushState = false;
  });

  after(() => {
    // Reset state
    PushStateTree.hasPushState = cacheVal;
  });

  it('force hash navigation if browser not support pushState', () => {
    var pst = new PushStateTree({
      usePushState: true
    });
    expect(pst.usePushState).to.be.false;
  });
});