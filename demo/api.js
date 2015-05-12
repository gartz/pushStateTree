(function($, pushStateTree){
  var rule = pushStateTree.createRule({
    id: 'api',
    rule: /^api($|\/(.*))/
  });

  $(pushStateTree).append(rule);

  // Add menu option in the first load
  navbarAdd('API', '/api', 1);

  // Handler for the content of API page

  // Store a jquery template elements from template file.
  var $about;

  // Load template, storing the promise from jquery
  var ready = $.ajax(demoPath + 'api.html').done(function (tmpl){
    $about = $(tmpl);
  });

  $(rule).on('enter', function(e){
    // Lazy execute when template is ready
    // if it already have been cached, will execute at same instant
    ready.done(function (){
      $('body .container').append($about);
    });
  });

  $(rule).on('leave', function(e){
    // if can remove, remove it when leaving
    $about.remove && $about.remove();
  });

  var parentRule = pushStateTree.createRule({
    id: 'events',
    parentGroup: 2,
    rule: /(.+)/
  });

  $(parentRule).on('change', function(e){
    debugger;
  });

  $(parentRule).on('enter', function(e){
    // Lazy execute when template is ready
    // if it already have been cached, will execute at same instant
    ready.done(function (){
      $('#eventsList').css('display', 'block');
      e.preventDefault();
      e.stopPropagation();
      pushStateTree.pushState(null, null, '/').dispatch();
    });
  });

  $(parentRule).on('leave', function(e){
    $('#eventsList').css('display', 'none');
  });

  $(rule).append(parentRule);
  $(pushStateTree).append(rule);

  // This was loaded after, so the system needs to dispatch again
  pushStateTree.dispatch();
})($, pushStateTree);
