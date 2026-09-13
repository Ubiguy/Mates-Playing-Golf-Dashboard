/* Unit tests for whatchanged.js - how the score log reads on the site.

       node tools/test_whatchanged.js

   Runs every rule against the real changes.js and against the awkward cases
   that have turned up, or could: brackets inside a submitter's name, a removal
   with no score, a correction that hands the match to the other player, a
   test sent and taken off, a real result that was corrected before removal. */
const fs = require('fs'), path = require('path'), vm = require('vm');
const WC = require(path.join(__dirname, '..', 'whatchanged.js'));

let fails = 0;
function check(name, ok, detail) {
  console.log((ok ? '   ok   ' : '   FAIL ') + name + (ok ? '' : '\n        ' + JSON.stringify(detail)));
  if (!ok) fails++;
}
// Tags become spaces, as the page's own spacing (label margins) would render.
const text = html => html.replace(/<[^>]+>/g, ' ').replace(/&ndash;/g, '–').replace(/&minus;/g, '−')
  .replace(/&mdash;/g, '—').replace(/&middot;/g, '·').replace(/&#9733;/g, '★')
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&amp;/g, '&')
  .replace(/\s+/g, ' ').trim();

// real data
const ctx = {};
vm.runInNewContext(fs.readFileSync(path.join(__dirname, '..', 'changes.js'), 'utf8') + ';this.CHANGES = CHANGES;', ctx);
const REAL = ctx.CHANGES;

// a synthetic log, newest first, built oldest first for readability
function log(entries) {
  return entries.map(([when, a, b, results, ...items]) => ({ when, a, b, results, items })).reverse();
}

console.log('1. every line in the real log is understood');
const kinds = REAL.flatMap(r => r.items.map(WC.parse));
check('no entry falls through to "other"', kinds.every(k => k.kind !== 'other'),
  kinds.filter(k => k.kind === 'other'));
check('the log is not empty', REAL.length > 20, REAL.length);

console.log('\n2. reading a line');
let p = WC.parse('added Mansoor v Raza 15-18 (Yaseen (C))');
check('a submitter with brackets in the name', p.by === 'Yaseen (C)' && p.a === 'Mansoor' && p.b === 'Raza' && p.bp === 18, p);
p = WC.parse('added Yaseen (C) v Shufqat (C) 13-18');
check('captains\' (C) marks stay on the players', p.a === 'Yaseen (C)' && p.b === 'Shufqat (C)' && p.by === '', p);
p = WC.parse('deleted Waseem v Shufqat (C)');
check('a trailing (C) with no submitter is a player, not a name', p.kind === 'removed' && p.b === 'Shufqat (C)' && p.by === '' && p.ap === null, p);
p = WC.parse('deleted Waseem v Gaff, was 27-21 (Waseem)');
check('a removal keeps the score it took off', p.kind === 'removed' && p.ap === 27 && p.bp === 21 && p.by === 'Waseem', p);
p = WC.parse('Moody v Sam now 12-17, was 17-12 (Waseem)');
check('a correction keeps old and new scores', p.kind === 'corrected' && p.ap === 12 && p.bp === 17 && p.wa === 17 && p.wb === 12, p);
check('the daily record', WC.parse('no change').kind === 'daily');
check('a drift warning', WC.parse('DRIFT - 38 submissions gave Yaseen 12, Shufqat 19 on 2026-09-09. no change').kind === 'drift');

console.log('\n3. how results read');
check('the Yaseen player winning', text(WC.result('Imran', 'Raz', 18, 15)) === 'Imran beat Raz 18–15');
check('the Shufqat player winning is named first', text(WC.result('Mansoor', 'Raza', 15, 18)) === 'Raza beat Mansoor 18–15',
  text(WC.result('Mansoor', 'Raza', 15, 18)));
check('a halved match', text(WC.result('Yaseen (C)', 'Tariq', 17, 17)) === 'Yaseen (C) halved with Tariq 17–17');
check('a win by 5 carries the star', text(WC.result('Nav', 'Sid', 14, 23)) === 'Sid beat Nav 23–14 ★');
check('a win by 4 does not', text(WC.result('Nav', 'Sid', 14, 18)) === 'Sid beat Nav 18–14');
check('each name keeps its team colour, win or lose',
  WC.result('Bash', 'Tab', 14, 19).includes('<span class="pa">Bash</span>') && WC.result('Bash', 'Tab', 14, 19).includes('<span class="pb">Tab</span>'));
check('"was" names who had it', text(WC.was('Moody', 'Sam', 17, 12)) === 'was 17–12 to Moody');
check('"was" for a halved match', text(WC.was('Moody', 'Sam', 15, 15)) === 'was halved 15–15');
check('"was" with no score', WC.was('Waseem', 'Gaff', null, null) === 'score not recorded');
check('names are escaped, never run as HTML', !WC.result('<img src=x>', 'Raz', 1, 0).includes('<img'));

console.log('\n4. folding tests away');
let rows = log([
  ['2026-09-10T10:00:00Z', 12, 20, 22, 'added Imran v Raz 18-15 (Waseem)'],
  ['2026-09-10T11:00:00Z', 13, 20, 23, 'added Waseem v Gaff 27-21 (Waseem)'],
  ['2026-09-10T11:09:00Z', 12, 20, 22, 'deleted Waseem v Gaff, was 27-21 (Waseem)'],
]);
let r = WC.render(rows, { now: new Date('2026-09-10T12:00:00Z') });
check('sent then taken off within a day folds to one Withdrawn line', r.shown === 2 && /Withdrawn Waseem v Gaff 27–21 sent, then taken off 9 min later/.test(text(r.html)), text(r.html));
check('show everything brings both back', WC.render(rows, { all: true }).shown === 3);

rows = log([
  ['2026-09-10T10:00:00Z', 13, 20, 23, 'added Waseem v Gaff 27-21 (Waseem)'],
  ['2026-09-11T10:01:00Z', 12, 20, 22, 'deleted Waseem v Gaff, was 27-21 (Waseem)'],
]);
check('taken off more than a day later is NOT folded - it was a real result', WC.render(rows).shown === 2);

rows = log([
  ['2026-09-10T10:00:00Z', 13, 20, 23, 'added Moody v Sam 17-12 (Waseem)'],
  ['2026-09-10T10:05:00Z', 12, 21, 23, 'Moody v Sam now 12-17, was 17-12 (Waseem)'],
  ['2026-09-10T10:10:00Z', 12, 20, 22, 'deleted Moody v Sam, was 12-17 (Waseem)'],
]);
check('a result corrected before removal is not folded', WC.render(rows).shown === 3, text(WC.render(rows).html));

rows = log([
  ['2026-09-10T10:00:00Z', 13, 20, 23, 'added Waseem v Jabar 5-26 (Waseem)'],
  ['2026-09-10T10:03:00Z', 12, 20, 22, 'deleted Waseem v Jabar (Waseem)'],
  ['2026-09-10T12:00:00Z', 13, 20, 23, 'added Waseem v Jabar 27-26 (Waseem)'],
  ['2026-09-10T12:02:00Z', 12, 20, 22, 'deleted Waseem v Jabar (Waseem)'],
  ['2026-09-10T14:00:00Z', 12, 21, 23, 'added Waseem v Jabar 18-19 (Waseem)'],
]);
r = WC.render(rows);
check('repeated tests on one fixture pair off one by one, the real result stays',
  r.shown === 3 && (text(r.html).match(/Withdrawn/g) || []).length === 2 && /Jabar beat Waseem 19–18/.test(text(r.html)), text(r.html));
check('a removal with no recorded score still folds', /Waseem v Jabar 5–26 sent/.test(text(r.html)));

console.log('\n5. how the score moved');
rows = log([
  ['2026-09-10T10:00:00Z', 12, 20, 22, 'added Imran v Raz 18-15 (Waseem)'],
  ['2026-09-10T11:00:00Z', 12, 22, 23, 'added Bash v Tab 14-19 (Waseem)'],
  ['2026-09-10T12:00:00Z', 10, 24, 23, 'Moody v Sam now 12-17, was 17-12 (Waseem)'],
]);
r = text(WC.render(rows).html);
check('a Shufqat big win shows Shufqat +2', /Tab beat Bash 19–14 ★ Shufqat \+2/.test(r), r);
check('a swapped correction shows both moves', /Yaseen −2 Shufqat \+2/.test(r), r);
check('the correction says what it was', /Sam beat Moody 17–12 ★? ?was 17–12 to Moody/.test(r), r);
check('the score after each change', /Yaseen 10 · Shufqat 24 · 23 played · sent by Waseem/.test(r), r);

console.log('\n6. the real log');
r = WC.render(REAL, { now: new Date(REAL[0].when) });
const all = WC.render(REAL, { all: true });
const rt = text(r.html);
check('quiet view hides every daily record', !/Daily/.test(rt) && /Daily/.test(text(all.html)));
check('show everything shows every entry', all.shown === REAL.length, [all.shown, REAL.length]);
check('the season load folds to one line', /Loaded the season so far — 20 results/.test(rt));
check('Imran beat Raz 18–15 with Yaseen +1', /Imran beat Raz 18–15 Yaseen \+1/.test(rt), rt.slice(0, 500));
check('the captain as submitter reads "sent by Yaseen (C)"', /sent by Yaseen \(C\)/.test(rt));
check('no raw log wording survives', !/\bdeleted\b|\badded\b|-\d+ \(/.test(rt), rt.match(/.{30}(deleted|added).{30}/));

console.log('\n7. the week in a sentence, and the last change');
rows = log([
  ['2026-09-01T10:00:00Z', 10, 10, 20, 'added Nav v Sid 13-16 (Waseem)'],
  ['2026-09-08T10:00:00Z', 11, 10, 21, 'added Imran v Raz 18-15 (Waseem)'],
  ['2026-09-09T10:00:00Z', 12, 10, 22, 'added Waseem v Gaff 27-26 (Waseem)'],
  ['2026-09-09T10:05:00Z', 11, 10, 21, 'deleted Waseem v Gaff, was 27-26 (Waseem)'],
  ['2026-09-10T10:00:00Z', 11, 12, 22, 'added Bash v Tab 14-19 (Waseem)'],
  ['2026-09-11T02:00:00Z', 11, 12, 22, 'no change'],
]);
const E = WC.build(rows);
check('counts real results and nets the score over the week',
  WC.summary(E, new Date('2026-09-11T12:00:00Z')) === 'Last 7 days: 2 results · Yaseen +1, Shufqat +2.',
  WC.summary(E, new Date('2026-09-11T12:00:00Z')));
check('a quiet week says so', WC.summary(E, new Date('2026-10-30T12:00:00Z')) === 'Nothing has changed in the last 7 days.');
check('the last change skips the daily record', WC.latest(E).text === 'Tab beat Bash 19–14', WC.latest(E));
check('an empty log renders politely', WC.render([]).shown === 0 && /Nothing recorded yet/.test(WC.render([]).html));

console.log(fails ? '\n' + fails + ' CHECK(S) FAILED' : '\nall checks passed - the log reads as intended');
process.exit(fails ? 1 : 0);
