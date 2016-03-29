var customMatchers = {
  toBeInstanceOf: function(util, customEqualityTesters) {
    return {
      compare: function(actual, expected) {
        var result = {};
        result.pass = actual instanceof expected;
        if (!result.pass) {
          return "Expected " + actual.constructor.name + notText + " is instance of " + expectedInstance.name;
        }
        return result;
      }
    };
  }
}

describe('PushStateTree createRule', function() {
  'use strict';
  beforeEach(function() {
  	jasmine.addMatchers(customMatchers);
  });

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
      expect(rule).toBeInstanceOf(HTMLElement);
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
        expect(rule.rule).to.equal(/^faq(\/)?(.*)/);
      });

      it('should convert string into regex format', function() {
        rule.rule = '^faq(\\/)?(.*)';
        expect(rule.rule).to.equal(/^faq(\/)?(.*)/);
      });

      it('should avoid recursive loop', function() {
        spyOn(rule, 'setAttribute');
        rule.rule = '/^servers(\\/)?(.*)/';
        expect(rule.setAttribute).not.toHaveBeenCalled();
      });
    });

  });

});
