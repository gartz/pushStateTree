const root = typeof window !== 'undefined' && window || global;

import { objectMixinProperties, proxyTo, isInt } from './helpers';

import { LEAVE, UPDATE, ENTER, CHANGE, MATCH, OLD_MATCH } from './constants';

function PushStateTree(options) {
  options = options || {};

  // Force the instance to always return a HTMLElement
  if (!(this instanceof PushStateTree.adapter.instanceof)) {

    // Allow plugins override the instance create
    let instance = PushStateTree.create.apply(this, arguments);
    return PushStateTree.apply(instance, arguments);
  }

  this.eventStack = {
    leave: [],
    change: [],
    enter: [],
    match: []
  };

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

      let event = new root.CustomEvent('path', {
        detail: {
          value: value,
          oldValue: path
        }
      });

      if (this.dispatchEvent(event)) {
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
  Object.defineProperty(this, 'disabled', {
    get() {
      return disabled;
    },
    set(value) {
      value = value === true;
      if (value != disabled) {
        disabled = value;
        this.dispatchEvent(new root.CustomEvent(disabled ? 'disabled' : 'enabled'));
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

objectMixinProperties(PushStateTree, {
  // VERSION is defined in the webpack build, it is replaced by package.version
  VERSION,
  plugins: [],
  adapter: {
    // Add compatibility with old IE browsers
    instanceof: typeof HTMLElement !== 'undefined' ? HTMLElement : Element
  },
  addAdapter(Constructor, ...args) {

    // Define the prototype from the constructor to be the PushStateTree.prototype
    Constructor.prototype = PushStateTree.prototype;

    // Create a instance of the constructor with the arguments
    let instance = new Constructor(...args);

    // Extend the prototype chain from PushStateTree with such instance
    PushStateTree.prototype = instance;

    return instance;
  },

  create(options) {
    if (!this) {
      throw new Error(DEV_ENV && 'Method create requires a context.');
    }
    options = options || {};
    options.plugins = Array.isArray(options.plugins) ? options.plugins : [];

    let router = PushStateTree.createElement('pushstatetree-route');

    // Execute prototype create
    if (typeof this.create == 'function') {
      this.create(router, ...arguments);
    }

    // Proxy all PushStateTree prototype properties and methods to the current PST instance
    proxyTo(router, PushStateTree.prototype);

    this.plugins = [];
    let plugins = options.plugins;
    let createArguments = arguments;

    plugins.forEach(plugin => {

      // Execute the static create method
      if (plugin.constructor && typeof plugin.constructor.create == 'function') {
        plugin.constructor.create.call(plugin, router, ...createArguments);
      }

      // Execute the create method
      if (typeof plugin.create == 'function') {
        plugin.create(router, ...createArguments);
      }

      // Expose loaded plugins
      this.plugins.push(plugin);
    });

    return router;
  },

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

// Node import support
export default PushStateTree;
