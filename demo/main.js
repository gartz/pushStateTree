var demoPath = basePath + '/demo/';

$('#loading').modal('show');

//TODO: Optimize this function, not priority
function navbarAdd(text, link, order){
  // Create and add menu option in the right priority order

  order = order || 1;
  $navbarAnchor = $('<li><a></a></li>');
  $navbarAnchor.find('a')
    .data('order', order)
    .attr('href', location.origin + link)
    .text(text);
  $navbarMain = $('#navbarMain');
  $anchors = $navbarMain.find('a[data-order]');
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
$(document).on('click', 'a[href]', function (e){
  var href = $(e.target).attr('href');
  if (href.indexOf('//') > 2 && href.indexOf('//') < 6) {
    if (href.indexOf(location.origin) === 0) href = href.substring(location.origin.length); else return;
  }
  
  e.preventDefault();
  pushStateTree
    .pushState(null, null, href)
    .dispatch();
});

// Exponse the pushStateTree on the DOM
$('body').append(pushStateTree);

$.when(
  load(demoPath + 'about.js'),
  load(demoPath + 'servers.js'),
  //load(demoPath + 'examples.js'),
  load(demoPath + 'api.js')
).done(function(){
  // This was loaded after, so the system needs to dispatch again
  pushStateTree.dispatch();
});