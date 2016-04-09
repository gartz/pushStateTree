const PushStateTree = require('../src/push-state-tree');
const pkg = require('../package.json');
import cleanHistoryAPI from './helper/cleanHistoryAPI';

describe('PushStateTree', function () {

  cleanHistoryAPI();

  it('should provide the version as static property in the function', () => {
    expect(PushStateTree.VERSION).to.be.a('string');
  });

  it('should provide the version as property in the instance', () => {
    let pst = new PushStateTree();
    expect(pst.VERSION).to.be.a('string');
  });

  it('should ensure the version is same as in the package.json file', () => {
    expect(PushStateTree.VERSION).to.be.equal(pkg.version);
  });

});