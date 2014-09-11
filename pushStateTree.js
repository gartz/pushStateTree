(function (root) {
  'use strict';

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
    if (Function.prototype.bind) return;

    Function.prototype.bind = function (oThis) {
      if (typeof this !== "function") {
        // closest thing possible to the ECMAScript 5 internal IsCallable function
        throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
      }

      var aArgs = Array.prototype.slice.call(arguments, 1), 
          fToBind = this, 
          fNOP = function () {},
          fBound = function () {
            return fToBind.apply(this instanceof fNOP && oThis
                    ? this
                    : oThis,
                    aArgs.concat(Array.prototype.slice.call(arguments)));
          };

      fNOP.prototype = this.prototype;
      fBound.prototype = new fNOP();

      return fBound;
    };
  })();

  // IE9 shims
  var HashChangeEvent = root.HashChangeEvent;
  var Event = root.Event;

  (function () {
    if (!Element.prototype.addEventListener) return;

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
    if (Element.prototype.addEventListener || !Object.defineProperty) return;

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
        document.documentElement[customEventId];
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

        if (type !== 'hashchange') return;
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

        if (type !== 'hashchange') return;
      }

      for (var i = 0; i < this.__bindedFunctions.length; i++) {
        if (this.__bindedFunctions[i].original === fn) {
          bindedFn = this.__bindedFunctions[i].binded;
          this.__bindedFunctions = this.__bindedFunctions.splice(i, 1);
          i = this.__bindedFunctions.length;
        }
      }
      if (!bindedFn) return;

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
      Array.prototype.slice = function(action, that) {
        'use strict';
        var arr = [];
        for (var i = 0, n = this.length; i < n; i++)
          if (i in this)
            arr.push(this[i]);

        return builtinSlice.apply(arr, arguments);
      };
    }
    if (!('forEach' in Array.prototype)) {
      Array.prototype.forEach = function(action, that) {
        'use strict';
        for (var i = 0, n = this.length; i < n; i++)
          if (i in this)
            action.call(that, this[i], i);
      };
    }
    if (typeof String.prototype.trim !== 'function') {
      String.prototype.trim = function() {
        return this.replace(/^\s+|\s+$/g, ''); 
      };
    }
    if (!Array.prototype.filter) {
      Array.prototype.filter = function(fun /*, thisArg */) {
        'use strict';

        if (this === void 0 || this === null)
          throw new TypeError();

        var t = Object(this);
        var len = t.length >>> 0;
        if (typeof fun !== 'function')
          throw new TypeError();

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
            if (fun.call(thisArg, val, i, t)) res.push(val);
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

  // Helpers
  function isInt(n) {
    return !isNaN(parseFloat(n)) && n % 1 === 0 && isFinite(n);
  }
  
  function wrapProperty(scope, prop, target) {
    Object.defineProperty(scope, prop, {
      get: function () {
        return target;
      },
      set: function () {},
    });
  }

  function isExternal(url) {
    // Check if a URL is external
    return (/^[a-z0-9]+:\/\//i).test(url);
  }

  function isRelative(url) {
    // Check if a URL is relative path
    if (url[0] === '#') {
      url = url.slice(1);
    }
    return url[0] !== '/';
  }

  //TODO: the container reference must be configurable to work with web components
  var rootElement = document.createElement('pushstatetree-route');
  var ready = false;

  function PushStateTree(options) {
    var method;
    options = options || {};

    if (ready) {
      // Setup options
      for (var prop in options) if (options.hasOwnProperty(prop)) {
        rootElement[prop] = options[prop];
      }

      return rootElement;
    }
    ready = true;

    if (!PushStateTree.prototype.hasPushState) {
      wrapProperty(rootElement, USE_PUSH_STATE, false);
    } else {
      Object.defineProperty(rootElement, USE_PUSH_STATE, {
        get: function () {
          return PushStateTree.prototype[USE_PUSH_STATE];
        },
        set: function (val) {
          PushStateTree.prototype[USE_PUSH_STATE] = val !== false;
        },
      });
      PushStateTree.prototype[USE_PUSH_STATE] = options[USE_PUSH_STATE] !== false;
    }

    rootElement.basePath = options.basePath || rootElement.basePath || '';

    for (var prop in PushStateTree.prototype)
    if (PushStateTree.prototype.hasOwnProperty(prop)) {
      (function (prop) {
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
            },
          });
        }
      })(prop);
    }

    wrapProperty(rootElement, 'length', root.history.length);
    wrapProperty(rootElement, 'state', root.history.state);

    Object.defineProperty(rootElement, 'uri', {
      get: function () {
        var uri;
        var hashPos = location.href.indexOf('#');
        if (hashPos !== -1) {
          uri = location.href.slice(hashPos + 1);
          uri = uri.replace(/^[#]+/, '');
        } else {
          uri = location.href.slice(location.origin.length);
          if (uri.indexOf(this.basePath) === 0) {
            uri = uri.slice(this.basePath.length);
          }
        }
        uri = uri.replace(/^[\/]+/, '');

        return uri;
      },
      configurable: true
    });

    root.addEventListener(POPSTATE, function (event) {
      rootElement.rulesDispatcher();

      oldURI = rootElement.uri;
      oldState = rootElement.state;
    }.bind(rootElement));

    root.addEventListener(HASHCHANGE, onhashchange);

    // Uglify propourses
    var dispatchHashChange = function () {
      var event;
      event = new HashChangeEvent(HASHCHANGE);
      root.dispatchEvent(event);
    };

    // Modern browsers
    document.addEventListener('DOMContentLoaded', function () {
      dispatchHashChange();
    });
    // Some IE browsers
    root.addEventListener('readystatechange', function () {
      dispatchHashChange();
    });
    // Almost all browsers
    root.addEventListener('load', function () {
      dispatchHashChange();

      if (isIE) {
        root.setInterval(function () {
          if (rootElement.uri !== oldURI) {
            dispatchHashChange();
            return;
          }
          if (readdOnhashchange) {
            readdOnhashchange = false;
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

  PushStateTree.prototype = {
    createRule: function (options) {
      // Create a pushstreamtree-rule element from a literal object

      var rule = document.createElement('pushstatetree-rule');
      
      // Bind rule propertie with element attribute
      var cachedRule = {
        regexp: new RegExp(),
        attribute: ''
      };
      Object.defineProperty(rule, 'rule', {
        get: function () {
          var attr = rule.getAttribute('rule') || '';
          if (cachedRule.attribute !== attr) {
            cachedRule.attribute = attr;
            //TODO: reset the rule state, after current queue of events

            // Detect RegExp with flags
            var flags = '';
            if (attr[0] === '/') {
              var lastSlash = attr.lastIndexOf('/');
              if (lastSlash > 0) {
                flags = attr.slice(lastSlash + 1);
                attr = attr.slice(1, lastSlash);
              }
            }
            cachedRule.regexp = new RegExp(attr, flags);
          }
          return cachedRule.regexp ;
        },
        set: rule.setAttribute.bind(rule, 'rule'),
      });
      
      // Bind rule propertie with element attribute
      Object.defineProperty(rule, 'parentGroup', {
        get: function () {
          var attr = rule.getAttribute('parent-group');
          //TODO: reset state when parent-group has changed or if the parent element has changed
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
        },
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
      
      //TODO: Add reset method, should reset all the children when triggered

      return rule;
    },

    add: function (options) {
      // Transform any literal object in a pushstatetree-rule and append it

      this.appendChild(this.createRule(options));
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
      // Trigger the actual browser location
      root.dispatchEvent(new Event(POPSTATE));
      return this;
    },

    rulesDispatcher: function () {
      // Will dispatch the right events in each rule
      /*jshint validthis:true */

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
          if (oldMatch.length === 0) {
            // just not match...
            return;
          }
          children.forEach(recursiveDispatcher.bind(this, uri, oldURI));

          // dispatch leave event
          ruleElement.dispatchEvent(new PushStateTreeEvent(LEAVE));

          // dispatch the any event
          ruleElement.dispatchEvent(new PushStateTreeEvent(UPDATE, {
            detail: {type: LEAVE}
          }));
          return;
        }

        // dispatch the match event
        ruleElement.dispatchEvent(new PushStateTreeEvent(MATCH));

        if (oldMatch.length === 0) {
          // dispatch the enter event
          ruleElement.dispatchEvent(new PushStateTreeEvent(ENTER));

          ruleElement.dispatchEvent(new PushStateTreeEvent(UPDATE, {
            detail: {type: ENTER}
          }));

          children.forEach(recursiveDispatcher.bind(this, uri, oldURI));
          return;
        }

        // if has something changed, dispatch the change event
        if (match[0] !== oldMatch[0]) {
          ruleElement.dispatchEvent(new PushStateTreeEvent(CHANGE));

          ruleElement.dispatchEvent(new PushStateTreeEvent(UPDATE, {
            detail: {type: CHANGE}
          }));
        }

        children.forEach(recursiveDispatcher.bind(this, uri, oldURI));
      }

      Array.prototype.slice.call(this.children || this.childNodes)
        .forEach(recursiveDispatcher.bind(this, this.uri, oldURI));
    }
  };

  // Wrap history methods
  for (var method in root.history) 
  if (typeof root.history[method] === 'function') {
    (function () {
      var scopeMethod = method;
      this[method] = function () {
        // Wrap method

        // remove the method from arguments
        var args = Array.prototype.slice.call(arguments);

        // if has a basePath translate the not relative paths to use the basePath
        if (scopeMethod === 'pushState' || scopeMethod === 'replaceState') {
          if (!this[USE_PUSH_STATE] && !isExternal(args[2]) && args[2][0] !== '#') {
            if (isRelative(args[2])) {
              args[2] = root.location.hash.slice(1, root.location.hash.lastIndexOf('/') + 1) + args[2];
            }
            args[2] = '#' + args[2];
          } else if (!isExternal(args[2])) {
            if (this.basePath && !isRelative(args[2]) && args[2][0] !== '#') {
              args[2] = this.basePath + args[2];
            }
          }
        }

        root.history[scopeMethod].apply(root.history, args);

        // Chainnable
        return this;
      };
    }.bind(PushStateTree.prototype))();
  }

  var onhashchange = function (event) {
    // Workaround IE8
    if (readdOnhashchange) return;

    // Don't dispatch, because already have dispatched in popstate event
    if (oldURI === rootElement.uri) return;
    rootElement.rulesDispatcher();

    oldURI = rootElement.uri;
    oldState = rootElement.state;
  }.bind(rootElement);

  var readdOnhashchange = false;
  function avoidTriggering() {
    // Avoid triggering hashchange event
    root.removeEventListener(HASHCHANGE, onhashchange);
    readdOnhashchange = true;
  }

  PushStateTree.prototype.hasPushState = root.history && !!root.history.pushState;
  if (!PushStateTree.prototype.hasPushState) {
    PushStateTree.prototype[USE_PUSH_STATE] = false;
  }

  var lastTitle = null;

  if (!PushStateTree.prototype.pushState) {
    PushStateTree.prototype.pushState = function(state, title, url) {
      var t = document.title || '';
      if (lastTitle !== null) {
          document.title = lastTitle;
      }
      avoidTriggering();

      // Replace hash url
      if (isExternal(url)) {
        // this will redirect the browser, so doesn't matters the rest...
        root.location.href = url;
      }

      // Remove the has if is it present
      if (url[0] === '#') {
        url = url.slice(1);
      }

      if (isRelative(url)) {
        url = root.location.hash.slice(1, root.location.hash.lastIndexOf('/') + 1) + url;
      }

      root.location.hash = url;

      document.title = t;
      lastTitle = title;

      return this;
    };
  }

  if (!PushStateTree.prototype.replaceState) {
    PushStateTree.prototype.replaceState = function(state, title, url) {
      var t = document.title || '';
      if (lastTitle !== null) {
          document.title = lastTitle;
      }
      avoidTriggering();

      // Replace the url
      if (isExternal(url)) {
        throw new Error('Invalid url replace.');
      }

      if (url[0] === '#') {
        url = url.slice(1);
      }

      if (isRelative(url)) {
        var relativePos = root.location.hash.lastIndexOf('/') + 1;
        url = root.location.hash.slice(1, relativePos) + url;
      }

      // Always use hash navigation
      url = '#' + url;

      root.location.replace(url);
      document.title = t;
      lastTitle = title;

      return this;
    };
  }

  root.PushStateTree = PushStateTree;
})(this);
