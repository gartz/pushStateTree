/* global $, pushStateTree, demoPath, navbarAdd */
(function($, pushStateTree){
  'use strict';

  var rule = pushStateTree.createRule({
    id: 'about',
    rule: /^$/
  });

  $(pushStateTree).append(rule);

  var $about;
  
  // Load template
  var ready = $.ajax(demoPath + 'about.html').done(function (template){
    $about = $(template);
  });

  function onEnter(){
    ready.done(function (){
      $('#content').append($about);
    });
  }

  function onLeave(e){
    $about.remove && $about.remove();
  }

  $(rule)
    .on('enter', onEnter)
    .on('leave', onLeave)
    .get(0).dispatch();

})($, pushStateTree);