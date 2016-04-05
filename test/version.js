const PushStateTree = require('../src/pushStateTree');
const pkg = require('../package.json');

describe('PushStateTree', function () {

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