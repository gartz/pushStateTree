(function($, pushStateTree){
  var aboutRule = pushStateTree.createRule({
    id: 'about',
    rule: /^$/
  });

  $(pushStateTree).append(aboutRule);

  var $about;
  
  // Load template
  var ready = $.ajax(demoPath + 'about.html').done(function (tmpl){
    $about = $(tmpl);
  });

  $(aboutRule).on('enter', function(e){
    ready.done(function (){
      $('body .container').append($about);
    });
  });
  
  $(aboutRule).on('leave', function(e){
    ready.done(function (){
      $about.remove();
    });
  });

  // This was loaded after, so the system needs to dispatch again
  pushStateTree.dispatch();
})($, pushStateTree);