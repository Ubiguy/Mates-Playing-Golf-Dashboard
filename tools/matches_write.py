"""Write the team match play blocks in data.js from the match-play workbook.

    python matches_write.py

Team_Matchplay_Leaderboard.xlsx is already the entry form: the Match Log says
"add one row per completed match", and the player columns are dropdowns off the
Rosters tab. Its columns map one for one onto data.js, so copying them across by
hand was pure duplication - and the one step where a typo would silently change
the standings. This regenerates them instead.

    Match Log                          data.js MATCHES
    Date                               date
    Yaseen Player / Playing For / Pts   aPlayer / aSubFor / aPts
    Shufqat Player / Playing For / Pts  bPlayer / bSubFor / bPts

HANDICAPS COME FROM THE REGISTER, not from the workbook's Handicap column.
The rosters used to carry their own copy of each player's NHS figure with a
comment saying to update both together - the same arrangement that left seven
profile cards showing a stale index. There is now one source. If the workbook
disagrees with the register the difference is reported, and the register wins.

Everything else on the match play page - team scores, win/loss records, the
pairings grid - is already derived from MATCHES by matchplay.html, so nothing
else needs touching when a match is added.
"""
import os, re, sys, warnings

warnings.filterwarnings('ignore')
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from matches_inputs import SHORT_TO_REGISTER, SCHEDULE, COMP_HANDICAP, SUB_REQUIRED
import results_import

BIG_WIN = 5      # winning margin that is worth 2 points instead of 1

WB = os.path.join('..', 'TeamGames2026', 'Team_Matchplay_Leaderboard.xlsx')
# CI checks the site out flat, so the path has to be overridable
DATA = os.environ.get('DATA_JS') or os.path.join('..', 'WedsiteHTML', 'data.js')
HEAD = '/* ---------- Team match play (TeamGames2026) ----------'


def register_nhs():
    src = open(DATA, encoding='utf-8').read()
    return {m.group(1): float(m.group(2)) for m in
            re.finditer(r"\{n:'([^']+)',\s*nhs:([-\d.]+),", src)}


def rosters():
    """Both team sheets, from week 1 of the schedule rather than the workbook.

    Week 1 pairs every player exactly once in roster order, so the team sheets
    are already written down in SCHEDULE. Reading them from the Rosters tab as
    well was a second copy of the same fact - and it tied this script to a
    workbook that only exists on one PC, which is what stopped results being
    published from a phone. Handicaps come from the register either way, so
    nothing is lost by dropping the sheet's own copy of them."""
    a, b = results_import.rosters()
    return [(n, None) for n in a], [(n, None) for n in b]


def matches(wb):
    ws = wb['Match Log']
    head = next(r for r in range(1, 12) if ws.cell(r, 1).value == 'Match #')
    out = []
    for r in range(head + 1, ws.max_row + 1):
        d, ap, bp = ws.cell(r, 2).value, ws.cell(r, 3).value, ws.cell(r, 6).value
        if not (d and ap and bp):
            continue
        out.append(dict(
            date=d.strftime('%Y-%m-%d') if hasattr(d, 'strftime') else str(d).strip(),
            aPlayer=str(ap).strip(), aSubFor=(str(ws.cell(r, 4).value).strip()
                                              if ws.cell(r, 4).value else None),
            aPts=int(ws.cell(r, 5).value),
            bPlayer=str(bp).strip(), bSubFor=(str(ws.cell(r, 7).value).strip()
                                              if ws.cell(r, 7).value else None),
            bPts=int(ws.cell(r, 8).value)))
    return out


def js_roster(name, rows, nhs, problems):
    lines = []
    width = max(len(n) for n, _ in rows) + 4
    for short, sheet_hcp in rows:
        full = SHORT_TO_REGISTER.get(short)
        if full is None:
            problems.append('roster name "%s" is not in matches_inputs.py' % short)
            hcp = sheet_hcp
        elif full not in nhs:
            problems.append('"%s" maps to "%s", which is not on the register' % (short, full))
            hcp = sheet_hcp
        else:
            hcp = nhs[full]
            if sheet_hcp is not None and abs(float(sheet_hcp) - hcp) >= 0.05:
                problems.append('%s: workbook has %s, register has %s - register used'
                                % (short, sheet_hcp, hcp))
        # a competition handicap overrides the register for this comp only, and
        # is flagged so the page can say it is not the player's NHS figure
        comp = COMP_HANDICAP.get(short)
        if comp is not None:
            cell = "['%s',%s,'comp']," % (short, ('%.1f' % comp))
            lines.append('  %-*s // %s - team games only, NHS is %.1f'
                         % (width + 12, cell, full or '?', hcp))
            continue
        cell = "['%s',%s]," % (short, ('%.1f' % hcp))
        lines.append('  %-*s // %s' % (width + 12, cell, full or '?'))
    lines[-1] = lines[-1].replace('],', ']', 1)
    return 'const %s = [\n%s\n];' % (name, '\n'.join(lines))


def main():
    nhs = register_nhs()
    problems = []
    a, b = rosters()

    # The captains' form is the source of truth when one is configured; the
    # workbook remains the fallback so nothing breaks if it is not.
    ms = results_import.load()
    source = 'captains form'

    # AN EMPTY FEED IS NEVER A REASON TO PUBLISH AN EMPTY SEASON.
    # The form can be read successfully and still return nothing - a secret
    # pointing at the wrong spreadsheet, a form nobody has submitted to yet, a
    # Google outage serving an empty body. Without this the run "succeeds" and
    # quietly wipes every result off a public site, which is what happened the
    # first time the Action ran against a live secret.
    if ms is not None and not ms:
        have = len(re.findall(r"aPlayer:'", open(DATA, encoding='utf-8').read()))
        if have:
            print('REFUSING TO PUBLISH')
            print('   the form returned no submissions at all, but data.js')
            print('   already holds %d results.' % have)
            print('   Check that RESULTS_CSV_URL points at the responses sheet')
            print('   of the form the captains are actually submitting to.')
            sys.exit(1)

    if ms is None:
        import openpyxl                      # only the fallback needs it
        ms = matches(openpyxl.load_workbook(WB, data_only=True))
        source = 'workbook Match Log'

    # the published fixture list must be a complete round robin, and every
    # result must belong to one of its pairings
    sched = {}
    for wk, (d, pairings) in enumerate(SCHEDULE, 1):
        for pr in pairings:
            if pr in sched:
                problems.append('pairing %s v %s appears twice in the schedule' % pr)
            sched[pr] = wk
    if len(sched) != len(a) * len(b):
        problems.append('schedule has %d pairings, expected %d'
                        % (len(sched), len(a) * len(b)))
    for m in ms:
        # a substitute stands in for the scheduled player, so match on who they replaced
        pr = (m['aSubFor'] or m['aPlayer'], m['bSubFor'] or m['bPlayer'])
        if pr not in sched:
            problems.append('result %s v %s on %s is not a scheduled pairing'
                            % (pr[0], pr[1], m['date']))

    known = set(SHORT_TO_REGISTER)
    for m in ms:
        for who in (m['aPlayer'], m['bPlayer'], m['aSubFor'], m['bSubFor']):
            if who and who not in known:
                problems.append('match log name "%s" is not in matches_inputs.py' % who)

    block = (HEAD + '\n'
             "   Generated by matches_write.py from Team_Matchplay_Leaderboard.xlsx.\n"
             "   Add a match as a row on that workbook's Match Log, then re-run it;\n"
             "   do not edit these lists by hand.\n\n"
             "   aSubFor / bSubFor: null normally. A name there means that player\n"
             "   stood in for a team-mate, and it is the team-mate's name.\n\n"
             "   Handicaps are the NHS figures from REGISTER, the single source.\n"
             "   A third entry 'comp' marks a handicap agreed for this competition\n"
             "   only, which is NOT that player's NHS.                          */\n"
             + js_roster('ROSTER_A', a, nhs, problems) + '\n'
             + js_roster('ROSTER_B', b, nhs, problems) + '\n'
             + 'const BIG_WIN = %d;   // margin that turns a win into 2 points\n\n'
               % BIG_WIN
             + 'const MATCHES = [\n'
             + ',\n'.join(
                 "  {date:'%s',aPlayer:'%s',aSubFor:%s,aPts:%d,"
                 "bPlayer:'%s',bSubFor:%s,bPts:%d}"
                 % (m['date'], m['aPlayer'],
                    "'%s'" % m['aSubFor'] if m['aSubFor'] else 'null', m['aPts'],
                    m['bPlayer'],
                    "'%s'" % m['bSubFor'] if m['bSubFor'] else 'null', m['bPts'])
                 for m in ms)
             + '\n];\n\n'
             + '/* The published 10-week round robin. A match may be played ahead of\n'
               '   its week by agreement, so a result can carry a date earlier than\n'
               '   the week it belongs to.                                        */\n'
             + 'const TEAM_SCHEDULE = [\n'
             + ',\n'.join(
                 "  {week:%d, from:'%s', pairs:[%s]}"
                 % (wk, d, ','.join("['%s','%s']" % pr for pr in pairings))
                 for wk, (d, pairings) in enumerate(SCHEDULE, 1))
             + '\n];\n\n'
             + '/* Fixtures known in advance to need a stand-in, with the reason, so\n'
               '   the fixture list can say so rather than showing them as ordinary\n'
               '   matches still to arrange.                                      */\n'
             + 'const SUB_REQUIRED = {\n'
             + ',\n'.join("  '%s|%s':'%s'" % (pa, pb, why)
                          for (pa, pb), why in sorted(SUB_REQUIRED.items()))
             + '\n};\n')

    src = open(DATA, encoding='utf-8').read()
    start = src.index(HEAD)
    if 'const SUB_REQUIRED' in src:
        end = src.index('\n};\n', src.index('const SUB_REQUIRED', start)) + 4
    else:
        tail = 'const TEAM_SCHEDULE' if 'const TEAM_SCHEDULE' in src else 'const MATCHES'
        end = src.index('\n];\n', src.index(tail, start)) + 4
    open(DATA, 'w', encoding='utf-8', newline='').write(src[:start] + block + src[end:])

    # The team score, scored the way the competition scores it. This used to
    # report the sum of raw Stableford points - Yaseen 321, Shufqat 333 - a
    # different and far larger number than the score, and not what anyone means
    # by asking what the score is. Both are printed now, each labelled as what
    # it is, and the score goes first so publish.py surfaces it.
    ya = sh = 0.0
    for m in ms:
        big = abs(m['aPts'] - m['bPts']) >= BIG_WIN
        if m['aPts'] > m['bPts']:
            ya += 2 if big else 1
        elif m['bPts'] > m['aPts']:
            sh += 2 if big else 1
        else:
            ya += 0.5
            sh += 0.5

    # A drop is legitimate - a captain can delete a result - but a cliff is
    # worth saying out loud in a log nobody reads until something looks wrong.
    if source == 'captains form':
        have = len(re.findall(r"aPlayer:'", open(DATA, encoding='utf-8').read()))
        if len(ms) < have:
            print('NOTE    : %d results now, was %d - %d fewer than the site had'
                  % (len(ms), have, have - len(ms)))

    print('score   : Yaseen %g, Shufqat %g  (match points)' % (ya, sh))
    print('rosters : %d and %d players' % (len(a), len(b)))
    print('source  : %s' % source)
    print('matches : %d played of %d scheduled'
          % (len(ms), sum(len(p) for _, p in SCHEDULE)))
    print('points  : Yaseen %d, Shufqat %d  (raw Stableford, not the score)'
          % (sum(m['aPts'] for m in ms), sum(m['bPts'] for m in ms)))
    if problems:
        print('\nCHECK:')
        for p in sorted(set(problems)):
            print('   %s' % p)
    else:
        print('no name or handicap discrepancies')


if __name__ == '__main__':
    main()
