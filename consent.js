/* NorseLift analytics consent.
 * Google Analytics is NOT loaded (no gtag script, no cookies) unless the
 * visitor clicks "Accept". The choice is stored in localStorage
 * ("norselift-consent") and can be changed via any [data-cookie-settings]
 * element (footer "Cookie settings").
 */
(function () {
  var GA_ID = 'G-YJ8DCEJGHD';
  var KEY = 'norselift-consent';
  var gaLoaded = false;

  // Until consent, gtag() is a no-op so existing onclick handlers are safe.
  window.gtag = function () {};

  function read() {
    try { var v = JSON.parse(localStorage.getItem(KEY) || 'null'); return v && (v.analytics === 'granted' || v.analytics === 'denied') ? v.analytics : null; }
    catch (e) { return null; }
  }
  function write(value) {
    try { localStorage.setItem(KEY, JSON.stringify({ analytics: value, ts: new Date().toISOString(), v: 1 })); } catch (e) {}
  }

  function loadGA() {
    if (gaLoaded) return;
    gaLoaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', GA_ID);
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);
  }

  function clearGACookies() {
    var host = location.hostname, parts = host.split('.'), domains = ['', host];
    for (var i = 0; i < parts.length - 1; i++) domains.push('.' + parts.slice(i).join('.'));
    document.cookie.split(';').forEach(function (c) {
      var name = c.split('=')[0].trim();
      if (/^_ga/.test(name) || name === '_gid' || /^_gat/.test(name)) {
        domains.forEach(function (d) {
          document.cookie = name + '=; Max-Age=0; path=/' + (d ? '; domain=' + d : '');
        });
      }
    });
  }

  var css = '' +
    '.nl-consent{position:fixed;left:16px;right:16px;bottom:16px;z-index:1000;max-width:560px;margin:0 auto;padding:18px 20px;border-radius:16px;' +
    'background:#ffffff;color:#1a1e30;border:1px solid #c8d4e4;box-shadow:0 12px 40px -8px rgba(20,30,60,.35);font:15px/1.5 Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}' +
    '[data-theme="dark"] .nl-consent{background:#151b2e;color:#e4e4ef;border-color:#2a3654;box-shadow:0 12px 40px -8px rgba(0,0,0,.7)}' +
    '.nl-consent h2{font:700 16px/1.3 Inter,-apple-system,sans-serif;margin:0 0 6px}' +
    '.nl-consent p{margin:0 0 14px}' +
    '.nl-consent a{color:#2f6aa8;text-decoration:underline}' +
    '[data-theme="dark"] .nl-consent a{color:#8cc0f5}' +
    '.nl-consent-actions{display:flex;gap:10px;flex-wrap:wrap}' +
    '.nl-consent button{flex:1 1 140px;min-height:44px;padding:10px 16px;border-radius:12px;font:600 15px/1 Inter,-apple-system,sans-serif;cursor:pointer;' +
    'background:#edf2f9;color:#1a1e30;border:1.5px solid #8e9ab4}' +
    '[data-theme="dark"] .nl-consent button{background:#1e2740;color:#e4e4ef;border-color:#55607d}' +
    '.nl-consent button:hover{border-color:currentColor}' +
    '.nl-consent button:focus-visible,.nl-consent a:focus-visible,[data-cookie-settings]:focus-visible{outline:3px solid #4a90d9;outline-offset:2px}' +
    '[data-cookie-settings]{background:none;border:0;padding:0;font:inherit;color:inherit;cursor:pointer;text-decoration:none;line-height:inherit;white-space:nowrap}' +
    '[data-cookie-settings]:hover{text-decoration:underline}' +
    '@media (prefers-reduced-motion:no-preference){.nl-consent{animation:nlc-in .25s ease-out}@keyframes nlc-in{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}}';

  var banner = null;
  function show(focus) {
    if (banner) { banner.hidden = false; if (focus) banner.querySelector('button').focus(); return; }
    banner = document.createElement('section');
    banner.className = 'nl-consent';
    banner.setAttribute('role', 'region');
    banner.setAttribute('aria-labelledby', 'nl-consent-title');
    banner.setAttribute('aria-describedby', 'nl-consent-desc');
    banner.innerHTML =
      '<h2 id="nl-consent-title">Cookies &amp; analytics</h2>' +
      '<p id="nl-consent-desc">We\'d like to use Google Analytics, which sets cookies, to see how visitors use this site. It only runs if you accept. ' +
      'You can change your choice anytime under <em>Cookie settings</em> in the footer. <a href="/privacy#cookies">Privacy policy</a></p>' +
      '<div class="nl-consent-actions">' +
      '<button type="button" data-consent="denied">Decline</button>' +
      '<button type="button" data-consent="granted">Accept</button>' +
      '</div>';
    banner.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-consent]');
      if (!b) return;
      decide(b.getAttribute('data-consent'));
    });
    document.body.appendChild(banner);
    if (focus) banner.querySelector('button').focus();
  }
  function hide() { if (banner) banner.hidden = true; }

  function decide(value) {
    var previous = read();
    write(value);
    hide();
    if (value === 'granted') loadGA();
    else if (previous === 'granted' || gaLoaded) {
      window['ga-disable-' + GA_ID] = true; // stop gtag from re-writing cookies
      clearGACookies();
      location.reload();
    }
  }

  function wireSettings() {
    document.querySelectorAll('[data-cookie-settings]').forEach(function (el) {
      el.addEventListener('click', function (e) { e.preventDefault(); show(true); });
    });
  }

  function init() {
    var style = document.createElement('style'); style.textContent = css; document.head.appendChild(style);
    wireSettings();
    var choice = read();
    if (choice === 'granted') loadGA();
    else {
      clearGACookies(); // remove any leftover Google Analytics cookies
      if (choice === null) show(false);
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  window.NorseLiftConsent = { open: function () { show(true); }, get: read };
})();
