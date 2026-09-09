/* Reload the page if the copy in the browser is out of date.
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
 * The reload uses a NEW url (?fresh=...) rather than location.reload(), because
 * reloading a cached page can be served from that same cache. A new url cannot.
 * The 'fresh' parameter is also the guard against looping: having tried once,
 * it never tries again, so a version.txt that is somehow always different
 * costs one wasted load rather than an endless spin.
 */
(function () {
  var tag = document.querySelector('script[src^="data.js?v="]');
  if (!tag || location.search.indexOf('fresh=') !== -1) return;

  var mine = tag.getAttribute('src').split('v=')[1];
  if (!mine) return;

  fetch('version.txt', { cache: 'no-store' })
    .then(function (r) { return r.ok ? r.text() : null; })
    .then(function (live) {
      if (live && live.trim() && live.trim() !== mine) {
        location.replace(location.pathname + '?fresh=' + live.trim());
      }
    })
    .catch(function () { /* offline, or version.txt not there yet - leave it */ });
})();
