import { MATCH } from '../constants';
import { isExternal, isRelative, convertToURI, resolveRelativePath } from './../helpers';
import { isIE } from '../ieOld.shim';

const HASH_CHANGE = 'hashchange';
const POP_STATE = 'popstate';

const root = typeof window == 'object' ? window : global;

function BrowserHistory(options) {
  if (!(this instanceof BrowserHistory)) {
    return new BrowserHistory(options);
  }
  options = options || {};

  let location = this.location = options.location || root.location;
  let history = this.history = options.history || root.history;
  
  if (!location) {
    throw new Error(DEV_ENV && 'BrowserHistory require Location API');
  }

  /*eslint guard-for-in: "off"*/
  for (var method in history) {
    if (typeof history[method] === 'function') {
      preProcessUriBeforeExecuteNativeHistoryMethods.call(this, history, location, method);
    }
  }

  this.hasPushState = !!(history && history.pushState);
}

BrowserHistory.prototype.create = function () {
  let globalListeners = () => {};
  let enableListeners = () => {
    globalListeners = this.globalListeners();
  };
  this.addEventListener('disabled', globalListeners);
  this.addEventListener('enabled', enableListeners);
};


BrowserHistory.prototype.globalListeners = function() {
  // Called when creating a new instance of the parent of the current prototype

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
};

function preProcessUriBeforeExecuteNativeHistoryMethods(history, location, method) {

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

BrowserHistory.prototype.pushState = function (uri, ignored, deprecatedUri) {
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
    this.location.href = uri;
  }

  // Remove the has if is it present
  if (uri[0] === '#') {
    uri = uri.slice(1);
  }

  if (isRelative(uri)) {
    uri = this.location.hash.slice(1, this.location.hash.lastIndexOf('/') + 1) + uri;
    uri = resolveRelativePath(uri);
  }

  // Include the basePath in the uri, if is already in the current router
  // basePath, it will apply the assign without refresh, but if the basePath
  // is different, it will refresh the browser to work in the current router
  // basePath.
  // The behavior is the same in browsers that support pushState, however they
  // don't refresh when switching between basePath of different routers
  this.path = this.basePath + uri;
  if (this.location.pathname == this.basePath) {
    this.location.hash = uri;
  } else {
    this.location.assign(uri);
  }

  return this;
};

BrowserHistory.prototype.replaceState = function (uri, ignored, deprecatedUri) {
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
    var relativePos = this.location.hash.lastIndexOf('/') + 1;
    uri = this.location.hash.slice(1, relativePos) + uri;
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
  this.location.replace(uri);

  return this;
};

export default BrowserHistory;