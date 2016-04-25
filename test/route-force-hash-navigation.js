const PushStateTree = require('../src/main');
import cleanHistoryAPI from './helper/cleanHistoryAPI';

describe('PushStateTree hash-navigation', function() {

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

  it(`should force hash navigation if browser doesn't support pushState`, () => {
    var pst = new PushStateTree({
      usePushState: true
    });
    expect(pst.usePushState).to.be.false;
  });
});