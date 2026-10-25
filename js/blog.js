/* ==========================================================================
   BINKOD Tech — blog.js
   Shared behaviour for the BINKOD Tech blog pages:
   1. Sequential steppers (an AI-assisted software development flow).
   2. Selectable, animated architecture maps (the MCP request path).
   3. A reading-progress indicator for article pages.

   Everything is progressive enhancement: all explanatory content exists in
   the HTML and remains readable without JavaScript. No network requests.
   ========================================================================== */
(function () {
  'use strict';

  var root = document.documentElement;

  /* ------------------------------------------------------------------ */
  /* 1. Sequential stepper                                               */
  /* ------------------------------------------------------------------ */
  function setupSteppers() {
    var steppers = document.querySelectorAll('[data-stepper]');

    Array.prototype.forEach.call(steppers, function (stepper) {
      var steps = stepper.querySelectorAll('[data-step]');
      var panels = stepper.querySelectorAll('[data-step-panel]');
      var startButton = stepper.querySelector('[data-step-start]');
      var pauseButton = stepper.querySelector('[data-step-pause]');
      var replayButton = stepper.querySelector('[data-step-replay]');
      var status = stepper.querySelector('[data-step-status]');
      var total = steps.length;
      var index = 0;
      var timer = null;

      if (!total) {
        return;
      }

      function labelFor(i) {
        var label = steps[i].querySelector('.stepflow__label');
        return label ? label.textContent.trim() : 'Step ' + (i + 1);
      }

      function setControls() {
        if (startButton) {
          startButton.disabled = timer !== null;
        }
        if (pauseButton) {
          pauseButton.disabled = timer === null;
        }
        if (replayButton) {
          replayButton.disabled = false;
        }
      }

      function show(i, announce) {
        index = Math.max(0, Math.min(total - 1, i));

        Array.prototype.forEach.call(steps, function (step, n) {
          var active = n === index;
          step.classList.toggle('is-active', active);
          step.classList.toggle('is-done', n < index);
          step.setAttribute('aria-pressed', String(active));
        });

        Array.prototype.forEach.call(panels, function (panel) {
          panel.hidden = Number(panel.getAttribute('data-step-panel')) !== index;
        });

        if (status && announce !== false) {
          status.textContent = 'Step ' + (index + 1) + ' of ' + total + ': ' + labelFor(index) + '.';
        }
      }

      function stop(message) {
        if (timer !== null) {
          window.clearInterval(timer);
          timer = null;
        }
        setControls();
        if (status && message) {
          status.textContent = message;
        }
      }

      function tick() {
        if (index < total - 1) {
          show(index + 1, false);
          if (status) {
            status.textContent = 'Playing: ' + labelFor(index) + '.';
          }
        } else {
          stop('Walkthrough complete: ' + labelFor(index) + '. Press Replay to watch it again.');
        }
      }

      function start() {
        if (timer !== null) {
          return;
        }

        if (index === total - 1) {
          show(0, false);
        }

        if (status) {
          status.textContent = 'Playing: ' + labelFor(index) + '.';
        }
        timer = window.setInterval(tick, 2800);
        setControls();
      }

      function pause() {
        stop('Paused at step ' + (index + 1) + ' of ' + total + ': ' + labelFor(index) + '.');
      }

      function replay() {
        stop();
        show(0, false);
        start();
      }

      Array.prototype.forEach.call(steps, function (step, n) {
        step.addEventListener('click', function () {
          stop();
          show(n);
          if (status) {
            status.textContent = 'Selected step ' + (n + 1) + ' of ' + total + ': ' + labelFor(n) + '.';
          }
        });
      });

      if (startButton) {
        startButton.addEventListener('click', start);
      }
      if (pauseButton) {
        pauseButton.addEventListener('click', pause);
      }
      if (replayButton) {
        replayButton.addEventListener('click', replay);
      }

      show(0, false);
      setControls();
      if (status) {
        status.textContent = 'Ready. Press Start, or select any step to read what happens there.';
      }
    });
  }

  /* ------------------------------------------------------------------ */
  /* 2. Selectable architecture maps                                     */
  /* ------------------------------------------------------------------ */
  function setupArchMaps() {
    var maps = document.querySelectorAll('[data-map]');

    Array.prototype.forEach.call(maps, function (map) {
      var nodes = map.querySelectorAll('[data-map-node]');
      var links = map.querySelectorAll('[data-map-link]');
      var detailTitle = map.querySelector('[data-map-detail-title]');
      var detailText = map.querySelector('[data-map-detail-text]');
      var status = map.querySelector('[data-map-status]');
      var startButton = map.querySelector('[data-map-start]');
      var pauseButton = map.querySelector('[data-map-pause]');
      var replayButton = map.querySelector('[data-map-replay]');
      var order = (map.getAttribute('data-map-order') || '')
        .split(',')
        .map(function (value) { return value.trim(); })
        .filter(Boolean);

      var requestPrefix = map.getAttribute('data-request-prefix') || 'Request moves to';
      var responsePrefix = map.getAttribute('data-response-prefix') || 'Response returns through';
      var idleMessage = map.getAttribute('data-idle-message') || 'Press Start to follow a request through the system. You can also select any component to read about it.';
      var completeMessage = map.getAttribute('data-complete-message') || 'Walkthrough complete. Press Replay to watch it again.';

      var timer = null;
      var sequenceIndex = -1;
      var finished = false;
      var events = [];

      if (!nodes.length || !order.length) {
        return;
      }

      order.forEach(function (id, i) {
        events.push({ id: id, phase: 'request', index: i });
      });
      for (var r = order.length - 1; r >= 0; r--) {
        events.push({ id: order[r], phase: 'response', index: r });
      }

      function nodeById(id) {
        var found = null;
        Array.prototype.forEach.call(nodes, function (node) {
          if (node.getAttribute('data-map-node') === id) {
            found = node;
          }
        });
        return found;
      }

      function nodeTitle(id) {
        var node = nodeById(id);
        return node ? (node.getAttribute('data-title') || id) : id;
      }

      function nodeDescription(id) {
        var node = nodeById(id);
        return node ? (node.getAttribute('data-desc') || '') : '';
      }

      function clearVisuals() {
        Array.prototype.forEach.call(nodes, function (node) {
          node.classList.remove('is-active', 'is-done');
          node.setAttribute('aria-pressed', 'false');
        });
        Array.prototype.forEach.call(links, function (link) {
          link.classList.remove('is-flowing', 'is-done', 'is-reverse');
        });
      }

      function setControls() {
        if (startButton) {
          startButton.disabled = timer !== null;
        }
        if (pauseButton) {
          pauseButton.disabled = timer === null;
        }
        if (replayButton) {
          replayButton.disabled = false;
        }
      }

      function setDetail(id, hint) {
        if (detailTitle) {
          detailTitle.textContent = nodeTitle(id);
        }
        if (detailText) {
          detailText.textContent = nodeDescription(id);
        }
        if (status && hint) {
          status.textContent = hint;
        }
      }

      function stop(message) {
        if (timer !== null) {
          window.clearInterval(timer);
          timer = null;
        }
        Array.prototype.forEach.call(links, function (link) {
          link.classList.remove('is-flowing', 'is-reverse');
        });
        setControls();
        if (status && message) {
          status.textContent = message;
        }
      }

      function applyEvent(event) {
        var activeNode = nodeById(event.id);

        Array.prototype.forEach.call(nodes, function (node) {
          var id = node.getAttribute('data-map-node');
          var orderIndex = order.indexOf(id);
          var syncedTo = node.getAttribute('data-map-sync');
          var isActive = id === event.id || syncedTo === event.id;
          var isDone = false;

          if (event.phase === 'request') {
            isDone = orderIndex > -1 && orderIndex < event.index;
          } else {
            isDone = !isActive;
          }

          node.classList.toggle('is-active', isActive);
          node.classList.toggle('is-done', isDone);
          node.setAttribute('aria-pressed', String(isActive));
        });

        Array.prototype.forEach.call(links, function (link, i) {
          var flowing = event.phase === 'request'
            ? i === event.index - 1
            : i === event.index;
          var done = event.phase === 'request'
            ? i < event.index - 1
            : i > event.index;

          link.classList.toggle('is-flowing', flowing);
          link.classList.toggle('is-reverse', flowing && event.phase === 'response');
          link.classList.toggle('is-done', done);
        });

        if (activeNode) {
          var title = activeNode.getAttribute('data-title') || event.id;
          var description = activeNode.getAttribute('data-desc') || '';
          if (detailTitle) {
            detailTitle.textContent = title;
          }
          if (detailText) {
            detailText.textContent = description;
          }
          if (status) {
            status.textContent = event.phase === 'request'
              ? requestPrefix + ': ' + title + '.'
              : responsePrefix + ': ' + title + '.';
          }
        }
      }

      function advance() {
        if (sequenceIndex < events.length - 1) {
          sequenceIndex += 1;
          applyEvent(events[sequenceIndex]);
        } else {
          finished = true;
          stop(completeMessage);
          Array.prototype.forEach.call(nodes, function (node) {
            node.classList.remove('is-active');
            node.setAttribute('aria-pressed', 'false');
          });
        }
      }

      function start() {
        if (timer !== null) {
          return;
        }

        if (finished) {
          clearVisuals();
          sequenceIndex = -1;
          finished = false;
        }

        if (sequenceIndex < 0) {
          advance();
        }

        timer = window.setInterval(advance, 1400);
        setControls();
        if (status && sequenceIndex === 0) {
          status.textContent = requestPrefix + ': ' + nodeTitle(events[0].id) + '.';
        }
      }

      function pause() {
        var currentId = sequenceIndex >= 0 ? events[sequenceIndex].id : order[0];
        stop('Paused at ' + nodeTitle(currentId) + '. Press Start to continue.');
      }

      function replay() {
        stop();
        clearVisuals();
        sequenceIndex = -1;
        finished = false;
        if (status) {
          status.textContent = 'Replaying the walkthrough…';
        }
        start();
      }

      function selectNode(id) {
        stop();
        clearVisuals();
        sequenceIndex = -1;
        finished = false;

        var node = nodeById(id);
        if (node) {
          node.classList.add('is-active');
          node.setAttribute('aria-pressed', 'true');
        }
        setDetail(id, 'Selected ' + nodeTitle(id) + '. Press Start to follow the complete flow.');
        setControls();
      }

      Array.prototype.forEach.call(nodes, function (node) {
        node.addEventListener('click', function () {
          selectNode(node.getAttribute('data-map-node'));
        });
      });

      if (startButton) {
        startButton.addEventListener('click', start);
      }
      if (pauseButton) {
        pauseButton.addEventListener('click', pause);
      }
      if (replayButton) {
        replayButton.addEventListener('click', replay);
      }

      if (nodes[0]) {
        nodes[0].classList.add('is-active');
        nodes[0].setAttribute('aria-pressed', 'true');
      }
      setDetail(order[0], idleMessage);
      setControls();
    });
  }

  /* ------------------------------------------------------------------ */
  /* 3. Reading progress                                                 */
  /* ------------------------------------------------------------------ */
  function setupReadingProgress() {
    var bar = document.querySelector('[data-reading-progress]');
    var article = document.querySelector('[data-article]');
    if (!bar || !article) {
      return;
    }

    var framePending = false;

    function update() {
      framePending = false;
      var articleTop = article.getBoundingClientRect().top + window.scrollY;
      var start = articleTop - 140;
      var end = articleTop + article.offsetHeight - window.innerHeight;
      var ratio = 0;

      if (end > start) {
        ratio = (window.scrollY - start) / (end - start);
      }
      ratio = Math.max(0, Math.min(1, ratio));
      bar.style.transform = 'scaleX(' + ratio + ')';
    }

    function onScroll() {
      if (framePending) {
        return;
      }
      framePending = true;
      window.requestAnimationFrame(update);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  setupSteppers();
  setupArchMaps();
  setupReadingProgress();
})();
