(function($, pushStateTree){
  var rule = pushStateTree.createRule({
    id: 'examples',
    rule: /^examples($|\/$)/
  });

  $(pushStateTree).append(rule);
  
  // Add menu option in the first load
  navbarAdd('Examples', '/examples', 2);

})($, pushStateTree);