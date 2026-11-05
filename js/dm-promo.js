/* ==========================================================================
   BINKOD Tech — dm-promo.js
   Shared Device Matrix promotion for the root homepage and the Device
   Matrix homepage: a floating app icon and a ticket popup that opens by
   default each browser session until dismissed, after which it stays
   available from the icon. No dependencies.
   ========================================================================== */
(function () {
  'use strict';

  /* ------------------------------------------------------------------ */
  /* Device Matrix promotion                                            */
  /* ------------------------------------------------------------------ */
  var DEVICE_MATRIX_PLAY_URL =
    'https://play.google.com/store/apps/details?id=com.binkod.devicematrix';
  var DM_PROMO_SEEN_KEY = 'binkod-device-matrix-promo-seen';
  var DM_PROMO_SESSION_KEY = 'binkod-device-matrix-promo-session';

  /* The dismissal is remembered in localStorage, but tied to the current
     browser session. A new visit therefore opens the ticket by default while
     navigation within the same session still respects the earlier close. */
  function getDeviceMatrixPromoSession() {
    try {
      var session = window.sessionStorage.getItem(DM_PROMO_SESSION_KEY);
      if (!session) {
        session = String(Date.now()) + '-' + Math.random().toString(36).slice(2);
        window.sessionStorage.setItem(DM_PROMO_SESSION_KEY, session);
      }
      return session;
    } catch (error) {
      return null;
    }
  }

  function hasSeenDeviceMatrixPromo() {
    try {
      var session = getDeviceMatrixPromoSession();
      return (
        session !== null &&
        window.localStorage.getItem(DM_PROMO_SEEN_KEY) === session
      );
    } catch (error) {
      return false;
    }
  }

  function rememberDeviceMatrixPromo() {
    try {
      var session = getDeviceMatrixPromoSession();
      window.localStorage.setItem(DM_PROMO_SEEN_KEY, session || '1');
    } catch (error) {
      /* Storage can be unavailable in private modes; the popup still works. */
    }
  }

  /* Official Google Play icon, identical to the Play buttons rendered in
     the site's HTML. */
  var DM_PLAY_ICON =
    '<svg class="btn__play-icon" viewBox="0 0 92 101" aria-hidden="true" focusable="false">' +
    '<path fill="#EA4335" d="M42.7141006,48.2030918 L0.378682653,92.5574864 C1.34201801,95.9718278 3.8294422,98.7491902 7.11735265,100.081627 C10.4052631,101.414063 14.1244454,101.151948 17.1929731,99.3715328 L64.8282049,72.2415332 L42.7141006,48.2030918 Z"/>' +
    '<path fill="#FBBC04" d="M85.5227162,40.6634756 L64.9228444,28.8650805 L41.7361587,49.2125801 L65.0174839,72.1784402 L85.4596231,60.5062311 C89.1508724,58.5735708 91.4640104,54.7514463 91.4640104,50.5848534 C91.4640104,46.4182604 89.1508724,42.5961359 85.4596231,40.6634756 L85.5227162,40.6634756 Z"/>' +
    '<path fill="#4285F4" d="M0.378682653,8.39139474 C0.122773783,9.33743897 -0.00455672329,10.3136395 3.58642309e-13,11.2936738 L3.58642309e-13,89.6552074 C0.00268414143,90.6347753 0.129891998,91.6100356 0.378682653,92.5574864 L44.1652401,49.3387662 L0.378682653,8.39139474 Z"/>' +
    '<path fill="#34A853" d="M43.0295657,50.4744406 L64.9228444,28.8650805 L17.3507056,1.60889485 C15.5610268,0.560731677 13.5255296,0.005596085 11.4515081,0 C6.30402332,-0.0101779895 1.77867801,3.40639326 0.378682653,8.35984823 L43.0295657,50.4744406 Z"/></svg>';

  var DM_ICON_HARDWARE =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' +
    '<rect x="5" y="5" width="14" height="14" rx="2.5"></rect>' +
    '<rect x="9" y="9" width="6" height="6" rx="1"></rect>' +
    '<path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3"></path></svg>';

  var DM_ICON_BATTERY =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' +
    '<rect x="2.5" y="7" width="16" height="10" rx="2.5"></rect>' +
    '<path d="M21.5 10.5v3"></path>' +
    '<path d="M6 12h2.4l1.2-2.4 1.8 4.8 1.2-2.4h2.4"></path></svg>';

  var DM_ICON_STORAGE =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' +
    '<rect x="3" y="4" width="18" height="7" rx="2"></rect>' +
    '<rect x="3" y="13" width="18" height="7" rx="2"></rect>' +
    '<path d="M7 7.5h.01M7 16.5h.01"></path></svg>';

  var DM_ICON_NETWORK =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' +
    '<path d="M1.8 8.8a15 15 0 0 1 20.4 0"></path>' +
    '<path d="M5.2 12.2a10 10 0 0 1 13.6 0"></path>' +
    '<path d="M8.6 15.6a5 5 0 0 1 6.8 0"></path>' +
    '<path d="M12 19h.01"></path></svg>';

  var DM_ICON_DISPLAY =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' +
    '<rect x="3" y="4" width="18" height="13" rx="2"></rect>' +
    '<path d="M8 21h8M12 17v4"></path></svg>';

  var DM_ICON_CHECKS =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' +
    '<path d="M12 3l7 3v5c0 4.4-3 8.4-7 10-4-1.6-7-5.6-7-10V6l7-3z"></path>' +
    '<path d="M9 12l2 2 4-4"></path></svg>';

  function setupDeviceMatrixPromo() {
    /* Initialization guard: one trigger and one popup per page. */
    if (document.getElementById('dm-promo-fab')) {
      return;
    }

    var trigger = document.createElement('button');
    trigger.id = 'dm-promo-fab';
    trigger.className = 'dm-promo-fab';
    trigger.type = 'button';
    trigger.setAttribute('aria-label', 'Open Device Matrix promotion');
    trigger.setAttribute('aria-haspopup', 'dialog');
    trigger.setAttribute('aria-controls', 'dm-promo');
    trigger.setAttribute('aria-expanded', 'false');
    trigger.innerHTML =
      '<img src="/public/assets/device-matrix/logo/app-icon.png" alt="" width="128" height="128" decoding="async">';

    var popup = document.createElement('div');
    popup.id = 'dm-promo';
    popup.className = 'dm-promo';
    popup.setAttribute('role', 'dialog');
    popup.setAttribute('aria-modal', 'false');
    popup.setAttribute('aria-labelledby', 'dm-promo-title');
    popup.setAttribute('aria-describedby', 'dm-promo-desc');
    popup.setAttribute('aria-hidden', 'true');
    popup.innerHTML =
      '<div class="dm-promo__ticket">' +
      '<div class="dm-promo__head">' +
      '<span class="dm-promo__logo">' +
      '<img src="/public/assets/device-matrix/logo/dm-logo-transparent.svg" alt="" width="64" height="64" decoding="async">' +
      '</span>' +
      '<span class="dm-promo__kicker">Install Device Matrix. Know your phone.</span>' +
      '</div>' +
      '<h2 class="dm-promo__title" id="dm-promo-title">Device Matrix is Now Available!</h2>' +
      '<p class="dm-promo__desc" id="dm-promo-desc">Get detailed device information, hardware insights, battery health and more, right on your phone.</p>' +
      '<ul class="dm-promo__features">' +
      '<li class="dm-promo__feature">' +
      '<span class="dm-promo__feature-icon">' + DM_ICON_HARDWARE + '</span>' +
      '<strong class="dm-promo__feature-label">Hardware</strong>' +
      '</li>' +
      '<li class="dm-promo__feature">' +
      '<span class="dm-promo__feature-icon">' + DM_ICON_BATTERY + '</span>' +
      '<strong class="dm-promo__feature-label">Battery health</strong>' +
      '</li>' +
      '<li class="dm-promo__feature">' +
      '<span class="dm-promo__feature-icon">' + DM_ICON_STORAGE + '</span>' +
      '<strong class="dm-promo__feature-label">Storage</strong>' +
      '</li>' +
      '<li class="dm-promo__feature">' +
      '<span class="dm-promo__feature-icon">' + DM_ICON_NETWORK + '</span>' +
      '<strong class="dm-promo__feature-label">Network</strong>' +
      '</li>' +
      '<li class="dm-promo__feature">' +
      '<span class="dm-promo__feature-icon">' + DM_ICON_DISPLAY + '</span>' +
      '<strong class="dm-promo__feature-label">Display</strong>' +
      '</li>' +
      '<li class="dm-promo__feature">' +
      '<span class="dm-promo__feature-icon">' + DM_ICON_CHECKS + '</span>' +
      '<strong class="dm-promo__feature-label">Guided checks</strong>' +
      '</li>' +
      '</ul>' +
      '</div>' +
      '<div class="dm-promo__footer">' +
      '<a class="btn btn--light dm-promo__cta" href="' + DEVICE_MATRIX_PLAY_URL + '" target="_blank" rel="noopener noreferrer">' +
      DM_PLAY_ICON +
      '<span>Get It on Google Play</span>' +
      '</a>' +
      '</div>' +
      '<button class="dm-promo__close" type="button" aria-label="Close Device Matrix promotion">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true" focusable="false">' +
      '<path d="M6 6l12 12M18 6L6 18"></path></svg>' +
      '</button>';

    document.body.appendChild(trigger);
    document.body.appendChild(popup);

    var closeButton = popup.querySelector('.dm-promo__close');
    var ticket = popup.querySelector('.dm-promo__ticket');
    var isOpen = false;

    function openPromo(focusCloseButton) {
      if (isOpen) {
        return;
      }
      isOpen = true;
      if (ticket) {
        ticket.scrollTop = 0;
      }
      popup.setAttribute('aria-hidden', 'false');
      popup.classList.add('is-open');
      trigger.setAttribute('aria-expanded', 'true');
      if (focusCloseButton) {
        closeButton.focus({ preventScroll: true });
      }
    }

    function closePromo(returnFocus) {
      if (!isOpen) {
        return;
      }
      isOpen = false;
      popup.classList.remove('is-open');
      trigger.setAttribute('aria-expanded', 'false');
      /* Closing the ticket is an explicit dismissal: remember it so the
         ticket does not reopen during later navigation in this session. */
      rememberDeviceMatrixPromo();
      if (returnFocus) {
        trigger.focus({ preventScroll: true });
      }
      popup.setAttribute('aria-hidden', 'true');
    }

    trigger.addEventListener('click', function () {
      if (isOpen) {
        closeButton.focus({ preventScroll: true });
      } else {
        openPromo(true);
      }
    });

    closeButton.addEventListener('click', function () {
      closePromo(true);
    });

    /* Following the Play listing also dismisses the ticket. The link keeps
       its normal new-tab behaviour and verified destination. */
    var playLink = popup.querySelector('.dm-promo__cta');
    if (playLink) {
      playLink.addEventListener('click', function () {
        closePromo(true);
      });
    }

    /* Each browser session starts with the ticket open. Only the close button
       or the install link closes it; outside clicks and Escape do not dismiss
       it. */
    if (!hasSeenDeviceMatrixPromo()) {
      window.setTimeout(function () {
        if (!isOpen && !hasSeenDeviceMatrixPromo()) {
          openPromo(false);
        }
      }, 650);
    }
  }


  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupDeviceMatrixPromo);
  } else {
    setupDeviceMatrixPromo();
  }
})();
