import PushStateTree from '../push-state-tree';
import { isIE } from '../ieOld.shim';
import { isExternal, isRelative, convertToURI, resolveRelativePath } from './../helpers';

const HASH_CHANGE = 'hashchange';
const POP_STATE = 'popstate';

const root = typeof window == 'object' ? window : global;

let location = PushStateTree.adapter.location || root.location;
PushStateTree.adapter.location = location;
location = () => PushStateTree.adapter.location;

export function BrowserAdapter() {

  this.globalListeners = function() {
    // Called when creating a new instance of the parent of the current prototype

    // Start the browser global listeners and return a method to stop listening to them

    let browserListener = () => {
      let pathURI = convertToURI(location().href);
      if (this.path != pathURI) {
        this.path = pathURI;
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
      root.removeEventListener(POP_STATE, browserListener);
      document.removeEventListener('DOMContentLoaded', browserListener);
      root.removeEventListener('readystatechange', browserListener);
      root.removeEventListener(HASH_CHANGE, browserListener);
      root.removeEventListener('load', loadListener);
      if (ieWatch) clearInterval(ieWatch);
    };
  };

  this.pushState = function (uri, ignored, deprecatedUri) {
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
      location().href = uri;
    }

    // Remove the has if is it present
    if (uri[0] === '#') {
      uri = uri.slice(1);
    }

    if (isRelative(uri)) {
      uri = location().hash.slice(1, location().hash.lastIndexOf('/') + 1) + uri;
      uri = resolveRelativePath(uri);
    }

    // Include the basePath in the uri, if is already in the current router
    // basePath, it will apply the assign without refresh, but if the basePath
    // is different, it will refresh the browser to work in the current router
    // basePath.
    // The behavior is the same in browsers that support pushState, however they
    // don't refresh when switching between basePath of different routers
    this.path = this.basePath + uri;
    if (location().pathname == this.basePath) {
      location().hash = uri;
    } else {
      location().assign(uri);
    }

    return this;
  };

  this.replaceState = function (uri, ignored, deprecatedUri) {
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
      var relativePos = location().hash.lastIndexOf('/') + 1;
      uri = location().hash.slice(1, relativePos) + uri;
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
    location().replace(uri);

    return this;
  };

  this.create = function (router) {
    if (typeof BrowserAdapter.prototype.create == 'function') {
      BrowserAdapter.prototype.create.apply(this, arguments);
    }

    let globalListeners = () => {};
    let enableListeners = () => {
      globalListeners = this.globalListeners.apply(router);
    };
    router.addEventListener('disabled', globalListeners);
    router.addEventListener('enabled', enableListeners);

    if (!router.disabled) {
      enableListeners();
    }
  };
}

export default BrowserAdapter;