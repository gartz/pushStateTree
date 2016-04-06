if (typeof PST_NO_SHIM === 'undefined') {
  // Opera and most of IE version doesn't implement location.origin
  // https://developer.mozilla.org/en-US/docs/Web/API/Window/location
  let root = window;
  if (root && !root.location.origin) {
    root.location.origin = root.location.protocol + '//' + root.location.host;
  }
}