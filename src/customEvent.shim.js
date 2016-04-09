require('./eventTarget.shim');

if (typeof PST_NO_SHIM === 'undefined') {
  var isIE = require('./ieOld.shim').isIE;

  var root = window;

  // IE9 shims
  var HashChangeEvent = root.HashChangeEvent;
  var Event = root.Event;

  if (!Element.prototype.addEventListener) {
    throw new Error('CustomEvent shim needs EventTarget support to work.');
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
  if (!root.HashChangeEvent || (root.opera && root.opera.version() < 15) || isIE()) {
    root.HashChangeEvent = root.CustomEvent;
  }

  if (isIE()) {
    root.Event = CustomEvent;
  }

  // fix for Safari
  try {
    new root.HashChangeEvent('hashchange');
  } catch (e) {
    root.HashChangeEvent = CustomEvent;
  }

  try {
    new root.Event('popstate');
  } catch (e) {
    root.Event = CustomEvent;
  }
}