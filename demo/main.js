var demoPath = basePath + 'demo/';

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
  usePushState: !basePath
});

// Delegate anchor clicks to use pushStateTree
$(document).on('click', 'a[href]', function (e){
  var href = $(e.target).attr('href');
  if (href.indexOf('//') > 2 && href.indexOf('//') < 6) return;
  e.preventDefault();
  pushStateTree
    .pushState(null, null, href)
    .dispatch();
});

// Exponse the pushStateTree on the DOM
$('body').append(pushStateTree);

load(demoPath + 'about.js');