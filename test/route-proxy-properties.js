const PushStateTree = require('../src/push-state-tree');
import cleanHistoryAPI from './helper/cleanHistoryAPI';
const _ = require('underscore');

describe('PushStateTree', function () {
  cleanHistoryAPI();

  let pst;
  beforeEach(() => {
    pst = new PushStateTree();
  });

  it('should allow to access the internalHistory length', () => {
    let internalHistory = PushStateTree.getInternalHistory();
    expect(pst.length).to.be.equal(internalHistory.length);
  });

  it('should proxy the history.length', () => {
    let internalHistory = PushStateTree.getInternalHistory();
    pst.navigate(_.uniqueId('new_url'));
    expect(pst).to.have.length(internalHistory.length);
  });

});
