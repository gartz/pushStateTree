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
});
