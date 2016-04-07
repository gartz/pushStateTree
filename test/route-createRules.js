const PushStateTree = require('../src/push-state-tree');

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

    it('should allow to define native and custom properties from options', function () {
      let values = {
        id: 'test',
        rule: /test/,
        parentGroup: 3,
        className: 'test'
      };
      let rule = pst.createRule(values);

      Object.keys(values).forEach(key => {
        expect(rule[key]).to.be.equal(values[key]);
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
