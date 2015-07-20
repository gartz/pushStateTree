/*globals PushStateTree, it, expect, beforeEach */
describe('PushStateTree should', function() {
  'use strict';

  beforeEach(function(){
    // Reset the URI before begin the tests
    history.pushState(null, null, '/');
  });

  it('be available on global scope', function() {
    expect(PushStateTree).toBeDefined();
  });

  it('instances without "new" operator', function() {
    /* jshint newcap: false*/
    expect(PushStateTree()).toEqual(jasmine.any(HTMLElement));
  });

  it('construct and became a HTMLElement instance', function(){
    expect(new PushStateTree()).toEqual(jasmine.any(HTMLElement));
    expect(new PushStateTree({})).toEqual(jasmine.any(HTMLElement));
  });

  it('auto enable push state if browser support it', function(){
    var pst = new PushStateTree();
    expect(pst.usePushState).toBeTruthy();
  });

  it('auto enable beautifyLocation feature', function(){
    var pst = new PushStateTree();
    expect(pst.beautifyLocation).toBeTruthy();
  });

  it('allow to disable push state if it constructor has a false option', function(){
    var pst = new PushStateTree({
      usePushState: false
    });
    expect(pst.usePushState).toBeFalsy();
  });

  it('allow to enable push state if it constructor has a true option', function(){
    var pst = new PushStateTree({
      usePushState: true
    });
    expect(pst.usePushState).toBeTruthy();
  });

  it('usePushState be true by default', function(){
    var pst = new PushStateTree();
    expect(pst.usePushState).toBeTruthy();
  });

  it('allow to change the usePushState flag after start running', function(){
    var pst = new PushStateTree();
    pst.usePushState = false;
    expect(pst.usePushState).toBeFalsy();
    pst.usePushState = true;
    expect(pst.usePushState).toBeTruthy();
  });

  it('usePushState change for each instance', function(){
    var pst1 = new PushStateTree({
      usePushState: false
    });
    var pst2 = new PushStateTree();
    expect(pst1.usePushState).toBeFalsy();
    expect(pst2.usePushState).toBeTruthy();
  });

  it('allow to change the beautifyLocation flag after start running', function(){
    var pst = new PushStateTree();
    expect(pst.beautifyLocation).toBeTruthy();
    pst.beautifyLocation = false;
    expect(pst.beautifyLocation).toBeFalsy();
    pst.beautifyLocation = true;
    expect(pst.beautifyLocation).toBeTruthy();
  });

  it('allow to set the base path', function(){
    var pst = new PushStateTree({
      basePath: '/test/'
    });
    expect(pst.basePath).toEqual('/test/');
  });

  it('normalize basePath', function(){
    expect((new PushStateTree({
      basePath: 'test'
    })).basePath).toEqual('/test/');
    expect((new PushStateTree({
      basePath: '/test'
    })).basePath).toEqual('/test/');
    expect((new PushStateTree({
      basePath: 'test/'
    })).basePath).toEqual('/test/');
    expect((new PushStateTree({
      basePath: 'test/test'
    })).basePath).toEqual('/test/test/');
    expect((new PushStateTree({
      basePath: '/test/test'
    })).basePath).toEqual('/test/test/');
    expect((new PushStateTree({
      basePath: 'test/test/'
    })).basePath).toEqual('/test/test/');
  });

  it('get the current URI', function(){
    var pst = new PushStateTree();
    expect(pst.uri).toEqual(location.pathname.slice(1));
  });

  it('prioritise the hash to provide the URI', function(){
    var pst = new PushStateTree({
      beautifyLocation: false
    });
    location.hash = '#test';
    expect(pst.uri).toEqual('test');
  });

  it('remove the first slash from the URI in the regular URL', function(){
    var pst = new PushStateTree({
      beautifyLocation: false
    });
    history.pushState(null, null, '/test');
    expect(location.pathname).toEqual('/test');
    expect(pst.uri).toEqual('test');
  });

  it('remove the first slash from the URI in the location.hash', function(){
    var pst = new PushStateTree({
      beautifyLocation: false
    });
    location.hash = '/test';
    expect(location.hash).toEqual('#/test');
    expect(pst.uri).toEqual('test');
  });

  it('redirect from the hash to path when beautifyLocation is enabled', function(){
    var pst = new PushStateTree({
      beautifyLocation: true
    });

    // Reset URL
    var randomURI = Math.random() + '';
    history.pushState(null, null, '/' + randomURI);
    expect(pst.uri).toEqual(randomURI);
    expect(location.pathname).toEqual('/' + randomURI);

    location.hash = '/abc';
    expect(pst.uri).toEqual('abc');
    expect(location.hash).toEqual('');

    expect(location.pathname).toEqual('/abc');
  });

  it('use the non relative root as basePath if not specified', function(){
    history.pushState(null, null, '/abc/123/');
    var pst = new PushStateTree();
    expect(pst.basePath).toEqual('/');
  });

  it('not share the basePath between route instances', function(){
    var pst1 = new PushStateTree({
      basePath: '1'
    });
    var pst2 = new PushStateTree({
      basePath: '2'
    });
    expect(pst1.basePath).toEqual('/1/');
    expect(pst2.basePath).toEqual('/2/');
  });

});
