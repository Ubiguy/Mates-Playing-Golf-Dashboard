"""Prove the rollback script puts the pages back and never takes a result off.

    python tools/test_release.py

Every test builds throwaway git repositories: an 'origin' standing in for
GitHub, the working copy a release is made from, and a second clone playing the
results bot, which publishes results in between - including in the middle of a
rollback. Nothing touches the real site.
"""
import contextlib, io, os, re, shutil, subprocess, sys, tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import release as R

STAMP_PY = os.path.join(os.path.dirname(HERE), 'stamp.py')
fails = []


def check(name, cond, detail=''):
    print('   %-4s %s%s' % ('ok' if cond else 'FAIL', name,
                            '' if cond else '\n        ' + str(detail)))
    if not cond:
        fails.append(name)


def git(repo, *args):
    return R.out(repo, *args)


def write(repo, path, body):
    full = os.path.join(repo, path)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    with open(full, 'w', encoding='utf-8', newline='\n') as f:
        f.write(body)


def read(repo, path):
    with open(os.path.join(repo, path), encoding='utf-8') as f:
        return f.read()


def page(body, extra=''):
    return ('<!doctype html><link rel="stylesheet" href="style.css">\n'
            '<body>%s\n<script src="data.js"></script>\n'
            '<script src="fx.js"></script>%s\n</body>\n' % (body, extra))


def configure(repo, who='wjave'):
    for k, v in (('user.name', who), ('user.email', 'test@example.com'),
                 ('core.autocrlf', 'false')):
        git(repo, 'config', k, v)


def clone(origin, path):
    # autocrlf off from the first checkout - set afterwards, git already wrote
    # CRLF files and every one of them reads as modified.
    subprocess.run(['git', '-c', 'core.autocrlf=false', 'clone', '-q', origin, path],
                   check=True)


def restamp(repo):
    subprocess.run([sys.executable, 'stamp.py', '.'], cwd=repo, check=True,
                   capture_output=True)


def commit_push(repo, msg):
    git(repo, 'add', '-A')
    git(repo, 'commit', '-q', '-m', msg)
    git(repo, 'push', '-q', 'origin', 'HEAD:main')


class World:
    """origin (GitHub), site (where releases are made), bot (the results bot)."""

    def __init__(self, tmp):
        self.origin = os.path.join(tmp, 'origin.git')
        self.site = os.path.join(tmp, 'site')
        self.bot = os.path.join(tmp, 'bot')
        subprocess.run(['git', 'init', '-q', '--bare', '-b', 'main', self.origin], check=True)
        subprocess.run(['git', 'init', '-q', '-b', 'main', self.site], check=True)
        configure(self.site)
        git(self.site, 'remote', 'add', 'origin', self.origin)

        shutil.copy(STAMP_PY, os.path.join(self.site, 'stamp.py'))
        write(self.site, '.gitattributes', '* -text\n')     # as the real repo: no CRLF conversion
        write(self.site, '.gitignore', '__pycache__/\n')
        write(self.site, 'data.js', '// feed rows: 2\nconst MATCHES = [1, 2];\n')
        write(self.site, 'changes.js', 'const CHANGES = [];\n')
        write(self.site, 'score-log.csv', 'when,results\n1,2\n')
        write(self.site, 'fx.js', 'const FX = 1;\n')
        write(self.site, 'style.css', 'body{color:black}\n')
        write(self.site, 'index.html', page('<p>old home</p><a href="old.html">old</a>'))
        write(self.site, 'matchplay.html', page('<section>old layout</section>'))
        write(self.site, 'old.html', page('<p>a page the release deletes</p>'))
        restamp(self.site)
        commit_push(self.site, 'the site as it was')

        clone(self.origin, self.bot)
        configure(self.bot, R.BOT)
        self.results = 2

    def release(self, touch_data=False):
        with quiet():
            R.start(self.site, 'layout')
        write(self.site, 'index.html', page('<p>score only</p>', '\n<script src="new.js"></script>'))
        write(self.site, 'matchplay.html', page('<details>new layout</details>'))
        write(self.site, 'fx.js', 'const FX = 2;\n')
        write(self.site, 'style.css', 'body{color:green}\n')
        write(self.site, 'new.js', 'const NEW = 1;\n')
        os.remove(os.path.join(self.site, 'old.html'))
        if touch_data:
            write(self.site, 'data.js', '// feed rows: 2\nconst MATCHES = [1, 2]; // new shape\n')
        restamp(self.site)
        commit_push(self.site, 'the new layout')

    def result(self):
        """The bot publishes a result: new data, every page restamped."""
        git(self.bot, 'pull', '-q', '--rebase', 'origin', 'main')
        self.results += 1
        write(self.bot, 'data.js', '// feed rows: %d\nconst MATCHES = [%s];\n'
              % (self.results, ', '.join(str(i + 1) for i in range(self.results))))
        write(self.bot, 'score-log.csv', read(self.bot, 'score-log.csv') + '1,%d\n' % self.results)
        write(self.bot, 'changes.js', 'const CHANGES = [%d];\n' % self.results)
        restamp(self.bot)
        commit_push(self.bot, 'result %d' % self.results)

    def live(self):
        return git(self.site, 'ls-remote', self.origin, 'refs/heads/main').split()[0]

    def fresh_clone(self, tmp, name):
        path = os.path.join(tmp, name)
        clone(self.origin, path)
        return path


@contextlib.contextmanager
def quiet():
    with contextlib.redirect_stdout(io.StringIO()) as buf:
        yield buf


def unstamped(s):
    return R.STAMP.sub('', s)


def at_tag(repo, path):
    return subprocess.run(['git', 'show', 'before-layout:' + path], cwd=repo,
                          capture_output=True, text=True).stdout


def scenario(title):
    print('\n' + title)
    return tempfile.TemporaryDirectory(ignore_cleanup_errors=True)


def main():
    with scenario('1. start tags what is live, and will not reuse a name') as tmp:
        w = World(tmp)
        live = w.live()
        with quiet():
            R.start(w.site, 'layout')
        remote = git(w.site, 'ls-remote', '--tags', w.origin, 'before-layout^{}')
        check('the tag is on GitHub, at the live commit', remote.startswith(live), remote)
        try:
            with quiet():
                R.start(w.site, 'layout')
            check('a second start with the same name is refused', False)
        except R.Failure:
            check('a second start with the same name is refused', True)
        for bad in ('Layout', 'has space', '', '-x'):
            try:
                R.tag_for(bad)
                check('the bad name %r is refused' % bad, False)
            except R.Failure:
                check('the bad name %r is refused' % bad, True)

    with scenario('2. refuses to start from an untidy working copy') as tmp:
        w = World(tmp)
        write(w.site, 'index.html', 'half-finished edit')
        try:
            with quiet():
                R.start(w.site, 'layout')
            check('uncommitted changes are refused', False)
        except R.Failure as e:
            check('uncommitted changes are refused', 'uncommitted' in str(e), e)
        check('and the edit is still there', read(w.site, 'index.html') == 'half-finished edit')

    with scenario('3. THE MAIN CASE: release, results arrive, roll back') as tmp:
        w = World(tmp)
        w.release()
        w.result()
        w.result()
        bot_data = read(w.bot, 'data.js')
        bot_log = read(w.bot, 'score-log.csv')
        with quiet() as out:
            got = R.rollback(w.site, 'layout')
        check('it reports rolled-back', got == 'rolled-back', got)

        c = w.fresh_clone(tmp, 'check')
        for f in ('index.html', 'matchplay.html'):
            check('%s is the old page again' % f,
                  unstamped(read(c, f)) == unstamped(at_tag(w.site, f)), read(c, f))
        for f in ('fx.js', 'style.css'):
            check('%s is the old file again' % f, read(c, f) == at_tag(w.site, f))
        check('the file the release added is gone', not os.path.exists(os.path.join(c, 'new.js')))
        check('the page the release deleted is back', os.path.exists(os.path.join(c, 'old.html')))
        check('BOTH results sent since the release are still in data.js',
              read(c, 'data.js') == bot_data, read(c, 'data.js'))
        check('and in the score log', read(c, 'score-log.csv') == bot_log)
        check('version.txt matches data.js', read(c, 'version.txt').strip() == R.sha8(os.path.join(c, 'data.js')))
        check('every stamp and asset checks out', R.verify(c) == [], R.verify(c))
        stamp = re.search(r'data\.js\?v=([0-9a-f]{8})', read(c, 'index.html'))
        check('the old page asks for TODAY\'s data.js', stamp and stamp.group(1) == R.sha8(os.path.join(c, 'data.js')))
        check('the rollback is one commit on top of history, nothing rewritten',
              git(c, 'log', '-1', '--format=%s') == 'Roll back layout'
              and git(c, 'log', '-2', '--format=%an').splitlines()[1] == R.BOT)
        check('the report names the release commit it undoes', 'the new layout' in out.getvalue(), out.getvalue())

    with scenario('4. a dry run changes nothing, anywhere') as tmp:
        w = World(tmp)
        w.release()
        w.result()
        before = w.live()
        with quiet() as out:
            got = R.rollback(w.site, 'layout', dry_run=True)
        check('it reports dry-run', got == 'dry-run', got)
        check('GitHub is untouched', w.live() == before)
        check('the working copy is clean',
              git(w.site, 'status', '--porcelain', '--untracked-files=no') == '')
        check('it lists what it would put back',
              'index.html' in out.getvalue() and 'new.js' in out.getvalue(), out.getvalue())

    with scenario('5. rolling back twice does nothing the second time') as tmp:
        w = World(tmp)
        w.release()
        w.result()
        with quiet():
            R.rollback(w.site, 'layout')
        w.result()                      # a result lands after the rollback too
        before = w.live()
        with quiet():
            got = R.rollback(w.site, 'layout')
        check('the second run finds nothing to do', got == 'nothing', got)
        check('and pushes nothing', w.live() == before)

    with scenario('6. the bot publishes IN THE MIDDLE of a rollback') as tmp:
        w = World(tmp)
        w.release()
        w.result()
        fired = []

        def bot_gets_in_first(attempt):
            if attempt == 1:
                w.result()              # lands between our commit and our push
                fired.append(attempt)

        with quiet() as out:
            got = R.rollback(w.site, 'layout', before_push=bot_gets_in_first)
        check('the race actually happened', fired == [1])
        check('it tried again and succeeded', got == 'rolled-back', out.getvalue())
        c = w.fresh_clone(tmp, 'check')
        check('the result that raced it is on the site', 'feed rows: 4' in read(c, 'data.js'), read(c, 'data.js'))
        check('and the rollback is too', unstamped(read(c, 'index.html')) == unstamped(at_tag(w.site, 'index.html')))
        check('everything checks out', R.verify(c) == [], R.verify(c))

    with scenario('7. refusals that leave everything as it was') as tmp:
        w = World(tmp)
        w.release()
        try:
            with quiet():
                R.rollback(w.site, 'no-such-release')
            check('an unknown release is refused', False)
        except R.Failure as e:
            check('an unknown release is refused', 'no release called' in str(e), e)

        write(w.site, 'extra.txt', 'x')
        git(w.site, 'add', 'extra.txt')
        git(w.site, 'commit', '-q', '-m', 'not pushed')
        before = w.live()
        try:
            with quiet():
                R.rollback(w.site, 'layout')
            check('unpushed local work is refused, not destroyed', False)
        except R.Failure as e:
            check('unpushed local work is refused, not destroyed',
                  'not pushed' in str(e) and os.path.exists(os.path.join(w.site, 'extra.txt')), e)
        check('and GitHub is untouched', w.live() == before)

    with scenario('8. if the rolled-back site would be broken, nothing is pushed') as tmp:
        w = World(tmp)
        w.release()
        w.result()
        before = w.live()
        real = R.verify
        R.verify = lambda repo: ['pretend a page is broken']
        try:
            with quiet():
                R.rollback(w.site, 'layout')
            check('a failed verification stops the rollback', False)
        except R.Failure as e:
            check('a failed verification stops the rollback', 'not be consistent' in str(e), e)
        finally:
            R.verify = real
        check('GitHub is untouched', w.live() == before)
        check('the working copy is put back clean',
              git(w.site, 'status', '--porcelain', '--untracked-files=no') == '')

    with scenario('9. verify catches what would break a page') as tmp:
        w = World(tmp)
        check('a consistent site passes', R.verify(w.site) == [], R.verify(w.site))
        write(w.site, 'fx.js', 'const FX = 99;\n')                 # changed, not restamped
        write(w.site, 'index.html', read(w.site, 'index.html') + '<img src="gone.png">\n')
        write(w.site, 'broken.js', 'const = ;\n')
        problems = R.verify(w.site)
        check('an out-of-date stamp', any('stamp for fx.js' in p for p in problems), problems)
        check('a missing asset', any('gone.png' in p for p in problems), problems)
        if shutil.which('node'):
            check('a script that does not parse', any('broken.js' in p for p in problems), problems)
        write(w.site, 'data.js', read(w.site, 'data.js') + '// another result\n')
        check('a version.txt that no longer matches data.js',
              any('version.txt' in p for p in R.verify(w.site)))

    with scenario('10. a release that also changed a data file is flagged, data kept') as tmp:
        w = World(tmp)
        w.release(touch_data=True)
        w.result()
        bot_data = read(w.bot, 'data.js')
        with quiet() as out:
            R.rollback(w.site, 'layout')
        c = w.fresh_clone(tmp, 'check')
        check('the dry-run report warns about it', 'WARNING' in out.getvalue(), out.getvalue())
        check('data.js is still today\'s, with every result', read(c, 'data.js') == bot_data)
        check('everything checks out', R.verify(c) == [], R.verify(c))

    with scenario('11. results alone, with no release since the tag, are left alone') as tmp:
        w = World(tmp)
        with quiet():
            R.start(w.site, 'layout')
        w.result()
        w.result()
        before = w.live()
        with quiet():
            got = R.rollback(w.site, 'layout')
        check('pages that differ only by stamps are not "rolled back"', got == 'nothing', got)
        check('nothing is pushed', w.live() == before)

    print()
    if fails:
        print('%d CHECK(S) FAILED:\n   %s' % (len(fails), '\n   '.join(fails)))
        return 1
    print('all checks passed - a rollback restores the pages and keeps every result')
    return 0


if __name__ == '__main__':
    sys.exit(main())
