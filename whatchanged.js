/* What changed - turns the score log into something a player can read.

   changes.js holds every published move in the team score, newest first, as
   score_log.py wrote it: terse lines like "added Imran v Raz 18-15 (Waseem)".
   This file decides how they read. It is its own file, rather than script
   inside matchplay.html, so that tools/test_whatchanged.js can run every rule
   in it against the real log and against the awkward cases - a submitter whose
   name has brackets in it, a removal with no score, a correction that swaps
   the winner - before any of it reaches the site.

   QUIET BY DEFAULT. Two kinds of entry are true but are not news:
     - the daily record, written once a day whether or not anything moved
     - a result sent and taken off again within a day - a test, or a slip
       corrected on the spot. Shown as one grey "Withdrawn" line, not two.
   "Show everything" puts every entry back exactly as recorded. Nothing here
   ever edits the record; score-log.csv stays the source.

   The first player named is always Team Yaseen's and the second Team
   Shufqat's - that is how score_log.py writes a fixture - so each name can
   carry its team's colour whether it won or lost. */
(function (root) {
  const BIG = (typeof root.BIG_WIN === 'number') ? root.BIG_WIN : 5;
  const HOUR = 3600 * 1000, DAY = 24 * HOUR;

  const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const num = v => v % 1 === 0 ? String(v) : v.toFixed(1);
  const hm = d => d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  const dayOf = d => d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
  const whenShort = d => d.toLocaleString('en-GB', { weekday: 'short', day: 'numeric', month: 'short',
                                                   hour: '2-digit', minute: '2-digit' });

  /* ---------- one line of the log ----------
     The submitter is the last bracketed group, which may itself contain
     brackets - "(Yaseen (C))". A bare "(C)" is a captain's mark on a player,
     never a submitter. */
  const BY = /\s\(((?:[^()]|\([^()]*\))+)\)$/;

  function parse(t) {
    let body = String(t), by = '';
    const m = body.match(BY);
    if (m && m[1] !== 'C') { by = m[1]; body = body.slice(0, m.index); }
    let x;
    if ((x = body.match(/^added (.+) v (.+) (\d+)-(\d+)$/)))
      return { kind: 'added', fx: x[1] + ' v ' + x[2], a: x[1], b: x[2], ap: +x[3], bp: +x[4], by };
    if ((x = body.match(/^deleted (.+) v (.+?)(?:, was (\d+)-(\d+))?$/)))
      return { kind: 'removed', fx: x[1] + ' v ' + x[2], a: x[1], b: x[2],
               ap: x[3] ? +x[3] : null, bp: x[4] ? +x[4] : null, by };
    if ((x = body.match(/^(.+) v (.+) now (\d+)-(\d+), was (\d+)-(\d+)$/)))
      return { kind: 'corrected', fx: x[1] + ' v ' + x[2], a: x[1], b: x[2],
               ap: +x[3], bp: +x[4], wa: +x[5], wb: +x[6], by };
    if (body === 'no change') return { kind: 'daily', by };
    if (/^DRIFT/.test(body)) return { kind: 'drift', text: body, by };
    return { kind: 'other', text: body, by };
  }

  /* ---------- how a result reads ---------- */
  const pa = n => '<span class="pa">' + esc(n) + '</span>';
  const pb = n => '<span class="pb">' + esc(n) + '</span>';

  // A score never breaks across two lines - "16–" on one and "15" on the next.
  const sc = (x, y) => '<span class="nw">' + x + '&ndash;' + y + '</span>';

  function result(a, b, ap, bp) {
    if (ap === bp) return pa(a) + ' halved with ' + pb(b) + ' ' + sc(ap, bp);
    const big = Math.abs(ap - bp) >= BIG ? ' <span class="big" title="won by ' + BIG + ' or more">&#9733;</span>' : '';
    return ap > bp
      ? '<b>' + pa(a) + '</b> beat ' + pb(b) + ' ' + sc(ap, bp) + big
      : '<b>' + pb(b) + '</b> beat ' + pa(a) + ' ' + sc(bp, ap) + big;
  }

  // "was 17–12 to Moody" / "was halved 17–17"
  function was(a, b, ap, bp) {
    if (ap == null) return 'score not recorded';
    if (ap === bp) return 'was halved ' + sc(ap, bp);
    return 'was ' + sc(Math.max(ap, bp), Math.min(ap, bp)) + ' to ' + esc(ap > bp ? a : b);
  }

  function plain(a, b, ap, bp) {
    if (ap === bp) return a + ' halved with ' + b + ' ' + ap + '–' + bp;
    return ap > bp ? a + ' beat ' + b + ' ' + ap + '–' + bp : b + ' beat ' + a + ' ' + bp + '–' + ap;
  }

  const LABEL = { added: 'Added', removed: 'Removed', corrected: 'Corrected', daily: 'Daily',
                  drift: 'Check', other: 'Note', withdrawn: 'Withdrawn', loaded: 'Loaded' };
  const lab = k => '<span class="lab ' + k + '">' + LABEL[k] + '</span>';

  function line(it) {
    let what;
    if (it.kind === 'added') what = result(it.a, it.b, it.ap, it.bp);
    else if (it.kind === 'corrected') what = result(it.a, it.b, it.ap, it.bp)
      + ' <span class="was">' + was(it.a, it.b, it.wa, it.wb) + '</span>';
    else if (it.kind === 'removed') what = pa(it.a) + ' v ' + pb(it.b) + ' taken off'
      + ' <span class="was">' + was(it.a, it.b, it.ap, it.bp) + '</span>';
    else if (it.kind === 'daily') what = 'no change &mdash; the daily record';
    else what = esc(it.text);
    return lab(it.kind) + what;
  }

  const signed = v => (v > 0 ? '+' : '&minus;') + num(Math.abs(v));
  function moved(da, db) {
    const parts = [];
    if (da) parts.push('<span class="a">Yaseen ' + signed(da) + '</span>');
    if (db) parts.push('<span class="b">Shufqat ' + signed(db) + '</span>');
    return parts.length ? ' <span class="mv">' + parts.join(' ') + '</span>' : '';
  }

  /* ---------- the log as entries ---------- */
  const isDaily = e => e.items.length === 1 && e.items[0].kind === 'daily';

  function build(rows) {
    const E = rows.map((r, i) => {
      const prev = rows[i + 1];
      return { r, d: new Date(r.when), items: (r.items || []).map(parse),
               da: prev ? r.a - prev.a : null, db: prev ? r.b - prev.b : null,
               first: !prev, hide: false, pairedWith: null };
    });

    /* A removal folds together with the result it took off, when that result
       was the nearest earlier entry to touch the same fixture, was a plain
       "added", and was sent within a day. Anything in between - a correction,
       say - means it was a real result that changed, and both stay visible. */
    E.forEach((e, i) => {
      if (e.items.length !== 1 || e.items[0].kind !== 'removed') return;
      const fx = e.items[0].fx;
      for (let j = i + 1; j < E.length; j++) {
        const o = E[j];
        if (!o.items.some(it => it.fx === fx)) continue;
        if (o.items.length === 1 && o.items[0].kind === 'added' && !o.hide && e.d - o.d <= DAY) {
          o.hide = true;
          e.pairedWith = o;
        }
        break;
      }
    });
    return E;
  }

  const nowrap = s => '<span class="nw">' + s + '</span>';

  function entry(e, all) {
    const by = [...new Set(e.items.map(it => it.by).filter(Boolean))].join(', ');
    const meta = [nowrap('Yaseen ' + num(e.r.a)), nowrap('Shufqat ' + num(e.r.b)),
                  nowrap(e.r.results + ' played')]
      .concat(by ? [nowrap('sent by ' + esc(by))] : []).join(' &middot; ');

    if (!all && e.pairedWith) {
      const it = e.pairedWith.items[0];
      const mins = Math.max(1, Math.round((e.d - e.pairedWith.d) / 60000));
      const gap = mins < 60 ? mins + ' min' : Math.round(mins / 60) + ' h';
      return '<div class="ch quiet"><span class="t">' + hm(e.d) + '</span>'
        + '<div class="ln">' + lab('withdrawn') + pa(it.a) + ' v ' + pb(it.b) + ' '
        + it.ap + '&ndash;' + it.bp + ' sent, then taken off ' + gap + ' later</div>'
        + '<div class="meta">' + nowrap('no change to the score')
        + (by ? ' &middot; ' + nowrap(esc(by)) : '') + '</div></div>';
    }
    if (!all && e.first && e.items.length > 3) {
      return '<div class="ch"><span class="t">' + hm(e.d) + '</span>'
        + '<div class="ln">' + lab('loaded') + 'the season so far &mdash; ' + e.items.length + ' results</div>'
        + '<div class="meta">' + meta + '</div></div>';
    }
    const drift = e.items.some(it => it.kind === 'drift');
    const lines = e.items.map((it, k) =>
      '<div class="ln">' + line(it) + (k === 0 ? moved(e.da, e.db) : '') + '</div>').join('');
    return '<div class="ch' + (drift ? ' drift' : '') + (isDaily(e) ? ' quiet' : '') + '">'
      + '<span class="t">' + hm(e.d) + '</span>' + lines
      + '<div class="meta">' + meta + '</div></div>';
  }

  /* ---------- the last seven days, in a sentence ---------- */
  function summary(E, now) {
    const since = now - 7 * DAY;
    const inWeek = E.filter(e => e.d >= since && e.d <= now);
    if (!inWeek.length) return 'Nothing has changed in the last 7 days.';
    const real = inWeek.filter(e => !e.hide && !e.pairedWith && !isDaily(e));
    const count = k => real.reduce((n, e) => n + e.items.filter(it => it.kind === k).length, 0);
    const added = count('added'), fixed = count('corrected'), off = count('removed');
    const oldest = E.indexOf(inWeek[inWeek.length - 1]);
    const base = E[oldest + 1] ? E[oldest + 1].r : { a: 0, b: 0 };
    const da = E[0].r.a - base.a, db = E[0].r.b - base.b;
    const parts = [];
    if (added) parts.push(added + ' result' + (added === 1 ? '' : 's'));
    if (fixed) parts.push(fixed + ' correction' + (fixed === 1 ? '' : 's'));
    if (off) parts.push(off + ' taken off');
    if (!parts.length) return 'Last 7 days: no results, only tests and daily checks.';
    const mv = (da || db)
      ? ' · Yaseen ' + (da > 0 ? '+' : da < 0 ? '−' : '±') + num(Math.abs(da))
        + ', Shufqat ' + (db > 0 ? '+' : db < 0 ? '−' : '±') + num(Math.abs(db))
      : ' · the score did not move';
    return 'Last 7 days: ' + parts.join(', ') + mv + '.';
  }

  /* The newest entry that is not a daily record, in plain words - for the
     one-line "last change" under the score. */
  function latest(E) {
    const e = E.find(x => !isDaily(x));
    if (!e) return null;
    let text;
    if (e.pairedWith) {
      const it = e.pairedWith.items[0];
      text = it.a + ' v ' + it.b + ' sent, then taken off';
    } else if (e.first && e.items.length > 3) {
      text = 'the season so far loaded';
    } else {
      const it = e.items[0];
      text = it.kind === 'added' ? plain(it.a, it.b, it.ap, it.bp)
        : it.kind === 'corrected' ? plain(it.a, it.b, it.ap, it.bp) + ' (corrected)'
        : it.kind === 'removed' ? it.a + ' v ' + it.b + ' taken off'
        : it.text || '';
      if (e.items.length > 1) text += ' and ' + (e.items.length - 1) + ' more';
    }
    return { d: e.d, text };
  }

  /* ---------- everything the panel shows ---------- */
  function render(rows, opts) {
    opts = opts || {};
    const E = build(rows || []);
    if (!E.length) return { html: '<p class="dv-note">Nothing recorded yet.</p>', shown: 0, total: 0,
                            note: '', summary: '', latest: null };
    const show = opts.all ? E : E.filter(e => !e.hide && !isDaily(e));
    let html = '', lastDay = '';
    show.forEach(e => {
      const dd = dayOf(e.d);
      if (dd !== lastDay) { html += '<div class="ch-day">' + dd + '</div>'; lastDay = dd; }
      html += entry(e, opts.all);
    });
    const folded = E.length - show.length;
    return {
      html, shown: show.length, total: E.length,
      note: opts.all ? 'All ' + E.length + ' entries, exactly as recorded.'
        : 'Newest first.' + (folded ? ' ' + folded + ' test' + (folded === 1 ? '' : 's')
          + ' and daily checks folded away.' : ''),
      summary: summary(E, opts.now || new Date()),
      latest: latest(E)
    };
  }

  const WC = { parse, build, render, summary, latest, result, was, plain, whenShort, esc };
  if (typeof module !== 'undefined' && module.exports) module.exports = WC;
  else root.WC = WC;
})(typeof window !== 'undefined' ? window : globalThis);
