
describe('PushStateTree createRule', function() {
  'use strict';

  describe('when rule /^servers(\/)?(.*)/', function() {
    var pst;
    var rule;
    beforeEach(function() {
      pst = new PushStateTree();
      rule = pst.createRule({
        id: 'servers',
        rule: /^servers(\/)?(.*)/
      });
    });
    it('should create the html node rule', function() {
      expect(rule.outerHTML).toEqual('<pushstatetree-rule id="servers" rule="/^servers(\\/)?(.*)/"></pushstatetree-rule>');
    });

    it('should create a get function which returns the regex rule', function() {
      expect(rule.rule).toEqual(/^servers(\/)?(.*)/);
    });

    describe('when a set rule function is created', function() {
      it('should it should change regex value ', function() {
        rule.rule = /^faq(\/)?(.*)/;
        expect(rule.rule).toEqual(/^faq(\/)?(.*)/);
      });
      it('should convert string into regex format', function() {
        rule.rule = '^faq(\\/)?(.*)';
        expect(rule.rule).toEqual(/^faq(\/)?(.*)/);
      });
      it('should avoid recursive loop', function() {
        spyOn(rule, 'setAttribute');
        rule.rule = '/^servers(\\/)?(.*)/';
        expect(rule.setAttribute).not.toHaveBeenCalled();
      });
    });

  });

});
