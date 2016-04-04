/* global $, pushStateTree, demoPath, navbarAdd, basePath */
(function($, pushStateTree){
  'use strict';

  var rule = pushStateTree.createRule({
    id: 'faq',
    rule: /^faq($|\/(.*))/
  });

  // Add menu option in the first load
  navbarAdd('FAQ', '/faq', 3, rule);

  // Load template, storing the promise from jquery
  setupTemplate(rule, 'faq.html').request.done(function () {
    $(pushStateTree)
      .append(rule)
      .get(0).dispatch();
  });

})($, pushStateTree);
