/* ==========================================================================
   BINKOD Tech — theme.js
   Light and dark appearance for the main website.
   The small inline script in each page applies the saved preference before
   CSS paints; this file adds the two controls, persists explicit choices and
   keeps the browser theme colour in sync. No network requests, no
   dependencies and no hidden follow-the-system option.
   ========================================================================== */
(function () {
  'use strict';

  var STORAGE_KEY = 'binkod-theme';
  var root = document.documentElement;
  var buttons = document.querySelectorAll('[data-theme-value]');
  var meta = document.querySelector('meta[name="theme-color"]');

  function isChoice(value) {
    return value === 'light' || value === 'dark';
  }

  function savedChoice() {
    try {
      var value = window.localStorage.getItem(STORAGE_KEY);
      return isChoice(value) ? value : 'light';
    } catch (error) {
      return 'light';
    }
  }

  function syncButtons(choice) {
    Array.prototype.forEach.call(buttons, function (button) {
      var selected = button.getAttribute('data-theme-value') === choice;
      var label = button.getAttribute('data-label');
      button.setAttribute('aria-pressed', selected ? 'true' : 'false');
      button.setAttribute('title', selected ? label + ' (selected)' : label);
    });
  }

  function paint(choice, persist) {
    var mode = choice === 'dark' ? 'dark' : 'light';

    root.setAttribute('data-theme', mode);
    root.setAttribute('data-mode', mode);
    root.style.colorScheme = mode;
    syncButtons(mode);

    if (meta) {
      meta.setAttribute('content', mode === 'dark' ? '#061022' : '#f3f6fb');
    }

    if (persist) {
      try {
        window.localStorage.setItem(STORAGE_KEY, mode);
      } catch (error) {
        /* The selected appearance still applies for this page. */
      }
    }
  }

  Array.prototype.forEach.call(buttons, function (button) {
    var choice = button.getAttribute('data-theme-value');
    if (isChoice(choice)) {
      button.addEventListener('click', function () {
        paint(choice, true);
      });
    }
  });

  window.addEventListener('storage', function (event) {
    if (event.key === STORAGE_KEY) {
      paint(isChoice(event.newValue) ? event.newValue : savedChoice(), false);
    }
  });

  paint(isChoice(root.getAttribute('data-theme')) ? root.getAttribute('data-theme') : savedChoice(), false);
})();
