if (typeof PST_NO_SHIM === 'undefined') {
  // IE 8 shims
  if (!Element.prototype.addEventListener && Object.defineProperty) {

    // create an MS event object and get prototype
    var proto = document.createEventObject().constructor.prototype;

    Object.defineProperty(proto, 'target', {
      get: function () {
        return this.srcElement;
      }
    });

    // IE8 addEventLister shim
    var addEventListenerFunc = function (type, handler) {
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
    var removeEventListenerFunc = function (type, handler) {
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

    Event = function (type, obj) {

      var evt = document.createEventObject();

      obj = obj || {};
      evt.type = type;
      evt.detail = obj.detail;

      if (!('on' + type in window) || type === 'hashchange') {
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
  }
}