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
  var $anchorElements;

  var onScroll = (function (pixels){
    var lastPos = 0;
    return function(){
      // Firefox or Chrome
      var pos = $('html').scrollTop() || $('body').scrollTop();
      if (!(lastPos + pixels < pos || lastPos - pixels > pos)) return;
      lastPos = pos;

      if ($sidebar.parent().offset().top >= pos) {
        if($sidebar.hasClass('affix-top')) return;
        $sidebar.toggleClass('affix-top', true).toggleClass('affix', false);
      } else {
        if($sidebar.hasClass('affix')) return;
        $sidebar.toggleClass('affix-top', false).toggleClass('affix', true);
      }
    };
  }(10));
  
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

  var scrollspy = function(event){

    // Avoid multiple re
    if($(event.target).find('.active').length > 0) return;
    var $anchor = $(event.target).find('a[href]');
    if (!$anchor || $anchor.length === 0) return;

    var uri = $anchor.attr('href');

    // Old browsers show links that can conflict here
    if(uri.indexOf('http://') == 0 || uri.indexOf('https://') == 0) return;


    // Replace the URL, but don't dispatch (because the animation for match it)
    scrollSpyRule.replaceState(null, null, uri);
  };

  $(rule).on('enter', function(){
    $('#content').append($template);
    $anchorElements = $template.find('[role=main] [id]');
    $sidebar = $template.find('.bs-docs-sidebar');

    // Enable Bootstrap scrollspy
    $body
      .attr({
        'data-spy': 'scroll',
        'data-target': '.bs-docs-sidebar',
        'data-offset': '0'
      })
      .scrollspy('refresh')
      .on('activate.bs.scrollspy', scrollspy);

    // Listen for scroll event
    $window.on('scroll', onScroll);

    // Apply on enter
    onScroll();
  }).on('leave', function(){
    // Stop listening for scroll event
    $window.off('scroll', onScroll);

    // Disable Bootstrap scrollspy
    $body
      .attr({
        'data-spy': '',
        'data-target': '',
        'data-offset': ''
      })
      .scrollspy('refresh')
      .off('activate.bs.scrollspy', scrollspy);

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

  var $animation;

  $(scrollSpyRule).on('match', function(event){
    // on match any scroll spy rule, animate the scroll to the element with the corresponding ID on DOM if it exists

    var oEvent = event.originalEvent;
    var section = oEvent.detail.match[0];

    var $focusDocElement = $('#' + section);
    $animation && $animation.stop();
    if (!$focusDocElement || $focusDocElement.length === 0) return;

    // Firefox use html, and webkit uses body
    $animation = $('html, body').animate({
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
  });

})($, pushStateTree);