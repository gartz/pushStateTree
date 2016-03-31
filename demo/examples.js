(function($, pushStateTree){
  var rule = pushStateTree.createRule({
    id: 'examples',
    rule: /^examples($|\/$)/
  });

  $(pushStateTree).append(rule);
  
  // Add menu option in the first load
  var $navLink = navbarAdd('Examples', '/examples', 2);

  // Handler for the content of API page
  var $app;

  $(rule).on('enter', function(){
    $navLink.toggleClass('active', true);

    // Lazy execute when template is ready
    // if it already have been cached, will execute at same instant
    $('#content').append($app);
  });

  $(rule).on('leave', function(){
    $navLink.toggleClass('active', false);
    
    // if can remove, remove it when leaving
    $app.remove();
  });

  // Load template, storing the promise from jquery
  $.ajax(demoPath + 'api.html').done(function (template){
    $app = $(template);
    if (basePath) {
      $app.find('[src]').each(function(i, element){
        var oldSrc = $(element).attr('src');
        $(element).attr('src', basePath + oldSrc);
      });
    }

    $(pushStateTree)
      .append(rule)
      .get(0).dispatch();
  });

})($, pushStateTree);