"""Weekly singles round scores from the round-scores Google Form, resolved
into a clean list of entries.

    python rounds_import.py                 read the live form, report, write nothing
    python rounds_import.py --csv FILE       read a local CSV instead (for testing)
    python rounds_import.py --write          resolve, then regenerate data.js

WHY A FORM. Same reasoning as the captains' match results form (see
results_import.py): whoever ran a week's round should be able to log
everyone's score from a phone in the car park, not wait for someone to sit
down at a PC with data.js open.

ONE ROW PER PLAYER PER ROUND. The organiser fills the form in once for each
player who played that week, in one sitting, all with the same round date.
A round with twelve players is twelve submissions. This is deliberately the
same shape as the captains' form (one row per fact), not a spreadsheet the
organiser fills in and uploads - nothing to install, nothing that only
works from a PC.

APPEND-ONLY, LAST ONE WINS - the same rule as the match results form, for
the same reason (a Google Form can only add rows). The key is (competition,
round date, player), because a player plays a competition on a given date
at most once. Corrections and deletions are later submissions that
supersede earlier ones; nothing is ever edited in the responses sheet
itself.

WHAT THIS REFUSES. A player name that is not on the register, a
competition this pipeline is not currently tracking live (see
rounds_config.ACTIVE - most likely reason: nobody has switched live
tracking on yet), a gross score outside a plausible range, and a
Stableford round with no points entered. See rounds_config.py for why
points are required for Stableford and cannot be derived from the gross
score the way a strokeplay net score can.
"""
import csv, io, os, re, sys, time, urllib.error, urllib.request
from datetime import date

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import rounds_config as cfg

# Set by the workflow, or here for local runs. File -> Share -> Publish to web
# -> whole document -> CSV, on the round-scores form's responses sheet.
CSV_URL = os.environ.get('ROUNDS_CSV_URL', '')

# CI checks the site out flat, so the path has to be overridable - see the
# note in matches_write.py.
DATA = os.environ.get('DATA_JS') or os.path.join('..', 'data.js')

# The form's question text becomes the CSV header, so these must match
# exactly - see README's "Live weekly singles scores" for the form to build.
COL = {
    'ts':     'Timestamp',
    'action': 'What are you doing?',
    'comp':   'Competition',
    'date':   'Round date',
    'player': 'Player',
    'gross':  'Gross score',
    'points': 'Stableford points',
    'hcp':    'Handicap played off',
    'by':     'Your name',
}
NEW, FIX, DEL = 'New result', 'Correction', 'Delete'

MIN_GROSS, MAX_GROSS = 50, 160     # a plausible round, generously bounded
MAX_POINTS = 54                    # 18 holes, birdie every hole - the practical ceiling

# The form's Competition dropdown reads as a full label; rounds_config.ACTIVE
# names competitions by their short key. This is the one place that maps
# between them.
COMP_KEY = {'Stableford Singles': 'stableford', 'Strokeplay Singles': 'strokeplay'}


def _parts(s):
    """(a, b, year) from a slashed date, or None."""
    m = re.match(r'^(\d{1,2})[/.](\d{1,2})[/.](\d{4})', (s or '').strip())
    return tuple(int(g) for g in m.groups()) if m else None


def date_order(rows):
    """Is this sheet writing d/m/y or m/d/y? Same sniff as results_import.py
    - see that file for why this cannot just be hard-coded. Duplicated
    rather than imported so this pipeline can change without touching the
    one already live for team match play."""
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
    d = parse_date(s, order)
    if d is None:
        return None
    m = re.search(r'(\d{1,2}):(\d{2})(?::(\d{2}))?', s or '')
    return (d, tuple(int(x or 0) for x in m.groups()) if m else (0, 0, 0))


def submissions(rows, order):
    """[(sheet row, row)], oldest submission first - see results_import.py's
    submissions() for why sheet order is not submission order."""
    out, last = [], (date.min, (0, 0, 0))
    for i, r in enumerate(rows, 2):        # 2 = first data row in the sheet
        last = stamp(r.get(COL['ts'], ''), order) or last
        out.append((last, i, r))
    out.sort(key=lambda x: (x[0], x[1]))
    return [(i, r) for _, i, r in out]


def fetch(source):
    """The CSV text. See results_import.py's fetch() for the two ways a
    misconfigured URL fails and what each one means."""
    if source and not source.startswith('http'):
        return open(source, encoding='utf-8-sig').read()

    sep = '&' if '?' in source else '?'
    source = '%s%s_=%d' % (source, sep, time.time())

    try:
        with urllib.request.urlopen(source, timeout=30) as r:
            return r.read().decode('utf-8-sig')
    except urllib.error.HTTPError as e:
        if e.code in (401, 403):
            print('THE FEED URL NEEDS A SIGN-IN, SO IT IS NOT A PUBLISHED ONE')
            print('   Google returned HTTP %d.' % e.code)
            print('   ROUNDS_CSV_URL looks like an ordinary spreadsheet link.')
            print('   In the responses spreadsheet: File > Share > Publish to web,')
            print('   pick the sheet "Form Responses 1", choose Comma-separated')
            print('   values (.csv), press Publish, and use THAT url. A published')
            print('   one contains /d/e/2PACX- and ends output=csv.')
            sys.exit(1)
        if e.code == 404:
            print('THE FEED URL IS NOT THERE (HTTP 404)')
            print('   The spreadsheet may have been deleted, or publishing turned')
            print('   off. Re-publish it and update ROUNDS_CSV_URL.')
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
    fields = reader.fieldnames or []
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
        print('   not Entire Document. Then update ROUNDS_CSV_URL to match.')
        sys.exit(1)
    return list(reader)


def register_names(data_js=DATA):
    """Player names on the register, so a typo'd form entry is caught
    rather than quietly starting a new, wrongly-spelled player."""
    src = open(data_js, encoding='utf-8').read()
    return {m.group(1) for m in re.finditer(r"\{n:'([^']+)',", src)}


def resolve(rows, known):
    """Apply the log in order. Returns (entries, problems, notes).

    entries: [{comp, date, player, gross, points, by}], one per fixture
    (competition, date, player), points None for a strokeplay round.
    """
    active = {a['comp'] for a in cfg.ACTIVE}
    order = date_order(rows)
    state, notes, problems = {}, [], []

    for i, r in submissions(rows, order):
        g = lambda k: (r.get(COL[k]) or '').strip()
        act, comp_label, player = g('action'), g('comp'), g('player')
        where = 'row %d (%s)' % (i, g('by') or 'unknown')

        comp = COMP_KEY.get(comp_label)
        if comp is None:
            problems.append('%s: competition %r not recognised' % (where, comp_label))
            continue
        if comp not in active:
            problems.append('%s: %s is not being tracked live right now - see '
                            'rounds_config.ACTIVE' % (where, comp_label))
            continue
        if not player:
            problems.append('%s: no player chosen - ignored' % where)
            continue
        if player not in known:
            problems.append('%s: player %r is not on the register' % (where, player))
            continue

        # A blank date is not defaulted to "today" here the way the match
        # results form does it - a round's date matters for which week it
        # belongs to and an organiser filling in twelve rows in one sitting
        # is expected to have the date to hand, not be logging it live from
        # the course.
        d = parse_date(g('date'), order)
        if d is None:
            problems.append('%s: no usable round date' % where)
            continue
        key = (comp, d.isoformat(), player)

        if act.startswith(DEL):
            if key in state:
                del state[key]
                notes.append('%s: deleted %s, %s, %s' % (where, comp_label, player, d.isoformat()))
            else:
                problems.append('%s: asked to delete a result that does not exist' % where)
            continue

        try:
            gross = int(float(g('gross')))
        except ValueError:
            problems.append('%s: gross score not a number (%r)' % (where, g('gross')))
            continue
        if not (MIN_GROSS <= gross <= MAX_GROSS):
            problems.append('%s: gross %d is outside %d-%d, which is not a plausible round'
                            % (where, gross, MIN_GROSS, MAX_GROSS))
            continue

        # THE HANDICAP PLAYED OFF THAT DAY, from the card.
        #
        # The society's rule, stated on the 2025 page, is "net is gross total
        # minus the handicap played off that day". Taking today's figure off
        # the register instead would recompute every earlier round whenever a
        # handicap moved: a cut in week five would silently rewrite weeks one
        # to four and could reorder the table with no new round played.
        #
        # Blank is allowed and falls back to the register, because a round
        # entered before this column existed has nothing else to go on - but
        # it is recorded as a fallback so the page can say so.
        hcp, hcp_from_card = None, False
        raw = g('hcp')
        if raw:
            try:
                hcp, hcp_from_card = float(raw), True
            except ValueError:
                problems.append('%s: handicap played off is not a number (%r)'
                                % (where, raw))
                continue
            if not (-5 <= hcp <= 54):
                problems.append('%s: handicap %s is outside -5 to 54' % (where, hcp))
                continue

        points = None
        if comp == 'stableford':
            pts_raw = g('points')
            if not pts_raw:
                problems.append("%s: Stableford Singles needs points - they decide the "
                                "week's finishing order and cannot be worked out from the "
                                "gross score alone (see the note in rounds_config.py)" % where)
                continue
            try:
                points = int(float(pts_raw))
            except ValueError:
                problems.append('%s: points not a number (%r)' % (where, pts_raw))
                continue
            if not (0 <= points <= MAX_POINTS):
                problems.append('%s: %d points is outside 0-%d' % (where, points, MAX_POINTS))
                continue

        if act.startswith(NEW) and key in state:
            problems.append('%s: entered as a NEW result but %s already has one for this '
                            'round - treated as a correction, check it is right' % (where, player))
        if act.startswith(FIX) and key not in state:
            problems.append('%s: entered as a correction but %s has no result yet for this '
                            'round' % (where, player))

        state[key] = dict(comp=comp, date=d.isoformat(), player=player,
                          gross=gross, points=points, hcp=hcp,
                          hcp_from_card=hcp_from_card, by=g('by') or None)

    entries = sorted(state.values(), key=lambda e: (e['comp'], e['date'], e['player']))
    return entries, problems, notes


def load(data_js=DATA):
    """The resolved entry list, or None if there is nothing to read (no
    form configured, or nothing switched on in rounds_config.ACTIVE)."""
    if not CSV_URL or not cfg.ACTIVE:
        return None
    return resolve(read_rows(CSV_URL), register_names(data_js))[0]


def main():
    src = CSV_URL
    if '--csv' in sys.argv:
        src = sys.argv[sys.argv.index('--csv') + 1]
    if not src:
        raise SystemExit('no form configured: set ROUNDS_CSV_URL, or pass --csv FILE')
    if not cfg.ACTIVE:
        raise SystemExit('rounds_config.ACTIVE is empty - nothing is being tracked live yet')

    rows = read_rows(src)
    entries, problems, notes = resolve(rows, register_names())

    print('submissions read : %d' % len(rows))
    print('entries standing : %d' % len(entries))
    for comp in sorted({a['comp'] for a in cfg.ACTIVE}):
        n = sum(1 for e in entries if e['comp'] == comp)
        print('   %-11s: %d entries' % (comp, n))
    for n in notes:
        print('   note    %s' % n)
    for p in problems:
        print('   PROBLEM %s' % p)
    if problems:
        print('\n%d row(s) were not applied. Nothing is lost - the log keeps them, '
              'and a corrected submission will supersede.' % len(problems))

    if '--write' in sys.argv:
        if problems:
            raise SystemExit('\nrefusing to publish while rows are unresolved')
        import rounds_write
        rounds_write.main()


if __name__ == '__main__':
    main()
