const PushStateTree = require('../src/push-state-tree');
import cleanHistoryAPI from './helper/cleanHistoryAPI';
const _ = require('underscore');

describe('PushStateTree-rule', function () {
  let pst;
  let rule;
  let urlTriggerMethods = [
    'navigate',
    'replace',
    'assign'
  ];

  cleanHistoryAPI();

  beforeEach(function () {
    pst = new PushStateTree();
    rule = pst.createRule();
    pst.appendChild(rule);
  });

  urlTriggerMethods.forEach(triggerMethod => {

    describe(`using ${triggerMethod}`, () => {

      it('should dispatch enter if URL match with the rule', () => {
        let url = _.uniqueId('url');
        rule.rule = url;
        var spy = chai.spy();
        rule.addEventListener('enter', spy);

        spy.should.not.have.been.called();

        rule[triggerMethod](url);

        spy.should.have.been.called.once;
      });

      it('should dispatch enter only once when dispatch same URL', () => {
        let url = _.uniqueId('url');
        rule.rule = url;
        var spy = chai.spy();
        rule.addEventListener('enter', spy);

        spy.should.not.have.been.called();

        rule[triggerMethod](url);
        rule.dispatch();

        spy.should.have.been.called.once;
      });

      it('should update the uri when redirect internally', () => {
        let url = _.uniqueId('url');
        rule.rule = url;
        var spy = chai.spy();
        rule.addEventListener('enter', spy);

        spy.should.not.have.been.called();

        rule[triggerMethod](url);
        rule.dispatch();

        spy.should.have.been.called.once;
      });

    });

  });

});