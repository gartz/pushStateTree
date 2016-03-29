var PushStateTree = require('../src/pushStateTree');

describe('PushStateTree should', function() {
  'use strict';

  var events = {
    popstate: [],
    hashchange: [],
    DOMContentLoaded: [],
    readystatechange: [],
    load: []
  };

  beforeAll(function(){
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

  it('be available on global scope', function() {
    expect(PushStateTree).toBeDefined();
  });

  it('instances without "new" operator', function() {
    /* jshint newcap: false*/
    expect(PushStateTree()).to.equal(jasmine.any(HTMLElement));
  });

  it('construct and became a HTMLElement instance', function(){
    expect(new PushStateTree()).to.equal(jasmine.any(HTMLElement));
    expect(new PushStateTree({})).to.equal(jasmine.any(HTMLElement));
  });

  it('auto enable push state if browser support it', function(){
    var pst = new PushStateTree();
    expect(pst.usePushState).toBeTruthy();
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

  it('get the current URI', function(){
    var pst = new PushStateTree();
    expect(pst.uri).to.equal(location.pathname.slice(1));
  });

});
