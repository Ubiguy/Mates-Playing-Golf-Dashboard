/* Keep an open page up to date without anybody pressing reload.
 *
 * WHY. Every asset is cache-busted - data.js?v=<hash> - so a page fetched fresh
 * can never be handed a stale data.js. What that cannot fix is a stale PAGE.
 * GitHub Pages serves HTML with Cache-Control: max-age=600 and gives no way to
 * change it, so for ten minutes after a result is published a browser that
 * already has a page will keep serving it from its own cache, and that copy
 * asks for the old data.js by name - which it also still has. Both agree with
 * each other and both are wrong.
 *
 * That is exactly what was seen on 9 September: the home page showed 14-21
 * while Team Match Play, visited earlier and still cached, showed 12-21.
 *
 * So ask. version.txt is written by stamp.py and holds the hash of the current
 * data.js. Fetching it with no-store bypasses the cache; if it disagrees with
 * the hash this page was built against, the page is old and worth replacing.
 *
 * AND KEEP ASKING. Checking once on load fixed the stale page but not the page
 * left open on a phone during a round - it went on showing the score as it was
 * when the tab was opened. So the check repeats every EVERY seconds while the
 * page is on screen, and once more the moment it comes back on screen (phone
 * unlocked, tab switched back). A hidden tab asks nothing. version.txt is eight
 * bytes, so a tab left open all day costs next to nothing.
 *
 * The reload uses a NEW url (?fresh=...) rather than location.reload(), because
 * reloading a cached page can be served from that same cache. A new url cannot.
 *
 * LOOP GUARD. A reload is tried once per published version. If the page that
 * comes back still disagrees with version.txt, something outside our control
 * is serving it and asking again would only spin, so it stops. The next
 * publish is a new version and gets its own try.
 */
(function () {
  var tag = document.querySelector('script[src^="data.js?v="]');
  if (!tag || !window.fetch) return;

  var mine = tag.getAttribute('src').split('v=')[1];
  if (!mine) return;

  var EVERY = 45;                       // seconds between checks while on screen
  var TRIED = 'mpgolf-fresh-tried';     // the version last reloaded for
  var SCROLL = 'mpgolf-fresh-scroll';   // where the reader was, to put them back

  // sessionStorage can be missing or throw - a private window, or this page
  // inside the Google Sites frame with third-party storage blocked. Everything
  // below still works without it; the ?fresh= parameter is the fallback guard.
  function get(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } }
  function put(k, v) { try { sessionStorage.setItem(k, v); } catch (e) { /* fine */ } }

  function param(name) {
    var m = location.search.match(new RegExp('[?&]' + name + '=([^&]*)'));
    return m ? m[1] : null;
  }

  // Back where they were. A reload for new data should not throw the reader to
  // the top of a long page.
  var back = get(SCROLL);
  if (back) {
    put(SCROLL, '');
    var at = back.split('|');
    if (at[0] === location.pathname) {
      window.addEventListener('load', function () { window.scrollTo(0, +at[1] || 0); });
    }
  }

  // Somebody typing into a box or holding a menu open is not interrupted - the
  // check simply comes round again.
  function busy() {
    var el = document.activeElement;
    return el && /^(INPUT|SELECT|TEXTAREA)$/.test(el.tagName);
  }

  var stopped = false, asking = false;

  function check() {
    if (stopped || asking || document.hidden) return;
    asking = true;
    fetch('version.txt', { cache: 'no-store' })
      .then(function (r) { return r.ok ? r.text() : null; })
      .then(function (live) {
        asking = false;
        live = (live || '').trim();
        if (!/^[0-9a-f]{8}$/.test(live) || live === mine) return;

        if (live === get(TRIED) || live === param('fresh')) {
          stopped = true;               // tried this version already - see LOOP GUARD
          return;
        }
        if (busy()) return;

        put(TRIED, live);
        put(SCROLL, location.pathname + '|' + Math.round(window.pageYOffset || 0));

        var keep = location.search.replace(/^\?/, '').split('&').filter(function (p) {
          return p && p.indexOf('fresh=') !== 0;
        });
        keep.push('fresh=' + live);
        location.replace(location.pathname + '?' + keep.join('&') + location.hash);
      })
      .catch(function () { asking = false; /* offline - try again next time round */ });
  }

  check();
  setInterval(check, EVERY * 1000);
  document.addEventListener('visibilitychange', check);
})();
