(function (root) {
  'use strict';
  
  var isIE = (function(){
    var trident = window.navigator.userAgent.indexOf('Trident');

    return trident >= 0;
  }());
  
  (function () {
    if (!Array.prototype.compare) {
      // Credits: http://stackoverflow.com/questions/7837456/comparing-two-arrays-in-javascript
      // attach the .compare method to Array's prototype to call it on any array
      Array.prototype.compare = function (array) {
        // if the other array is a falsy value, return
        if (!array)
          return false;
    
        // compare lengths - can save a lot of time
        if (this.length != array.length)
          return false;
    
        for (var i = 0, l=this.length; i < l; i++) {
          // Check if we have nested arrays
          if (this[i] instanceof Array && array[i] instanceof Array) {
            // recurse into the nested arrays
            if (!this[i].compare(array[i]))
              return false;
          }
          else if (this[i] != array[i]) {
            // Warning - two different object instances will never be equal: {x:20} != {x:20}
            return false;
          }
        }
        return true;
      };
    }
  })();
  
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
  
  function wrapProperty(scope, prop, target) {
    Object.defineProperty(scope, prop, {
      get: function () {
        return target;
      },
      set: function () {},
      enumerable: true
    });
  }

  var frag = document.createDocumentFragment();
  
  function PushStateTree() {
    var isProto = PushStateTree.prototype === frag;
    var method;
    
    // After this only prototype
    if (!isProto) return;
    
    var oldState = null;
    var oldURI = '';
      
    this.createRule = function (options) {
      // Create a pushstreamtree-rule element from a literal object
      
      var rule = document.createElement('pushstatetree-rule');
      for (var prop in options)
      if (options.hasOwnProperty(prop)) {
        rule[prop] = options[prop];
      }
      
      rule.match = null;
      rule.oldMatch = null;
      
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
        if (typeof ruleElement.parentGroup === 'number') {
          useURI = '';
          if (ruleElement.parentElement.match)
            useURI = ruleElement.parentElement.match[ruleElement.parentGroup];
          
          useOldURI = '';
          if (ruleElement.parentElement.oldMatch)
            useOldURI = ruleElement.parentElement.oldMatch[ruleElement.parentGroup];
        }
        
        var match = useURI.match(ruleElement.rule);
        ruleElement.match = match;
        var oldMatch = useOldURI.match(ruleElement.rule);
        ruleElement.oldMatch = oldMatch;
        var children = Array.prototype.slice.call(ruleElement.children);
        
        function PushStateTreeEvent(name, params) {
          
          params = params || {};
          params.detail = params.detail || {};
          params.detail.match = match;
          params.detail.oldMatch = oldMatch;

          var event = new CustomEvent(name, params);

          delete event.target;
          delete event.srcElement;
          try {
            Object.defineProperty(event, 'target', {
              value: params.target || ruleElement
            });
            Object.defineProperty(event, 'srcElement', {
              value: params.srcElement || ruleElement
            });
          } catch (e) {
            event.target = params.target || ruleElement;
            event.srcElement = params.srcElement || ruleElement;
          }
          return event;
        }
        
        // Not match or leave?
        if (match === null) {
          if (oldMatch === null) {
            // just not match...
            return;
          }
          
          children.forEach(recursiveDispatcher.bind(this));
          
          // dispatch leave event
          ruleElement.dispatchEvent(new PushStateTreeEvent('leave'));
          return;
        }
        
        if (oldMatch === null) {
          // dispatch the enter event
          ruleElement.dispatchEvent(new PushStateTreeEvent('enter'));
          
          children.forEach(recursiveDispatcher.bind(this));
          return;
        }
        
        // dispatch the update event
        ruleElement.dispatchEvent(new PushStateTreeEvent('update'));
        
        // if has something changed, dispatch the change event
        if (!match.compare(oldMatch)) {
          ruleElement.dispatchEvent(new PushStateTreeEvent('change'));
        }
        
        children.forEach(recursiveDispatcher.bind(this));
      }
      
      Array.prototype.slice.call(this.children || this.childNodes)
        .forEach(recursiveDispatcher.bind(this));
    };
    
    // Wrap frag methods
    for (method in frag) 
    if (!this.hasOwnProperty(method)) {
      if (typeof frag[method] === 'function') {
        this[method] = frag[method].bind(frag);
      } else {
        wrapProperty(this, method, frag[method]);
      }
        
    }
    
    // Wrap history methods
    for (method in root.history) 
    if (typeof root.history[method] === 'function') {
      this[method] = function (method) {
        // Wrap method
        
        // remove the method from arguments
        var args = Array.prototype.slice.call(arguments, 1);
        root.history[method].apply(root.history, args);
        
        // Chainnable
        return this;
      }.bind(this, method);
    }
    
    var lastTitle = null;
    if (!this.pushState) {
      this.pushState = function(state, title, url) {
        var t = document.title;
        if (lastTitle !== null) {
            document.title = lastTitle;
        }
        //TODO: Don't trigger!!!
        
        root.location.hash = url;
        document.title = t;
        lastTitle = title;
      };
    }

    if (!this.replaceState) {
      this.replaceState = function(state, title, url) {
        var t = document.title;
        if (lastTitle !== null) {
            document.title = lastTitle;
        }
        //TODO: Don't trigger!!!
        
        root.location.replace(url);
        document.title = t;
        lastTitle = title;
      };
    }
    
    this.dispatch = function () {
      // Trigger the actual browser location
      
      root.dispatchEvent(new Event('popstate'));
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
        return location.href.slice(location.origin.length);
      }
    });
    
    root.addEventListener('popstate', function (event) {
      this.rulesDispatcher();

      oldURI = this.uri;
      oldState = this.state;
    }.bind(this));

    root.addEventListener('hashchange', function (event) {
      // Don't dispatch, because already have dispatched in popstate event
      if (oldURI === this.uri) return;
      this.rulesDispatcher();

      oldURI = this.uri;
      oldState = this.state;
    }.bind(this));
    
    // Uglify propourses
    var dispatchHashChange = function () {
      root.dispatchEvent(new root.HashChangeEvent('hashchange'));
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
          }
        }.bind(this), 50);
      }
    }.bind(this));
    
  }
  
  PushStateTree.prototype = frag;
  
  PushStateTree.prototype = new PushStateTree();
  
  root.PushStateTree = PushStateTree;
})(this);