const PushStateTree = require('../src/push-state-tree');
import cleanHistoryAPI from './helper/cleanHistoryAPI';

describe('PushStateTree hash-navigation should', function() {

  cleanHistoryAPI();

  it('allow hash navigation when push-state is disabled', function(){
    var pst = new PushStateTree({
      usePushState: false
    });
    expect(pst.usePushState).to.be.false;
  });

  it('detect the hash address', function(){
    var pst = new PushStateTree({
      usePushState: false
    });
    location.hash = '#test';
    expect(pst.uri).to.equal('test');
  });

  it('increment the history length when using navigate method', function(){
    var pst = new PushStateTree({
      usePushState: false
    });
    var currentLength = history.length;
    pst.navigate('test');
    expect(history.length).to.equal(currentLength + 1);
  });

  it('not increment the history length when using replace method', function(){
    var pst = new PushStateTree({
      usePushState: false
    });
    var currentLength = history.length;
    pst.replace('test');
    expect(history.length).to.equal(currentLength);
  });

  it('change the hash address when pushstate is disabled', function(){
    var pst = new PushStateTree({
      usePushState: false
    });
    pst.navigate('test2');
    expect(pst.uri).to.equal('test2');
    expect(location.hash).to.equal('#test2');
  });

  it('go to the current folder when use ./ in the command', function(){
    var pst = new PushStateTree({
      usePushState: false
    });

    location.hash = '#folder/file';
    expect(pst.uri).to.equal('folder/file');
    pst.navigate('./');
    expect(pst.uri).to.equal('folder/');
    expect(location.hash).to.equal('#folder/');
  });

  it('go to the parent folder when use ../ in the command from a file', function(){
    var pst = new PushStateTree({
      usePushState: false
    });

    location.hash = '#folder/file';
    expect(pst.uri).to.equal('folder/file');
    pst.navigate('../');
    expect(pst.uri).to.equal('');
    expect(location.hash).to.equal('');
  });

  it('go to the parent folder when use ../ in the command from sub-folder', function(){
    var pst = new PushStateTree({
      usePushState: false
    });

    location.hash = '#folder/sub-folder/';
    expect(pst.uri).to.equal('folder/sub-folder/');
    pst.navigate('../');
    expect(pst.uri).to.equal('folder/');
    expect(location.hash).to.equal('#folder/');
  });

  it('ignore ./ if is already in the root folder', function(){
    var pst = new PushStateTree({
      usePushState: false
    });

    location.hash = '#/';
    expect(pst.uri).to.equal('');
    pst.navigate('./');
    expect(pst.uri).to.equal('');
    expect(location.hash).to.equal('');
  });

  it('ignore ../ if is already in the root folder', function(){
    var pst = new PushStateTree({
      usePushState: false
    });

    location.hash = '#/';
    expect(pst.uri).to.equal('');
    pst.navigate('../');
    expect(pst.uri).to.equal('');
    expect(location.hash).to.equal('');
  });

  it('stop in the root folder when there is more parent folder commands them possible', function(){
    var pst = new PushStateTree({
      usePushState: false
    });

    location.hash = '#folder/';
    expect(pst.uri).to.equal('folder/');
    pst.navigate('../../');
    expect(pst.uri).to.equal('');
    expect(location.hash).to.equal('');
  });

  it('go to the root folder when use / in the command from file', function(){
    var pst = new PushStateTree({
      usePushState: false
    });

    location.hash = '#folder/file';
    expect(pst.uri).to.equal('folder/file');
    pst.navigate('/');
    expect(pst.uri).to.equal('');
    expect(location.hash).to.equal('');
  });

  it('go to the root folder when use / in the command from a folder', function(){
    var pst = new PushStateTree({
      usePushState: false
    });

    location.hash = '#folder/';
    expect(pst.uri).to.equal('folder/');
    pst.navigate('/');
    expect(pst.uri).to.equal('');
    expect(location.hash).to.equal('');
  });

  it('go to the root folder when use / in the command from a sub-folder', function(){
    var pst = new PushStateTree({
      usePushState: false
    });

    location.hash = '#folder/sub-folder/';
    expect(pst.uri).to.equal('folder/sub-folder/');
    pst.navigate('/');
    expect(pst.uri).to.equal('');
    expect(location.hash).to.equal('');
  });
});
