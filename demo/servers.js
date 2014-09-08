(function($, pushStateTree){
  var rule = pushStateTree.createRule({
    id: 'servers',
    rule: /^servers($|\/$)/
  });

  $(pushStateTree).append(rule);
  
  // Add menu option in the first load
  navbarAdd('Servers', '/servers', 3);

})($, pushStateTree);