const PushStateTree = require('../src/main');
import cleanHistoryAPI from './helper/cleanHistoryAPI';
const _ = require('underscore');

describe('PushStateTree hash-navigation', () => {
  let pst;
  let urlTriggerMethods = [
    'navigate',
    'replace',
    'assign'
  ];

  cleanHistoryAPI();

  beforeEach(() => {
    pst = new PushStateTree({
      beautifyLocation: false,
      usePushState: false
    });
  });

  it('should allow hash navigation when push-state is disabled', () => {
    expect(pst.usePushState).to.be.false;
  });

  urlTriggerMethods.forEach(triggerMethod => {
    describe(`using ${triggerMethod}`, () => {

      it('should detect the hash address', () => {
        location.hash = '#test';
        expect(pst.uri).to.equal('test');
      });

      it('should increment the instance length when using navigate method', () => {
        var currentLength = pst.length;
        pst[triggerMethod](_.uniqueId('url'));
        expect(pst.length).to.be.above(currentLength);
      });

      it('should change the hash address when pushstate is disabled', () => {
        pst[triggerMethod]('test2');
        expect(pst.uri).to.equal('test2');
        expect(location.hash).to.equal('#test2');
      });

      it('should go to the current folder when use ./ in the command', () => {
        location.hash = '#folder/file';
        expect(pst.uri).to.equal('folder/file');
        pst[triggerMethod]('./');
        expect(pst.uri).to.equal('folder/');
        expect(location.hash).to.equal('#folder/');
      });

      it('should go to the parent folder when use ../ in the command from a file', () => {
        location.hash = '#folder/file';
        expect(pst.uri).to.equal('folder/file');
        pst[triggerMethod]('../');
        expect(pst.uri).to.equal('');
        expect(location.hash).to.equal('');
      });

      it('should go to the parent folder when use ../ in the command from sub-folder', () => {
        location.hash = '#folder/sub-folder/';
        expect(pst.uri).to.equal('folder/sub-folder/');
        pst[triggerMethod]('../');
        expect(pst.uri).to.equal('folder/');
        expect(location.hash).to.equal('#folder/');
      });

      it('should ignore ./ if is already in the root folder', () => {
        location.hash = '#/';
        expect(pst.uri).to.equal('');
        pst[triggerMethod]('./');
        expect(pst.uri).to.equal('');
        expect(location.hash).to.equal('');
      });

      it('should ignore ../ if is already in the root folder', () => {
        location.hash = '#/';
        expect(pst.uri).to.equal('');
        pst[triggerMethod]('../');
        expect(pst.uri).to.equal('');
        expect(location.hash).to.equal('');
      });

      it('should stop in the root folder when there is more parent folder commands them possible', () => {
        location.hash = '#folder/';
        expect(pst.uri).to.equal('folder/');
        pst[triggerMethod]('../../');
        expect(pst.uri).to.equal('');
        expect(location.hash).to.equal('');
      });

      it('should go to the root folder when use / in the command from file', () => {
        location.hash = '#folder/file';
        expect(pst.uri).to.equal('folder/file');
        pst[triggerMethod]('/');
        expect(pst.uri).to.equal('');
        expect(location.hash).to.equal('');
      });

      it('should go to the root folder when use / in the command from a folder', () => {
        location.hash = '#folder/';
        expect(pst.uri).to.equal('folder/');
        pst[triggerMethod]('/');
        expect(pst.uri).to.equal('');
        expect(location.hash).to.equal('');
      });

      it('should go to the root folder when use / in the command from a sub-folder', () => {
        location.hash = '#folder/sub-folder/';
        expect(pst.uri).to.equal('folder/sub-folder/');
        pst[triggerMethod]('/');
        expect(pst.uri).to.equal('');
        expect(location.hash).to.equal('');
      }); 
      
    });
  });
});
