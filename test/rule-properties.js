const PushStateTree = require('../src/push-state-tree');

describe('PushStateTree properties', () => {

  describe('when parent-group is specified', () => {
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
});
