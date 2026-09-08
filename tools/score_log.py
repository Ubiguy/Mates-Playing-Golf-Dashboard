"""Append the team score to score-log.csv, and say what moved it.

    python score_log.py [SITE_DIR]
    python score_log.py [SITE_DIR] --backfill

WHY. data.js is REGENERATED from the form on every run, so it only ever holds
the score as it stands right now. If a score is ever wrong there is nothing to
retrace it against: the form's log says what was SUBMITTED, not what the site
PUBLISHED, and the two can differ - a code change, an edited cell, a resolution
rule that shifted. This is the second record. It is append-only, one row per
change plus one a day whether or not anything moved, so the season's score has
a dated trail that is never rewritten.

It runs after matches_write.py and before the commit, so it compares the data.js
about to be published against the one HEAD already holds, and names the fixtures
that differ. That difference is the retrace: not "12-19" but "12-19, because
Waseem v Sam was deleted".

DRIFT is the case worth catching. The same number of submissions going in and a
different score coming out means the input did not change but the answer did,
which is either a bug or somebody editing the responses sheet by hand rather
than submitting a correction. It does not fail the run - one bad day would then
block every publish after it - so it shouts instead: the row is marked, and the
commit message carries the word.
"""
import csv, os, re, subprocess, sys
from datetime import datetime, timezone

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)

LOG = 'score-log.csv'
FIELDS = ['when', 'results', 'yaseen', 'shufqat', 'submissions', 'change', 'from']

# The MATCHES block as matches_write.py writes it. aPlayer is who PLAYED;
# aSubFor is the rostered player they stood in for, and it is the rostered pair
# that identifies a fixture - a stand-in must not read as a different match.
PAT = (r"date:'(?P<d>[^']+)',aPlayer:'(?P<ap>[^']+)',aSubFor:(?P<asf>null|'[^']*'),"
       r"aPts:(?P<apt>\d+),bPlayer:'(?P<bp>[^']+)',bSubFor:(?P<bsf>null|'[^']*'),"
       r"bPts:(?P<bpt>\d+)")


def matches(src):
    """{(rostered a, rostered b): (date, aPts, bPts)} from the text of a data.js."""
    if not src or 'const MATCHES' not in src:
        return {}
    # To the next declaration, or the end. Backfill reaches versions of data.js
    # older than TEAM_SCHEDULE, so that cannot be the terminator.
    start = src.index('const MATCHES')
    nxt = src.find('\nconst ', start + 1)
    blk = src[start:nxt if nxt > 0 else len(src)]
    strip = lambda v: None if v == 'null' else v[1:-1]
    out = {}
    for mm in re.finditer(PAT, blk):
        g = mm.groupdict()
        key = (strip(g['asf']) or g['ap'], strip(g['bsf']) or g['bp'])
        out[key] = (g['d'], int(g['apt']), int(g['bpt']))
    return out


def points(ms):
    """Match points. A win is 1, a win by 5 or more is 2, a tie is a half each."""
    a = b = 0.0
    for _, ap, bp in ms.values():
        big = abs(ap - bp) >= 5
        if ap > bp:
            a += 2 if big else 1
        elif bp > ap:
            b += 2 if big else 1
        else:
            a += 0.5
            b += 0.5
    return a, b


def changes(old, new):
    """Plain-English list of what differs between two sets of matches."""
    out = []
    for k in sorted(set(old) | set(new), key=lambda k: (new.get(k) or old[k])[0]):
        o, n = old.get(k), new.get(k)
        if o == n:
            continue
        fx = '%s v %s' % k
        if n and not o:
            out.append('added %s %d-%d' % (fx, n[1], n[2]))
        elif o and not n:
            out.append('deleted %s' % fx)
        elif o[1:] != n[1:]:
            out.append('%s now %d-%d, was %d-%d' % (fx, n[1], n[2], o[1], o[2]))
        else:
            out.append('%s moved to %s' % (fx, n[0]))
    return out


def git(site, *args):
    # utf-8 explicitly: on Windows text=True decodes as cp1252, which throws on
    # the arrows and dashes in data.js and loses the whole commit - a backfill
    # would skip it in silence and the trail would have holes in it.
    r = subprocess.run(['git', '-C', site] + list(args), capture_output=True,
                       text=True, encoding='utf-8', errors='replace')
    return r.stdout if r.returncode == 0 else ''


def submissions():
    """How many rows the form's feed held, or blank when it cannot be read.

    Blank rather than 0 on failure: 0 is a real answer that would sit in the
    log looking like an empty season, and this column is the drift check's
    only notion of "the same input".
    """
    try:
        import results_import
        if not results_import.CSV_URL:
            return ''
        return len(results_import.read_rows(results_import.CSV_URL))
    except SystemExit:
        return ''
    except Exception:
        return ''


def read_log(path):
    if not os.path.exists(path):
        return []
    with open(path, newline='', encoding='utf-8') as f:
        return list(csv.DictReader(f))


def append(path, row):
    new = not os.path.exists(path)
    with open(path, 'a', newline='', encoding='utf-8') as f:
        w = csv.DictWriter(f, FIELDS)
        if new:
            w.writeheader()
        w.writerow(row)


def drift(prev, subs, a, b):
    """The most recent row read from the same input that disagrees, if any."""
    if subs == '':
        return None
    for r in reversed(prev):
        if r.get('submissions') == str(subs):
            same = (r.get('yaseen'), r.get('shufqat')) == ('%g' % a, '%g' % b)
            return None if same else r
    return None


def headline(a, b, n, moved):
    """The commit subject. Long change lists are summarised, not truncated."""
    head = 'Yaseen %g, Shufqat %g (%d matches)' % (a, b, n)
    if not moved:
        return head + ' -- daily record'
    if len(moved) > 2:
        moved = moved[:2] + ['and %d more' % (len(moved) - 2)]
    return head + ' -- ' + '; '.join(moved)


def backfill(site, path):
    """Seed the log from the data.js already in git history.

    The trail did not start today. Every commit that touched data.js holds the
    score as it was published, so the season up to now can be recovered rather
    than begun.
    """
    if os.path.exists(path):
        raise SystemExit('%s already exists - backfill is for starting it' % LOG)
    log = git(site, 'log', '--reverse', '--format=%H %cI', '--', 'data.js')
    prev, wrote = {}, 0
    for line in log.splitlines():
        sha, when = line.split()
        ms = matches(git(site, 'show', '%s:data.js' % sha))
        if not ms or ms == prev:
            continue
        a, b = points(ms)
        append(path, {'when': when, 'results': len(ms), 'yaseen': '%g' % a,
                      'shufqat': '%g' % b, 'submissions': '',
                      'change': '; '.join(changes(prev, ms)) or 'first record',
                      'from': sha[:7]})
        prev, wrote = ms, wrote + 1
    print('%s seeded from git history - %d rows' % (LOG, wrote))


def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    site = args[0] if args else os.path.join(HERE, '..', 'WedsiteHTML')
    path = os.path.join(site, LOG)

    if '--backfill' in sys.argv:
        return backfill(site, path)

    new = matches(open(os.path.join(site, 'data.js'), encoding='utf-8').read())
    old = matches(git(site, 'show', 'HEAD:data.js'))
    a, b = points(new)
    moved = changes(old, new)
    prev = read_log(path)
    today = datetime.now(timezone.utc).strftime('%Y-%m-%d')
    logged_today = any((r.get('when') or '').startswith(today) for r in prev)

    if not moved and logged_today:
        print('score log : Yaseen %g, Shufqat %g - no change, today already recorded'
              % (a, b))
        print('headline: %s' % headline(a, b, len(new), moved))
        return

    subs = submissions()
    note = '; '.join(moved) or 'no change'

    # Never write the same row twice. CI commits after every run, so HEAD moves
    # and this cannot arise there - but run by hand twice over, without a commit
    # in between, the same change would be recorded again and the trail would
    # read as though it happened twice.
    if prev and logged_today:
        last = prev[-1]
        if (last['results'], last['yaseen'], last['shufqat'], last['change']) == \
           (str(len(new)), '%g' % a, '%g' % b, note):
            print('score log : Yaseen %g, Shufqat %g - already recorded' % (a, b))
            print('headline: %s' % headline(a, b, len(new), moved))
            return

    d = drift(prev, subs, a, b)
    if d:
        note = ('DRIFT - %s submissions gave Yaseen %s, Shufqat %s on %s. %s'
                % (subs, d['yaseen'], d['shufqat'], d['when'][:10], note))

    append(path, {'when': datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ'),
                  'results': len(new), 'yaseen': '%g' % a, 'shufqat': '%g' % b,
                  'submissions': subs, 'change': note,
                  'from': (git(site, 'rev-parse', 'HEAD') or '').strip()[:7]})

    print('score log : Yaseen %g, Shufqat %g from %d matches' % (a, b, len(new)))
    for m in moved:
        print('   changed %s' % m)
    if d:
        print('   DRIFT   the same %s submissions gave Yaseen %s, Shufqat %s on %s.'
              % (subs, d['yaseen'], d['shufqat'], d['when'][:10]))
        print('           The input did not change but the score did. Either the')
        print('           rules changed, or the responses sheet was edited by hand')
        print('           instead of a correction being submitted.')
    hl = headline(a, b, len(new), moved)
    print('headline: %s' % ('DRIFT -- ' + hl if d else hl))


if __name__ == '__main__':
    main()
