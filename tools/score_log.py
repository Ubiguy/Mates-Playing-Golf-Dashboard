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
FEED = 'changes.js'          # what the pages read; the CSV stays the record
# Every entry. It used to be the newest 25, and by 13 September the season's
# opening results had already fallen off the end. A whole season is a few
# hundred rows at most; the page groups them by day and folds away the noise.
KEEP = None
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
            what = 'added %s %d-%d' % (fx, n[1], n[2])
        elif o and not n:
            # WITH THE SCORE. Without it this file records that something was
            # removed but not what, so the one document meant to let you
            # retrace a change cannot be used to undo it - the score would have
            # to be dug out of whichever earlier entry added it, which may be
            # weeks and a hundred rows back, or off the end of changes.js
            # entirely. One line should be enough to put a result back.
            what = 'deleted %s, was %d-%d' % (fx, o[1], o[2])
        elif o[1:] != n[1:]:
            what = '%s now %d-%d, was %d-%d' % (fx, n[1], n[2], o[1], o[2])
        else:
            what = '%s moved to %s' % (fx, n[0])
        out.append((what, k))
    return out


def git(site, *args):
    # utf-8 explicitly: on Windows text=True decodes as cp1252, which throws on
    # the arrows and dashes in data.js and loses the whole commit - a backfill
    # would skip it in silence and the trail would have holes in it.
    r = subprocess.run(['git', '-C', site] + list(args), capture_output=True,
                       text=True, encoding='utf-8', errors='replace')
    return r.stdout if r.returncode == 0 else ''


def feed(site):
    """(rows that produced this data.js, {fixture: who last touched it}).

    THE COUNT COMES FROM data.js, not from a fresh fetch. It used to be counted
    by re-reading the form here, which meant the number in the log was sampled
    at a different moment from the score it sat beside. On 9 September two
    fetches seconds apart disagreed by one row, so a genuine deletion was
    recorded against the previous run's count - and the drift check, whose
    whole premise is "same input, different answer", duly cried wolf.
    matches_write.py now stamps the size of the feed it actually read into the
    file it wrote, and that is the only number that can honestly be compared.

    The names still come from the form, and are allowed to be a moment newer:
    a name arriving late is cosmetic, where a count arriving late is a false
    alarm. They are read from the LOG rather than the resolved matches because
    a deletion leaves no match behind, and "who took that off?" is the first
    thing anybody asks.
    """
    src = open(os.path.join(site, 'data.js'), encoding='utf-8').read()
    m = re.match(r'// feed rows: (\d+)', src)
    rows = int(m.group(1)) if m else ''

    who = {}
    try:
        import results_import as R
        if R.CSV_URL:
            log = R.read_rows(R.CSV_URL)
            for _, r in R.submissions(log, R.date_order(log)):
                g = lambda k: (r.get(R.COL[k]) or '').strip()
                if g('a') and g('b'):
                    who[(g('a'), g('b'))] = g('by')
    except SystemExit:
        pass
    except Exception:
        pass
    return rows, who

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


def js(v):
    """A JavaScript string literal.

    Fixtures and names are plain enough, but the log's change column is built
    from whatever the captains typed into the form, so quote it properly rather
    than trusting it to be tame.
    """
    return "'" + (v or '').replace('\\', '\\\\').replace("'", "\\'") + "'"


def write_feed(site, path):
    """Write the newest KEEP entries of the log to changes.js.

    The pages read this rather than score-log.csv. Parsing CSV in a browser
    looks trivial and breaks on exactly the row you would most want to read: a
    drift note says "gave Yaseen 14, Shufqat 19", so the field is quoted and a
    split on commas tears it in half. Python already owns a correct reader, so
    the splitting happens here, once, and the page is handed a list.
    """
    rows = read_log(path)
    if KEEP:
        rows = rows[-KEEP:]
    out = []
    for r in reversed(rows):                     # newest first, as it is read
        items = [i for i in (r.get('change') or '').split('; ') if i]
        out.append('  {when:%s,results:%s,a:%s,b:%s,items:[%s]}' % (
            js(r.get('when')), r.get('results') or '0',
            r.get('yaseen') or '0', r.get('shufqat') or '0',
            ','.join(js(i) for i in items)))
    body = ('// Written by score_log.py - %s of %s, newest first.\n'
            '// That CSV is the record; this is only what the pages read.\n'
            'const CHANGES = [\n%s\n];\n'
            % ('the newest %d entries' % KEEP if KEEP else 'every entry', LOG, ',\n'.join(out)))
    open(os.path.join(site, FEED), 'w', encoding='utf-8', newline='\n').write(body)
    return len(out)

def drift(prev, subs, a, b):
    """The most recent row read from the same input that disagrees, if any."""
    if subs == '':
        return None
    for r in reversed(prev):
        if r.get('submissions') == str(subs):
            same = (r.get('yaseen'), r.get('shufqat')) == ('%g' % a, '%g' % b)
            return None if same else r
    return None


def headline(a, b, n, told):
    """The commit subject. Long change lists are summarised, not truncated."""
    head = 'Yaseen %g, Shufqat %g (%d matches)' % (a, b, n)
    if not told:
        return head + ' -- daily record'
    if len(told) > 2:
        told = told[:2] + ['and %d more' % (len(told) - 2)]
    return head + ' -- ' + '; '.join(told)


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
                      'change': '; '.join(w for w, _ in changes(prev, ms)) or 'first record',
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
        print('headline: %s' % headline(a, b, len(new), []))
        write_feed(site, path)          # in case only the page shape changed
        return

    subs, who = feed(site)
    told = [w + (' (%s)' % who[k] if who.get(k) else '') for w, k in moved]
    note = '; '.join(told) or 'no change'

    # Never write the same row twice. CI commits after every run, so HEAD moves
    # and this cannot arise there - but run by hand twice over, without a commit
    # in between, the same change would be recorded again and the trail would
    # read as though it happened twice.
    if prev and logged_today:
        last = prev[-1]
        if (last['results'], last['yaseen'], last['shufqat'], last['change']) == \
           (str(len(new)), '%g' % a, '%g' % b, note):
            print('score log : Yaseen %g, Shufqat %g - already recorded' % (a, b))
            print('headline: %s' % headline(a, b, len(new), told))
            return

    d = drift(prev, subs, a, b)
    if d:
        note = ('DRIFT - %s submissions gave Yaseen %s, Shufqat %s on %s. %s'
                % (subs, d['yaseen'], d['shufqat'], d['when'][:10], note))

    append(path, {'when': datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ'),
                  'results': len(new), 'yaseen': '%g' % a, 'shufqat': '%g' % b,
                  'submissions': subs, 'change': note,
                  'from': (git(site, 'rev-parse', 'HEAD') or '').strip()[:7]})

    n = write_feed(site, path)
    print('score log : Yaseen %g, Shufqat %g from %d matches (%s holds %d)'
          % (a, b, len(new), FEED, n))
    for m in told:
        print('   changed %s' % m)
    if d:
        print('   DRIFT   the same %s submissions gave Yaseen %s, Shufqat %s on %s.'
              % (subs, d['yaseen'], d['shufqat'], d['when'][:10]))
        print('           The input did not change but the score did. Either the')
        print('           rules changed, or the responses sheet was edited by hand')
        print('           instead of a correction being submitted.')
    hl = headline(a, b, len(new), told)
    print('headline: %s' % ('DRIFT -- ' + hl if d else hl))


if __name__ == '__main__':
    main()
