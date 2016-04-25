export function isExternal(url) {
  // Check if a URL is external
  return (/^[a-z0-9]+:\/\//i).test(url);
}

export function isRelative(uri) {
  // Check if a URI is relative path, when begin with # or / isn't relative uri
  return (/^[^#/]/).test(uri);
}

export function convertToURI(url) {
  // Remove unwanted data from url
  // if it's a browser it will remove the location.origin
  // else it will ignore first occurrence of / and return the rest
  if (location && url == location.href) {
    let host = location.host && `//${location.host}`;
    return url.substr(`${location.protocol}${host}`.length);
  } else {
    let match = url.match(/([^\/]*)(\/+)?(.*)/);
    return match[2] ? match[3] : match[1];
  }
}

export function resolveRelativePath(path) {
  // Resolve relative paths manually for browsers using hash navigation

  var parts = path.split('/');
  var i = 1;
  while (i < parts.length) {
    // if current part is `..` and previous part is different, remove both of them
    if (parts[i] === '..' && i > 0 && parts[i-1] !== '..') {
      parts.splice(i - 1, 2);
      i -= 2;
    }
    i++;
  }
  return parts
    .join('/')
    .replace(/\/\.\/|\.\/|\.\.\//g, '/')
    .replace(/^\/$/, '');
}

export function objectMixinProperties(destineObject, sourceObject) {
  // Simple version of Object.assign
  for (let property in sourceObject) {
    if (sourceObject.hasOwnProperty(property)) {
      destineObject[property] = sourceObject[property];
    }
  }
}

export function isInt(n) {
  return typeof n != 'undefined' && !isNaN(parseFloat(n)) && n % 1 === 0 && isFinite(n);
}

export function proxyLikePrototype(context, prototypeContext) {
  // It proxy the method, or property to the prototype

  for (let property in prototypeContext) {
    if (typeof prototypeContext[property] == 'function') {

      // function wrapper, it doesn't use binding because it needs to execute the current version of the property in the
      // prototype to conserve the prototype chain resource
      context[property] = function proxyMethodToPrototype() {
        return prototypeContext[property].apply(this, arguments);
      };
      continue;
    }
    // Proxy prototype properties to the instance, but if they're redefined in the instance, use the instance definition
    // without change the prototype property value
    if (typeof context[property] == 'undefined') {
      let propertyValue;
      Object.defineProperty(context, property, {
        get() {
          if (typeof propertyValue == 'undefined') {
            return prototypeContext[property];
          }
          return propertyValue;
        },
        set(value) {
          propertyValue = value;
        }
      });
    }
  }
}