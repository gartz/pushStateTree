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

//TODO: Optimize this function, not priority
function navbarAdd(text, link, order){
  // Create and add menu option in the right priority order

  order = order || 1;
  var $navbarAnchor = $('<li><a></a></li>');
  $navbarAnchor.find('a')
    .data('order', order)
    .attr('href', location.origin + link)
    .text(text);
  var $navbarMain = $('#navbarMain');
  var $anchors = $navbarMain.find('a[data-order]');
  if ($anchors.length === 0){
    $navbarMain.append($navbarAnchor);
  } else {
    $anchors.filter(function() {
      return $(this).data('order') > order;
    })
    .first()
    .closest('li')
    .before($navbarAnchor);
  }
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
  debug: true
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

  pushStateTree.navigate(href);
});

// Expose the pushStateTree on the DOM
$('body').append(pushStateTree);


load(demoPath + 'about.js');
load(demoPath + 'servers.js');
//load(demoPath + 'examples.js');
load(demoPath + 'api.js');

// This was loaded after, so the system needs to dispatch again
pushStateTree.dispatch();