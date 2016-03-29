var PushStateTree = require('../src/pushStateTree');

describe('PushStateTree methods should', function() {
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

  it('have the methods: pushState, replaceState, dispatch, assign, replace, navigate', function() {
    var pst = new PushStateTree();
    var methods = [];
    for (var method in pst) {
      if (typeof pst[method] === 'function') {
        methods.push(method);
      }
    }

    // Methods that should exist:
    [
      'pushState',
      'replaceState',
      'dispatch',
      'assign',
      'replace',
      'navigate'
    ].forEach(function(method){
      expect(methods).to.contain(method);
    });
  });

});
