"""Stamp data.js and style.css with a content hash in every page.

Both are cached by the browser, so a change to either must change the URL or
readers keep the old copy. data.js has always been stamped; style.css was not,
which meant a CSS change could sit stale behind a cached stylesheet.
"""
import hashlib, re, glob, os

os.chdir(os.path.dirname(os.path.abspath(__file__)))


def sha8(path):
    return hashlib.sha256(open(path, 'rb').read()).hexdigest()[:8]


def main():
    stamps = {'data.js': sha8('data.js'), 'style.css': sha8('style.css')}
    changed = []
    for f in sorted(glob.glob('*.html')):
        s = old = open(f, encoding='utf-8').read()
        for asset, v in stamps.items():
            pat = re.escape(asset) + r'(?:\?v=[0-9a-f]{8})?'
            s = re.sub(pat, '%s?v=%s' % (asset, v), s)
        if s != old:
            open(f, 'w', encoding='utf-8', newline='').write(s)
            changed.append(f)
    for a, v in stamps.items():
        print('%-10s -> %s' % (a, v))
    print('%d page%s restamped' % (len(changed), '' if len(changed) == 1 else 's'))


if __name__ == '__main__':
    main()
