(function () {
  'use strict';

  var STORAGE_KEY = 'paytientGateAuthed';
  var EXPECTED_HASH = '733f273e1c2e75fb5f18daf22a375bac2395a6b046cbf684bd50c59a0366b5ae';

  try {
    if (sessionStorage.getItem(STORAGE_KEY) === '1') {
      document.documentElement.removeAttribute('data-locked');
      return;
    }
  } catch (e) {}

  document.documentElement.setAttribute('data-locked', '1');

  function toHex(buffer) {
    var bytes = new Uint8Array(buffer);
    var out = '';
    for (var i = 0; i < bytes.length; i++) {
      var h = bytes[i].toString(16);
      out += h.length === 1 ? '0' + h : h;
    }
    return out;
  }

  function buildGate() {
    var section = document.createElement('section');
    section.className = 'password-gate';
    section.innerHTML =
      '<div class="password-gate__inner">' +
        '<h1 class="password-gate__title">This case study is password protected</h1>' +
        '<form class="password-gate__form" autocomplete="off" novalidate>' +
          '<input class="password-gate__input" id="password-gate-input" type="text" placeholder="Enter password" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Password" required />' +
          '<button class="password-gate__submit" type="submit" aria-label="Unlock">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>' +
          '</button>' +
        '</form>' +
        '<p class="password-gate__error" role="alert" aria-live="polite"></p>' +
      '</div>';

    var footer = document.querySelector('body > footer');
    if (footer) {
      document.body.insertBefore(section, footer);
    } else {
      document.body.appendChild(section);
    }

    var form = section.querySelector('.password-gate__form');
    var input = section.querySelector('.password-gate__input');
    var error = section.querySelector('.password-gate__error');
    var button = section.querySelector('.password-gate__submit');

    input.focus();

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      error.textContent = '';
      var value = input.value;
      if (!value) return;

      button.disabled = true;
      var data = new TextEncoder().encode(value);

      crypto.subtle.digest('SHA-256', data).then(function (digest) {
        var hex = toHex(digest);
        if (hex === EXPECTED_HASH) {
          try { sessionStorage.setItem(STORAGE_KEY, '1'); } catch (e) {}
          document.documentElement.removeAttribute('data-locked');
          section.remove();
        } else {
          error.textContent = 'Incorrect password.';
          input.value = '';
          input.focus();
          button.disabled = false;
        }
      }).catch(function () {
        error.textContent = 'Incorrect password.';
        input.value = '';
        input.focus();
        button.disabled = false;
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildGate);
  } else {
    buildGate();
  }
})();
