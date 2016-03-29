/*!
 * ! PushStateTree - v0.15.0 - 2016-03-29
 * * https://github.com/gartz/pushStateTree/
 * * Copyright (c) 2016 Gabriel Reitz Giannattasio <gabriel@gartz.com.br>; Licensed undefined
 */
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {'use strict';

	var _typeof2 = __webpack_require__(1);

	var _typeof3 = _interopRequireDefault(_typeof2);

	var _defineProperty = __webpack_require__(33);

	var _defineProperty2 = _interopRequireDefault(_defineProperty);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var root = typeof window !== 'undefined' && window || global;
	var document = root.document;
	var location = root.location;

	var isIE = function () {
	  var trident = window.navigator.userAgent.indexOf('Trident');
	  return trident >= 0;
	}();

	// Shim, to work with older browsers
	(function () {
	  // Opera and IE doesn't implement location.origin
	  if (!root.location.origin) {
	    root.location.origin = root.location.protocol + '//' + root.location.host;
	  }
	})();

	(function () {
	  /* global HTMLDocument */
	  if (Function.prototype.bind) {
	    return;
	  }

	  Function.prototype.bind = function (oThis) {
	    if (typeof this !== 'function') {
	      // closest thing possible to the ECMAScript 5 internal IsCallable function
	      throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
	    }

	    var aArgs = Array.prototype.slice.call(arguments, 1),
	        fToBind = this,
	        FNOP = function FNOP() {},
	        fBound = function fBound() {
	      var context = oThis;
	      if (this instanceof FNOP && oThis) {
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
	  if (!Element.prototype.addEventListener) {
	    return;
	  }

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
	  if (!HashChangeEvent || root.opera && root.opera.version() < 15 || !!isIE) {
	    HashChangeEvent = root.CustomEvent;
	  }

	  if (!!isIE) {
	    Event = CustomEvent;
	  }

	  // fix for Safari
	  try {
	    new HashChangeEvent('hashchange');
	  } catch (e) {
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
	  if (Element.prototype.addEventListener || !_defineProperty2.default) {
	    return;
	  }

	  // create an MS event object and get prototype
	  var proto = document.createEventObject().constructor.prototype;

	  Object.defineProperty(proto, 'target', {
	    get: function get() {
	      return this.srcElement;
	    }
	  });

	  // IE8 addEventLister shim
	  var addEventListenerFunc = function addEventListenerFunc(type, handler) {
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

	      var propHandler = function propHandler(event) {
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

	      if (type !== 'hashchange') {
	        return;
	      }
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
	  var removeEventListenerFunc = function removeEventListenerFunc(type, handler) {
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

	      if (type !== 'hashchange') {
	        return;
	      }
	    }

	    for (var j = 0; j < this.__bindedFunctions.length; j++) {
	      if (this.__bindedFunctions[j].original === fn) {
	        bindedFn = this.__bindedFunctions[j].binded;
	        this.__bindedFunctions = this.__bindedFunctions.splice(j, 1);
	        j = this.__bindedFunctions.length;
	      }
	    }
	    if (!bindedFn) {
	      return;
	    }

	    this.detachEvent('on' + type, bindedFn);
	  };

	  // setup the DOM and window objects
	  HTMLDocument.prototype.removeEventListener = removeEventListenerFunc;
	  Element.prototype.removeEventListener = removeEventListenerFunc;
	  window.removeEventListener = removeEventListenerFunc;

	  Event = function Event(type, obj) {

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

	  var dispatchEventFunc = function dispatchEventFunc(e) {
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
	    Array.prototype.slice = function () {
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
	    Array.prototype.forEach = function (action, that) {
	      for (var i = 0; i < this.length; i++) {
	        if (i in this) {
	          action.call(that, this[i], i);
	        }
	      }
	    };
	  }
	  if (typeof String.prototype.trim !== 'function') {
	    String.prototype.trim = function () {
	      return this.replace(/^\s+|\s+$/g, '');
	    };
	  }
	  if (!Array.prototype.filter) {
	    Array.prototype.filter = function (fun /*, thisArg */) {
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
	          if (fun.call(thisArg, val, i, t)) {
	            res.push(val);
	          }
	        }
	      }

	      return res;
	    };
	  }
	})();

	// Constants for uglifiers

	var USE_PUSH_STATE = 'usePushState';
	var HAS_PUSH_STATE = 'hasPushState';
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

	// Helpers
	function isInt(n) {
	  return !isNaN(parseFloat(n)) && n % 1 === 0 && isFinite(n);
	}

	function wrapProperty(scope, prop, target) {
	  (0, _defineProperty2.default)(scope, prop, {
	    get: function get() {
	      return target;
	    },
	    set: function set() {}
	  });
	}

	function isExternal(url) {
	  // Check if a URL is external
	  return (/^[a-z0-9]+:\/\//i.test(url)
	  );
	}

	function isRelative(uri) {
	  // Check if a URI is relative path, when begin with # or / isn't relative uri
	  return (/^[^#/]/.test(uri)
	  );
	}

	function resolveRelativePath(path) {
	  // Resolve relative paths manually for browsers using hash navigation

	  var parts = path.split('/');
	  var i = 1;
	  while (i < parts.length) {
	    // if current part is `..` and previous part is different, remove both of them
	    if (parts[i] === '..' && i > 0 && parts[i - 1] !== '..') {
	      parts.splice(i - 1, 2);
	      i -= 2;
	    }
	    i++;
	  }
	  return parts.join('/').replace(/\/\.\/|\.\/|\.\.\//g, '/').replace(/^\/$/, '');
	}

	// Add compatibility with old IE browsers
	var elementPrototype = typeof HTMLElement !== 'undefined' ? HTMLElement : Element;

	function PushStateTree(options) {
	  options = options || {};
	  options[USE_PUSH_STATE] = options[USE_PUSH_STATE] !== false;

	  // Force the instance to always return a HTMLElement
	  if (!(this instanceof elementPrototype)) {
	    return PushStateTree.apply(document.createElement('pushstatetree-route'), arguments);
	  }

	  var rootElement = this;
	  this.VERSION = ("0.15.0");

	  // Setup options
	  for (var prop in options) {
	    if (options.hasOwnProperty(prop)) {
	      rootElement[prop] = options[prop];
	    }
	  }

	  // Allow switch between pushState or hash navigation modes, in browser that doesn't support
	  // pushState it will always be false. and use hash navigation enforced.
	  // use backend non permanent redirect when old browsers are detected in the request.
	  if (!PushStateTree.prototype[HAS_PUSH_STATE]) {
	    wrapProperty(rootElement, USE_PUSH_STATE, false);
	  } else {
	    var usePushState = options[USE_PUSH_STATE];
	    (0, _defineProperty2.default)(rootElement, USE_PUSH_STATE, {
	      get: function get() {
	        return usePushState;
	      },
	      set: function set(val) {
	        usePushState = val !== false;
	      }
	    });
	  }

	  // When enabled beautifyLocation will auto switch between hash to pushState when enabled
	  Object.defineProperty(rootElement, 'beautifyLocation', {
	    get: function get() {
	      return PushStateTree.prototype.beautifyLocation && usePushState;
	    },
	    set: function set(value) {
	      PushStateTree.prototype.beautifyLocation = value === true;
	    }
	  });
	  rootElement.beautifyLocation = options.beautifyLocation && rootElement.usePushState;

	  var basePath;
	  Object.defineProperty(rootElement, 'basePath', {
	    get: function get() {
	      return basePath;
	    },
	    set: function set(value) {
	      basePath = value || '';
	      if (basePath[0] !== '/') {
	        basePath = '/' + basePath;
	      }
	    }
	  });
	  rootElement.basePath = options.basePath;

	  function wrappMethodsAndPropertiesToPrototype(prop) {
	    if (typeof PushStateTree.prototype[prop] === 'function') {
	      // function wrapper
	      rootElement[prop] = function () {
	        return PushStateTree.prototype[prop].apply(this, arguments);
	      };
	    } else {
	      if (typeof rootElement[prop] !== 'undefined') return;
	      // property wrapper
	      (0, _defineProperty2.default)(rootElement, prop, {
	        get: function get() {
	          return PushStateTree.prototype[prop];
	        },
	        set: function set(val) {
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
	    get: function get() {
	      if (cachedUri.url === root.location.href) return cachedUri.uri;

	      var uri;
	      if (root.location.hash.length || root.location.href[location.href.length - 1] === '#') {
	        // Remove all begin # chars from the location when using hash
	        uri = root.location.hash.match(/^(#*)?(.*\/?)/)[2];

	        var usePushState = rootElement[USE_PUSH_STATE];
	        if (rootElement.beautifyLocation && rootElement.isPathValid && usePushState) {
	          // when using pushState, replace the browser location to avoid ugly URLs

	          rootElement.replaceState(rootElement.state, rootElement.title, uri[0] === '/' ? uri : '/' + uri);
	        }
	      } else {
	        uri = root.location.pathname + root.location.search;
	        if (this.isPathValid) {
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

	  Object.defineProperty(rootElement, 'isPathValid', {
	    get: function get() {
	      var uri = root.location.pathname + root.location.search;
	      return !this.basePath || uri.indexOf(this.basePath) === 0;
	    }
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

	  rootElement.avoidHashchangeHandler = function () {
	    // Avoid triggering hashchange event
	    root.removeEventListener(HASHCHANGE, onhashchange);
	    readOnhashchange = true;
	  };

	  root.addEventListener(HASHCHANGE, onhashchange);

	  // Uglify propourses
	  var dispatchHashChange = function dispatchHashChange() {
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

	  return this;
	}

	var oldState = null;
	var oldURI = null;
	var eventsQueue = [];
	var holdingDispatch = false;
	var holdDispatch = false;

	PushStateTree.prototype = {
	  // Version ~0.11 beatifyLocation is enabled by default
	  beautifyLocation: true,

	  createRule: function createRule(options) {
	    // Create a pushstreamtree-rule element from a literal object

	    var rule = document.createElement('pushstatetree-rule');

	    var ruleRegex = new RegExp('');

	    // Bind rule property with element attribute
	    Object.defineProperty(rule, 'rule', {
	      get: function get() {
	        return ruleRegex;
	      },
	      set: function set(val) {
	        if (val instanceof RegExp) {
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
	      get: function get() {
	        var attr = rule.getAttribute('parent-group');
	        if (attr && isInt(attr)) {
	          return +attr;
	        }
	        return null;
	      },
	      set: function set(val) {
	        if (isInt(val)) {
	          rule.setAttribute('parent-group', val);
	        } else {
	          rule.removeAttribute('parent-group');
	        }
	      }
	    });

	    for (var prop in options) {
	      if (options.hasOwnProperty(prop)) {
	        rule[prop] = options[prop];
	      }
	    } // Match is always a array, so you can test for match[n] anytime
	    var match = [];
	    (0, _defineProperty2.default)(rule, MATCH, {
	      get: function get() {
	        return match;
	      },
	      set: function set(val) {
	        match = val instanceof Array ? val : [];
	      }
	    });

	    var oldMatch = [];
	    (0, _defineProperty2.default)(rule, OLD_MATCH, {
	      get: function get() {
	        return oldMatch;
	      },
	      set: function set(val) {
	        oldMatch = val instanceof Array ? val : [];
	      }
	    });

	    rule[MATCH] = [];
	    rule[OLD_MATCH] = [];

	    // Replicate the methods from `route` to the rule, by transversing until find and execute
	    // the router method, not a fast operation, but ensure the right route to be triggered
	    ['assign', 'navigate', 'replace', 'dispatch', 'pushState', 'replaceState'].forEach(function (methodName) {
	      rule[methodName] = function () {
	        this.parentElement[methodName].apply(this.parentElement, arguments);
	      };
	    });

	    return rule;
	  },

	  add: function add(options) {
	    // Transform any literal object in a pushstatetree-rule and append it

	    this.appendChild(this.createRule(options));
	    return this;
	  },

	  remove: function remove(queryOrElement) {
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

	  dispatch: function dispatch() {
	    // Deferred trigger the actual browser location
	    if (holdDispatch) {
	      holdingDispatch = true;
	      return this;
	    }
	    holdingDispatch = false;
	    root.dispatchEvent(new Event(POPSTATE));
	    return this;
	  },

	  assign: function assign(url) {
	    // Shortcut for pushState and dispatch methods
	    return this.pushState(null, null, url).dispatch();
	  },

	  replace: function replace(url) {
	    // Shortcut for pushState and dispatch methods
	    return this.replaceState(null, null, url).dispatch();
	  },

	  navigate: function navigate() {
	    this.assign.apply(this, arguments);
	  },

	  rulesDispatcher: function rulesDispatcher() {
	    // Will dispatch the right events in each rule
	    /*jshint validthis:true */

	    // Cache the URI, in case of an event try to change it
	    var debug = this.debug === true || DEBUG;

	    // Abort if the basePath isn't valid for this router
	    if (!this.isPathValid) return;

	    function runner(uri, oldURI) {
	      Array.prototype.slice.call(this.children || this.childNodes).forEach(recursiveDispatcher.bind(this, uri, oldURI));
	      return uri;
	    }

	    eventsQueue.push(runner.bind(this, this.uri));

	    // Is there already a queue been executed, so just add the runner
	    // and let the main queue resolve it
	    if (eventsQueue.length > 1) {
	      return;
	    }

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
	    [CHANGE, ENTER, MATCH].forEach(function (type) {
	      // Execute the leave stack of events
	      while (eventStack[type].length > 0) {
	        var events = eventStack[type][0].events;
	        var element = eventStack[type][0].element;

	        //TODO: Ignore if there isn't same in the enter stack and remove it
	        while (events.length > 0) {
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

	        if (parentElement[MATCH].length > ruleElement.parentGroup) useURI = parentElement[MATCH][ruleElement.parentGroup] || '';

	        useOldURI = '';
	        if (parentElement[OLD_MATCH].length > ruleElement.parentGroup) useOldURI = parentElement[OLD_MATCH][ruleElement.parentGroup] || '';
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

	        if (debug && (typeof console === 'undefined' ? 'undefined' : (0, _typeof3.default)(console)) === 'object') {
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
	          detail: { type: LEAVE }
	        }));

	        ruleElement.dispatchEvent(new PushStateTreeEvent(LEAVE));
	        return;
	      }

	      // dispatch the match event
	      this.eventStack[MATCH].push({
	        element: ruleElement,
	        events: [new PushStateTreeEvent(MATCH)]
	      });

	      var isNewURI = ruleElement.routerURI !== oldURI;
	      ruleElement.routerURI = this.uri;
	      ruleElement.uri = match[0];
	      ruleElement.setAttribute('uri', match[0]);

	      if (oldMatch.length === 0 || isNewURI) {
	        // stack dispatch enter event
	        this.eventStack[ENTER].push({
	          element: ruleElement,
	          events: [new PushStateTreeEvent(UPDATE, {
	            detail: { type: ENTER }
	          }), new PushStateTreeEvent(ENTER)]
	        });

	        children.forEach(recursiveDispatcher.bind(this, uri, oldURI));
	        return;
	      }

	      // if has something changed, dispatch the change event
	      if (match[0] !== oldMatch[0]) {
	        // stack dispatch enter event
	        this.eventStack[CHANGE].push({
	          element: ruleElement,
	          events: [new PushStateTreeEvent(UPDATE, {
	            detail: { type: CHANGE }
	          }), new PushStateTreeEvent(CHANGE)]
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
	          // Relative to the uri
	          var basePath = this.uri.match(/^([^?#]*)\//);
	          basePath = basePath ? basePath[1] + '/' : '';
	          args[2] = basePath + args[2];
	        } else {
	          // This isn't relative, will cleanup / and # from the begin and use the remain path
	          args[2] = args[2].match(/^([#/]*)?(.*)/)[2];
	        }

	        if (!this[USE_PUSH_STATE]) {

	          // Ignore basePath when using location.hash and resolve relative path and keep
	          // the current location.pathname, some browsers history API might apply the new pathname
	          // with the hash content if not explicit
	          args[2] = location.pathname + '#' + resolveRelativePath(args[2]);
	        } else {

	          // Add the basePath to your uri, not allowing to go by pushState outside the basePath
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

	PushStateTree.prototype[HAS_PUSH_STATE] = root.history && !!root.history.pushState;
	if (!PushStateTree.prototype[HAS_PUSH_STATE]) {
	  PushStateTree.prototype[USE_PUSH_STATE] = false;
	}

	var lastTitle = null;

	if (!PushStateTree.prototype.pushState) {
	  PushStateTree.prototype.pushState = function (state, title, uri) {
	    var t = document.title || '';
	    uri = uri || '';
	    if (lastTitle !== null) {
	      document.title = lastTitle;
	    }
	    this.avoidHashchangeHandler();

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
	      uri = resolveRelativePath(uri);
	    }

	    root.location.hash = uri;

	    document.title = t;
	    lastTitle = title;

	    return this;
	  };
	}

	if (!PushStateTree.prototype.replaceState) {
	  PushStateTree.prototype.replaceState = function (state, title, uri) {
	    var t = document.title || '';
	    uri = uri || '';
	    if (lastTitle !== null) {
	      document.title = lastTitle;
	    }
	    this.avoidHashchangeHandler();

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
	      uri = resolveRelativePath(uri);
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
	if (true) module.exports = PushStateTree;
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var _Symbol = __webpack_require__(2)["default"];

	exports["default"] = function (obj) {
	  return obj && obj.constructor === _Symbol ? "symbol" : typeof obj;
	};

	exports.__esModule = true;

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(3), __esModule: true };

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(4);
	__webpack_require__(32);
	module.exports = __webpack_require__(11).Symbol;

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	// ECMAScript 6 symbols shim
	var $              = __webpack_require__(5)
	  , global         = __webpack_require__(6)
	  , has            = __webpack_require__(7)
	  , DESCRIPTORS    = __webpack_require__(8)
	  , $export        = __webpack_require__(10)
	  , redefine       = __webpack_require__(14)
	  , $fails         = __webpack_require__(9)
	  , shared         = __webpack_require__(17)
	  , setToStringTag = __webpack_require__(18)
	  , uid            = __webpack_require__(20)
	  , wks            = __webpack_require__(19)
	  , keyOf          = __webpack_require__(21)
	  , $names         = __webpack_require__(26)
	  , enumKeys       = __webpack_require__(27)
	  , isArray        = __webpack_require__(28)
	  , anObject       = __webpack_require__(29)
	  , toIObject      = __webpack_require__(22)
	  , createDesc     = __webpack_require__(16)
	  , getDesc        = $.getDesc
	  , setDesc        = $.setDesc
	  , _create        = $.create
	  , getNames       = $names.get
	  , $Symbol        = global.Symbol
	  , $JSON          = global.JSON
	  , _stringify     = $JSON && $JSON.stringify
	  , setter         = false
	  , HIDDEN         = wks('_hidden')
	  , isEnum         = $.isEnum
	  , SymbolRegistry = shared('symbol-registry')
	  , AllSymbols     = shared('symbols')
	  , useNative      = typeof $Symbol == 'function'
	  , ObjectProto    = Object.prototype;

	// fallback for old Android, https://code.google.com/p/v8/issues/detail?id=687
	var setSymbolDesc = DESCRIPTORS && $fails(function(){
	  return _create(setDesc({}, 'a', {
	    get: function(){ return setDesc(this, 'a', {value: 7}).a; }
	  })).a != 7;
	}) ? function(it, key, D){
	  var protoDesc = getDesc(ObjectProto, key);
	  if(protoDesc)delete ObjectProto[key];
	  setDesc(it, key, D);
	  if(protoDesc && it !== ObjectProto)setDesc(ObjectProto, key, protoDesc);
	} : setDesc;

	var wrap = function(tag){
	  var sym = AllSymbols[tag] = _create($Symbol.prototype);
	  sym._k = tag;
	  DESCRIPTORS && setter && setSymbolDesc(ObjectProto, tag, {
	    configurable: true,
	    set: function(value){
	      if(has(this, HIDDEN) && has(this[HIDDEN], tag))this[HIDDEN][tag] = false;
	      setSymbolDesc(this, tag, createDesc(1, value));
	    }
	  });
	  return sym;
	};

	var isSymbol = function(it){
	  return typeof it == 'symbol';
	};

	var $defineProperty = function defineProperty(it, key, D){
	  if(D && has(AllSymbols, key)){
	    if(!D.enumerable){
	      if(!has(it, HIDDEN))setDesc(it, HIDDEN, createDesc(1, {}));
	      it[HIDDEN][key] = true;
	    } else {
	      if(has(it, HIDDEN) && it[HIDDEN][key])it[HIDDEN][key] = false;
	      D = _create(D, {enumerable: createDesc(0, false)});
	    } return setSymbolDesc(it, key, D);
	  } return setDesc(it, key, D);
	};
	var $defineProperties = function defineProperties(it, P){
	  anObject(it);
	  var keys = enumKeys(P = toIObject(P))
	    , i    = 0
	    , l = keys.length
	    , key;
	  while(l > i)$defineProperty(it, key = keys[i++], P[key]);
	  return it;
	};
	var $create = function create(it, P){
	  return P === undefined ? _create(it) : $defineProperties(_create(it), P);
	};
	var $propertyIsEnumerable = function propertyIsEnumerable(key){
	  var E = isEnum.call(this, key);
	  return E || !has(this, key) || !has(AllSymbols, key) || has(this, HIDDEN) && this[HIDDEN][key]
	    ? E : true;
	};
	var $getOwnPropertyDescriptor = function getOwnPropertyDescriptor(it, key){
	  var D = getDesc(it = toIObject(it), key);
	  if(D && has(AllSymbols, key) && !(has(it, HIDDEN) && it[HIDDEN][key]))D.enumerable = true;
	  return D;
	};
	var $getOwnPropertyNames = function getOwnPropertyNames(it){
	  var names  = getNames(toIObject(it))
	    , result = []
	    , i      = 0
	    , key;
	  while(names.length > i)if(!has(AllSymbols, key = names[i++]) && key != HIDDEN)result.push(key);
	  return result;
	};
	var $getOwnPropertySymbols = function getOwnPropertySymbols(it){
	  var names  = getNames(toIObject(it))
	    , result = []
	    , i      = 0
	    , key;
	  while(names.length > i)if(has(AllSymbols, key = names[i++]))result.push(AllSymbols[key]);
	  return result;
	};
	var $stringify = function stringify(it){
	  if(it === undefined || isSymbol(it))return; // IE8 returns string on undefined
	  var args = [it]
	    , i    = 1
	    , $$   = arguments
	    , replacer, $replacer;
	  while($$.length > i)args.push($$[i++]);
	  replacer = args[1];
	  if(typeof replacer == 'function')$replacer = replacer;
	  if($replacer || !isArray(replacer))replacer = function(key, value){
	    if($replacer)value = $replacer.call(this, key, value);
	    if(!isSymbol(value))return value;
	  };
	  args[1] = replacer;
	  return _stringify.apply($JSON, args);
	};
	var buggyJSON = $fails(function(){
	  var S = $Symbol();
	  // MS Edge converts symbol values to JSON as {}
	  // WebKit converts symbol values to JSON as null
	  // V8 throws on boxed symbols
	  return _stringify([S]) != '[null]' || _stringify({a: S}) != '{}' || _stringify(Object(S)) != '{}';
	});

	// 19.4.1.1 Symbol([description])
	if(!useNative){
	  $Symbol = function Symbol(){
	    if(isSymbol(this))throw TypeError('Symbol is not a constructor');
	    return wrap(uid(arguments.length > 0 ? arguments[0] : undefined));
	  };
	  redefine($Symbol.prototype, 'toString', function toString(){
	    return this._k;
	  });

	  isSymbol = function(it){
	    return it instanceof $Symbol;
	  };

	  $.create     = $create;
	  $.isEnum     = $propertyIsEnumerable;
	  $.getDesc    = $getOwnPropertyDescriptor;
	  $.setDesc    = $defineProperty;
	  $.setDescs   = $defineProperties;
	  $.getNames   = $names.get = $getOwnPropertyNames;
	  $.getSymbols = $getOwnPropertySymbols;

	  if(DESCRIPTORS && !__webpack_require__(31)){
	    redefine(ObjectProto, 'propertyIsEnumerable', $propertyIsEnumerable, true);
	  }
	}

	var symbolStatics = {
	  // 19.4.2.1 Symbol.for(key)
	  'for': function(key){
	    return has(SymbolRegistry, key += '')
	      ? SymbolRegistry[key]
	      : SymbolRegistry[key] = $Symbol(key);
	  },
	  // 19.4.2.5 Symbol.keyFor(sym)
	  keyFor: function keyFor(key){
	    return keyOf(SymbolRegistry, key);
	  },
	  useSetter: function(){ setter = true; },
	  useSimple: function(){ setter = false; }
	};
	// 19.4.2.2 Symbol.hasInstance
	// 19.4.2.3 Symbol.isConcatSpreadable
	// 19.4.2.4 Symbol.iterator
	// 19.4.2.6 Symbol.match
	// 19.4.2.8 Symbol.replace
	// 19.4.2.9 Symbol.search
	// 19.4.2.10 Symbol.species
	// 19.4.2.11 Symbol.split
	// 19.4.2.12 Symbol.toPrimitive
	// 19.4.2.13 Symbol.toStringTag
	// 19.4.2.14 Symbol.unscopables
	$.each.call((
	  'hasInstance,isConcatSpreadable,iterator,match,replace,search,' +
	  'species,split,toPrimitive,toStringTag,unscopables'
	).split(','), function(it){
	  var sym = wks(it);
	  symbolStatics[it] = useNative ? sym : wrap(sym);
	});

	setter = true;

	$export($export.G + $export.W, {Symbol: $Symbol});

	$export($export.S, 'Symbol', symbolStatics);

	$export($export.S + $export.F * !useNative, 'Object', {
	  // 19.1.2.2 Object.create(O [, Properties])
	  create: $create,
	  // 19.1.2.4 Object.defineProperty(O, P, Attributes)
	  defineProperty: $defineProperty,
	  // 19.1.2.3 Object.defineProperties(O, Properties)
	  defineProperties: $defineProperties,
	  // 19.1.2.6 Object.getOwnPropertyDescriptor(O, P)
	  getOwnPropertyDescriptor: $getOwnPropertyDescriptor,
	  // 19.1.2.7 Object.getOwnPropertyNames(O)
	  getOwnPropertyNames: $getOwnPropertyNames,
	  // 19.1.2.8 Object.getOwnPropertySymbols(O)
	  getOwnPropertySymbols: $getOwnPropertySymbols
	});

	// 24.3.2 JSON.stringify(value [, replacer [, space]])
	$JSON && $export($export.S + $export.F * (!useNative || buggyJSON), 'JSON', {stringify: $stringify});

	// 19.4.3.5 Symbol.prototype[@@toStringTag]
	setToStringTag($Symbol, 'Symbol');
	// 20.2.1.9 Math[@@toStringTag]
	setToStringTag(Math, 'Math', true);
	// 24.3.3 JSON[@@toStringTag]
	setToStringTag(global.JSON, 'JSON', true);

/***/ },
/* 5 */
/***/ function(module, exports) {

	var $Object = Object;
	module.exports = {
	  create:     $Object.create,
	  getProto:   $Object.getPrototypeOf,
	  isEnum:     {}.propertyIsEnumerable,
	  getDesc:    $Object.getOwnPropertyDescriptor,
	  setDesc:    $Object.defineProperty,
	  setDescs:   $Object.defineProperties,
	  getKeys:    $Object.keys,
	  getNames:   $Object.getOwnPropertyNames,
	  getSymbols: $Object.getOwnPropertySymbols,
	  each:       [].forEach
	};

/***/ },
/* 6 */
/***/ function(module, exports) {

	// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
	var global = module.exports = typeof window != 'undefined' && window.Math == Math
	  ? window : typeof self != 'undefined' && self.Math == Math ? self : Function('return this')();
	if(typeof __g == 'number')__g = global; // eslint-disable-line no-undef

/***/ },
/* 7 */
/***/ function(module, exports) {

	var hasOwnProperty = {}.hasOwnProperty;
	module.exports = function(it, key){
	  return hasOwnProperty.call(it, key);
	};

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	// Thank's IE8 for his funny defineProperty
	module.exports = !__webpack_require__(9)(function(){
	  return Object.defineProperty({}, 'a', {get: function(){ return 7; }}).a != 7;
	});

/***/ },
/* 9 */
/***/ function(module, exports) {

	module.exports = function(exec){
	  try {
	    return !!exec();
	  } catch(e){
	    return true;
	  }
	};

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	var global    = __webpack_require__(6)
	  , core      = __webpack_require__(11)
	  , ctx       = __webpack_require__(12)
	  , PROTOTYPE = 'prototype';

	var $export = function(type, name, source){
	  var IS_FORCED = type & $export.F
	    , IS_GLOBAL = type & $export.G
	    , IS_STATIC = type & $export.S
	    , IS_PROTO  = type & $export.P
	    , IS_BIND   = type & $export.B
	    , IS_WRAP   = type & $export.W
	    , exports   = IS_GLOBAL ? core : core[name] || (core[name] = {})
	    , target    = IS_GLOBAL ? global : IS_STATIC ? global[name] : (global[name] || {})[PROTOTYPE]
	    , key, own, out;
	  if(IS_GLOBAL)source = name;
	  for(key in source){
	    // contains in native
	    own = !IS_FORCED && target && key in target;
	    if(own && key in exports)continue;
	    // export native or passed
	    out = own ? target[key] : source[key];
	    // prevent global pollution for namespaces
	    exports[key] = IS_GLOBAL && typeof target[key] != 'function' ? source[key]
	    // bind timers to global for call from export context
	    : IS_BIND && own ? ctx(out, global)
	    // wrap global constructors for prevent change them in library
	    : IS_WRAP && target[key] == out ? (function(C){
	      var F = function(param){
	        return this instanceof C ? new C(param) : C(param);
	      };
	      F[PROTOTYPE] = C[PROTOTYPE];
	      return F;
	    // make static versions for prototype methods
	    })(out) : IS_PROTO && typeof out == 'function' ? ctx(Function.call, out) : out;
	    if(IS_PROTO)(exports[PROTOTYPE] || (exports[PROTOTYPE] = {}))[key] = out;
	  }
	};
	// type bitmap
	$export.F = 1;  // forced
	$export.G = 2;  // global
	$export.S = 4;  // static
	$export.P = 8;  // proto
	$export.B = 16; // bind
	$export.W = 32; // wrap
	module.exports = $export;

/***/ },
/* 11 */
/***/ function(module, exports) {

	var core = module.exports = {version: '1.2.6'};
	if(typeof __e == 'number')__e = core; // eslint-disable-line no-undef

/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	// optional / simple context binding
	var aFunction = __webpack_require__(13);
	module.exports = function(fn, that, length){
	  aFunction(fn);
	  if(that === undefined)return fn;
	  switch(length){
	    case 1: return function(a){
	      return fn.call(that, a);
	    };
	    case 2: return function(a, b){
	      return fn.call(that, a, b);
	    };
	    case 3: return function(a, b, c){
	      return fn.call(that, a, b, c);
	    };
	  }
	  return function(/* ...args */){
	    return fn.apply(that, arguments);
	  };
	};

/***/ },
/* 13 */
/***/ function(module, exports) {

	module.exports = function(it){
	  if(typeof it != 'function')throw TypeError(it + ' is not a function!');
	  return it;
	};

/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(15);

/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	var $          = __webpack_require__(5)
	  , createDesc = __webpack_require__(16);
	module.exports = __webpack_require__(8) ? function(object, key, value){
	  return $.setDesc(object, key, createDesc(1, value));
	} : function(object, key, value){
	  object[key] = value;
	  return object;
	};

/***/ },
/* 16 */
/***/ function(module, exports) {

	module.exports = function(bitmap, value){
	  return {
	    enumerable  : !(bitmap & 1),
	    configurable: !(bitmap & 2),
	    writable    : !(bitmap & 4),
	    value       : value
	  };
	};

/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	var global = __webpack_require__(6)
	  , SHARED = '__core-js_shared__'
	  , store  = global[SHARED] || (global[SHARED] = {});
	module.exports = function(key){
	  return store[key] || (store[key] = {});
	};

/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	var def = __webpack_require__(5).setDesc
	  , has = __webpack_require__(7)
	  , TAG = __webpack_require__(19)('toStringTag');

	module.exports = function(it, tag, stat){
	  if(it && !has(it = stat ? it : it.prototype, TAG))def(it, TAG, {configurable: true, value: tag});
	};

/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	var store  = __webpack_require__(17)('wks')
	  , uid    = __webpack_require__(20)
	  , Symbol = __webpack_require__(6).Symbol;
	module.exports = function(name){
	  return store[name] || (store[name] =
	    Symbol && Symbol[name] || (Symbol || uid)('Symbol.' + name));
	};

/***/ },
/* 20 */
/***/ function(module, exports) {

	var id = 0
	  , px = Math.random();
	module.exports = function(key){
	  return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36));
	};

/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	var $         = __webpack_require__(5)
	  , toIObject = __webpack_require__(22);
	module.exports = function(object, el){
	  var O      = toIObject(object)
	    , keys   = $.getKeys(O)
	    , length = keys.length
	    , index  = 0
	    , key;
	  while(length > index)if(O[key = keys[index++]] === el)return key;
	};

/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	// to indexed object, toObject with fallback for non-array-like ES3 strings
	var IObject = __webpack_require__(23)
	  , defined = __webpack_require__(25);
	module.exports = function(it){
	  return IObject(defined(it));
	};

/***/ },
/* 23 */
/***/ function(module, exports, __webpack_require__) {

	// fallback for non-array-like ES3 and non-enumerable old V8 strings
	var cof = __webpack_require__(24);
	module.exports = Object('z').propertyIsEnumerable(0) ? Object : function(it){
	  return cof(it) == 'String' ? it.split('') : Object(it);
	};

/***/ },
/* 24 */
/***/ function(module, exports) {

	var toString = {}.toString;

	module.exports = function(it){
	  return toString.call(it).slice(8, -1);
	};

/***/ },
/* 25 */
/***/ function(module, exports) {

	// 7.2.1 RequireObjectCoercible(argument)
	module.exports = function(it){
	  if(it == undefined)throw TypeError("Can't call method on  " + it);
	  return it;
	};

/***/ },
/* 26 */
/***/ function(module, exports, __webpack_require__) {

	// fallback for IE11 buggy Object.getOwnPropertyNames with iframe and window
	var toIObject = __webpack_require__(22)
	  , getNames  = __webpack_require__(5).getNames
	  , toString  = {}.toString;

	var windowNames = typeof window == 'object' && Object.getOwnPropertyNames
	  ? Object.getOwnPropertyNames(window) : [];

	var getWindowNames = function(it){
	  try {
	    return getNames(it);
	  } catch(e){
	    return windowNames.slice();
	  }
	};

	module.exports.get = function getOwnPropertyNames(it){
	  if(windowNames && toString.call(it) == '[object Window]')return getWindowNames(it);
	  return getNames(toIObject(it));
	};

/***/ },
/* 27 */
/***/ function(module, exports, __webpack_require__) {

	// all enumerable object keys, includes symbols
	var $ = __webpack_require__(5);
	module.exports = function(it){
	  var keys       = $.getKeys(it)
	    , getSymbols = $.getSymbols;
	  if(getSymbols){
	    var symbols = getSymbols(it)
	      , isEnum  = $.isEnum
	      , i       = 0
	      , key;
	    while(symbols.length > i)if(isEnum.call(it, key = symbols[i++]))keys.push(key);
	  }
	  return keys;
	};

/***/ },
/* 28 */
/***/ function(module, exports, __webpack_require__) {

	// 7.2.2 IsArray(argument)
	var cof = __webpack_require__(24);
	module.exports = Array.isArray || function(arg){
	  return cof(arg) == 'Array';
	};

/***/ },
/* 29 */
/***/ function(module, exports, __webpack_require__) {

	var isObject = __webpack_require__(30);
	module.exports = function(it){
	  if(!isObject(it))throw TypeError(it + ' is not an object!');
	  return it;
	};

/***/ },
/* 30 */
/***/ function(module, exports) {

	module.exports = function(it){
	  return typeof it === 'object' ? it !== null : typeof it === 'function';
	};

/***/ },
/* 31 */
/***/ function(module, exports) {

	module.exports = true;

/***/ },
/* 32 */
/***/ function(module, exports) {

	

/***/ },
/* 33 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(34), __esModule: true };

/***/ },
/* 34 */
/***/ function(module, exports, __webpack_require__) {

	var $ = __webpack_require__(5);
	module.exports = function defineProperty(it, key, desc){
	  return $.setDesc(it, key, desc);
	};

/***/ }
/******/ ]);