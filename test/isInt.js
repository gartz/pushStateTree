import { isInt } from '../src/helpers';

describe('PushStateTree isInt', function() {

  it('should return true for valid numbers', function() {
    expect(isInt(0)).to.be.true;
    expect(isInt(1)).to.be.true;
    expect(isInt(-1)).to.be.true;
  });

  it('should return true for valid number in string', function() {
    expect(isInt('0')).to.be.true;
    expect(isInt('1')).to.be.true;
    expect(isInt('2')).to.be.true;
  });

  it('should return false for Boolean values', function() {
    expect(isInt(true)).to.be.false;
    expect(isInt(false)).to.be.false;
  });

  it('should return false for literal objects', function() {
    expect(isInt({})).to.be.false;
  });

  it('should return false when no value is specified', function() {
    expect(isInt()).to.be.false;
  });

  it('should return false for invalid strings', function() {
    expect(isInt('1bc')).to.be.false;
    expect(isInt('1.1')).to.be.false;
    expect(isInt('-1.1')).to.be.false;
  });

  it('should return false for null', function() {
    expect(isInt(null)).to.be.false;
  });

  it('should return false for infinity numbers', function() {
    expect(isInt(Number.POSITIVE_INFINITY)).to.be.false;
    expect(isInt(Number.NEGATIVE_INFINITY)).to.be.false;
  });

  it('should return false for invalid numbers', function() {
    expect(isInt(1.1)).to.be.false;
    expect(isInt(-1.1)).to.be.false;
  });

});
