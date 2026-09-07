/* ---------- Team match play fixture list: shared rendering ----------

   Both the home page and the match play page draw the same fixture rows, and
   until now each carried its own copy of the markup. That meant every change
   had to be made twice and stayed right only by luck. This is the single copy;
   neither page builds a row itself any more.

   FORM. Each name carries a short run of bars, one per match that player has
   actually played, oldest first:

       long bar   win by 5 points or more, worth 2   (BIG_WIN)
       short bar  win, worth 1
       faded bar  halved, worth 0.5
       outline    loss

   So the run reads as a strength meter - more solid bars, better record - and
   its last mark is that player's most recent result.

   CREDIT GOES TO WHOEVER PLAYED. A substitute's win is the substitute's win,
   not the rostered player's, so form is keyed on aPlayer / bPlayer. The
   FIXTURE still belongs to the player who was due to play it, which is why
   results are looked up by aSubFor / bSubFor. The two keys differ on purpose:
   Moody has a record because he has played twice as a stand-in, and Shaan has
   none because Moody played his week 1 match for him.

   READ IT WITH THE SAMPLE SIZE IN MIND. This is one to three matches a player,
   so the bars show what has happened, not a settled ranking. A player with one
   big win is not yet demonstrably better than one with two ordinary wins.   */
const FX = (function () {

  const day = d => new Date(d + 'T00:00:00');
  const dmy = d => day(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  const num = v => v % 1 === 0 ? String(v) : v.toFixed(1);

  /* which side of the draw a player is on, so a name can carry its team colour
     whether or not the match has been played */
  const team = {};
  ROSTER_A.forEach(([n]) => team[n] = 'a');
  ROSTER_B.forEach(([n]) => team[n] = 'b');

  /* the running record, built once */
  const form = {};
  const blank = () => ({ p: 0, w: 0, bw: 0, h: 0, l: 0, pts: 0, seq: [] });
  MATCHES.slice()
    .sort((x, y) => x.date < y.date ? -1 : x.date > y.date ? 1 : 0)
    .forEach(m => {
      const big = Math.abs(m.aPts - m.bPts) >= BIG_WIN;
      [[m.aPlayer, m.aPts, m.bPts], [m.bPlayer, m.bPts, m.aPts]].forEach(function (e) {
        const who = e[0], mine = e[1], theirs = e[2];
        const r = form[who] || (form[who] = blank());
        r.p++;
        if (mine > theirs) { const k = big ? 'bw' : 'w'; r[k]++; r.pts += big ? 2 : 1; r.seq.push(k); }
        else if (mine < theirs) { r.l++; r.seq.push('l'); }
        else { r.h++; r.pts += 0.5; r.seq.push('h'); }
      });
    });

  /* a result belongs to the pairing that was SCHEDULED, so a stand-in is
     looked up under the team-mate they replaced */
  const byPair = {};
  MATCHES.forEach(m => {
    byPair[(m.aSubFor || m.aPlayer) + '|' + (m.bSubFor || m.bPlayer)] = m;
  });

  const WORD = { bw: ['big win', 'big wins'], w: ['win', 'wins'],
                 h: ['halved', 'halved'], l: ['loss', 'losses'] };

  function pips(name) {
    const r = form[name];
    if (!r) return '<i class="form none" title="' + esc(name)
      + ' has not played a match yet">&middot;</i>';
    const parts = ['bw', 'w', 'h', 'l'].filter(k => r[k])
      .map(k => r[k] + ' ' + WORD[k][r[k] === 1 ? 0 : 1]);
    const title = name + ': ' + parts.join(', ') + ' from ' + r.p
      + ' match' + (r.p === 1 ? '' : 'es')
      + ' · ' + num(r.pts) + ' point' + (r.pts === 1 ? '' : 's');
    return '<i class="form" title="' + esc(title) + '">'
      + r.seq.map(k => '<b class="' + k + '"></b>').join('') + '</i>';
  }

  const subMark = (p, f) => f && f !== p
    ? ' <span class="src" title="stood in for ' + esc(f) + '">' + esc(p) + '</span>' : '';

  /* One fixture. opts.late marks a week whose date has passed; opts.early lets
     the match play page say a result was played ahead of its week. */
  function row(a, b, i, opts) {
    opts = opts || {};
    const m = byPair[a + '|' + b];
    const nm = (n, extra) => '<span class="nm">' + esc(n) + extra + '</span>';

    if (!m) {
      const why = (typeof SUB_REQUIRED !== 'undefined') && SUB_REQUIRED[a + '|' + b];
      const note = why
        ? '<span class="src" title="' + esc(why) + '">sub needed</span>'
        : (opts.late ? 'not yet played' : 'to play');
      return '<li class="fx' + (opts.late ? ' late' : '') + '">'
        + '<span class="no">' + (i + 1) + '</span>'
        + '<span class="fx-a">' + pips(a) + nm(a, '') + '</span>'
        + '<span class="fx-v">v</span>'
        + '<span class="fx-b">' + nm(b, '') + pips(b) + '</span>'
        + '<span class="fx-r pending">' + note + '</span></li>';
    }

    const win = m.aPts === m.bPts ? 'halved' : (m.aPts > m.bPts ? 'a' : 'b');
    const early = opts.early && opts.start && day(m.date) < opts.start
      ? ' <span class="src" title="played ahead of its week, which the rules allow">early</span>'
      : '';
    return '<li class="fx done' + (win === 'halved' ? ' halved' : '') + '">'
      + '<span class="no">' + (i + 1) + '</span>'
      + '<span class="fx-a' + (win === 'a' ? ' won' : '') + '">'
      + pips(m.aPlayer) + nm(a, subMark(m.aPlayer, m.aSubFor)) + '</span>'
      + '<span class="fx-v">' + m.aPts + '&ndash;' + m.bPts + '</span>'
      + '<span class="fx-b' + (win === 'b' ? ' won' : '') + '">'
      + nm(b, subMark(m.bPlayer, m.bSubFor)) + pips(m.bPlayer) + '</span>'
      + '<span class="fx-r">' + dmy(m.date) + early + '</span></li>';
  }

  /* One week as a card. opts.header adds the week heading the match play page
     wants; the home page puts its own heading in the section head instead. */
  function card(w, opts) {
    opts = opts || {};
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const start = day(w.from);
    const end = new Date(start); end.setDate(end.getDate() + 6);
    const done = w.pairs.filter(p => byPair[p[0] + '|' + p[1]]).length;
    const late = end < today && done < w.pairs.length;

    const rows = w.pairs.map((p, i) =>
      row(p[0], p[1], i, { late: late, early: opts.early, start: start })).join('');

    let head = '';
    if (opts.header) {
      const state = done === w.pairs.length ? 'done' : (start <= today ? 'live' : '');
      head = '<div class="wk-h"><b>Week ' + w.week + '</b>'
        + '<span class="when">commencing Monday '
        + start.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })
        + '</span><span class="chip ' + state + '">'
        + done + ' of ' + w.pairs.length + '</span></div>';
    }
    return '<div class="wk">' + head + '<ul class="fx-list">' + rows + '</ul></div>';
  }

  /* The bars mean nothing without this, so it goes under the list once - not
     once per week card. */
  function key() {
    const bar = k => '<i class="form"><b class="' + k + '"></b></i>';
    return '<div class="fx-key"><span class="fx-key-t">Form</span>'
      + '<span>' + bar('bw') + 'big win</span>'
      + '<span>' + bar('w') + 'win</span>'
      + '<span>' + bar('h') + 'halved</span>'
      + '<span>' + bar('l') + 'loss</span>'
      + '<span class="fx-key-t">one bar per match played, oldest first</span></div>';
  }

  return { row: row, card: card, key: key, form: form, byPair: byPair, team: team };
})();
