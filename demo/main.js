/* global load, PushStateTree, basePath, $ */
'use strict';

var demoPath = basePath + '/demo/';

$('#loading').modal('show');

// Returns a function, that, as long as it continues to be invoked, will not
// be triggered. The function will be called after it stops being called for
// N milliseconds. If `immediate` is passed, trigger the function on the
// leading edge, instead of the trailing.
function debounce(func, wait, immediate) {
  var timeout;
  return function() {
    var context = this, args = arguments;
    var later = function() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    var callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
}

function trottle(func, wait) {
  var timeout;
  return function() {
    var context = this, args = arguments;
    var later = function() {
      timeout = null;
    };
    if (!timeout) func.apply(context, args);
    timeout = setTimeout(later, wait);
  };
}

function navbarAdd(text, link, order, rule){
  // Create and add menu option in the right priority order

  order = order || 1;
  var $navbarAnchor = $('<li><a></a></li>');
  $navbarAnchor
    .data('order', order)
    .find('a')
    .attr('href', basePath + link)
    .text(text);
  var $navbarMain = $('#navbarMain');
  var $anchors = $navbarMain.children();
  $navbarMain.append($navbarAnchor);
  $anchors.filter(
    function () {
      return +$(this).data('order') > order;
    })
    .first()
    .before($navbarAnchor)
  ;

  if (rule) {
    $(rule)
      // Force all templates to be inside a folder url
      .on('match', function () {
        if (this.uri.indexOf('/') === -1) {
          this.replace(this.uri + '/');
        }
      })
      .on('enter', function() {
        $navbarAnchor.toggleClass('active', true);
      }).on('leave', function() {
        $navbarAnchor.toggleClass('active', false);
      })
    ;
  }

  return $navbarAnchor;
}

function setupTemplate(rule, src) {
  // Load template, storing the promise from jquery
  var r = {};
  r.request = $.ajax(demoPath + src).then(function (template) {
    r.$template = $(template);
    if (basePath) {
      r.$template.find('[src]').each(function(i, element){
        var oldSrc = $(element).attr('src');
        $(element).attr('src', basePath + oldSrc);
      });
    }
  });
  r.$rule = $(rule)
    .on('enter', function () {
      $('#content').append(r.$template);
    })
    .one('enter', function () {
      if (window.prettyPrint) window.prettyPrint();
    })
    .on('leave', function () {
      r.$template.remove();
    });
  return r;
}

// Load CSS
$('<link>')
  .appendTo('head')
  .attr({type : 'text/css', rel : 'stylesheet'})
  .attr('href', demoPath + 'demo.css');

// Init the framework
var pushStateTree = new PushStateTree({
  basePath: basePath,
  // Disable the pushState support on github, because the
  // server don't support it, but enable in localhost or
  // other root server for this demo
  usePushState: !basePath,
  beautifyLocation: true
});

// Delegate anchor clicks to use pushStateTree
$(document).on('click', 'a[href]', function (e) {
  var href = $(e.currentTarget).attr('href');
  if (href.indexOf('//') > 2 && href.indexOf('//') <= 6) {
    if (href.indexOf(location.origin) === 0) {
      href = href.substring(location.origin.length);
    } else {
      return;
    }
  }
  
  e.preventDefault();
  if(href[0] == '#') href = href.slice(1);

  if (href.indexOf(basePath) === 0) {
    href = href.substring(basePath.length);
  }

  pushStateTree.navigate(href);
});

// Expose the pushStateTree on the DOM
$('body').append(pushStateTree);


load(demoPath + 'about.js');
load(demoPath + 'servers.js');
load(demoPath + 'api.js');
load(demoPath + 'faq.js');

// This was loaded after, so the system needs to dispatch again
pushStateTree.dispatch();