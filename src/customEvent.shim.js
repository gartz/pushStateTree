if (typeof PST_NO_SHIM === 'undefined') {
  var isIE = require('./ieOld.shim').isIE;

  var root = window;

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

    if (!root.CustomEvent || isIE()) {
      root.CustomEvent = CustomEvent;
    }

    // Opera before 15 has HashChangeEvent but throw a DOM Implement error
    if (!HashChangeEvent || (root.opera && root.opera.version() < 15) || isIE()) {
      HashChangeEvent = root.CustomEvent;
    }

    if (isIE()) {
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
}