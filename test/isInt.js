var PushStateTree = require('../src/pushStateTree');

describe('PushStateTree isInt', function() {

  it('should return true for valid numbers', function() {
    expect(PushStateTree.isInt(0)).to.be.true;
    expect(PushStateTree.isInt(1)).to.be.true;
    expect(PushStateTree.isInt(-1)).to.be.true;
  });

  it('should return true for valid number in string', function() {
    expect(PushStateTree.isInt('0')).to.be.true;
    expect(PushStateTree.isInt('1')).to.be.true;
    expect(PushStateTree.isInt('2')).to.be.true;
  });

  it('should return false for Boolean values', function() {
    expect(PushStateTree.isInt(true)).to.be.false;
    expect(PushStateTree.isInt(false)).to.be.false;
  });

  it('should return false for literal objects', function() {
    expect(PushStateTree.isInt({})).to.be.false;
  });

  it('should return false when no value is specified', function() {
    expect(PushStateTree.isInt()).to.be.false;
  });

  it('should return false for invalid strings', function() {
    expect(PushStateTree.isInt('1bc')).to.be.false;
    expect(PushStateTree.isInt('1.1')).to.be.false;
    expect(PushStateTree.isInt('-1.1')).to.be.false;
  });

  it('should return false for null', function() {
    expect(PushStateTree.isInt(null)).to.be.false;
  });

  it('should return false for infinity numbers', function() {
    expect(PushStateTree.isInt(Number.POSITIVE_INFINITY)).to.be.false;
    expect(PushStateTree.isInt(Number.NEGATIVE_INFINITY)).to.be.false;
  });

  it('should return false for invalid numbers', function() {
    expect(PushStateTree.isInt(1.1)).to.be.false;
    expect(PushStateTree.isInt(-1.1)).to.be.false;
  });

});
