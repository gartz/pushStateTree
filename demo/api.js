/* global $, pushStateTree, demoPath, navbarAdd */
(function($, pushStateTree){
  'use strict';

  var rule = pushStateTree.createRule({
    id: 'api',
    rule: /^api($|\/(.*))/
  });

  $(pushStateTree).append(rule);

  // Add menu option in the first load
  navbarAdd('API', '/api', 1);

  // Handler for the content of API page

  // Store a jquery template elements from template file.
  var $about;

  // Load template, storing the promise from jquery
  var ready = $.ajax(demoPath + 'api.html').done(function (tmpl){
    $about = $(tmpl);
  });

  $(rule).on('enter', function(e){
    // Lazy execute when template is ready
    // if it already have been cached, will execute at same instant
    ready.done(function (){
      $('#content').append($about);
    });
  });

  $(rule).on('leave', function(e){
    // if can remove, remove it when leaving
    $about.remove && $about.remove();
  });

  function onEnter(){
    // Lazy execute when template is ready
    // if it already have been cached, will execute at same instant
    ready.done(function (){
      $('#eventsList').removeClass('out').addClass('in');
      $('#eventListToggler').attr('href', '/api');
    });
  }

  function onLeave(){
    $('#eventsList').removeClass('in').addClass('out');
    $('#eventListToggler').attr('href', '/api/events');
  }

  function onChange(){

  }

  var parentRule = pushStateTree.createRule({
    id: 'events',
    parentGroup: 2,
    rule: /(.+)/
  });

  $(parentRule)
    .on('enter', onEnter)
    .on('change', onChange)
    .on('leave', onLeave)
    .appendTo(rule).parent()
    .appendTo(pushStateTree)
    .get(0).dispatch();

})($, pushStateTree);
