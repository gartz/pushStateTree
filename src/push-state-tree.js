const root = typeof window !== 'undefined' && window || global;

let errorApiMessage = api => new Error(`PushStateTree ${VERSION} requires ${api} API to run.`);

if (!root.document) {
  throw errorApiMessage('document');
}
const document = root.document;

if (!root.location) {
  throw errorApiMessage('location');
}
const location = root.location;

if (!root.history) {
  throw errorApiMessage('history');
}
const history = root.history;

if (!root.CustomEvent) {
  throw errorApiMessage('CustomEvent');
}

// If you have your own shim for ES3 and old IE browsers, you can remove all shim files from your package by adding a
// webpack.DefinePlugin that translates `typeof PST_NO_SHIM === 'undefined'` to false, this will remove the section
// in the minified version:
//     new webpack.DefinePlugin({
//       PST_NO_SHIM: false
//     })
// https://webpack.github.io/docs/list-of-plugins.html#defineplugin

// Add support to location.origin for all browsers
require('./origin.shim');

let isIE = require('./ieOld.shim').isIE;

// If you don't want support IE 7 and IE 8 you can remove the compatibility shim with `PST_NO_OLD_ID: false`
//     new webpack.DefinePlugin({
//       PST_NO_OLD_IE: false
//     })
// https://webpack.github.io/docs/list-of-plugins.html#defineplugin
require('./es3.shim.js');

// TODO: Use a PushStateTree.prototype.createEvent instead of shim native CustomEvents
require('./customEvent.shim');
require('./eventTarget.shim');

// Constants for uglifiers
const USE_PUSH_STATE = 'usePushState';
const HASH_CHANGE = 'hashchange';
const POP_STATE = 'popstate';
const LEAVE = 'leave';
const UPDATE = 'update';
const ENTER = 'enter';
const CHANGE = 'change';
const MATCH = 'match';
const OLD_MATCH = 'oldMatch';

// Internal history keep tracking of all changes in the location history, it can be reset any
let internalHistory;
function InternalLocation(url, previous) {
  this.url = url;
  this.previous = previous;
}
function InternalHistory() {
  if (!this) {
    return internalHistory = new InternalHistory();
  }

  // It's a object like an array, but it can start from a certain point to allow memory cleanup
  if (internalHistory && internalHistory.length) {
    this.startFrom = internalHistory.length - 1;
    let savedLocation = internalHistory[this.startFrom];

    // Break the link to previous to allow GC collect unused values
    if (savedLocation) savedLocation.previous = undefined;

    this[this.startFrom] = savedLocation;
    this.length = internalHistory.length;
  } else {
    this.startFrom = 0;
    this.length = 0;
  }
}
InternalHistory.prototype.push = function (url) {
  let previous = this[this.length - 1];

  // Ignore if is the same URL
  if (previous && url == previous.url) return;

  this[this.length] = new InternalLocation(url, previous);
  this.length += 1;

  // Reset every 100 iterations in the history
  if (this.length % 100 == 0) InternalHistory();
};
InternalHistory.prototype.last = function () {
  return this[this.length - 1];
};

// Helpers
function isInt(n) {
  return typeof n != 'undefined' && !isNaN(parseFloat(n)) && n % 1 === 0 && isFinite(n);
}

function proxyReadOnlyProperty(context, property, targetObject) {
  // Proxy the property with same name from the targetObject into the defined context
  // if `targetObject` is `false` it will always return `false`.

  Object.defineProperty(context, property, {
    get() {
      return targetObject && targetObject[property];
    }
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
    return PushStateTree.apply(PushStateTree.createElement('pushstatetree-route'), arguments);
  }

  // Initialize internal history when creating a router instance
  PushStateTree.initInternalHistory();

  // Allow switch between pushState or hash navigation modes, in browser that doesn't support
  // pushState it will always be false. and use hash navigation enforced.
  // use backend non permanent redirect when old browsers are detected in the request.
  if (!PushStateTree.hasPushState) {
    proxyReadOnlyProperty(this, USE_PUSH_STATE, false);
  } else {
    var usePushState = options[USE_PUSH_STATE];
    Object.defineProperty(this, USE_PUSH_STATE, {
      get() {
        return usePushState;
      },
      set(val) {
        usePushState = val !== false;
      }
    });
  }

  // When enabled beautifyLocation will auto switch between hash to pushState when enabled
  Object.defineProperty(this, 'beautifyLocation', {
    get() {
      return PushStateTree.prototype.beautifyLocation && usePushState;
    },
    set(value) {
      PushStateTree.prototype.beautifyLocation = value === true;
    }
  });
  this.beautifyLocation = options.beautifyLocation && this.usePushState;

  let basePath;
  Object.defineProperty(this, 'basePath', {
    get() {
      return basePath;
    },
    set(value) {
      basePath = value || '';
      if (basePath[0] !== '/') {
        basePath = '/' + basePath;
      }
    }
  });
  this.basePath = options.basePath;

  //TODO: emcapsulate this
  for (let property in PushStateTree.prototype) {
    if (typeof PushStateTree.prototype[property] === 'function') {
      // function wrapper, without bind the context
      this[property] = function () {
        return PushStateTree.prototype[property].apply(this, arguments);
      };
      continue;
    }
    // Copy properties from prototype to the instance
    if (typeof this[property] == 'undefined') {
      this[property] = PushStateTree.prototype[property];
    }
  }

  var cachedUri = {
    url: '',
    uri: ''
  };
  Object.defineProperty(this, 'uri', {
    get() {
      let href = internalHistory.last().url;
      if (cachedUri.url === href) return cachedUri.uri;

      let uri;
      let hashPosition = href.indexOf('#');
      if (hashPosition != -1) {
        // Remove all begin # chars from the location when using hash
        uri = href.substr(hashPosition).match(/^(#*)?(.*\/?)/)[2];

        if (this.beautifyLocation && this.isPathValid && this[USE_PUSH_STATE]) {
          // when using pushState, replace the browser location to avoid ugly URLs

          this.replaceState(null, null, uri[0] === '/' ? uri : '/' + uri);
        }
      } else {
        uri = location.pathname + location.search;
        if (this.isPathValid) {
          uri = uri.slice(this.basePath.length);
        }
      }

      // Remove the very first slash, do don't match it as URI
      uri = uri.replace(/^[\/]+/, '');

      if (this.getAttribute('uri') !== uri) {
        this.setAttribute('uri', uri);
      }

      cachedUri.url = href;
      cachedUri.uri = uri;
      return uri;
    },
    configurable: true
  });

  // Setup options
  for (var prop in options) {
    if (options.hasOwnProperty(prop)) {
      this[prop] = options[prop];
    }
  }

  proxyReadOnlyProperty(this, 'length', internalHistory);

  Object.defineProperty(this, 'isPathValid', {
    get() {
      var uri = location.pathname + location.search;
      return !this.basePath || (uri).indexOf(this.basePath) === 0;
    }
  });

  this.eventStack = {
    leave: [],
    change: [],
    enter: [],
    match: []
  };

  root.addEventListener(POP_STATE, () => {

    internalHistory.push(location.href);

    var eventURI = this.uri;
    this.rulesDispatcher();

    oldURI = eventURI;

    // If there is holding dispatch in the event, do it now
    if (holdingDispatch) {
      this.dispatch();
    }
  });

  var readOnhashchange = false;
  var onhashchange = () => {
    // Workaround IE8
    if (readOnhashchange) return;

    // Don't dispatch, because already have dispatched in popstate event
    if (oldURI === this.uri) return;

    var eventURI = this.uri;
    this.rulesDispatcher();

    oldURI = eventURI;

    // If there is holding dispatch in the event, do it now
    if (holdingDispatch) {
      this.dispatch();
    }
  };

  this.avoidHashchangeHandler = () => {
    // Avoid triggering hashchange event
    root.removeEventListener(HASH_CHANGE, onhashchange);
    readOnhashchange = true;
  };

  root.addEventListener(HASH_CHANGE, onhashchange);

  // Uglify propourses
  var dispatchHashChange = () => {
    root.dispatchEvent(new HashChangeEvent(HASH_CHANGE));
  };

  // Modern browsers
  document.addEventListener('DOMContentLoaded', dispatchHashChange);
  // Some IE browsers
  root.addEventListener('readystatechange', dispatchHashChange);
  // Almost all browsers
  root.addEventListener('load', () => {
    dispatchHashChange();

    if (!isIE()) return;

    setInterval(() => {
      if (this.uri !== oldURI) {
        dispatchHashChange();
        return;
      }
      if (readOnhashchange) {
        readOnhashchange = false;
        oldURI = this.uri;
        root.addEventListener(HASH_CHANGE, onhashchange);
      }
    }, 50);
  });

  return this;
}

var oldURI = null;
var eventsQueue = [];
var holdingDispatch = false;
var holdDispatch = false;

let hasPushState = !!(history && history.pushState);

Object.assign(PushStateTree, {
  VERSION,
  isInt,
  hasPushState,
  getInternalHistory() {
    return internalHistory;
  },
  createElement(name) {
    // When document is available, use it to create and return a HTMLElement
    if (typeof document !== 'undefined') {
      return document.createElement(name);
    }
    throw new Error('PushStateTree requires HTMLElement support from window to work.')
  },
  initInternalHistory() {
    if (!internalHistory) {
      // Init internal history
      InternalHistory();
    }

    internalHistory.push(location.href);
  },
  prototype: {
    VERSION,
    hasPushState,

    // Version ~0.11 beatifyLocation is enabled by default
    beautifyLocation: true,

    createRule(options) {
      // Create a pushstreamtree-rule element from a literal object

      var rule = PushStateTree.createElement('pushstatetree-rule');

      var ruleRegex = new RegExp('');

      // Bind rule property with element attribute
      Object.defineProperty(rule, 'rule', {
        get() {
          return ruleRegex;
        },
        set(val) {
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
        get() {
          var attr = rule.getAttribute('parent-group');
          if (isInt(attr)) {
            return + attr;
          }
          return null;
        },
        set(val) {
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
      let match = [];
      Object.defineProperty(rule, MATCH, {
        get() {
          return match;
        },
        set(val) {
          match = val instanceof Array ? val : [];
        }
      });

      var oldMatch = [];
      Object.defineProperty(rule, OLD_MATCH, {
        get() {
          return oldMatch;
        },
        set(val) {
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
      ].forEach(function (methodName) {
        rule[methodName] = function () {
          this.parentElement[methodName].apply(this.parentElement, arguments);
        };
      });

      return rule;
    },

    add(options) {
      // Transform any literal object in a pushstatetree-rule and append it

      this.appendChild(this.createRule(options));
      return this;
    },

    remove(queryOrElement) {
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

    dispatch() {
      // Deferred trigger the actual browser location
      if (holdDispatch) {
        holdingDispatch = true;
        return this;
      }
      holdingDispatch = false;
      root.dispatchEvent(new Event(POP_STATE));
      return this;
    },

    assign(url) {
      // Shortcut for pushState and dispatch methods
      return this.pushState(null, null, url).dispatch();
    },

    replace(url) {
      // Shortcut for pushState and dispatch methods
      return this.replaceState(null, null, url).dispatch();
    },

    navigate() {
      this.assign.apply(this, arguments);
    },

    rulesDispatcher() {
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
  }
});

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

    history[scopeMethod].apply(history, args);

    // Chainnable
    return this;
  };
}

// Wrap history methods
for (var method in history) {
  if (typeof history[method] === 'function') {
    preProcessUriBeforeExecuteNativeHistoryMethods.call(PushStateTree.prototype, method);
  }
}

// Add support to pushState on old browsers that doesn't native support it
if (typeof PST_NO_OLD_IE == 'undefined'
  && typeof PST_NO_SHIM == 'undefined'
  && !PushStateTree.hasPushState
) {
  let lastTitle = null;
  PushStateTree.prototype.pushState = function (state, title, uri) {
    title = title || document.title || '';
    uri = uri || '';
    if (lastTitle !== null) {
      document.title = lastTitle;
    }
    this.avoidHashchangeHandler();

    // Replace hash url
    if (isExternal(uri)) {
      // this will redirect the browser, so doesn't matters the rest...
      location.href = uri;
    }

    // Remove the has if is it present
    if (uri[0] === '#') {
      uri = uri.slice(1);
    }

    if (isRelative(uri)) {
      uri = location.hash.slice(1, location.hash.lastIndexOf('/') + 1) + uri;
      uri = resolveRelativePath(uri);
    }

    location.hash = uri;

    document.title = title;
    lastTitle = title;

    return this;
  };

  PushStateTree.prototype.replaceState = function (state, title, uri) {
    title = title || document.title || '';
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
      var relativePos = location.hash.lastIndexOf('/') + 1;
      uri = location.hash.slice(1, relativePos) + uri;
      uri = resolveRelativePath(uri);
    }

    // Always use hash navigation
    uri = '#' + uri;

    location.replace(uri);
    document.title = title;
    lastTitle = title;

    return this;
  };
}

// Node import support
module.exports = PushStateTree;
