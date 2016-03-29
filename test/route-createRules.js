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

});
