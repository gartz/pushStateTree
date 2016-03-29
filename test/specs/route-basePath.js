/*globals PushStateTree, it, expect, beforeEach, before */
describe('PushStateTree basePath should', function() {
  'use strict';

  var events = {
    popstate: [],
    hashchange: [],
    DOMContentLoaded: [],
    readystatechange: [],
    load: []
  };

  before(function(){
    var addEventListener = window.addEventListener;
    window.addEventListener = function(name, callback){
      events[name].push(callback);
      addEventListener.apply(window, arguments);
    };
  });

  beforeEach(function(){
    // Reset the URI before begin the tests
    history.pushState(null, null, '/');
    for (var eventName in events)
      if (events.hasOwnProperty(eventName)) {
        var eventList = events[eventName];
        while (eventList.length) {
          var callback = eventList.pop();
          window.removeEventListener(eventName, callback);
        }
      }
  });

  it('allow to set the base path', function(){
    var pst = new PushStateTree({
      basePath: '/test/'
    });
    expect(pst.basePath).to.equal('/test/');
  });

  it('normalize basePath folder', function(){
    expect((new PushStateTree({
      basePath: 'folder/'
    })).basePath).to.equal('/folder/');
    expect((new PushStateTree({
      basePath: 'folder/sub-folder/'
    })).basePath).to.equal('/folder/sub-folder/');
  });

  it('normalize basePath file', function(){
    expect((new PushStateTree({
      basePath: 'file'
    })).basePath).to.equal('/file');
    expect((new PushStateTree({
      basePath: '/file'
    })).basePath).to.equal('/file');
    expect((new PushStateTree({
      basePath: 'folder/file'
    })).basePath).to.equal('/folder/file');
    expect((new PushStateTree({
      basePath: '/folder/file'
    })).basePath).to.equal('/folder/file');
    expect((new PushStateTree({
      basePath: 'folder/file.ext'
    })).basePath).to.equal('/folder/file.ext');
    expect((new PushStateTree({
      basePath: '/folder/file.ext'
    })).basePath).to.equal('/folder/file.ext');
    expect((new PushStateTree({
      basePath: 'folder/file.ext?param=value'
    })).basePath).to.equal('/folder/file.ext?param=value');
    expect((new PushStateTree({
      basePath: '/folder/file.ext?param=value'
    })).basePath).to.equal('/folder/file.ext?param=value');
  });

  it('use the non relative root as basePath if not specified', function(){
    history.pushState(null, null, '/abc/123/');
    var pst = new PushStateTree();
    expect(pst.basePath).to.equal('/');
  });

  it('not share the basePath between route instances', function(){
    var pst1 = new PushStateTree({
      basePath: '1/'
    });
    var pst2 = new PushStateTree({
      basePath: '2/'
    });
    expect(pst1.basePath).to.equal('/1/');
    expect(pst2.basePath).to.equal('/2/');
  });

});
