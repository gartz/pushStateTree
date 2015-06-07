/* global $, pushStateTree, demoPath, navbarAdd */
(function($, pushStateTree){
  'use strict';

  var rule = pushStateTree.createRule({
    id: 'faq',
    rule: /^faq($|\/(.*))/
  });

  // Add menu option in the first load
  navbarAdd('FAQ', '/faq', 1);

  // Handler for the content of API page
  var $app;

  $(rule).on('enter', function(){
    // Lazy execute when template is ready
    // if it already have been cached, will execute at same instant
    $('#content').append($app);
  });

  $(rule).on('leave', function(){
    // if can remove, remove it when leaving
    $app.remove();
  });

  // Load template, storing the promise from jquery
  $.ajax(demoPath + 'faq.html').done(function (template){
    $app = $(template);

    $(pushStateTree)
      .append(rule)
      .get(0).dispatch();
  });

})($, pushStateTree);
