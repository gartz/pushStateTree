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
  navbarAdd('Servers', '/servers/', 2, rule);

  var $sidebar;
  var $anchorElements;

  // Load template, storing the promise from jquery
  var page = setupTemplate(rule, 'servers.html');
  page.request
    .then(function () {
      var $roleComplementary = page.$template.find('[role=complementary]');
      $sidebar = page.$template.find('.bs-docs-sidebar');

      // Fix window resize checkPosition for the sidebar
      $(window).resize(trottle(function () {
        $sidebar.affix('checkPosition');
      }, 150));

      // Listen for scroll event
      $sidebar.affix({
        offset: {
          top: function () { return $roleComplementary.offset().top; }
        }
      });
    })
    .then(function () {
      $(rule)
        .append(scrollSpyRule)
        .appendTo(pushStateTree)
        .get(0).dispatch();
    });

  function scrollspy(event) {
    // Rewrite the browser URL for the current element on the spy area
    if($(event.target).find('.active').length > 0) return;
    var $anchor = $(event.target).find('a[href]');
    if (!$anchor || $anchor.length === 0) return;

    var uri = $anchor.attr('href');

    // Old browsers show links that can conflict here
    if(uri.indexOf('http://') == 0 || uri.indexOf('https://') == 0) return;

    // Remove the # begin to make the links relative
    uri = uri.match(/^(#*)?(.*)/)[2];

    // Replace the URL, but don't dispatch (because the animation for match it)
    scrollSpyRule.replaceState(null, null, uri);
  }

  $(rule).on('enter', function () {
    $anchorElements = page.$template.find('[role=main] [id]');

    // Enable Bootstrap scrollspy
    $('body')
      .scrollspy({
        target: '.bs-docs-sidebar',
        offset: 0
      })
      .on('activate.bs.scrollspy', scrollspy);
  }).on('leave', function() {

    // Disable Bootstrap scrollspy
    $('body').off('activate.bs.scrollspy', scrollspy);
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