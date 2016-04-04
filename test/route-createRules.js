var PushStateTree = require('../src/pushStateTree');

describe('PushStateTree createRule', function() {

  describe('when rule /^servers(\/)?(.*)/', function() {
    var pst;
    var rule;
    var regexRule = /^servers(\/)?(.*)/;
    var idRule = 'servers';
    beforeEach(function() {
      pst = new PushStateTree();
      rule = pst.createRule({
        id: idRule,
        rule: regexRule
      });
    });

    it('should create the html node', function() {
      expect(rule).to.be.instanceof(HTMLElement);
    });

    it('should add the id attribute to the node', function() {
      expect(rule.id).to.equal(idRule);
    });

    it('should create a get function which returns the regex rule', function() {
      expect(rule.rule).to.equal(regexRule);
    });

    describe('when a set rule function is created', function() {

      it('should change regex value ', function() {
        rule.rule = /^faq(\/)?(.*)/;
        expect(rule.rule.toString()).to.equal(/^faq(\/)?(.*)/.toString());
      });

      it('should convert string into regex format', function() {
        rule.rule = '^faq(\\/)?(.*)';
        expect(rule.rule).to.be.instanceof(RegExp);
      });

      it('should avoid recursive loop', function() {
        chai.spy.on(rule, 'setAttribute');
        rule.rule = '/^servers(\\/)?(.*)/';
        expect(rule.setAttribute).not.to.have.been.called;
      });
    });

  });

  describe('when parent-group is specified', function() {
    var parentGroup = 2;
    var pst;
    var rule;
    beforeEach(function() {
      pst = new PushStateTree();
      rule = pst.createRule({
        id: 'parent',
        parentGroup: 2,
        rule: /[^/]+/
      });
    });

    it('should bind "get" with parentGroup property', function() {
      expect(rule.parentGroup).to.equal(parentGroup);
    });

    it('should bind "set" with parentGroup property', function() {
      rule.parentGroup = 3;
      expect(rule.parentGroup).to.equal(3);
    });

    it('should remove the "parent-group" if not an int is set', function() {
      chai.spy.on(rule, 'removeAttribute');
      rule.parentGroup = '';
      expect(rule.removeAttribute).to.have.been.called.with('parent-group');
    });

    it('should return null if theres no parent-group', function() {
      rule.parentGroup = null;
      expect(rule.parentGroup).to.be.null;
    });

    it('should set 0 to parentGroup', function() {
      rule.parentGroup = 0;
      expect(rule.parentGroup).to.be.equal(0);
    });
  });
});
