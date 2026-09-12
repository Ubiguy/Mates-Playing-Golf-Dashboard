"""Choose which copy of the responses sheet a run publishes from.

    python feed_source.py ROWS_FILE [--allow-fewer]

Writes file=<path, or blank for the published CSV> and go=yes|no to
$GITHUB_OUTPUT when run in the Action, and prints them either way.

TWO COPIES OF THE SAME SHEET. The published-to-web CSV is Google's rendering of
the responses sheet, and it lags: a row can take a minute or more to appear,
which is why the trigger used to stand still for sixty seconds before asking
GitHub to publish. Now the trigger reads the sheet itself, the instant the row
lands, and sends those rows with the request. That copy is as fresh as the
sheet. The published CSV stays as the fallback, and it is all the cron and the
Run workflow button have.

THE RULE: NEVER PUBLISH FROM A COPY OLDER THAN THE ONE ON THE SITE. The sheet
only ever grows - a correction or a removal is a new row, never an edit - so a
copy with fewer rows than data.js was built from is simply out of date. Without
this, a scheduled run landing a few minutes after a trigger run would read the
lagging CSV, miss the result the trigger had just published, and take it back
off the table until Google caught up. The score would go up, down and up again.

data.js carries the row count it was built from (// feed rows: N, written by
matches_write), so the comparison needs nothing else.

Rows really removed from the sheet by hand - tidying out a test - do shrink it.
That is what --allow-fewer is for: the Run workflow button offers it.
"""
import os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import results_import as R


def stamped(data_js):
    """The row count the live data.js was built from, or None if unstamped."""
    try:
        first = open(data_js, encoding='utf-8').readline()
    except OSError:
        return None
    m = re.match(r'// feed rows: (\d+)', first)
    return int(m.group(1)) if m else None


def count(source):
    """Rows in a copy, or None if it cannot be read as the responses sheet."""
    try:
        return len(R.read_rows(source))
    except SystemExit:
        return None          # read_rows has already said why
    except Exception as e:   # unreachable, unreadable, not a CSV at all
        print('could not read %s: %s' % ('the rows sent' if not str(source).startswith('http')
                                         else 'the published CSV', e))
        return None


def choose(rows_file, url, have, allow_fewer=False):
    """(file, go, why). file '' means the published CSV."""
    def fresh_enough(n):
        return have is None or n >= have or allow_fewer

    sent = None
    if rows_file and os.path.exists(rows_file) and os.path.getsize(rows_file):
        sent = count(rows_file)
        if sent is not None and fresh_enough(sent):
            return rows_file, 'yes', ('the rows the trigger sent: %d, site has %s'
                                      % (sent, have))

    if not url:
        return '', 'no', 'no rows sent and no published CSV configured'

    pub = count(url)
    if pub is None:
        # Let the import step fail exactly as it always has, loudly and with
        # its own explanation of what is wrong with the URL.
        return '', 'yes', 'the published CSV could not be read - the import will say why'
    if fresh_enough(pub):
        why = 'the published CSV: %d rows, site has %s' % (pub, have)
        if sent is None and rows_file and os.path.exists(rows_file) and os.path.getsize(rows_file):
            why += ' (the rows sent could not be read, so fell back)'
        elif sent is not None:
            why += ' (the rows sent had only %d)' % sent
        return '', 'yes', why
    return '', 'no', ('NOTHING NEWER TO PUBLISH. The site was built from %d rows; the '
                      'published CSV has %d%s. That copy is behind Google, not ahead '
                      'of the site, so publishing it would take results back off. '
                      'If rows really were deleted from the sheet, use Run workflow '
                      'with "allow fewer rows" ticked.'
                      % (have, pub, '' if sent is None else ' and the rows sent %d' % sent))


def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    rows_file = args[0] if args else ''
    data_js = os.environ.get('DATA_JS') or os.path.join(HERE, '..', 'WedsiteHTML', 'data.js')
    allow = '--allow-fewer' in sys.argv

    f, go, why = choose(rows_file, R.CSV_URL, stamped(data_js), allow)
    print('source: %s' % why)
    out = os.environ.get('GITHUB_OUTPUT')
    if out:
        with open(out, 'a', encoding='utf-8') as fh:
            fh.write('file=%s\ngo=%s\n' % (f, go))
    else:
        print('file=%s\ngo=%s' % (f, go))


if __name__ == '__main__':
    main()
