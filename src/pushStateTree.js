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
      root.location.origin = root.location.protocol + '://' + root.location.host;
    }
  })();
  
  (function () {
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
  
    CustomEvent.prototype = root.Event.prototype;
  
    if (!root.CustomEvent || !!isIE) {
      root.CustomEvent = CustomEvent;
    }
    
    // Opera before 15 has HashChangeEvent but throw a DOM Implement error
    if (!root.HashChangeEvent || (root.opera && root.opera.version() < 15) || !!isIE) {
      root.HashChangeEvent = root.CustomEvent;
    }
    
    if (!!isIE) {
      root.Event = root.CustomEvent;
    }
  })();
  
  // Helpers
  
  function wrapProperty(scope, prop, target) {
    Object.defineProperty(scope, prop, {
      get: function () {
        return target;
      },
      set: function () {},
      enumerable: true
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
  var frag = document.createDocumentFragment();
  
  function PushStateTree(options) {
    var isProto = PushStateTree.prototype === frag;
    var method;
    options = options || {};
    
    if (!root.history || !root.history.pushState) {
      Object.defineProperty(this, 'usePushState', {
        get: function () {
          return false;
        }
      });
    } else {
      this.usePushState = options.usePushState !== false;
    }
    
    var proto = PushStateTree.prototype;
    if (typeof proto.basePath === 'string') {
      proto.basePath = options.basePath || proto.basePath;
    }
    
    // After this only prototype
    if (!isProto) return;
    
    var oldState = null;
    var oldURI = '';
    
    this.basePath = '';
      
    this.createRule = function (options) {
      // Create a pushstreamtree-rule element from a literal object
      
      var rule = document.createElement('pushstatetree-rule');
      for (var prop in options)
      if (options.hasOwnProperty(prop)) {
        rule[prop] = options[prop];
      }
      
      // Match is always a array, so you can test for match[n] anytime
      var match = [];
      Object.defineProperty(rule, 'match', {
        get: function () {
          return match;
        },
        set: function (val) {
          match = val instanceof Array ? val : [];
        },
        enumerable: true
      });
      
      var oldMatch = [];
      Object.defineProperty(rule, 'oldMatch', {
        get: function () {
          return oldMatch;
        },
        set: function (val) {
          oldMatch = val instanceof Array ? val : [];
        },
        enumerable: true
      });
      
      rule.match = [];
      rule.oldMatch = [];
      
      return rule;
    };
    
    this.add = function (options) {
      // Transform any literal object in a pushstatetree-rule and append it
      
      this.appendChild(this.createRule(options));
    };
    
    this.remove = function (queryOrElement) {
      // Remove a pushstateree-rule, pass a element or it query
      
      var element = queryOrElement;
      if (typeof queryOrElement === 'string') {
        element = this.querySelector(queryOrElement);
      }
      
      if (element && element.parentElement) {
        element.parentElement.removeChild(element);
        return element;
      }
    };
    
    this.rulesDispatcher = function () {
      // Will dispatch the right events in each rule
      
      function recursiveDispatcher(ruleElement) {
        if (!ruleElement.rule) return;
        
        var useURI = this.uri;
        var useOldURI = oldURI;
        var parentElement;
        
        if (typeof ruleElement.parentGroup === 'number') {
          useURI = '';
          parentElement = ruleElement.parentElement;
          
          if (parentElement.match.length > ruleElement.parentGroup)
            useURI = parentElement.match[ruleElement.parentGroup] || '';
          
          useOldURI = '';
          if (parentElement.oldMatch.length > ruleElement.parentGroup)
            useOldURI = parentElement.oldMatch[ruleElement.parentGroup] || '';
        }
        
        ruleElement.match = useURI.match(ruleElement.rule);
        ruleElement.oldMatch = useOldURI.match(ruleElement.rule);
        var match = ruleElement.match;
        var oldMatch = ruleElement.oldMatch;
        var children = Array.prototype.slice.call(ruleElement.children);
        
        function PushStateTreeEvent(name, params) {
          
          params = params || {};
          params.detail = params.detail || {};
          params.detail.match = match || [];
          params.detail.oldMatch = oldMatch || [];
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
          children.forEach(recursiveDispatcher.bind(this));
          
          // dispatch leave event
          ruleElement.dispatchEvent(new PushStateTreeEvent('leave'));
          
          // dispatch the any event
          ruleElement.dispatchEvent(new PushStateTreeEvent('update', {
            detail: {type: 'leave'}
          }));
          return;
        }
        
        // dispatch the match event
        ruleElement.dispatchEvent(new PushStateTreeEvent('match'));
        
        if (oldMatch.length === 0) {
          // dispatch the enter event
          ruleElement.dispatchEvent(new PushStateTreeEvent('enter'));
          
          ruleElement.dispatchEvent(new PushStateTreeEvent('update', {
            detail: {type: 'enter'}
          }));
          
          children.forEach(recursiveDispatcher.bind(this));
          return;
        }
        
        // if has something changed, dispatch the change event
        if (match[0] !== oldMatch[0]) {
          ruleElement.dispatchEvent(new PushStateTreeEvent('change'));
          
          ruleElement.dispatchEvent(new PushStateTreeEvent('update', {
            detail: {type: 'change'}
          }));
        }
        
        
        children.forEach(recursiveDispatcher.bind(this));
      }
      
      Array.prototype.slice.call(this.children || this.childNodes)
        .forEach(recursiveDispatcher.bind(this));
    };
    
    // Wrap frag methods
    for (method in frag) 
    if (!this.hasOwnProperty(method)) {
      if (typeof frag[method] === 'function' && frag[method].bind) {
        this[method] = frag[method].bind(frag);
      } else {
        wrapProperty(this, method, frag[method]);
      }
        
    }
    
    // Wrap history methods
    for (method in root.history) 
    if (typeof root.history[method] === 'function') {
      (function () {
        var scopeMethod = method;
        this[method] = function () {
          // Wrap method
          
          // remove the method from arguments
          var args = Array.prototype.slice.call(arguments);
          
          // if has a basePath translate the not relative paths to use the basePath
          if (scopeMethod === 'pushState' || scopeMethod === 'replaceState') {
            if (!this.usePushState && !isExternal(args[2]) && args[2][0] !== '#') {
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
      }.bind(this))();
    }
    
    var readdOnhashchange = false;
    function avoidTriggering() {
      // Avoid triggering hashchange event
      root.removeEventListener('hashchange', onhashchange);
      readdOnhashchange = true;
    }
    var lastTitle = null;
    if (!this.pushState) {
      this.pushState = function(state, title, url) {
        var t = document.title;
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

    
    if (!this.replaceState) {
      this.replaceState = function(state, title, url) {
        var t = document.title;
        if (lastTitle !== null) {
            document.title = lastTitle;
        }
        avoidTriggering();
        
        // Replace the url
        if (!isExternal(url) && url[0] !== '#') {
          url = '#' + url;
        }
        
        if (isRelative(url)) {
          url = root.location.hash.slice(1, root.location.hash.lastIndexOf('/') + 1) + url;
        }
        
        root.location.replace(url);
        document.title = t;
        lastTitle = title;
        
        return this;
      };
    }
    
    this.dispatch = function () {
      // Trigger the actual browser location
      var event;
      try {
        event = new Event('popstate');
      } catch (e) {
        event = new CustomEvent('popstate');
      }
      
      root.dispatchEvent(event);
      return this;
    };
    
    wrapProperty(this, 'length', root.history.length);
    
    Object.defineProperty(this, 'state', {
      get: function () {
        return root.history.state;
      }
    });
    
    Object.defineProperty(this, 'uri', {
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
    
    root.addEventListener('popstate', function (event) {
      this.rulesDispatcher();

      oldURI = this.uri;
      oldState = this.state;
    }.bind(this));
    
    var onhashchange = function (event) {
      // Don't dispatch, because already have dispatched in popstate event
      if (oldURI === this.uri) return;
      this.rulesDispatcher();

      oldURI = this.uri;
      oldState = this.state;
    }.bind(this)

    root.addEventListener('hashchange', onhashchange);
    
    // Uglify propourses
    var dispatchHashChange = function () {
      var event;
      try {
        event = new root.HashChangeEvent('hashchange');
      } catch(e) {
        event = new root.CustomEvent('hashchange');
      }
      root.dispatchEvent(event);
    }
    
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
          if (this.uri !== oldURI) {
            dispatchHashChange();
            return;
          }
          if (readdOnhashchange) {
            readdOnhashchange = false;
            oldURI = this.uri;
            root.addEventListener('hashchange', onhashchange);
          }
          
        }.bind(this), 50);
      }
    }.bind(this));
    
  }
  
  PushStateTree.prototype = frag;
  
  PushStateTree.prototype = new PushStateTree();
  
  root.PushStateTree = PushStateTree;
})(this);
