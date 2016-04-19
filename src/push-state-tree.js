const root = typeof window !== 'undefined' && window || global;

let errorApiMessage = api => new Error(`PushStateTree ${VERSION} requires ${api} API to run.`);

if (!root.document) {
  throw errorApiMessage('document');
}
const document = root.document;
const location = root.location;
const history = root.history;

// If you have your own shim for ES3 and old IE browsers, you can remove all shim files from your package by adding a
// webpack.DefinePlugin that translates `typeof PST_NO_SHIM === 'undefined'` to false, this will remove the section
// in the minified version:
//     new webpack.DefinePlugin({
//       PST_NO_SHIM: false
//     })
// https://webpack.github.io/docs/list-of-plugins.html#defineplugin

let isIE = require('./ieOld.shim').isIE;

// If you don't want support IE 7 and IE 8 you can remove the compatibility shim with `PST_NO_OLD_ID: false`
//     new webpack.DefinePlugin({
//       PST_NO_OLD_IE: false
//     })
// https://webpack.github.io/docs/list-of-plugins.html#defineplugin
require('./es3.shim.js');

// TODO: Use a PushStateTree.prototype.createEvent instead of shim native CustomEvents
require('./customEvent.shim');

// Constants for uglifiers
const HASH_CHANGE = 'hashchange';
const POP_STATE = 'popstate';
const LEAVE = 'leave';
const UPDATE = 'update';
const ENTER = 'enter';
const CHANGE = 'change';
const MATCH = 'match';
const OLD_MATCH = 'oldMatch';

function convertToURI(url) {
  // Remove unwanted data from url
  // if it's a browser it will remove the location.origin
  // else it will ignore first occurrence of / and return the rest
  if (location && url == location.href) {
    let host = location.host && `//${location.host}`;
    return url.substr(`${location.protocol}${host}`.length);
  } else {
    let match = url[MATCH](/([^\/]*)(\/+)?(.*)/);
    return match[2] ? match[3] : match[1];
  }
}

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
    },
    // Must have set to ignore when try to set a new value and not throw error.
    set() {}
  });
}

function proxyLikePrototype(context, prototypeContext) {
  // It proxy the method, or property to the prototype

  for (let property in prototypeContext) {
    if (typeof prototypeContext[property] === 'function') {
      // function wrapper, it doesn't use binding because it needs to execute the current version of the property in the
      // prototype to conserve the prototype chain resource
      context[property] = function proxyMethodToPrototype() {
        return prototypeContext[property].apply(this, arguments);
      };
      continue;
    }
    // Proxy prototype properties to the instance, but if they're redefined in the instance, use the instance definition
    // without change the prototype property value
    if (typeof context[property] == 'undefined') {
      let propertyValue;
      Object.defineProperty(context, property, {
        get() {
          if (typeof propertyValue == 'undefined') {
            return prototypeContext[property];
          }
          return propertyValue;
        },
        set(value) {
          propertyValue = value;
        }
      });
    }
  }
}

function objectMixinProperties(destineObject, sourceObject) {
  // Simple version of Object.assign
  for (let property in sourceObject) {
    if (sourceObject.hasOwnProperty(property)) {
      destineObject[property] = sourceObject[property];
    }
  }
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

  // Force the instance to always return a HTMLElement
  if (!(this instanceof elementPrototype)) {
    return PushStateTree.apply(PushStateTree.createElement('pushstatetree-route'), arguments);
  }

  this.eventStack = {
    leave: [],
    change: [],
    enter: [],
    match: []
  };

  proxyLikePrototype(this, PushStateTree.prototype);

  // Allow switch between pushState or hash navigation modes, in browser that doesn't support
  // pushState it will always be false. and use hash navigation enforced.
  // use backend non permanent redirect when old browsers are detected in the request.
  if (!PushStateTree.hasPushState) {
    proxyReadOnlyProperty(this, 'usePushState', false);
  } else {
    let usePushState = true;
    Object.defineProperty(this, 'usePushState', {
      get() {
        return usePushState;
      },
      set(val) {
        usePushState = PushStateTree.hasPushState ? val !== false : false;
      }
    });
    this.usePushState = options.usePushState;
  }

  // When enabled beautifyLocation will replace the location using history.replaceState
  // to remove the hash from the URL
  let beautifyLocation = true && this.usePushState;
  Object.defineProperty(this, 'beautifyLocation', {
    get() {
      return beautifyLocation;
    },
    set(value) {
      beautifyLocation = this.usePushState && value === true;
    }
  });

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

  let cachedUri = {
    url: '',
    uri: '',
    basePath: ''
  };
  let oldURI = '';
  Object.defineProperty(this, 'oldURI', {
    get() {
      return oldURI;
    }
  });
  Object.defineProperty(this, 'uri', {
    get() {
      let url = this.path;
      let basePath = this.basePath;
      let uri = cachedUri.uri;

      // If it's available from the cache return it
      if (cachedUri.url == url && cachedUri.basePath == basePath) return uri;

      uri = this.getUri(url);

      // Update oldURI
      oldURI = cachedUri.uri;
      // Update cache
      cachedUri.url = url;
      cachedUri.basePath = basePath;
      cachedUri.uri = uri;

      // Expose DOM Attribute
      if (this.getAttribute('uri') != uri) {
        this.setAttribute('uri', uri);
      }

      return uri;
    }
  });

  let length = 0;
  Object.defineProperty(this, 'length', {
    get() {
      return length;
    }
  });

  let path = '';
  Object.defineProperty(this, 'isPathValid', {
    get() {
      return !basePath || path.indexOf(basePath) === 0;
    }
  });

  Object.defineProperty(this, 'path', {
    get() {
      return path;
    },
    set(value) {
      if (typeof path != 'string') {
        throw new TypeError('path must be a string.');
      }
      if (holdDispatch || value == path) return;
      let wasBasePathValid = this.isPathValid;

      if (this.dispatchEvent(new root.CustomEvent('path'))) {
        path = value;
        length++;

        // Expose path DOM Attribute
        if (this.getAttribute('path') != path) {
          this.setAttribute('path', path);
        }

        if (this.isPathValid) {
          this.dispatchEvent(new root.CustomEvent(MATCH));
          if (!wasBasePathValid) {
            this.dispatchEvent(new root.CustomEvent(ENTER));
          } else {
            this.dispatchEvent(new root.CustomEvent(CHANGE));
          }
        } else if (wasBasePathValid) {
          this.dispatchEvent(new root.CustomEvent(LEAVE));
        }
      }
    }
  });
  this.disabled = options.disabled === true;

  // Disabled must be the last thing before options, because it will start the listeners
  let disabled = true;
  let disableMethod;
  Object.defineProperty(this, 'disabled', {
    get() {
      return disabled;
    },
    set(value) {
      value = value === true;
      if (value != disabled) {
        disabled = value;
        if (disabled) disableMethod();
        else disableMethod = this.startGlobalListeners();
      }
    }
  });
  this.disabled = options.disabled === true;

  // Setup options, must be executed after define all properties
  objectMixinProperties(this, options);

  return this;
}

const eventsQueue = [];
let holdingDispatch = false;
let holdDispatch = false;

let hasPushState = !!(history && history.pushState);

objectMixinProperties(PushStateTree, {
  // VERSION is defined in the webpack build, it is replaced by package.version
  VERSION,
  isInt,
  hasPushState,
  createElement(name) {
    // When document is available, use it to create and return a HTMLElement
    if (typeof document !== 'undefined') {
      return document.createElement(name);
    }
    throw new Error('PushStateTree requires HTMLElement support from window to work.')
  },

  prototype: {
    // VERSION is defined in the webpack build, it is replaced by package.version
    VERSION,
    hasPushState,

    startGlobalListeners() {
      // Start the browser global listeners and return a method to stop listening to them

      let beautifyLocation = () => {
        // apply pushState for a beautiful URL when beautifyLocation is enable and it's possible to do it
        if (this.beautifyLocation
          && this.usePushState
          && this.isPathValid
          && this.path.indexOf('#') != -1
        ) {

          // Execute after to pop_state again
          this.replace(this.uri);
          return true;
        }
      };

      let dispatchListener = event => {
        this.path = convertToURI(location.href);

        if (beautifyLocation()) {
          event.preventDefault();
        }
      };
      this.addEventListener('dispatch', dispatchListener);

      let browserListener = () => {
        if (this.path != convertToURI(location.href)) {
          this.dispatch();
        }
      };

      root.addEventListener(POP_STATE, browserListener);
      root.addEventListener(HASH_CHANGE, browserListener);

      let ieWatch;
      let loadListener = () => {
        browserListener();

        if (!isIE() || isIE() > 8) return;

        // Watch for URL changes in the IE
        ieWatch = setInterval(browserListener, 50);
      };

      // If the DOM is ready when running the PST, execute loadListeners and ignore others
      if (document.readyState == 'complete') {
        loadListener();
      } else {
        // Modern browsers
        document.addEventListener('DOMContentLoaded', browserListener);
        // Some IE browsers
        root.addEventListener('readystatechange', browserListener);
        // Almost all browsers
        root.addEventListener('load', loadListener);
      }

      return () => {
        // Method to stop watching
        this.removeEventListener('dispatch', dispatchListener);
        root.removeEventListener(POP_STATE, browserListener);
        document.removeEventListener('DOMContentLoaded', browserListener);
        root.removeEventListener('readystatechange', browserListener);
        root.removeEventListener(HASH_CHANGE, browserListener);
        root.removeEventListener('load', loadListener);
        if (ieWatch) clearInterval(ieWatch);
      };
    },

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
            var slicedPattern = (val + '')[MATCH](/^\/(.+)\/([gmi]*)|(.*)/);

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

      // Setup options, must be executed after define all properties in rules
      if (typeof options == 'object') {
        objectMixinProperties(rule, options);
      }


      // Match is always a array, so you can test for match[n] anytime
      let match = [];
      Object.defineProperty(rule, MATCH, {
        get() {
          return match;
        },
        set(val) {
          if (!(val instanceof Array)) {
            throw new TypeError(DEV_ENV && 'match must be an array');
          }
          match = val;
        }
      });

      var oldMatch = [];
      Object.defineProperty(rule, OLD_MATCH, {
        get() {
          return oldMatch;
        },
        set(val) {
          if (!(val instanceof Array)) {
            throw new TypeError(DEV_ENV && 'oldMatch must be an array');
          }
          oldMatch = val;
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
        rule[methodName] = function proxyRuleMethodToRouter() {
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

    getUri(url) {
      let uri = '';
      if (!this.isPathValid) {
        return uri;
      }

      // If is a hash address, remove the
      let hashPosition = url.indexOf('#');
      if (hashPosition != -1) {
        // Remove all begin # ch ars from the location when using hash
        uri = url.substr(hashPosition)[MATCH](/.*#(.*)/)[1];
      } else {
        // Remove basePath
        uri = url.slice(this.basePath.length);
      }

      // Remove the very first slash, do don't match it as URI
      //TODO: make it optional
      uri = uri.replace(/^[\/]+/, '');

      return uri;
    },

    dispatch() {
      // Deferred trigger the actual browser location
      if (holdDispatch) {
        holdingDispatch = true;
        return this;
      }
      holdingDispatch = false;

      // If preventDefault in the dispatch event, it will not run rulesDispatcher()
      if (this.dispatchEvent(new root.CustomEvent('dispatch'))) {
        this.rulesDispatcher();
      }

      // If there is holding dispatch in the event, do it now
      if (holdingDispatch) {
        this.dispatch();
      }

      return this;
    },

    assign(url) {
      // Shortcut for pushState and dispatch methods
      return this.pushState(url).dispatch();
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

      function runner(uri, oldURI) {
        Array.prototype.slice.call(this.children || this.childNodes)
          .forEach(recursiveDispatcher.bind(this, uri, oldURI));
        return uri;
      }

      // if the basePath is not available in the path, make all rules leave
      eventsQueue.push(runner.bind(this, this.isPathValid ? this.uri : ''));

      // Is there already a queue been executed, so just add the runner
      // and let the main queue resolve it
      if (eventsQueue.length > 1) { return; }

      // Chain execute the eventsQueue
      let last = this.oldURI;
      while (eventsQueue.length) {
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
          let {events, element} = eventStack[type][0];

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
        const parentElement = ruleElement.parentElement;

        let useURI = uri || '';

        // Check if have a parent rule
        if (parentElement[MATCH]) {
          // New rule for 0.15.0 the default parentGroup is 0 from parent rule
          let parentGroup = isInt(ruleElement.parentGroup) ? +ruleElement.parentGroup : 0;
          useURI = parentElement[MATCH][parentGroup] || '';
        }

        const match = useURI[MATCH](ruleElement.rule) || [];
        const oldMatch = ruleElement[MATCH] || [];
        ruleElement[MATCH] = match;
        ruleElement[OLD_MATCH] = oldMatch;

        const children = Array.prototype.slice.call(ruleElement.children);

        function PushStateTreeEvent(name, params) {
          params = params || {};
          params.detail = params.detail || {};
          params.detail[MATCH] = match || [];
          params.detail[OLD_MATCH] = oldMatch || [];
          params.cancelable = true;
          return new root.CustomEvent(name, params);
        }

        const isNewURI = match.length && !oldMatch.length || match[0] != oldMatch[0];
        // Not match or leave?
        if (match.length === 0) {
          if (oldMatch.length === 0 || !isNewURI) {
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

        // From version 0.15.0 match only dispatch if URL has changed
        if (isNewURI) {
          // dispatch the match event
          this.eventStack[MATCH].push({
            element: ruleElement,
            events: [
              new PushStateTreeEvent(MATCH)
            ]
          });

          ruleElement.uri = match[0];
          ruleElement.setAttribute('uri', match[0]);

          if (oldMatch.length === 0) {
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
          } else {
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
        }

        children.forEach(recursiveDispatcher.bind(this, uri, oldURI));
      }
    }
  }
});

function preProcessUriBeforeExecuteNativeHistoryMethods(method) {

  // If not pushState or replaceState methods, execute it from history API
  if (method !== 'pushState' && method !== 'replaceState') {
    this[method] = function () {
      history[method].apply(history, arguments);
      return this;
    };
    return;
  }

  this[method] = function () {
    // Wrap method

    // remove the method from arguments
    let args = Array.prototype.slice.call(arguments);
    let uri = args[0] || '';
    if (typeof args[2] === 'string') {
      uri = args[2];
    }

    // if has a basePath translate the not relative paths to use the basePath
    if (!isExternal(uri)) {
      // When not external link, need to normalize the URI

      if (isRelative(uri)) {
        // Relative to the uri
        var basePath = this.uri[MATCH](/^([^?#]*)\//);
        basePath = basePath ? basePath[1] + '/' : '';
        uri = basePath + uri;
      } else {
        // This isn't relative, will cleanup / and # from the begin and use the remain path
        uri = uri[MATCH](/^([#/]*)?(.*)/)[2];
      }

      if (!this.usePushState) {

        // Ignore basePath when using location.hash and resolve relative path and keep
        // the current location.pathname, some browsers history API might apply the new pathname
        // with the hash content if not explicit
        uri = location.pathname + '#' + resolveRelativePath(uri);
      } else {

        // Add the basePath to your uri, not allowing to go by pushState outside the basePath
        uri = this.basePath + uri;
      }
    }

    // Ignore state and make the url be the current uri
    args[0] = null;
    args[2] = uri;

    this.path = this.basePath + uri;
    history[method].apply(history, args);
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
  && location
) {
  PushStateTree.prototype.pushState = function (uri, ignored, deprecatedUri) {
    // Does a shim for pushState when history API doesn't support pushState,
    // from version 0.15.x it ignores state and title definition since they are
    // never used in any production project so far and seems to make harder to
    // developers to use the method since they need to add 2 useless arguments
    // before the really necessary one.
    // However it keeps compatible with any implementation that already add the
    // url as third argument.
    if (typeof deprecatedUri == 'string') {
      uri = deprecatedUri;
    }
    if (typeof uri != 'string') {
      uri = '';
    }

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

    // Include the basePath in the uri, if is already in the current router
    // basePath, it will apply the assign without refresh, but if the basePath
    // is different, it will refresh the browser to work in the current router
    // basePath.
    // The behavior is the same in browsers that support pushState, however they
    // don't refresh when switching between basePath of different routers
    this.path = this.basePath + uri;
    if (location.pathname == this.basePath) {
      location.hash = uri;
    } else {
      location.assign(uri);
    }

    return this;
  };

  PushStateTree.prototype.replaceState = function (uri, ignored, deprecatedUri) {
    // Does a shim for replaceState when history API doesn't support pushState,
    // from version 0.15.x it ignores state and title definition since they are
    // never used in any production project so far and seems to make harder to
    // developers to use the method since they need to add 2 useless arguments
    // before the really necessary one.
    // However it keeps compatible with any implementation that already add the
    // url as third argument.

    if (typeof deprecatedUri == 'string') {
      uri = deprecatedUri;
    }
    if (typeof uri != 'string') {
      uri = '';
    }

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

    // Include the basePath in the uri, if is already in the current router
    // basePath, it will apply the replace without refresh, but if the basePath
    // is different, it will refresh the browser to work in the current router
    // basePath.
    // The behavior is the same in browsers that support pushState, however they
    // don't refresh when switching between basePath of different routers
    this.path = this.basePath + uri;
    location.replace(uri);

    return this;
  };
}

// Node import support
module.exports = PushStateTree;
