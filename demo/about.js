(function($, pushStateTree){
  var rule = pushStateTree.createRule({
    id: 'about',
    rule: /^$/
  });

  $(pushStateTree).append(rule);

  var $about;
  
  // Load template
  var ready = $.ajax(demoPath + 'about.html').done(function (tmpl){
    $about = $(tmpl);
  });

  $(rule).on('enter', function(e){
    ready.done(function (){
      $('body .container').append($about);
    });
  });
  
  $(rule).on('leave', function(e){
    $about.remove && $about.remove();
  });

  // This was loaded after, so the system needs to dispatch again
  pushStateTree.dispatch();
})($, pushStateTree);