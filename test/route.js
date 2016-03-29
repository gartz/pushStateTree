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

  it('be available on global scope', function() {
    expect(PushStateTree).to.be.defined;
  });

  it('instances without "new" operator', function() {
    /* jshint newcap: false*/
    expect(PushStateTree()).to.be.instanceof(HTMLElement);
  });

  it('construct and became a HTMLElement instance', function(){
    expect(new PushStateTree()).to.be.instanceof(HTMLElement);
    expect(new PushStateTree({})).to.be.instanceof(HTMLElement);
  });

  it('auto enable push state if browser support it', function(){
    var pst = new PushStateTree();
    expect(pst.usePushState).to.be.true;
  });

  it('allow to disable push state if it constructor has a false option', function(){
    var pst = new PushStateTree({
      usePushState: false
    });
    expect(pst.usePushState).to.be.false;
  });

  it('allow to enable push state if it constructor has a true option', function(){
    var pst = new PushStateTree({
      usePushState: true
    });
    expect(pst.usePushState).to.be.true;
  });

  it('usePushState be true by default', function(){
    var pst = new PushStateTree();
    expect(pst.usePushState).to.be.true;
  });

  it('allow to change the usePushState flag after start running', function(){
    var pst = new PushStateTree();
    pst.usePushState = false;
    expect(pst.usePushState).to.be.false;
    pst.usePushState = true;
    expect(pst.usePushState).to.be.true;
  });

  it('usePushState change for each instance', function(){
    var pst1 = new PushStateTree({
      usePushState: false
    });
    var pst2 = new PushStateTree();
    expect(pst1.usePushState).to.be.false;
    expect(pst2.usePushState).to.be.true;
  });

  it('get the current URI', function(){
    var pst = new PushStateTree();
    expect(pst.uri).to.equal(location.pathname.slice(1));
  });

});
