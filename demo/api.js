/* global $, pushStateTree, demoPath, navbarAdd */
(function($, pushStateTree){
  'use strict';

  var rule = pushStateTree.createRule({
    id: 'api',
    rule: /^api($|\/(.*))/
  });

  // Add menu option in the first load
  navbarAdd('API', '/api', 1, rule);
  
  // Load template, storing the promise from jquery
  setupTemplate(rule, 'api.html').request.done(function () {
    $(pushStateTree)
      .append(rule)
      .get(0).dispatch();
  });

})($, pushStateTree);
