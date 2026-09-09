"""Stamp the cached assets with a content hash in every page.

    python stamp.py

data.js, fx.js and style.css are all cached by the browser, so a change to any
of them must change its URL or readers keep the old copy. That has bitten this
site twice: once when style.css was not stamped at all and a restyle sat behind
a cached stylesheet, and once when a page was still asking for an older hash
than the one on disk.

ONLY src= AND href= ARE TOUCHED. The first version of this matched the bare
filename anywhere in the page, which quietly rewrote the prose too - the
handicaps page ended up telling the reader to edit "data.js?v=71f251c4", a file
that does not exist. A stamp belongs in a URL and nowhere else.
"""
import hashlib, re, glob, os, sys

# runs on its own folder normally; CI passes the checkout directory
os.chdir(sys.argv[1] if len(sys.argv) > 1 and not sys.argv[1].startswith('-')
         else os.path.dirname(os.path.abspath(__file__)))
ASSETS = ['data.js', 'fx.js', 'changes.js', 'fresh.js', 'style.css',
          'favicon-16.png', 'favicon-32.png', 'apple-touch-icon.png']


def sha8(path):
    return hashlib.sha256(open(path, 'rb').read()).hexdigest()[:8]


def main():
    stamps = {a: sha8(a) for a in ASSETS if os.path.exists(a)}

    # What fresh.js compares itself against. It is fetched with no-store, so it
    # is the one thing on the site guaranteed not to come from a cache.
    if 'data.js' in stamps:
        open('version.txt', 'w', encoding='utf-8').write(stamps['data.js'])

    changed = []
    for f in sorted(glob.glob('*.html')):
        s = old = open(f, encoding='utf-8').read()
        for asset, v in stamps.items():
            pat = r'((?:src|href)=")' + re.escape(asset) + r'(?:\?v=[0-9a-f]{8})?(")'
            s = re.sub(pat, r'\g<1>' + asset + '?v=' + v + r'\g<2>', s)
        if s != old:
            open(f, 'w', encoding='utf-8', newline='').write(s)
            changed.append(f)
    for a, v in sorted(stamps.items()):
        print('%-10s -> %s' % (a, v))
    print('%d page%s restamped: %s' % (len(changed), '' if len(changed) == 1 else 's',
                                       ', '.join(changed) or 'none'))


if __name__ == '__main__':
    main()
