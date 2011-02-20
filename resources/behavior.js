(function($) {
  var themeChosen = false;

  function getThemes() {
    $.get('resources/styles.css', function(data) {
      var matches = data.match(/THEME = \{[^}]*\}/gm);
      var themes = [];
      for (var i = 0; i < matches.length; i++) {
        themes.push($.parseJSON(matches[i].replace('THEME = ', '')));
      }
      setupPicker(themes);
    });
  }

  function setupPicker(themes) {
    // Create picker menu
    var $ol = $('<ol>').addClass('picker');
    for (var i in themes) {
      var theme = themes[i];
      var $a = $('<a>')
        .text(theme['name'])
        .attr('href', '#' + theme['name'])
        .attr('title', 'Switch to ' + theme['name']);
      $a.data('theme', theme);
      $a.click(function(e) {
        e.preventDefault();
        clearTimeout(chooseRandomTimeout);
        themeChosen = true;
        selectTheme($(this));
      });
      var $li = $('<li>').append($a);
      if (theme['name'] == 'default') $li.addClass('selected');
      $ol.append($li);
    }
    $ol.prependTo('#wrapper');
    // Choose random theme to after a timeout
    var chooseRandomTimeout = setTimeout(function() {
      if (!themeChosen) {
        var i = Math.floor(Math.random() * (themes.length - 1)) + 1;
        $ol.find('a').eq(i).click();
      }
    }, 3000);
    // Center vertically again
    centerVertically();
  }

  function selectTheme($el) {
    var theme = $el.data('theme');
    // Change picker selection
    $('.picker .selected').removeClass('selected');
    $el.parent().addClass('selected');
    // Ping the selected picker circle
    pingAnimate($el);
    // Fade out the wrapper content
    $('.canvas').animate({
      opacity: 0
    }, 400, function() {
      // Load Typekit kit
      loadKit(theme['kitId'], function() {
        $('body').animate({
          backgroundColor: theme['background']
        }, 400, function() {
          // Get theme data and update canvas
          var theme = $el.data('theme');
          $('body').attr('class', theme['class']).removeAttr('style');
          $('.tagline').text('has a ' + theme['thing']).lettering('words');
          // Fade in the canvas content
          $('.canvas').animate({
            opacity: 1
          }, 400);
        });
      }, function() {
        $('.canvas').animate({
          opacity: 1
        }, 400);
      });
    });
  }

  function pingAnimate($el) {
    var ping = $el.clone();
    var position = $el.position();
    ping.css({
      position: 'absolute',
      left: position.left,
      top: position.top
    });
    ping.appendTo('.picker');
    ping.animate({
      left: position.left - 50,
      top: position.top - 50,
      width: $el.width() + 100,
      height: $el.height() + 100,
      opacity: 0
    }, 200, function() {
      ping.remove();
    });
  }

  var loadedKits = {};

  function loadKit(kitId, onActive, onInactive) {
    if (kitId && !loadedKits[kitId]) {
      if (typeof Typekit !== 'undefined') {
        loadedKits[kitId] = true;
        Typekit.load(kitId, {
          active: onActive,
          inactive: onInactive
        });
      } else {
        $.getScript('http://use.typekit.com/' + kitId + '.js', function() {
          loadKit(kitId, onActive, onInactive);
        });
      }
    } else {
      onActive();
    }
  }

  function centerVertically() {
    var padding = Math.max(Math.floor(($(window).height() - $('#wrapper').height()) / 2), 0);
    $('#wrapper').css('padding', padding + 'px 0 ' + Math.max(padding - 10, 0) + 'px');
  }

  $(function() {
    getThemes();
    $('.canvas .name').lettering('words').children("span").lettering();
    $('.canvas .tagline').lettering('words');
    centerVertically();
    $(window).resize(centerVertically);
  });
})(jQuery);