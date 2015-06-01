/* global $, pushStateTree, demoPath, navbarAdd, trottle */

(function($, pushStateTree){
  'use strict';

  var rule = pushStateTree.createRule({
    id: 'servers',
    rule: /^servers(\/)?(.*)/
  });
  var scrollSpyRule = pushStateTree.createRule({
    id: 'server-scrollspy',
    parentGroup: 2,
    rule: /[^/]+/
  });
  
  // Add menu option in the first load
  navbarAdd('Servers', '/servers/', 3);

  var $template;
  var $body = $('body');
  var $window = $(window);
  var $sidebar;

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
  
  // Load template
  $.ajax(demoPath + 'servers.html').done(function (template){
    $template = $(template);
  }).done(function(){
    // Add the rules after the HTML is loaded, and then dispatch the url changing check
    $(rule)
      .append(scrollSpyRule)
      .appendTo(pushStateTree)
      .get(0).dispatch();
  });



  $(rule).on('enter', function(){
    $('#content').append($template);
    $sidebar = $template.find('.bs-docs-sidebar');

    // Listen for scroll event
    $window.on('scroll', onScroll);
  }).on('leave', function(){
    // Stop listening for scroll event
    $window.off('scroll', onScroll);

    $template.remove && $template.remove();
  }).on('match', function(event){
    // if match the app uri, but without the end slash redirect to add the slash, this make relative links work

    var oEvent = event.originalEvent;
    var uri = oEvent.detail.match[0];
    var hasSlash = !!oEvent.detail.match[1];

    if (!hasSlash) {
      this.replace(uri + '/');
    }
  });

  $(scrollSpyRule).on('match', function(event){
    // on match any scroll spy rule, animate the scroll to the element with the corresponding ID on DOM if it exists

    var oEvent = event.originalEvent;
    var section = oEvent.detail.match[0];

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

})($, pushStateTree);