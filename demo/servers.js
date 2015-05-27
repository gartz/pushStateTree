(function($, pushStateTree){
  var rule = pushStateTree.createRule({
    id: 'servers',
    rule: /^servers($|\/$)/
  });

  $(pushStateTree).append(rule);
  
  // Add menu option in the first load
  navbarAdd('Servers', '/servers', 3);

  var $tmpl;
  
  // Load template
  var ready = $.ajax(demoPath + 'servers.html').done(function (tmpl){
    $tmpl = $(tmpl);
  }).promise();

  $(rule).on('enter', function(e){
    ready.done(function (){
      $('body .container').append($tmpl);
    });
  });
  
  $(rule).on('leave', function(e){
    $tmpl.remove && $tmpl.remove();
  });

})($, pushStateTree);