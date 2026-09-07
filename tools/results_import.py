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

    New result       set the result for that fixture
    Correction       the same, and it is expected to replace something
    Delete           the fixture goes back to unplayed

Nothing is ever edited or removed from the responses sheet. It is a log of what
was reported and when, and the site is the fold of it. If a captain fat-fingers
a score, they submit a Correction; the wrong row stays in the log, which is
what you want when someone asks why the score changed.

SUBSTITUTES. The fixture belongs to the rostered players, so the form asks for
them first and only then who actually played. That is the same distinction the
site draws - aSubFor is the team-mate stood in for - and it is why a result can
be matched to its scheduled week even when neither name on the card is the one
in the fixture list.

WHAT THIS REFUSES. A pairing that is not in the schedule, an unknown name, a
substitute from the wrong team, a score outside what a 9-hole Stableford can
produce. Those are reported and the row is dropped rather than published. Rule
4's limit of two stand-ins per player is reported but NOT enforced - it is the
captains' call, and the site already shows where it bites.
"""
import csv, io, os, re, sys, urllib.request
from datetime import date

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from matches_inputs import SHORT_TO_REGISTER, SCHEDULE

# Set by the workflow, or here for local runs. File -> Share -> Publish to web
# -> whole document -> CSV, on the form's responses sheet.
CSV_URL = os.environ.get('RESULTS_CSV_URL', '')

# The form's question text becomes the CSV header, so these must match exactly.
COL = {
    'action':  'What are you doing?',
    'a':       'Team Yaseen player',
    'b':       'Team Shufqat player',
    'date':    'Date played',
    'apts':    'Team Yaseen points',
    'bpts':    'Team Shufqat points',
    'subside': 'Did anyone stand in?',
    'subwho':  'Who actually played?',
    'by':      'Your name',
}
NEW, FIX, DEL = 'New result', 'Correction', 'Delete'
MAX_POINTS = 40          # 9 holes, 2 points a hole is 18; 40 is far beyond real


def rosters():
    """Both team sheets, taken from week 1 of the schedule.

    Week 1 pairs every player exactly once in roster order, so the team sheets
    are already written down there. Reading them from the workbook as well was
    a second copy of the same fact, and a second thing to keep in step."""
    first = SCHEDULE[0][1]
    return [p[0] for p in first], [p[1] for p in first]


def parse_date(s):
    s = (s or '').strip()
    if not s:
        return None
    m = re.match(r'^(\d{4})-(\d{2})-(\d{2})', s)                 # ISO
    if m:
        return date(*map(int, m.groups()))
    m = re.match(r'^(\d{1,2})[/.](\d{1,2})[/.](\d{4})', s)        # d/m/Y
    if m:
        d, mo, y = map(int, m.groups())
        return date(y, mo, d)
    return None


def read_rows(source):
    if source and not source.startswith('http'):
        text = open(source, encoding='utf-8-sig').read()
    else:
        with urllib.request.urlopen(source, timeout=30) as r:
            text = r.read().decode('utf-8-sig')
    rows = list(csv.DictReader(io.StringIO(text)))
    missing = [c for c in COL.values() if rows and c not in rows[0]]
    if missing:
        raise SystemExit('form is missing these columns:\n   ' + '\n   '.join(missing)
                         + '\n\nthe question text must match exactly - see the form spec')
    return rows


def resolve(rows):
    """Apply the log in order. Returns (matches, problems, notes)."""
    sched = {}
    for wk, (d, pairs) in enumerate(SCHEDULE, 1):
        for p in pairs:
            sched[p] = wk
    team_a, team_b = rosters()
    known = set(SHORT_TO_REGISTER)

    state, notes, problems, subs_used = {}, [], [], {}

    for i, r in enumerate(rows, 2):            # 2 = first data row in the sheet
        g = lambda k: (r.get(COL[k]) or '').strip()
        act = g('action')
        a, b = g('a'), g('b')
        where = 'row %d (%s)' % (i, g('by') or 'unknown')

        if not (a and b):
            problems.append('%s: no players chosen - ignored' % where)
            continue
        if a not in known or b not in known:
            problems.append('%s: name not recognised (%s v %s)' % (where, a, b))
            continue
        if (a, b) not in sched:
            problems.append('%s: %s v %s is not a fixture in the schedule' % (where, a, b))
            continue

        if act.startswith(DEL):
            if (a, b) in state:
                del state[(a, b)]
                notes.append('%s: deleted %s v %s' % (where, a, b))
            else:
                problems.append('%s: asked to delete %s v %s, which has no result'
                                % (where, a, b))
            continue

        d = parse_date(g('date'))
        if d is None:
            problems.append('%s: date not understood (%r)' % (where, g('date')))
            continue
        try:
            ap, bp = int(float(g('apts'))), int(float(g('bpts')))
        except ValueError:
            problems.append('%s: points not a number (%r / %r)'
                            % (where, g('apts'), g('bpts')))
            continue
        if not (0 <= ap <= MAX_POINTS and 0 <= bp <= MAX_POINTS):
            problems.append('%s: %d-%d is outside what 9 holes can produce'
                            % (where, ap, bp))
            continue

        a_play, b_play, a_for, b_for = a, b, None, None
        side, who = g('subside'), g('subwho')
        if side.lower().startswith('yes'):
            if not who:
                problems.append('%s: a stand-in was ticked but nobody was named' % where)
                continue
            if who not in known:
                problems.append('%s: stand-in %r not recognised' % (where, who))
                continue
            for_a = 'yaseen' in side.lower()
            side_list = team_a if for_a else team_b
            if who not in side_list:
                problems.append('%s: %s cannot stand in for the %s player - wrong team'
                                % (where, who, 'Team Yaseen' if for_a else 'Team Shufqat'))
                continue
            if for_a:
                a_play, a_for = who, a
            else:
                b_play, b_for = who, b
            subs_used[who] = subs_used.get(who, 0) + 1

        if act.startswith(NEW) and (a, b) in state:
            problems.append('%s: entered as a NEW result but %s v %s already had one'
                            ' - treated as a correction, check it is right' % (where, a, b))
        if act.startswith(FIX) and (a, b) not in state:
            problems.append('%s: entered as a correction but %s v %s had no result yet'
                            % (where, a, b))

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
