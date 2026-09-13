"""Tag the live site before a change, and roll the change back by script.

    python tools/release.py start NAME               before the change goes live
    python tools/release.py rollback NAME --dry-run  what a rollback would do
    python tools/release.py rollback NAME            do it
    python tools/release.py verify                   are the pages and stamps consistent?
    python tools/release.py list                     releases that can be rolled back

WHY A SCRIPT AND NOT git revert. The results bot commits in between our commits,
and every one of its commits rewrites the ?v= stamp in every page. A revert of
a page change then conflicts on those stamp lines, and untangling that by hand
under pressure is how a wrong score reaches the site. A reset - the other quick
answer - is worse: it takes back off every result sent since the release.

WHAT A ROLLBACK DOES
  1. Starts from exactly what is live (origin/main).
  2. Puts every file back as it was at the tag before-NAME - pages, scripts,
     styles, workflows - EXCEPT the data files, which keep today's contents.
     Results sent since the release stay on the table.
  3. Removes files the release added, and brings back files it deleted.
  4. Restamps, so every page asks for its assets as they now are.
  5. Verifies, commits and pushes. If the results bot publishes in the middle,
     that attempt is thrown away and it starts again from 1.

It returns the site's CODE to the tag, so any other change made after the tag
goes too. --dry-run lists those commits before anything is touched.

Tested by test_release.py, which builds throwaway repositories with a results
bot committing in between, and rolls back through all of it.
"""
import argparse, glob, hashlib, os, re, shutil, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(HERE)

# Written by the results bot, never by a release. A rollback leaves them as they
# are now: they hold the results, and results are not code.
DATA_FILES = ('data.js', 'data-2025.js', 'changes.js', 'score-log.csv', 'version.txt')
PREFIX = 'before-'
BOT = 'mpgolf results bot'
ATTEMPTS = 3

REF = re.compile(r'(?:src|href)="([^"]+)"')
STAMP = re.compile(r'\?v=[0-9a-f]{8}')


class Failure(Exception):
    pass


def git(repo, *args, check=True):
    r = subprocess.run(['git', *args], cwd=repo, capture_output=True, text=True,
                       encoding='utf-8', errors='replace')
    if check and r.returncode:
        raise Failure('git %s failed:\n%s' % (' '.join(args), (r.stderr or r.stdout).strip()))
    return r


def out(repo, *args):
    return git(repo, *args).stdout.strip()


def sha8(path):
    with open(path, 'rb') as f:
        return hashlib.sha256(f.read()).hexdigest()[:8]


def tag_for(name):
    if not re.fullmatch(r'[a-z0-9][a-z0-9-]{1,40}', name or ''):
        raise Failure('a release name is lower-case letters, digits and dashes, '
                      'e.g. matchplay-layout')
    return PREFIX + name


def has_tag(repo, tag):
    return git(repo, 'rev-parse', '-q', '--verify', 'refs/tags/' + tag,
               check=False).returncode == 0


def ready(repo):
    """On main, nothing uncommitted, nothing unpushed - or refuse, touching nothing."""
    branch = out(repo, 'rev-parse', '--abbrev-ref', 'HEAD')
    if branch != 'main':
        raise Failure('switch to the main branch first (this is %s)' % branch)
    dirty = out(repo, 'status', '--porcelain', '--untracked-files=no')
    if dirty:
        raise Failure('there are uncommitted changes - commit or stash them first:\n' + dirty)
    git(repo, 'fetch', '-q', '--tags', '--force', 'origin')
    ahead = out(repo, 'rev-list', '--count', 'origin/main..HEAD')
    if ahead != '0':
        raise Failure('%s local commit(s) are not pushed - push or drop them first' % ahead)


# ------------------------------------------------------------------- start ---

def start(repo, name):
    tag = tag_for(name)
    ready(repo)
    if has_tag(repo, tag):
        raise Failure('%s already exists - give this release a new name' % tag)
    live = out(repo, 'rev-parse', 'origin/main')
    git(repo, 'tag', '-a', tag, live, '-m', 'The live site before %s' % name)
    git(repo, 'push', '-q', 'origin', 'refs/tags/' + tag)
    print('tagged %s at %s - the site as it is live right now' % (tag, live[:7]))
    print('to undo this release:  python tools/release.py rollback %s' % name)
    return tag


# ---------------------------------------------------------------- rollback ---

def text(b):
    return b.decode('utf-8', errors='replace').replace('\r\n', '\n')


def only_stamps(repo, tag, path):
    """True if the file differs from the tag in nothing but ?v= stamps."""
    if not path.endswith('.html'):
        return False
    full = os.path.join(repo, path)
    if not os.path.exists(full):
        return False
    then = subprocess.run(['git', 'show', '%s:%s' % (tag, path)], cwd=repo,
                          capture_output=True).stdout
    now = open(full, 'rb').read()
    return STAMP.sub('', text(then)) == STAMP.sub('', text(now))


def plan(repo, tag):
    p = {'restore': [], 'remove': [], 'data': [], 'commits': [], 'release_data': []}
    for line in out(repo, 'diff', '--no-renames', '--name-status', tag, 'HEAD').splitlines():
        status, path = line.split('\t', 1)
        if path in DATA_FILES:
            p['data'].append(path)
        elif status.startswith('A'):
            p['remove'].append(path)
        elif not only_stamps(repo, tag, path):
            p['restore'].append(path)          # modified, deleted, or mode changed

    def people(paths):
        if not paths:
            return []
        log = out(repo, 'log', '--format=%h\t%an\t%s', tag + '..HEAD', '--', *paths)
        return [l.split('\t', 2) for l in log.splitlines() if l.split('\t')[1] != BOT]

    p['commits'] = people(p['restore'] + p['remove'])
    p['release_data'] = [c for c in people(p['data'])]
    return p


def report(repo, tag, p):
    when = out(repo, 'log', '-1', '--format=%h %cd', '--date=format:%d %b %H:%M', tag)
    print('rolling back to %s (%s)' % (tag, when))
    print('  put back as they were : %s' % (', '.join(p['restore']) or 'none'))
    print('  remove (added since)  : %s' % (', '.join(p['remove']) or 'none'))
    print('  kept as they are now  : %s' % (', '.join(p['data']) or 'no data has changed'))
    if p['commits']:
        print('  this undoes these commits:')
        for h, who, subject in p['commits']:
            print('     %s  %-12s %s' % (h, who, subject))
    if p['release_data']:
        print('  WARNING: a non-bot commit since the tag changed a data file. The')
        print('  rollback keeps today\'s data - check the old pages still read it:')
        for h, who, subject in p['release_data']:
            print('     %s  %-12s %s' % (h, who, subject))


def restamp(repo):
    if not os.path.exists(os.path.join(repo, 'stamp.py')):
        return
    r = subprocess.run([sys.executable, 'stamp.py', '.'], cwd=repo,
                       capture_output=True, text=True)
    if r.returncode:
        raise Failure('stamp.py failed:\n' + (r.stderr or r.stdout))


def apply(repo, tag, p):
    """Stage the rollback. Raises - with the tree reset - if the result is unsafe."""
    try:
        if p['restore']:
            git(repo, 'checkout', tag, '--', *p['restore'])
        if p['remove']:
            git(repo, 'rm', '-q', '--', *p['remove'])
        restamp(repo)
        git(repo, 'add', '-u')

        touched = out(repo, 'diff', '--cached', '--name-only', 'origin/main', '--', *DATA_FILES)
        if touched:
            raise Failure('the rollback would change data files (%s) - refusing'
                          % touched.replace('\n', ', '))
        problems = verify(repo)
        if problems:
            raise Failure('the rolled-back site would not be consistent:\n   '
                          + '\n   '.join(problems))
    except Failure:
        git(repo, 'reset', '-q', '--hard', 'origin/main')
        raise


def rollback(repo, name, dry_run=False, before_push=None):
    tag = tag_for(name)
    ready(repo)
    if not has_tag(repo, tag):
        raise Failure('there is no release called %s - see: python tools/release.py list'
                      % name)

    for attempt in range(1, ATTEMPTS + 1):
        git(repo, 'reset', '-q', '--hard', 'origin/main')
        p = plan(repo, tag)
        report(repo, tag, p)
        if dry_run:
            print('\ndry run - nothing has been changed')
            return 'dry-run'
        if not p['restore'] and not p['remove']:
            print('\nnothing to roll back - the code already matches %s' % tag)
            return 'nothing'

        apply(repo, tag, p)
        if not out(repo, 'diff', '--cached', '--name-only'):
            git(repo, 'reset', '-q', '--hard', 'origin/main')
            print('\nnothing to roll back - the code already matches %s' % tag)
            return 'nothing'

        git(repo, 'commit', '-q', '-m',
            'Roll back %s\n\nEvery file except the data files is back as it was at %s.\n'
            'Results sent since then are kept.' % (name, tag))
        if before_push:
            before_push(attempt)
        if git(repo, 'push', '-q', 'origin', 'HEAD:main', check=False).returncode == 0:
            print('\nrolled back and pushed. The site shows it in about a minute.')
            return 'rolled-back'

        print('\nthe results bot published while this ran - starting again '
              '(attempt %d of %d)' % (attempt + 1, ATTEMPTS))
        git(repo, 'fetch', '-q', 'origin')

    git(repo, 'reset', '-q', '--hard', 'origin/main')
    raise Failure('could not push after %d attempts. Nothing on the site has changed '
                  '- run it again.' % ATTEMPTS)


# ------------------------------------------------------------------ verify ---

def verify(repo):
    """Everything a page asks for exists, every stamp is current, version.txt agrees."""
    problems = []
    data, ver = os.path.join(repo, 'data.js'), os.path.join(repo, 'version.txt')
    if os.path.exists(data):
        if not os.path.exists(ver):
            problems.append('version.txt is missing')
        elif open(ver, encoding='utf-8').read().strip() != sha8(data):
            problems.append('version.txt does not match data.js')

    for page in sorted(glob.glob(os.path.join(repo, '*.html'))):
        name = os.path.basename(page)
        html = open(page, encoding='utf-8').read()
        for ref in REF.findall(html):
            if re.match(r'^(?:[a-z][a-z0-9+.-]*:|//|#)', ref, re.I) or '${' in ref or "'" in ref:
                continue
            path, _, query = ref.partition('?')
            path = path.split('#')[0]
            if not path:
                continue
            full = os.path.join(repo, path)
            if not os.path.exists(full):
                problems.append('%s asks for %s, which does not exist' % (name, path))
                continue
            m = re.search(r'(?:^|&)v=([0-9a-f]{8})', query)
            if m and m.group(1) != sha8(full):
                problems.append('%s has an out-of-date stamp for %s' % (name, path))

    node = shutil.which('node')
    if node:
        for js in sorted(glob.glob(os.path.join(repo, '*.js'))):
            r = subprocess.run([node, '--check', js], capture_output=True, text=True)
            if r.returncode:
                last = (r.stderr.strip().splitlines() or [''])[-1]
                problems.append('%s does not parse: %s' % (os.path.basename(js), last))
    return problems


def releases(repo):
    git(repo, 'fetch', '-q', '--tags', 'origin', check=False)
    return [l.split('\t') for l in out(
        repo, 'for-each-ref', '--sort=-creatordate',
        '--format=%(refname:short)\t%(creatordate:short)\t%(*objectname:short)',
        'refs/tags/' + PREFIX + '*').splitlines() if l]


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__.split('\n')[0])
    ap.add_argument('--repo', default=REPO)
    sub = ap.add_subparsers(dest='cmd', required=True)
    sub.add_parser('start').add_argument('name')
    r = sub.add_parser('rollback')
    r.add_argument('name')
    r.add_argument('--dry-run', action='store_true')
    sub.add_parser('verify')
    sub.add_parser('list')
    a = ap.parse_args(argv)

    try:
        if a.cmd == 'start':
            start(a.repo, a.name)
        elif a.cmd == 'rollback':
            rollback(a.repo, a.name, a.dry_run)
        elif a.cmd == 'verify':
            problems = verify(a.repo)
            for pr in problems:
                print('   PROBLEM %s' % pr)
            print('consistent' if not problems else '%d problem(s)' % len(problems))
            return 1 if problems else 0
        elif a.cmd == 'list':
            rows = releases(a.repo)
            for tag, day, sha in rows:
                print('%-32s %s  %s' % (tag[len(PREFIX):], day, sha))
            if not rows:
                print('no releases tagged yet')
    except Failure as e:
        print('REFUSED: %s' % e)
        return 1
    return 0


if __name__ == '__main__':
    sys.exit(main())
