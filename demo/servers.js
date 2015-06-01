/* global $, pushStateTree, demoPath, navbarAdd */

(function($, pushStateTree){
  'use strict';

  var rule = pushStateTree.createRule({
    id: 'servers',
    rule: /^servers\/(.*)/
  });
  var scrollSpyRule = pushStateTree.createRule({
    id: 'server-scrollspy',
    parentGroup: 1,
    rule: /[^/]+/
  });

  $(rule)
    .append(scrollSpyRule)
    .appendTo(pushStateTree);
  
  // Add menu option in the first load
  navbarAdd('Servers', '/servers/', 3);

  var $template;
  var $body = $('body');
  var $window = $(window);
  var $sidebar;
  
  // Load template
  var ready = $.ajax(demoPath + 'servers.html').done(function (template){
    $template = $(template);
  }).promise();

  var onScroll = trottle(function (){
    if (!$sidebar) return;
    if ($sidebar.parent().offset().top >= $body.scrollTop()) {
      if($sidebar.hasClass('affix-top')) return;
      $sidebar.toggleClass('affix-top', true).toggleClass('affix', false);
    } else {
      if($sidebar.hasClass('affix')) return;
      $sidebar.toggleClass('affix-top', false).toggleClass('affix', true);
    }
  }, 50);

  $(rule).on('enter', function(){
    ready.done(function (){
      $('#content').append($template);
      $sidebar = $template.find('.bs-docs-sidebar');
    });

    // Listen for scroll event
    $window.on('scroll', onScroll);
  }).on('leave', function(){
    // Stop listening for scroll event
    $window.off('scroll', onScroll);

    $template.remove && $template.remove();
  });

  $(scrollSpyRule).on('match', function(event){
    // on match any scroll spy rule, animate the scroll to the element with the corresponding ID on DOM if it exists

    var oEvent = event.originalEvent;
    var section = oEvent.detail.match[0];

    ready.done(function () {
      var $focusDocElement = $('#' + section);
      $body.animate({
        scrollTop: $focusDocElement.offset().top
      }, 300, function(){
        $focusDocElement.css({
          backgroundColor: '#ffffcc'
        });
        setTimeout(function(){
          $focusDocElement.css({
            backgroundColor: ''
          });
        }, 1e3);
      });
      $sidebar.find('.active').removeClass('active');
      $sidebar.find('[href="' + section + '"]').parents('li').addClass('active');
    });
  });

})($, pushStateTree);