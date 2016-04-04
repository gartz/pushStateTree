var PushStateTree = require('../src/pushStateTree');

describe('PushStateTree isInt', function() {

  it('should return true for 0', function() {
    expect(PushStateTree.isInt(0)).to.be.true;
  });

  it('should return true for 1', function() {
    expect(PushStateTree.isInt(1)).to.be.true;
  });

  it('should return true for "0"', function() {
    expect(PushStateTree.isInt('0')).to.be.true;
  });

  it('should return true for "1"', function() {
    expect(PushStateTree.isInt('1')).to.be.true;
  });

  it('should return true for false', function() {
    expect(PushStateTree.isInt(false)).to.be.false;
  });

  it('should return false for true', function() {
    expect(PushStateTree.isInt(true)).to.be.false;
  });

  it('should return false for {}', function() {
    expect(PushStateTree.isInt({})).to.be.false;
  });

  it('should return false when no value is specified', function() {
    expect(PushStateTree.isInt()).to.be.false;
  });

  it('should return false for strings with letters', function() {
    expect(PushStateTree.isInt('1bc')).to.be.false;
  });

  it('should return false for null', function() {
    expect(PushStateTree.isInt(null)).to.be.false;
  });
});
