const PushStateTree = require('../src/push-state-tree');
import cleanHistoryAPI from './helper/cleanHistoryAPI';

describe('PushStateTree properties', () => {

  cleanHistoryAPI();

  var expectedParentGroup = 2;
  var pst;
  var rule;
  beforeEach(() => {
    pst = new PushStateTree();
    rule = pst.createRule({
      id: 'parent',
      parentGroup: expectedParentGroup,
      rule: /[^/]+/
    });
  });

  describe('when parent-group is specified', () => {

    it('should bind "get" with parentGroup property', () => {
      expect(rule.parentGroup).to.equal(expectedParentGroup);
    });

    it('should bind "set" with parentGroup property', () => {
      rule.parentGroup = 3;
      expect(rule.parentGroup).to.equal(3);
    });

    it('should remove the "parent-group" if an int is not set', () => {
      chai.spy.on(rule, 'removeAttribute');
      rule.parentGroup = '';
      expect(rule.removeAttribute).to.have.been.called.with('parent-group');
    });

    it('should return null if theres no parent-group', () => {
      rule.parentGroup = null;
      expect(rule.parentGroup).to.be.null;
    });
  });

  describe('match property', () => {
    var expectedMatch = 'test';
    beforeEach(() => {
      rule.match = [expectedMatch];
    });

    it('should return match', () => {
      rule.match = [expectedMatch];
      expect(rule.match[0]).to.equal(expectedMatch);
    });

    it('should change the match', () => {
      rule.match = ['newmatch'];
      expect(rule.match[0]).to.equal('newmatch');
    });

    it('should throw an error without message if match is not an array and DEV_ENV is false', () => {
      pst.DEV_ENV = false;
      expect(() => rule.match = expectedMatch).to.throw(TypeError, '');
    });

    it('should throw an error with message if match is not an array and DEV_ENV is true', () => {
      pst.DEV_ENV = true;
      expect(() => rule.match = expectedMatch).to.throw(TypeError, 'match must be an array');
    });
  });

  describe('oldMatch property', () => {
    var expectedOldMatch = 'test_old';
    beforeEach(() => {
      rule.oldMatch = [expectedOldMatch];
    });

    it('should return oldMatch', () => {
      rule.oldMatch = [expectedOldMatch];
      expect(rule.oldMatch[0]).to.equal(expectedOldMatch);
    });

    it('should change the oldMatch', () => {
      rule.oldMatch = ['newOldmatch'];
      expect(rule.oldMatch[0]).to.equal('newOldmatch');
    });

    it('should throw an error without message if oldMatch is not an array and DEV_ENV is false', () => {
      pst.DEV_ENV = false;
      expect(() => rule.oldMatch = expectedOldMatch).to.throw(TypeError, '');
    });

    it('should throw an error with message if oldMatch is not an array and DEV_ENV is true', () => {
      pst.DEV_ENV = true;
      expect(() => rule.oldMatch = expectedOldMatch).to.throw(TypeError, 'oldMatch must be an array');
    });
  });
});
