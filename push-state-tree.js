//! push-state-tree - v0.12.0 - 2015-06-07
//* https://github.com/gartz/pushStateTree/
//* Copyright (c) 2015 Gabriel Reitz Giannattasio <gabriel@gartz.com.br>; Licensed 

var PushStateTree = {options: {VERSION: '0.12.0'}};
(function (root) {
  'use strict';

  var document = root.document;
  var window = root.window;
  var location = root.location;

  var isIE = (function(){
    var trident = window.navigator.userAgent.indexOf('Trident');
    return trident >= 0;
  }());

  // Shim, to work with older browsers
  (function () {
    // Opera and IE doesn't implement location.origin
    if (!root.location.origin) {
      root.location.origin = root.location.protocol + '//' + root.location.host;
    }
  })();

  (function () {
    /* global HTMLDocument */
    if (Function.prototype.bind) { return; }

    Function.prototype.bind = function (oThis) {
      if (typeof this !== 'function') {
        // closest thing possible to the ECMAScript 5 internal IsCallable function
        throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
      }

      var aArgs = Array.prototype.slice.call(arguments, 1),
        fToBind = this,
        FNOP = function () {},
        fBound = function () {
          var context = oThis;
          if (this instanceof FNOP && oThis){
            context = this;
          }
          return fToBind.apply(context, aArgs.concat(Array.prototype.slice.call(arguments)));
        };

      FNOP.prototype = this.prototype;
      fBound.prototype = new FNOP();

      return fBound;
    };
  })();

// IE9 shims
  var HashChangeEvent = root.HashChangeEvent;
  var Event = root.Event;

  (function () {
    if (!Element.prototype.addEventListener) { return; }

    function CustomEvent(event, params) {
      params = params || {
        bubbles: false,
        cancelable: false,
        detail: undefined
      };
      var evt = document.createEvent('CustomEvent');
      evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
      return evt;
    }

    CustomEvent.prototype = Event.prototype;

    if (!root.CustomEvent || !!isIE) {
      root.CustomEvent = CustomEvent;
    }

    // Opera before 15 has HashChangeEvent but throw a DOM Implement error
    if (!HashChangeEvent || (root.opera && root.opera.version() < 15) || !!isIE) {
      HashChangeEvent = root.CustomEvent;
    }

    if (!!isIE) {
      Event = CustomEvent;
    }

    // fix for Safari
    try {
      new HashChangeEvent('hashchange');
    } catch(e) {
      HashChangeEvent = CustomEvent;
    }

    try {
      new Event('popstate');
    } catch (e) {
      Event = CustomEvent;
    }
  })();

// IE 8 shims
  (function () {
    if (Element.prototype.addEventListener || !Object.defineProperty) { return; }

    // create an MS event object and get prototype
    var proto = document.createEventObject().constructor.prototype;

    Object.defineProperty(proto, 'target', {
      get: function() { return this.srcElement; }
    });

    // IE8 addEventLister shim
    var addEventListenerFunc = function(type, handler) {
      if (!this.__bindedFunctions) {
        this.__bindedFunctions = [];
      }

      var fn = handler;

      if (!('on' + type in this) || type === 'hashchange') {
        this.__elemetIEid = this.__elemetIEid || '__ie__' + Math.random();
        var customEventId = type + this.__elemetIEid;
        //TODO: Bug???
        //document.documentElement[customEventId];
        var element = this;

        var propHandler = function (event) {
          // if the property changed is the custom jqmReady property
          if (event.propertyName === customEventId) {
            fn.call(element, document.documentElement[customEventId]);
          }
        };

        this.__bindedFunctions.push({
          original: fn,
          binded: propHandler
        });

        document.documentElement.attachEvent('onpropertychange', propHandler);

        if (type !== 'hashchange') { return; }
      }

      var bindedFn = fn.bind(this);

      this.__bindedFunctions.push({
        original: fn,
        binded: bindedFn
      });

      this.attachEvent('on' + type, bindedFn);
    };

    // setup the DOM and window objects
    HTMLDocument.prototype.addEventListener = addEventListenerFunc;
    Element.prototype.addEventListener = addEventListenerFunc;
    window.addEventListener = addEventListenerFunc;

    // IE8 removeEventLister shim
    var removeEventListenerFunc = function(type, handler) {
      if (!this.__bindedFunctions) {
        this.__bindedFunctions = [];
      }

      var fn = handler;

      var bindedFn;

      if (!('on' + type in this) || type === 'hashchange') {
        for (var i = 0; i < this.__bindedFunctions.length; i++) {
          if (this.__bindedFunctions[i].original === fn) {
            bindedFn = this.__bindedFunctions[i].binded;
            this.__bindedFunctions = this.__bindedFunctions.splice(i, 1);
            i = this.__bindedFunctions.length;
          }
        }

        if (bindedFn) {
          document.documentElement.detachEvent('onpropertychange', bindedFn);
        }

        if (type !== 'hashchange') { return; }
      }

      for (var j = 0; j < this.__bindedFunctions.length; j++) {
        if (this.__bindedFunctions[j].original === fn) {
          bindedFn = this.__bindedFunctions[j].binded;
          this.__bindedFunctions = this.__bindedFunctions.splice(j, 1);
          j = this.__bindedFunctions.length;
        }
      }
      if (!bindedFn) { return; }

      this.detachEvent('on' + type, bindedFn);
    };

    // setup the DOM and window objects
    HTMLDocument.prototype.removeEventListener = removeEventListenerFunc;
    Element.prototype.removeEventListener = removeEventListenerFunc;
    window.removeEventListener = removeEventListenerFunc;

    Event = function (type, obj) {

      var evt = document.createEventObject();

      obj = obj || {};
      evt.type = type;
      evt.detail = obj.detail;

      if (!('on' + type in root) || type === 'hashchange') {
        evt.name = type;
        evt.customEvent = true;
      }

      return evt;
    };

    /*jshint -W020 */
    CustomEvent = Event;

    HashChangeEvent = CustomEvent;

    var dispatchEventFunc = function (e) {
      if (!e.customEvent) {
        this.fireEvent(e.type, e);
        return;
      }
      // no event registred
      if (!this.__elemetIEid) {
        return;
      }
      var customEventId = e.name + this.__elemetIEid;
      document.documentElement[customEventId] = e;
    };

    // setup the Element dispatchEvent used to trigger events on the board
    HTMLDocument.prototype.dispatchEvent = dispatchEventFunc;
    Element.prototype.dispatchEvent = dispatchEventFunc;
    window.dispatchEvent = dispatchEventFunc;
  })();

  (function () {
    // modern browser support forEach, probably will be IE8
    var modernBrowser = 'forEach' in Array.prototype;

    // IE8 pollyfills:
    // IE8 slice doesn't work with NodeList
    if (!modernBrowser) {
      var builtinSlice = Array.prototype.slice;
      Array.prototype.slice = function() {
        var arr = [];
        for (var i = 0, n = this.length; i < n; i++) {
          if (i in this) {
            arr.push(this[i]);
          }
        }

        return builtinSlice.apply(arr, arguments);
      };
    }
    if (!('forEach' in Array.prototype)) {
      Array.prototype.forEach = function(action, that) {
        for (var i = 0; i < this.length; i++) {
          if (i in this) {
            action.call(that, this[i], i);
          }
        }
      };
    }
    if (typeof String.prototype.trim !== 'function') {
      String.prototype.trim = function() {
        return this.replace(/^\s+|\s+$/g, '');
      };
    }
    if (!Array.prototype.filter) {
      Array.prototype.filter = function(fun /*, thisArg */) {
        if (this === void 0 || this === null) {
          throw new TypeError();
        }

        var t = Object(this);
        var len = t.length >>> 0;
        if (typeof fun !== 'function') {
          throw new TypeError();
        }

        var res = [];
        var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
        for (var i = 0; i < len; i++) {
          if (i in t) {
            var val = t[i];

            // NOTE: Technically this should Object.defineProperty at
            //       the next index, as push can be affected by
            //       properties on Object.prototype and Array.prototype.
            //       But that method's new, and collisions should be
            //       rare, so use the more-compatible alternative.
            if (fun.call(thisArg, val, i, t)) { res.push(val); }
          }
        }

        return res;
      };
    }
  })();

  // Constants for uglifiers

  var USE_PUSH_STATE = 'usePushState';
  var HASHCHANGE = 'hashchange';
  var POPSTATE = 'popstate';
  var LEAVE = 'leave';
  var UPDATE = 'update';
  var ENTER = 'enter';
  var CHANGE = 'change';
  var MATCH = 'match';
  var OLD_MATCH = 'oldMatch';

  var options = root.PushStateTree && root.PushStateTree.options || {};
  var DEBUG = root.DEBUG || options.DEBUG;
  var VERSION = options.VERSION || 'development';

  // Helpers
  function isInt(n) {
    return !isNaN(parseFloat(n)) && n % 1 === 0 && isFinite(n);
  }

  function wrapProperty(scope, prop, target) {
    Object.defineProperty(scope, prop, {
      get: function () {
        return target;
      },
      set: function () {}
    });
  }

  function isExternal(url) {
    // Check if a URL is external
    return (/^[a-z0-9]+:\/\//i).test(url);
  }

  function isRelative(uri) {
    // Check if a URI is relative path, when begin with # or / isn't relative uri
    return (/^[^#/]/).test(uri);
  }

  //TODO: the container reference must be configurable to work with web components
  var rootElement = document.createElement('pushstatetree-route');
  var ready = false;

  function PushStateTree(options) {
    options = options || {};

    this.VERSION = VERSION;

    if (ready) {
      // Setup options
      for (var prop in options) {
        if (options.hasOwnProperty(prop)) {
          rootElement[prop] = options[prop];
        }
      }

      return rootElement;
    }
    ready = true;

    // Allow switch between pushState or hash navigation modes, in browser that doesn't support
    // pushState it will always be false. and use hash navigation enforced.
    // use backend non permanent redirect when old browsers are detected in the request.
    if (!PushStateTree.prototype.hasPushState) {
      wrapProperty(rootElement, USE_PUSH_STATE, false);
    } else {
      Object.defineProperty(rootElement, USE_PUSH_STATE, {
        get: function () {
          return PushStateTree.prototype[USE_PUSH_STATE];
        },
        set: function (val) {
          PushStateTree.prototype[USE_PUSH_STATE] = val !== false;
        }
      });
      PushStateTree.prototype[USE_PUSH_STATE] = options[USE_PUSH_STATE] !== false;
    }

    // When enabled beautifyLocation will auto switch between hash to pushState when enabled
    Object.defineProperty(rootElement, 'beautifyLocation', {
      get: function () {
        return !!PushStateTree.prototype.beautifyLocation;
      },
      set: function (val) {
        PushStateTree.prototype.beautifyLocation = !!val;
      }
    });

    var basePath;
    Object.defineProperty(rootElement, 'basePath', {
      get: function () {
        return basePath;
      },
      set: function (val) {
        val = val || '';
        basePath = val.match(/^(\/)?((.*?)\/?)(\/*)$/)[3] + '/';
        if (basePath.length > 1) basePath = '/' + basePath;
      }
    });

    function wrappMethodsAndPropertiesToPrototype(prop) {
      if (typeof PushStateTree.prototype[prop] === 'function') {
        // function wrapper
        rootElement[prop] = function () {
          return PushStateTree.prototype[prop].apply(this, arguments);
        };
      } else {
        if (typeof rootElement[prop] !== 'undefined') return;
        // property wrapper
        Object.defineProperty(rootElement, prop, {
          get: function () {
            return PushStateTree.prototype[prop];
          },
          set: function (val) {
            PushStateTree.prototype[prop] = val;
          }
        });
      }
    }

    //TODO: emcapsulate this
    for (var protoProperty in PushStateTree.prototype) {
      if (PushStateTree.prototype.hasOwnProperty(protoProperty)) {
        wrappMethodsAndPropertiesToPrototype(protoProperty);
      }
    }

    wrapProperty(rootElement, 'length', root.history.length);
    wrapProperty(rootElement, 'state', root.history.state);

    var cachedUri = {
      url: '',
      uri: ''
    };
    Object.defineProperty(rootElement, 'uri', {
      get: function () {
        if (cachedUri.url === root.location.href) return cachedUri.uri;

        var uri;
        if (root.location.hash.length || root.location.href[location.href.length - 1] === '#') {
          // Remove all begin # chars from the location when using hash
          uri = root.location.hash.match(/^(#*)?(.*\/?)/)[2];

          if (rootElement.beautifyLocation && rootElement.usePushState) {
            // when using pushState, replace the browser location to avoid ugly URLs
            rootElement.replaceState(
              rootElement.state,
              rootElement.title,
              uri[0] === '/' ? uri : '/' + uri
            );
          }
        } else {
          uri = root.location.pathname + root.location.search;
          if (uri.indexOf(this.basePath) === 0) {
            uri = uri.slice(this.basePath.length);
          }
        }

        // Remove the very first slash, do don't match it as URI
        uri = uri.replace(/^[\/]+/, '');

        if (rootElement.getAttribute('uri') !== uri) {
          rootElement.setAttribute('uri', uri);
        }

        cachedUri.url = root.location.href;
        cachedUri.uri = uri;
        return uri;
      },
      configurable: true
    });

    rootElement.eventStack = {
      leave: [],
      change: [],
      enter: [],
      match: []
    };

    root.addEventListener(POPSTATE, function () {
      var eventURI = rootElement.uri;
      var eventState = rootElement.state;
      rootElement.rulesDispatcher();

      oldURI = eventURI;
      oldState = eventState;

      // If there is holding dispatch in the event, do it now
      if (holdingDispatch) {
        this.dispatch();
      }
    }.bind(rootElement));

    root.addEventListener(HASHCHANGE, onhashchange);

    // Uglify propourses
    var dispatchHashChange = function () {
      root.dispatchEvent(new HashChangeEvent(HASHCHANGE));
    };

    // Modern browsers
    document.addEventListener('DOMContentLoaded', dispatchHashChange);
    // Some IE browsers
    root.addEventListener('readystatechange', dispatchHashChange);
    // Almost all browsers
    root.addEventListener('load', function () {
      dispatchHashChange();

      if (isIE) {
        root.setInterval(function () {
          if (rootElement.uri !== oldURI) {
            dispatchHashChange();
            return;
          }
          if (readOnhashchange) {
            readOnhashchange = false;
            oldURI = rootElement.uri;
            root.addEventListener(HASHCHANGE, onhashchange);
          }
        }.bind(rootElement), 50);
      }
    }.bind(rootElement));

    return new PushStateTree(options);
  }

  var oldState = null;
  var oldURI = null;
  var eventsQueue = [];
  var holdingDispatch = false;
  var holdDispatch = false;

  PushStateTree.prototype = {
    // Version ~0.11 beatifyLocation is enabled by default
    beautifyLocation: true,

    createRule: function (options) {
      // Create a pushstreamtree-rule element from a literal object

      var rule = document.createElement('pushstatetree-rule');

      var ruleRegex = new RegExp('');

      // Bind rule property with element attribute
      Object.defineProperty(rule, 'rule', {
        get: function () {
          return ruleRegex;
        },
        set: function (val) {
          if (val instanceof RegExp){
            ruleRegex = val;
          } else {

            // IE8 trigger set from the property when update the attribute, avoid recursive loop
            if (val === ruleRegex.toString()) return;

            // Slice the pattern from the attribute
            var slicedPattern = (val + '').match(/^\/(.+)\/([gmi]*)|(.*)/);

            ruleRegex = new RegExp(slicedPattern[1] || slicedPattern[3], slicedPattern[2]);
          }

          rule.setAttribute('rule', ruleRegex.toString());
        }
      });

      // Bind rule property with element attribute
      Object.defineProperty(rule, 'parentGroup', {
        get: function () {
          var attr = rule.getAttribute('parent-group');
          if (attr && isInt(attr)) {
            return + attr;
          }
          return null;
        },
        set: function (val) {
          if (isInt(val)) {
            rule.setAttribute('parent-group', val);
          } else {
            rule.removeAttribute('parent-group');
          }
        }
      });

      for (var prop in options)
        if (options.hasOwnProperty(prop)) {
          rule[prop] = options[prop];
        }

      // Match is always a array, so you can test for match[n] anytime
      var match = [];
      Object.defineProperty(rule, MATCH, {
        get: function () {
          return match;
        },
        set: function (val) {
          match = val instanceof Array ? val : [];
        },
      });

      var oldMatch = [];
      Object.defineProperty(rule, OLD_MATCH, {
        get: function () {
          return oldMatch;
        },
        set: function (val) {
          oldMatch = val instanceof Array ? val : [];
        },
      });

      rule[MATCH] = [];
      rule[OLD_MATCH] = [];

      // Replicate the methods from `route` to the rule, by transversing until find and execute
      // the router method, not a fast operation, but ensure the right route to be triggered
      [
        'assign',
        'navigate',
        'replace',
        'dispatch',
        'pushState',
        'replaceState'
      ].forEach(function(methodName){
        rule[methodName] = function(){
          this.parentElement[methodName].apply(this.parentElement, arguments);
        };
      });

      return rule;
    },

    add: function (options) {
      // Transform any literal object in a pushstatetree-rule and append it

      this.appendChild(this.createRule(options));
      return this;
    },

    remove: function (queryOrElement) {
      // Remove a pushstateree-rule, pass a element or it query

      var element = queryOrElement;
      if (typeof queryOrElement === 'string') {
        element = this.querySelector(queryOrElement);
      }

      if (element && element.parentElement) {
        element.parentElement.removeChild(element);
        return element;
      }
    },

    dispatch: function () {
      // Deferred trigger the actual browser location
      if (holdDispatch) {
        holdingDispatch = true;
        return this;
      }
      holdingDispatch = false;
      root.dispatchEvent(new Event(POPSTATE));
      return this;
    },

    assign: function (url) {
      // Shortcut for pushState and dispatch methods
      return this.pushState(null, null, url).dispatch();
    },

    replace: function (url) {
      // Shortcut for pushState and dispatch methods
      return this.replaceState(null, null, url).dispatch();
    },

    navigate: function(){
      this.assign.apply(this, arguments);
    },

    rulesDispatcher: function () {
      // Will dispatch the right events in each rule
      /*jshint validthis:true */

      // Cache the URI, in case of an event try to change it
      var debug = this.debug === true || DEBUG;

      function runner(uri, oldURI) {
        Array.prototype.slice.call(this.children || this.childNodes)
          .forEach(recursiveDispatcher.bind(this, uri, oldURI));
        return uri;
      }

      eventsQueue.push(runner.bind(this, this.uri));

      // Is there already a queue been executed, so just add the runner
      // and let the main queue resolve it
      if (eventsQueue.length > 1) { return; }

      // Chain execute the evetsQueue
      var last = oldURI;
      while (eventsQueue.length > 0) {
        last = eventsQueue[0].call(null, last);
        eventsQueue.shift();
      }

      // If a dispatch is triggered inside a event callback, it need to hold
      holdDispatch = true;

      // A stack of all events to be dispatched, to ensure the priority order
      var eventStack = this.eventStack;

      // Order of events stack execution, leave event isn't here because it executes in the
      // recursiveDispatcher, for one loop less
      [CHANGE, ENTER, MATCH].forEach(function(type){
        // Execute the leave stack of events
        while (eventStack[type].length > 0) {
          var events = eventStack[type][0].events;
          var element = eventStack[type][0].element;

          //TODO: Ignore if there isn't same in the enter stack and remove it
          while (events.length > 0){
            element.dispatchEvent(events[0]);
            events.shift();
          }
          eventStack[type].shift();
        }
      });

      // If there is holding dispatchs in the event, do it now
      holdDispatch = false;

      function recursiveDispatcher(uri, oldURI, ruleElement) {
        if (!ruleElement.rule) return;

        var useURI = uri;
        var useOldURI = oldURI;
        var parentElement;

        if (typeof ruleElement.parentGroup === 'number') {
          useURI = '';
          parentElement = ruleElement.parentElement;

          if (parentElement[MATCH].length > ruleElement.parentGroup)
            useURI = parentElement[MATCH][ruleElement.parentGroup] || '';

          useOldURI = '';
          if (parentElement[OLD_MATCH].length > ruleElement.parentGroup)
            useOldURI = parentElement[OLD_MATCH][ruleElement.parentGroup] || '';
        }

        ruleElement[MATCH] = useURI[MATCH](ruleElement.rule);
        if (typeof useOldURI === 'string') {
          ruleElement[OLD_MATCH] = useOldURI[MATCH](ruleElement.rule);
        } else {
          ruleElement[OLD_MATCH] = [];
        }
        var match = ruleElement[MATCH];
        var oldMatch = ruleElement[OLD_MATCH];
        var children = Array.prototype.slice.call(ruleElement.children);

        function PushStateTreeEvent(name, params) {

          params = params || {};
          params.detail = params.detail || {};
          params.detail[MATCH] = match || [];
          params.detail[OLD_MATCH] = oldMatch || [];
          params.cancelable = true;

          if (debug && console){
            console.log({
              name: name,
              ruleElement: ruleElement,
              params: params,
              useURI: useURI,
              useOldURI: useOldURI
            });
            if (console.trace) console.trace();
          }
          var event = new root.CustomEvent(name, params);
          return event;
        }

        // Not match or leave?
        if (match.length === 0) {
          if (oldMatch.length === 0 || ruleElement.routerURI !== oldURI) {
            // just not match...
            return;
          }
          ruleElement.uri = null;
          ruleElement.removeAttribute('uri');

          children.forEach(recursiveDispatcher.bind(this, uri, oldURI));

          // Don't use stack for LEAVE event, dispatch in this loop
          ruleElement.dispatchEvent(new PushStateTreeEvent(UPDATE, {
            detail: {type: LEAVE}
          }));

          ruleElement.dispatchEvent(new PushStateTreeEvent(LEAVE));
          return;
        }

        // dispatch the match event
        this.eventStack[MATCH].push({
          element: ruleElement,
          events: [
            new PushStateTreeEvent(MATCH)
          ]
        });

        var isNewURI = ruleElement.routerURI !== oldURI;
        ruleElement.routerURI = this.uri;
        ruleElement.uri = match[0];
        ruleElement.setAttribute('uri', match[0]);

        if (oldMatch.length === 0 || isNewURI) {
          // stack dispatch enter event
          this.eventStack[ENTER].push({
            element: ruleElement,
            events: [
              new PushStateTreeEvent(UPDATE, {
                detail: {type: ENTER}
              }),
              new PushStateTreeEvent(ENTER)
            ]
          });

          children.forEach(recursiveDispatcher.bind(this, uri, oldURI));
          return;
        }

        // if has something changed, dispatch the change event
        if (match[0] !== oldMatch[0]) {
          // stack dispatch enter event
          this.eventStack[CHANGE].push({
            element: ruleElement,
            events: [
              new PushStateTreeEvent(UPDATE, {
                detail: {type: CHANGE}
              }),
              new PushStateTreeEvent(CHANGE)
            ]
          });
        }

        children.forEach(recursiveDispatcher.bind(this, uri, oldURI));
      }
    }
  };

  function preProcessUriBeforeExecuteNativeHistoryMethods(method) {
    /*jshint validthis:true */
    var scopeMethod = method;
    this[method] = function () {
      // Wrap method

      // remove the method from arguments
      var args = Array.prototype.slice.call(arguments);

      // if has a basePath translate the not relative paths to use the basePath
      if (scopeMethod === 'pushState' || scopeMethod === 'replaceState') {

        if (!isExternal(args[2])) {
          // When not external link, need to normalize the URI

          if (isRelative(args[2])) {
            // Relative to the oldURI
            var basePath = this.uri.match(/^(.*)\//);
            basePath = basePath ? basePath[1] + '/' : '';
            args[2] = basePath + args[2];
          } else {
            // This isn't relative, will cleanup / and # from the begin and use the remain path
            args[2] = args[2].match(/^([#/]*)?(.*)/)[2];
          }

          if (!this[USE_PUSH_STATE]) {

            // Don't use basePath in the location hash mode
            args[2] = '#' + args[2];
          } else {

            // Add the basePath to your uri
            args[2] = this.basePath + args[2];
          }
        }
      }

      root.history[scopeMethod].apply(root.history, args);

      // Chainnable
      return this;
    };
  }

  // Wrap history methods
  for (var method in root.history) {
    if (typeof root.history[method] === 'function') {
      preProcessUriBeforeExecuteNativeHistoryMethods.call(PushStateTree.prototype, method);
    }
  }

  var readOnhashchange = false;
  var onhashchange = function () {
    // Workaround IE8
    if (readOnhashchange) return;

    // Don't dispatch, because already have dispatched in popstate event
    if (oldURI === rootElement.uri) return;

    var eventURI = rootElement.uri;
    var eventState = rootElement.state;
    rootElement.rulesDispatcher();

    oldURI = eventURI;
    oldState = eventState;

    // If there is holding dispatch in the event, do it now
    if (holdingDispatch) {
      this.dispatch();
    }
  }.bind(rootElement);

  function avoidTriggering() {
    // Avoid triggering hashchange event
    root.removeEventListener(HASHCHANGE, onhashchange);
    readOnhashchange = true;
  }

  PushStateTree.prototype.hasPushState = root.history && !!root.history.pushState;
  if (!PushStateTree.prototype.hasPushState) {
    PushStateTree.prototype[USE_PUSH_STATE] = false;
  }

  var lastTitle = null;

  if (!PushStateTree.prototype.pushState) {
    PushStateTree.prototype.pushState = function(state, title, uri) {
      var t = document.title || '';
      uri = uri || '';
      if (lastTitle !== null) {
        document.title = lastTitle;
      }
      avoidTriggering();

      // Replace hash url
      if (isExternal(uri)) {
        // this will redirect the browser, so doesn't matters the rest...
        root.location.href = uri;
      }

      // Remove the has if is it present
      if (uri[0] === '#') {
        uri = uri.slice(1);
      }

      if (isRelative(uri)) {
        uri = root.location.hash.slice(1, root.location.hash.lastIndexOf('/') + 1) + uri;
      }

      root.location.hash = uri;

      document.title = t;
      lastTitle = title;

      return this;
    };
  }

  if (!PushStateTree.prototype.replaceState) {
    PushStateTree.prototype.replaceState = function(state, title, uri) {
      var t = document.title || '';
      uri = uri || '';
      if (lastTitle !== null) {
        document.title = lastTitle;
      }
      avoidTriggering();

      // Replace the url
      if (isExternal(uri)) {
        throw new Error('Invalid url replace.');
      }

      if (uri[0] === '#') {
        uri = uri.slice(1);
      }

      if (isRelative(uri)) {
        var relativePos = root.location.hash.lastIndexOf('/') + 1;
        uri = root.location.hash.slice(1, relativePos) + uri;
      }

      // Always use hash navigation
      uri = '#' + uri;

      root.location.replace(uri);
      document.title = t;
      lastTitle = title;

      return this;
    };
  }

  root.PushStateTree = PushStateTree;

  // Node import support
  if(typeof module !== 'undefined') module.exports = PushStateTree;
})((function(){
  /*jshint strict: false */
  return this;
}()));