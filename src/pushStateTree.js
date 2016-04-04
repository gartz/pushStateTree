var root = typeof window !== 'undefined' && window || global;
var document = root.document;
var location = root.location;

// Add support to location.origin for all browsers
require('./origin.shim');

let isIE = require('./ieOld.shim').isIE;

// If you have your own shim for ES3 and old IE browsers, you can remove this shim from your package by adding a
// webpack.DefinePlugin that translates `typeof PST_NO_OLD_IE === 'undefined'` to false, this will remove the section
// in the minified version:
//     new webpack.DefinePlugin({
//       PST_NO_OLD_IE: false
//     })
// https://webpack.github.io/docs/list-of-plugins.html#defineplugin
if (typeof PST_NO_OLD_IE === 'undefined') {
  require('./es3.shim.js');
}

// TODO: Use a PushStateTree.prototype.createEvent instead of shim native CustomEvents
require('./customEvent.shim');
require('./eventTarget.shim');

// Constants for uglifiers
const USE_PUSH_STATE = 'usePushState';
const HAS_PUSH_STATE = 'hasPushState';
const HASHCHANGE = 'hashchange';
const POPSTATE = 'popstate';
const LEAVE = 'leave';
const UPDATE = 'update';
const ENTER = 'enter';
const CHANGE = 'change';
const MATCH = 'match';
const OLD_MATCH = 'oldMatch';

// Helpers
function isInt(n) {
  return typeof n != 'undefined' && !isNaN(parseFloat(n)) && n % 1 === 0 && isFinite(n);
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

function resolveRelativePath(path) {
  // Resolve relative paths manually for browsers using hash navigation

  var parts = path.split('/');
  var i = 1;
  while (i < parts.length) {
    // if current part is `..` and previous part is different, remove both of them
    if (parts[i] === '..' && i > 0 && parts[i-1] !== '..') {
      parts.splice(i - 1, 2);
      i -= 2;
    }
    i++;
  }
  return parts
    .join('/')
    .replace(/\/\.\/|\.\/|\.\.\//g, '/')
    .replace(/^\/$/, '');
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
  this.VERSION = VERSION;

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
    Object.defineProperty(rootElement, USE_PUSH_STATE, {
      get: function () {
        return usePushState;
      },
      set: function (val) {
        usePushState = val !== false;
      }
    });
  }

  // When enabled beautifyLocation will auto switch between hash to pushState when enabled
  Object.defineProperty(rootElement, 'beautifyLocation', {
    get: function () {
      return PushStateTree.prototype.beautifyLocation && usePushState;
    },
    set: function (value) {
      PushStateTree.prototype.beautifyLocation = value === true;
    }
  });
  rootElement.beautifyLocation = options.beautifyLocation && rootElement.usePushState;

  var basePath;
  Object.defineProperty(rootElement, 'basePath', {
    get: function () {
      return basePath;
    },
    set: function (value) {
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

        var usePushState = rootElement[USE_PUSH_STATE];
        if (rootElement.beautifyLocation && rootElement.isPathValid && usePushState) {
          // when using pushState, replace the browser location to avoid ugly URLs

          rootElement.replaceState(
            rootElement.state,
            rootElement.title,
            uri[0] === '/' ? uri : '/' + uri
          );
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
    get: function () {
      var uri = root.location.pathname + root.location.search;
      return !this.basePath || (uri).indexOf(this.basePath) === 0;
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
      rootElement.dispatch();
    }
  });

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
      rootElement.dispatch();
    }
  };

  rootElement.avoidHashchangeHandler = function () {
    // Avoid triggering hashchange event
    root.removeEventListener(HASHCHANGE, onhashchange);
    readOnhashchange = true;
  };

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

    if (isIE()) {
      root.setInterval(() => {
        if (this.uri !== oldURI) {
          dispatchHashChange();
          return;
        }
        if (readOnhashchange) {
          readOnhashchange = false;
          oldURI = this.uri;
          root.addEventListener(HASHCHANGE, onhashchange);
        }
      }, 50);
    }
  }.bind(rootElement));

  return this;
}

/*eslint no-unused-vars: ["error", { "varsIgnorePattern": "oldState" }]*/
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
        if (isInt(attr)) {
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
      }
    });

    var oldMatch = [];
    Object.defineProperty(rule, OLD_MATCH, {
      get: function () {
        return oldMatch;
      },
      set: function (val) {
        oldMatch = val instanceof Array ? val : [];
      }
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

    // Abort if the basePath isn't valid for this router
    if (!this.isPathValid) return;

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

        if (DEBUG) {
          /*eslint no-console: "off" */
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
  PushStateTree.prototype.pushState = function(state, title, uri) {
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
  PushStateTree.prototype.replaceState = function(state, title, uri) {
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
PushStateTree.isInt = isInt;

// Node import support
module.exports = PushStateTree;
