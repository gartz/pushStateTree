const PushStateTree = require('../src/pushStateTree');
import cleanHistoryAPI from './helper/cleanHistoryAPI';

describe('PushStateTree-rule', function () {
  let pst;

  cleanHistoryAPI();

  before(function () {
    pst = new PushStateTree();
  });

  it('should be created by PushStateTree-router instance', function () {
    let rule = pst.createRule();
    expect(rule).to.be.defined;
  });

  it('should be a HTMLElement instance', function () {
    let rule = pst.createRule();
    expect(rule).to.be.instanceof(HTMLElement);
  });

  it('should allow to define properties in the createRule method options', function () {
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

  it('should allow to set rule property as RegExp', function () {
    let regexp = /test/;
    let rule = pst.createRule();
    rule.rule = regexp;
    expect(rule.rule).to.be.equal(regexp);
  });

  it('should allow to create with rule property as RegExp', function () {
    let regexp = /test/;
    let rule = pst.createRule({
      rule: regexp
    });
    expect(rule.rule).to.be.equal(regexp);
  });

  it('should allow to create with rule property as RegExp', function () {
    let regexp = /test/;
    let rule = pst.createRule({
      rule: regexp
    });
    expect(rule.rule).to.be.equal(regexp);
  });

});