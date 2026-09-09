"""Team match results from the captains' Google Form, resolved into a match list.

    python results_import.py                 read the live form, report, write nothing
    python results_import.py --csv FILE      read a local CSV instead (for testing)
    python results_import.py --write         resolve, then regenerate data.js

WHY A FORM AND NOT THE WORKBOOK. Results used to be typed into the Match Log of
Team_Matchplay_Leaderboard.xlsx, which meant every result went through one
person at one PC. The captains are not at that PC and should not be editing a
formula-linked workbook in any case - one stray sort would misalign the whole
tracker. A form is a phone, a dropdown and no way to break anything.

APPEND-ONLY, LAST ONE WINS. A Google Form can only ever add a row, so amending
and deleting have to be expressed as later submissions that supersede earlier
ones. Every row names a FIXTURE - the two rostered players - and that is the
key, because in a round robin each pair meets exactly once. Rows are applied in
submission order and the last one for a fixture is the truth:

    Sending a result   set the result for that fixture, whether or not it
                       already had one
    Removing a result  the fixture goes back to unplayed

Nothing is ever edited or removed from the responses sheet. It is a log of what
was reported and when, and the site is the fold of it. If a captain fat-fingers
a score, they submit a Correction; the wrong row stays in the log, which is
what you want when someone asks why the score changed.

SUBSTITUTES, ONE PER SIDE. The fixture belongs to the rostered players, so the
form asks for them first and only then who actually played. That is the same distinction the
site draws - aSubFor is the team-mate stood in for - and it is why a result can
be matched to its scheduled week even when neither name on the card is the one
in the fixture list.

WHAT THIS REFUSES. A pairing that is not in the schedule, an unknown name, a
substitute from the wrong team or standing in for themselves, a score outside
0-27, which is what 9 holes of Stableford can produce. Those are reported and the row is dropped rather than published. Rule
4's limit of two stand-ins per player is reported but NOT enforced - it is the
captains' call, and the site already shows where it bites.
"""
import csv, io, os, re, sys, time, urllib.error, urllib.request
from datetime import date, datetime, time as dt_time, timedelta

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from matches_inputs import SHORT_TO_REGISTER, SCHEDULE

# Set by the workflow, or here for local runs. File -> Share -> Publish to web
# -> whole document -> CSV, on the form's responses sheet.
CSV_URL = os.environ.get('RESULTS_CSV_URL', '')

# The form's question text becomes the CSV header, so these must match exactly.
COL = {
    'ts':      'Timestamp',
    'action':  'Select one action from below',
    'a':       'Team Yaseen player',
    'b':       'Team Shufqat player',
    'date':    'Date played',        # blank means "today"
    'apts':    'Team Yaseen points',
    'bpts':    'Team Shufqat points',
    'suba':    'Stand-in for the Team Yaseen player',
    'subb':    'Stand-in for the Team Shufqat player',
    'by':      'Your name',
}
# The action column, in both the wordings the sheet has ever used.
#
# The form used to offer three choices - New result, Correction, Delete - and
# the first two did exactly the same thing here: set the result for a fixture.
# The only difference was a warning when the captain's guess about whether one
# already existed turned out wrong, which changed nothing and which nobody ever
# saw. So the form asks two questions now, not three.
#
# THE OLD WORDING MUST KEEP WORKING. The responses sheet is a log and nothing
# is ever edited out of it, so it still holds rows saying "Delete a result
# entered by mistake". If that stopped being recognised those rows would read
# as results, the deletions would be undone and matches would quietly come
# back. Hence a prefix test over both vocabularies rather than a constant.
# Headings this sheet has used before, and still has to be readable under.
#
# A QUESTION'S TITLE IS THE COLUMN HEADING. Rename the question in the form and
# the responses sheet renames the column with it - values intact, but the name
# the importer looks up is gone, and every run fails until it is taught the new
# one. That happened on 9 September when "What are you doing?" became "Select
# one action from below". Aliases mean the same sheet reads correctly whichever
# name it is carrying, so a rename costs a failed run rather than a lost day.
ALIASES = {
    'Select one action from below': ['What are you doing?'],
}

LAST_ROWS = None            # rows seen by the most recent read_rows

DELETING = ('delete', 'remov')

# ...and the wordings that mean "here is a score". Anything matching NEITHER
# list is refused rather than assumed, because the assumption is dangerous in
# one direction: a deletion whose label is not recognised would be read as a
# result and the match it removed would come back. Today a stray label is
# caught only because deletions carry no scores, which is luck rather than a
# check - it would stop being true the moment the form's branching changed.
SENDING = ('sending', 'new result', 'correction', 'result')
# Stableford on 9 holes: par is 2 points a hole, a birdie 3. Birdie every hole
# is 27, which is the practical ceiling and what the society plays to. An eagle
# would pay 4 and could in principle breach it - if that ever happens the round
# will be refused and this is the number to raise.
MAX_POINTS = 27

# A result older than this being removed is worth an email. Routine tidying
# happens the same day; going back weeks is either deliberate or a mistyped
# pair, and only one of those is fine.
OLD_RESULT_DAYS = 10

# How long a problem is worth failing the run over. The responses sheet is a
# log and nothing is edited out of it, so a bad row is replayed on EVERY future
# run - without this, one unresolvable row would leave the job red for the rest
# of the season and the red would stop meaning anything. Fresh problems fail
# and reach a mailbox; older ones stay printed but let the run pass.
FRESH_HOURS = 48
PAST = 'PAST: '


def is_delete(act):
    """Does this row take a result off, in either wording the form has used?"""
    return (act or '').strip().lower().startswith(DELETING)


def is_sending(act):
    """Does this row carry a score, in either wording the form has used?"""
    return (act or '').strip().lower().startswith(SENDING)


def rosters():
    """Both team sheets, taken from week 1 of the schedule.

    Week 1 pairs every player exactly once in roster order, so the team sheets
    are already written down there. Reading them from the workbook as well was
    a second copy of the same fact, and a second thing to keep in step."""
    first = SCHEDULE[0][1]
    return [p[0] for p in first], [p[1] for p in first]


def _parts(s):
    """(a, b, year) from a slashed date, or None."""
    m = re.match(r'^(\d{1,2})[/.](\d{1,2})[/.](\d{4})', (s or '').strip())
    return tuple(int(g) for g in m.groups()) if m else None


def date_order(rows):
    """Is this sheet writing d/m/y or m/d/y?

    Google exports dates in the SPREADSHEET's locale, not yours and not ISO.
    A sheet made by Apps Script defaults to US, so a submission made on the
    8th of September comes out "9/8/2026" - which read as d/m/y is the 9th of
    August, a month wrong, silently, on every result whose date was left blank.

    Rather than hard-code either order, work it out. Any timestamp with a part
    above 12 settles it outright. Failing that, a form submission is always in
    the past and usually recent, so of the two readings take the one that is
    not in the future and lands closest to today.
    """
    for r in rows:
        p = _parts(r.get(COL['ts'], ''))
        if not p:
            continue
        if p[0] > 12:
            return 'dmy'
        if p[1] > 12:
            return 'mdy'

    today, best = date.today(), None
    for r in rows:
        p = _parts(r.get(COL['ts'], ''))
        if not p:
            continue
        for order in ('mdy', 'dmy'):
            d, mo = (p[1], p[0]) if order == 'mdy' else (p[0], p[1])
            try:
                cand = date(p[2], mo, d)
            except ValueError:
                continue
            if cand > today:
                continue
            gap = (today - cand).days
            if best is None or gap < best[0]:
                best = (gap, order)
    return best[1] if best else 'dmy'


def parse_date(s, order='dmy'):
    s = (s or '').strip()
    if not s:
        return None
    m = re.match(r'^(\d{4})-(\d{2})-(\d{2})', s)          # ISO, unambiguous
    if m:
        return date(*map(int, m.groups()))
    p = _parts(s)
    if not p:
        return None
    d, mo = (p[1], p[0]) if order == 'mdy' else (p[0], p[1])
    try:
        return date(p[2], mo, d)
    except ValueError:
        return None


def stamp(s, order='dmy'):
    """A sortable (date, time) from a submission timestamp, or None.

    The date half goes through parse_date so it honours the sheet's locale the
    same way everything else does. The time half is plain H:M:S and needs no
    interpretation.
    """
    d = parse_date(s, order)
    if d is None:
        return None
    m = re.search(r'(\d{1,2}):(\d{2})(?::(\d{2}))?', s or '')
    return (d, tuple(int(x or 0) for x in m.groups()) if m else (0, 0, 0))


def submissions(rows, order):
    """[(sheet row, row)], oldest submission first.

    The log is applied last-wins, which is only right if it is read in the
    order the rows were SUBMITTED. SHEET ORDER IS NOT THAT ORDER. Google Forms
    writes each new response directly beneath the last row IT wrote, so when
    the season was pasted in during migration it landed underneath submissions
    that had already been made. A captain correcting a migrated fixture would
    have had the correction overridden by the older row below it - silently,
    with the site still showing the score they had just fixed.

    So sort on the timestamp rather than trusting position. Rows Google never
    stamped (a hand-typed one) inherit the timestamp of the row above, which
    keeps them where they were pasted, and the sort is stable, so rows sharing
    a timestamp keep their sheet order.
    """
    out, last = [], (date.min, (0, 0, 0))
    for i, r in enumerate(rows, 2):        # 2 = first data row in the sheet
        last = stamp(r.get(COL['ts'], ''), order) or last
        out.append((last, i, r))
    out.sort(key=lambda x: (x[0], x[1]))
    return [(i, r) for _, i, r in out]

def fetch(source):
    """The CSV text, with the two ways this goes wrong named out loud.

    A "publish to web" URL is world-readable and looks like

        https://docs.google.com/spreadsheets/d/e/2PACX-.../pub?...output=csv

    An ordinary sheet URL - the one in the address bar - looks like

        https://docs.google.com/spreadsheets/d/<id>/edit

    and needs a signed-in browser. GitHub's runner has no sign-in, so it gets
    401 or 403 and the run dies in a stack trace that says nothing about
    spreadsheets. Both mistakes are easy and neither is obvious from the URL
    unless you know what to look for, so they are spelled out here."""
    if source and not source.startswith('http'):
        return open(source, encoding='utf-8-sig').read()

    # Google serves a published sheet with max-age=300, so a fetch made moments
    # after a submission can be handed the feed as it stood five minutes ago -
    # missing the very row that asked for this run. That is fine on a schedule
    # and useless on a trigger, which fires the instant a captain presses send.
    # A unique parameter is a different cache key, so the sheet renders afresh.
    sep = '&' if '?' in source else '?'
    source = '%s%s_=%d' % (source, sep, time.time())

    try:
        with urllib.request.urlopen(source, timeout=30) as r:
            return r.read().decode('utf-8-sig')
    except urllib.error.HTTPError as e:
        if e.code in (401, 403):
            print('THE FEED URL NEEDS A SIGN-IN, SO IT IS NOT A PUBLISHED ONE')
            print('   Google returned HTTP %d.' % e.code)
            print('   RESULTS_CSV_URL looks like an ordinary spreadsheet link.')
            print('   In the responses spreadsheet: File > Share > Publish to web,')
            print('   pick the sheet "Form Responses 1", choose Comma-separated')
            print('   values (.csv), press Publish, and use THAT url. A published')
            print('   one contains /d/e/2PACX- and ends output=csv.')
            sys.exit(1)
        if e.code == 404:
            print('THE FEED URL IS NOT THERE (HTTP 404)')
            print('   The spreadsheet may have been deleted, or publishing turned')
            print('   off. Re-publish it and update RESULTS_CSV_URL.')
            sys.exit(1)
        raise
    except urllib.error.URLError as e:
        print('COULD NOT REACH GOOGLE: %s' % e.reason)
        print('   Nothing was published. This is usually transient - the next')
        print('   scheduled run will pick the results up.')
        sys.exit(1)


def read_rows(source):
    text = fetch(source)
    reader = csv.DictReader(io.StringIO(text))

    # Check the HEADER, not the first data row. The old check only looked when
    # there was data, so publishing the wrong tab - Sheet1, the empty one Google
    # creates alongside the responses - produced a perfectly valid empty CSV and
    # was reported as "0 submissions". Indistinguishable from a form nobody had
    # filled in, which sent us hunting for the wrong problem entirely.
    fields = reader.fieldnames or []

    # Accept a column under any name it has legitimately had.
    renamed = {}
    for canon, olds in ALIASES.items():
        if canon not in fields:
            for was in olds:
                if was in fields:
                    renamed[was] = canon
                    break
    if renamed:
        fields = [renamed.get(f, f) for f in fields]

    missing = [c for c in COL.values() if c not in fields]
    if missing:
        print('THE PUBLISHED CSV IS NOT THE RESPONSES SHEET')
        print('   expected columns that are not there:')
        for c in missing:
            print('      %s' % c)
        print('   columns it does have: %s'
              % (', '.join(fields) if fields else '(none - the sheet is empty)'))
        print('   In the responses spreadsheet: File > Share > Publish to web,')
        print('   and pick the sheet named "Form Responses 1" - not Sheet1, and')
        print('   not Entire Document. Then update RESULTS_CSV_URL to match.')
        sys.exit(1)
    rows = list(reader)
    for r in rows:
        for was, canon in renamed.items():
            r[canon] = r.pop(was, '')

    # How many rows THIS read saw. The number has to travel with the data.js it
    # produced: score_log used to re-fetch to count them, and two fetches
    # seconds apart disagreed by one row - which made a real deletion look like
    # the same input giving a different score, and raised a false DRIFT.
    global LAST_ROWS
    LAST_ROWS = len(rows)
    return rows


def resolve(rows):
    """Apply the log in order. Returns (matches, problems, notes)."""
    sched = {}
    for wk, (d, pairs) in enumerate(SCHEDULE, 1):
        for p in pairs:
            sched[p] = wk
    team_a, team_b = rosters()
    known = set(SHORT_TO_REGISTER)

    order = date_order(rows)
    state, notes, problems, subs_used = {}, [], [], {}

    for i, r in submissions(rows, order):
        g = lambda k: (r.get(COL[k]) or '').strip()
        act = g('action')
        a, b = g('a'), g('b')
        where = 'row %d (%s)' % (i, g('by') or 'unknown')
        sent = stamp(g('ts'), order)
        age = '' if sent is None or (
            datetime.combine(sent[0], dt_time(*sent[1]))
            > datetime.now() - timedelta(hours=FRESH_HOURS)) else PAST

        if not (a and b):
            problems.append('%s: no players chosen - ignored' % where)
            continue
        if a not in known or b not in known:
            problems.append('%s: name not recognised (%s v %s)' % (where, a, b))
            continue
        if (a, b) not in sched:
            problems.append('%s: %s v %s is not a fixture in the schedule' % (where, a, b))
            continue

        if not is_delete(act) and not is_sending(act):
            problems.append('%s%s: "%s" is not an action this understands, so the '
                            'row was left alone. If the form was edited, the '
                            'options must still begin "Sending"/"New"/'
                            '"Correction", or "Removing"/"Delete".'
                            % (age, where, act or '(blank)'))
            continue

        if is_delete(act):
            if (a, b) in state:
                gone = state.pop((a, b))
                notes.append('%s: deleted %s v %s, was %d-%d'
                             % (where, a, b, gone['aPts'], gone['bPts']))

                # Removing today's result is routine. Removing one from weeks
                # back is not, and it is the case the form cannot protect
                # against: the dropdowns list every player whether or not the
                # pair has played, so one wrong tap silently takes a real
                # result off a table nobody is looking at any more. It still
                # publishes - the captain may well mean it - but it says so
                # loudly enough to reach a mailbox.
                played = parse_date(gone['date'], 'ymd')
                if played and (date.today() - played).days > OLD_RESULT_DAYS:
                    problems.append(
                        '%s%s: removed %s v %s from %s - %d days back, and it '
                        'was %d-%d. Nothing is lost; send it again to put it '
                        'back. Flagged because a mistyped pair takes an old '
                        'result off in silence.'
                        % (age, where, a, b, gone['date'],
                           (date.today() - played).days,
                           gone['aPts'], gone['bPts']))
            else:
                problems.append('%s%s: asked to delete %s v %s, which has no result'
                                % (age, where, a, b))
            continue

        # A blank date means "played today", which is the common case and saves
        # the captain a tap. Google Forms cannot default a date field to today,
        # so the submission timestamp stands in - it is the same day unless
        # somebody is catching up, and then they fill the date in.
        d = parse_date(g('date'), order) or parse_date(g('ts'), order)
        if d is None:
            problems.append('%s: no date, and the submission timestamp (%r) could'
                            ' not be read either' % (where, g('ts')))
            continue
        try:
            ap, bp = int(float(g('apts'))), int(float(g('bpts')))
        except ValueError:
            problems.append('%s: points not a number (%r / %r)'
                            % (where, g('apts'), g('bpts')))
            continue
        if not (0 <= ap <= MAX_POINTS and 0 <= bp <= MAX_POINTS):
            problems.append('%s: %d-%d is outside 0-%d, which is what 9 holes of'
                            ' Stableford can produce' % (where, ap, bp, MAX_POINTS))
            continue

        # A stand-in per side, each its own field. Both teams can substitute in
        # the same match - a single "did anyone stand in?" could only ever name
        # one of them, which is exactly the case that went missing.
        a_play, b_play, a_for, b_for = a, b, None, None
        bad = False
        for key, rostered, mates, label in (('suba', a, team_a, 'Team Yaseen'),
                                            ('subb', b, team_b, 'Team Shufqat')):
            who = g(key)
            if not who:
                continue                       # nobody stood in on that side
            if who not in known:
                problems.append('%s: stand-in %r not recognised' % (where, who))
                bad = True
                break
            if who not in mates:
                problems.append('%s: %s cannot stand in for the %s player - wrong team'
                                % (where, who, label))
                bad = True
                break
            if who == rostered:
                problems.append('%s: %s is down as standing in for themselves'
                                % (where, who))
                bad = True
                break
            if key == 'suba':
                a_play, a_for = who, a
            else:
                b_play, b_for = who, b
            subs_used[who] = subs_used.get(who, 0) + 1
        if bad:
            continue

        # Not a problem - a captain re-sending a fixture is the supported way
        # to fix a score, and the form no longer asks them to declare which it
        # is. Worth saying out loud though: it is the one line that explains a
        # score changing after it was first published.
        if (a, b) in state:
            notes.append('%s: replaced the earlier %s v %s result' % (where, a, b))

        state[(a, b)] = dict(date=d.isoformat(), aPlayer=a_play, aSubFor=a_for, aPts=ap,
                             bPlayer=b_play, bSubFor=b_for, bPts=bp, week=sched[(a, b)])

    for who, n in sorted(subs_used.items()):
        if n > 2:
            notes.append('%s has stood in %d times - rule 4 allows 2, captains to confirm'
                         % (who, n))

    ms = sorted(state.values(), key=lambda m: (m['date'], m['week']))
    for m in ms:
        m.pop('week', None)
    return ms, problems, notes


def load():
    """The resolved match list, or None if no form is configured."""
    src = CSV_URL
    if not src:
        return None
    return resolve(read_rows(src))[0]


def main():
    src = CSV_URL
    if '--csv' in sys.argv:
        src = sys.argv[sys.argv.index('--csv') + 1]
    if not src:
        raise SystemExit('no form configured: set RESULTS_CSV_URL, or pass --csv FILE')

    rows = read_rows(src)
    ms, problems, notes = resolve(rows)

    print('submissions read : %d' % len(rows))
    print('results standing : %d' % len(ms))
    a = b = 0
    for m in ms:
        big = abs(m['aPts'] - m['bPts']) >= 5
        if m['aPts'] > m['bPts']:
            a += 2 if big else 1
        elif m['bPts'] > m['aPts']:
            b += 2 if big else 1
        else:
            a += 0.5; b += 0.5
    print('score            : Yaseen %g, Shufqat %g' % (a, b))
    for n in notes:
        print('   note    %s' % n)
    for p in problems:
        if p.startswith(PAST):
            print('   past    %s' % p[len(PAST):])
        else:
            print('   PROBLEM %s' % p)
    if problems:
        print('\n%d row(s) were not applied. Nothing is lost - the log keeps them,'
              ' and a corrected submission will supersede.' % len(problems))

    if '--write' in sys.argv:
        if problems:
            raise SystemExit('\nrefusing to publish while rows are unresolved')
        import matches_write
        matches_write.main()


if __name__ == '__main__':
    main()
