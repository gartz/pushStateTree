const PushStateTree = require('../src/push-state-tree');
import cleanHistoryAPI from './helper/cleanHistoryAPI';

describe('PushStateTree-rule', function () {
  let pst;
  let rule;

  cleanHistoryAPI();

  before(function () {
    pst = new PushStateTree();
    rule = pst.createRule();
  });

  it('should allow to set rule property as RegExp', function () {
    let regexp = /test/;
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

  it('should change regex value ', function() {
    let regexp = /^faq(\/)?(.*)/;
    rule.rule = regexp;
    expect(regexp).to.equal(regexp);
  });

  it('should convert string into regex format', function() {
    rule.rule = '^faq(\\/)?(.*)';
    expect(rule.rule).to.be.instanceof(RegExp);
  });

  it('should convert string into regex format and keep the same rule', function() {
    let regexpContent = '^faq(\\/)?(.*)';
    let regexp = new RegExp(regexpContent);
    rule.rule = regexpContent;

    expect(rule.rule.toString()).to.be.equal(regexp.toString());
  });

  it('should avoid recursive loop', function() {
    chai.spy.on(rule, 'setAttribute');
    rule.rule = '/^servers(\\/)?(.*)/';
    expect(rule.setAttribute).not.to.have.been.called;
  });

});