if (typeof PST_NO_OLD_IE === 'undefined' && typeof PST_NO_SHIM === 'undefined') {
  // modern browser support forEach, probably will be IE8
  var modernBrowser = 'forEach' in Array.prototype;

  // IE8 pollyfills:
  // IE8 slice doesn't work with NodeList
  if (!modernBrowser) {
    var builtinSlice = Array.prototype.slice;
    Array.prototype.slice = function() {
      var arr = [];
      for (var i = 0, n = this.length; i < n; i++) {
        if (i in this) {
          arr.push(this[i]);
        }
      }

      return builtinSlice.apply(arr, arguments);
    };
  }
  if (!('forEach' in Array.prototype)) {
    Array.prototype.forEach = function(action, that) {
      for (var i = 0; i < this.length; i++) {
        if (i in this) {
          action.call(that, this[i], i);
        }
      }
    };
  }
  if (typeof String.prototype.trim !== 'function') {
    String.prototype.trim = function() {
      return this.replace(/^\s+|\s+$/g, '');
    };
  }
  if (!Array.prototype.filter) {
    Array.prototype.filter = function(fun /*, thisArg */) {
      if (this === void 0 || this === null) {
        throw new TypeError();
      }

      var t = Object(this);
      var len = t.length >>> 0;
      if (typeof fun !== 'function') {
        throw new TypeError();
      }

      var res = [];
      var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
      for (var i = 0; i < len; i++) {
        if (i in t) {
          var val = t[i];

          // NOTE: Technically this should Object.defineProperty at
          //       the next index, as push can be affected by
          //       properties on Object.prototype and Array.prototype.
          //       But that method's new, and collisions should be
          //       rare, so use the more-compatible alternative.
          if (fun.call(thisArg, val, i, t)) { res.push(val); }
        }
      }

      return res;
    };
  }

  // IE 8 don't support bind
  if (!Function.prototype.bind) {
    Function.prototype.bind = function (oThis) {
      if (typeof this !== 'function') {
        // closest thing possible to the ECMAScript 5 internal IsCallable function
        throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
      }

      var aArgs = Array.prototype.slice.call(arguments, 1),
        fToBind = this,
        FNOP = function () {},
        fBound = function () {
          var context = oThis;
          if (this instanceof FNOP && oThis){
            context = this;
          }
          return fToBind.apply(context, aArgs.concat(Array.prototype.slice.call(arguments)));
        };

      FNOP.prototype = this.prototype;
      fBound.prototype = new FNOP();

      return fBound;
    };
  }
}