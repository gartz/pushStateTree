import PushStateTree from '../push-state-tree';
import { MATCH } from '../constants';
import { isExternal, isRelative, resolveRelativePath, proxyTo } from './../helpers';

const root = typeof window == 'object' ? window : global;

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

function BrowserHistory(options) {
  const enumerable = true;

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

  if (!PushStateTree.hasOwnProperty('hasPushState')) {
    let globalHasPushState = this.hasPushState;
    Object.defineProperty(PushStateTree, 'hasPushState', {
      get() {
        if (DEV_ENV) console.info('The static property hasPushState is deprecated. Use BrowserHistory plugin.');
        return globalHasPushState;
      },
      set(value) {
        globalHasPushState = !!value;
      },
      enumerable
    });
  }

  // Allow switch between pushState or hash navigation modes, in browser that doesn't support
  // pushState it will always be false. and use hash navigation enforced.
  // use backend non permanent redirect when old browsers are detected in the request.
  let usePushState = false;
  Object.defineProperty(this, 'usePushState', {
    get() {
      return usePushState;
    },
    set(val) {
      usePushState = this.hasPushState ? val !== false : false;
    },
    enumerable
  });
  this.usePushState = options.usePushState;

  // When enabled beautifyLocation will replace the location using history.replaceState
  // to remove the hash from the URL
  let beautifyLocation = false;
  Object.defineProperty(this, 'beautifyLocation', {
    get() {
      return beautifyLocation && this.usePushState;
    },
    set(value) {
      beautifyLocation = value === true;
    },
    enumerable
  });

  this.beautifyLocation = this.usePushState && options.beautifyLocation !== false;
}

BrowserHistory.create = function (router) {

  // Proxy all plugins instance properties and methods
  proxyTo(router, this);

  let stopListeners = () => {};
  let enableListeners = () => {

    // Listen for path changes, and applyBeautifyLocation
    let listener = (event) => {
      if (router.applyBeautifyLocation()) {
        event.preventDefault();
      }
    };
    router.addEventListener('dispatch', listener);

    stopListeners = () => {
      router.removeEventListener(listener);
    };
  };
  router.addEventListener('disabled', stopListeners);
  router.addEventListener('enabled', enableListeners);

  if (!router.disabled) {
    router.applyBeautifyLocation();
  }
};

BrowserHistory.prototype.applyBeautifyLocation = function () {
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
  return false;
};

export default BrowserHistory;