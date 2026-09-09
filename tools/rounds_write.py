"""Write the live weekly singles standings in data.js from the round-scores
form.

    python rounds_write.py

Reads the resolved entry list from rounds_import.load() (which reads
ROUNDS_CSV_URL and rounds_config.ACTIVE) and turns it into two blocks in
data.js:

    LIVE_ROUNDS      every entry standing, one row per player per round
    LIVE_STANDINGS   one summary per competition in rounds_config.ACTIVE -
                     the table live.html actually renders

HANDICAPS COME OFF THE CARD. The society's rule is "net is gross total
minus the handicap played off that day", so the form asks for it and
net_for uses it. The register is a fallback only - see that function.

WHAT THIS DOES NOT DO. It does not replace LEAGUE, STROKEPLAY or the other
already-published 2026 tables - those are the finished record of a
finished season and this pipeline never touches them. LIVE_ROUNDS and
LIVE_STANDINGS are new, separate blocks for whichever competition is
switched on in rounds_config.ACTIVE right now. When a live competition
ends, moving its final numbers into the same static, hand-checked form as
the 2026 tables is a deliberate step for whoever runs the site then, not
something this script does automatically.
"""
import os, re, sys
from datetime import datetime, timezone

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import rounds_config as cfg
import rounds_import

DATA = rounds_import.DATA
HEAD = '/* ---------- Live weekly singles rounds ----------'


def register_nhs(data_js=DATA):
    src = open(data_js, encoding='utf-8').read()
    return {m.group(1): float(m.group(2)) for m in
            re.finditer(r"\{n:'([^']+)',\s*nhs:([-\d.]+),", src)}


def round_labels(entries):
    """{(comp, date): 'R<n>'} - rounds numbered in the order they were
    played, separately for each competition."""
    out = {}
    for comp in {e['comp'] for e in entries}:
        dates = sorted({e['date'] for e in entries if e['comp'] == comp})
        for i, d in enumerate(dates, 1):
            out[(comp, d)] = 'R%d' % i
    return out


def net_for(e, nhs):
    """Net for one entry: gross minus the handicap PLAYED OFF that day.

    The society's rule, stated on the 2025 page, is exactly that. Taking
    today's register figure instead would recompute every earlier round each
    time a handicap moved - a cut in week five silently rewriting weeks one to
    four and reordering the table with no new round played.

    The register is a fallback only, for rounds entered before the form asked
    for the handicap. None means neither was available and the entry cannot be
    scored.
    """
    h = e.get('hcp')
    if h is None:
        h = nhs.get(e['player'])
    return None if h is None else e['gross'] - h


def strokeplay_table(entries, nhs, bestOf, qualify, problems):
    """(standings, unranked, rounds, best) for one strokeplay competition.

    standings: [[rank, player, rounds, best-N total, best-N average]]
    unranked : [[player, rounds]]
    rounds   : [[round label, date, field size, leader(s), lead net, lead gross]]
    best     : [[player, net, gross, round label]] - five lowest nets
    """
    by_player = {}
    for e in entries:
        if net_for(e, nhs) is None:
            problems.append('%s: no handicap on the card and not on the register '
                            '- entry skipped' % e['player'])
            continue
        net = net_for(e, nhs)
        by_player.setdefault(e['player'], []).append(
            (e['label'], e['date'], e['gross'], net))

    ranked, unranked = [], []
    for player, rounds in by_player.items():
        if len(rounds) < qualify:
            unranked.append([player, len(rounds)])
            continue
        best = sorted(rounds, key=lambda r: r[3])[:bestOf]
        total = round(sum(r[3] for r in best), 1)
        avg = round(total / len(best), 2)
        ranked.append([player, len(rounds), total, avg])

    ranked.sort(key=lambda r: r[3])
    standings, rank = [], 0
    for i, row in enumerate(ranked):
        if i == 0 or row[3] != ranked[i - 1][3]:
            rank = i + 1
        standings.append([rank] + row)
    unranked.sort(key=lambda r: (-r[1], r[0]))

    by_round = {}
    for e in entries:
        by_round.setdefault((e['label'], e['date']), []).append(e)
    round_rows = []
    for (label, d), es in sorted(by_round.items(), key=lambda kv: kv[0][1]):
        withnet = [(e, net_for(e, nhs)) for e in es if net_for(e, nhs) is not None]
        if not withnet:
            continue
        low = min(n for _, n in withnet)
        leaders = sorted(e['player'] for e, n in withnet if n == low)
        leadGross = next(e['gross'] for e, n in withnet if n == low)
        round_rows.append([label, d, len(es), ' & '.join(leaders), low, leadGross])

    best = sorted(
        ([e['player'], net_for(e, nhs), e['gross'], e['label']]
         for e in entries if net_for(e, nhs) is not None),
        key=lambda r: r[1])[:5]

    return standings, unranked, round_rows, best


def stableford_table(entries, nhs, bestOf, qualify, problems):
    """(standings, unranked, rounds, best) for one Stableford competition.

    League points per round: position 1 = 12, down one per place, nothing
    below 13th - the same formula the 2026 page describes. Ties share a
    position and the SAME league points; there is no countback here (see
    rounds_config.py for why) - the site marks them T instead, the way the
    Strokeplay page already marks a shared position.
    """
    by_round = {}
    for e in entries:
        by_round.setdefault((e['label'], e['date']), []).append(e)

    league_pts = {}   # (label, player) -> points awarded that round
    round_rows = []
    for (label, d), es in sorted(by_round.items(), key=lambda kv: kv[0][1]):
        ordered = sorted(es, key=lambda e: -e['points'])
        for i, e in enumerate(ordered):
            pos = 1 + sum(1 for o in ordered if o['points'] > e['points'])
            league_pts[(label, e['player'])] = max(0, 13 - pos)
        top = ordered[0]['points']
        winners = sorted(e['player'] for e in ordered if e['points'] == top)
        round_rows.append([label, d, len(es), ' & '.join(winners), top])

    by_player = {}
    for e in entries:
        if net_for(e, nhs) is None:
            problems.append('%s: no handicap on the card and not on the register '
                            '- entry skipped' % e['player'])
            continue
        by_player.setdefault(e['player'], []).append(e)

    ranked, unranked = [], []
    for player, rounds in by_player.items():
        if len(rounds) < qualify:
            unranked.append([player, len(rounds)])
            continue
        pts = sorted((league_pts[(e['label'], player)] for e in rounds), reverse=True)[:bestOf]
        ranked.append([player, len(rounds), sum(pts)])

    ranked.sort(key=lambda r: -r[2])
    standings, rank = [], 0
    for i, row in enumerate(ranked):
        if i == 0 or row[2] != ranked[i - 1][2]:
            rank = i + 1
        standings.append([rank] + row)
    unranked.sort(key=lambda r: (-r[1], r[0]))

    best = sorted(
        ([e['player'], e['points'], e['label']] for e in entries),
        key=lambda r: -r[1])[:5]

    return standings, unranked, round_rows, best


def js_str(s):
    return "'" + str(s).replace('\\', '\\\\').replace("'", "\\'") + "'"


def js_row(vals):
    out = []
    for v in vals:
        if isinstance(v, str):
            out.append(js_str(v))
        elif v is None:
            out.append('null')
        else:
            out.append(repr(v))
    return '[' + ','.join(out) + ']'


def build_block(entries, nhs, problems):
    labels = round_labels(entries)
    for e in entries:
        e['label'] = labels[(e['comp'], e['date'])]

    live_rounds_rows = []
    for e in sorted(entries, key=lambda e: (e['comp'], e['date'], e['player'])):
        net = net_for(e, nhs)
        live_rounds_rows.append(js_row(
            [e['comp'], e['label'], e['date'], e['player'], e['gross'], net, e['points']]))

    now = datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')
    comps_out = []
    for a in cfg.ACTIVE:
        es = [e for e in entries if e['comp'] == a['comp']]
        if a['comp'] == 'strokeplay':
            standings, unranked, rounds, best = strokeplay_table(
                es, nhs, a['bestOf'], a['qualify'], problems)
        else:
            standings, unranked, rounds, best = stableford_table(
                es, nhs, a['bestOf'], a['qualify'], problems)

        comps_out.append(
            '  {comp:%s,label:%s,season:%d,bestOf:%d,qualify:%d,updated:%s,\n'
            '   standings:[%s],\n'
            '   unranked:[%s],\n'
            '   rounds:[%s],\n'
            '   best:[%s]}'
            % (js_str(a['comp']), js_str(a['label']), a['season'], a['bestOf'], a['qualify'],
               js_str(now),
               ','.join(js_row(r) for r in standings),
               ','.join(js_row(r) for r in unranked),
               ','.join(js_row(r) for r in rounds),
               ','.join(js_row(r) for r in best)))

    block = (
        HEAD + '\n'
        '   Regenerated by rounds_write.py from the round-scores form. Do not\n'
        '   hand-edit - see rounds_config.py to switch a competition live, and\n'
        '   README.md\'s "Live weekly singles scores" for the form behind it.\n\n'
        '   LIVE_ROUNDS: [comp, round label, date, player, gross, net, points]\n'
        '   net is gross minus the register NHS handicap; points is null for\n'
        '   a strokeplay round. LIVE_STANDINGS: one summary per competition\n'
        '   in rounds_config.ACTIVE - see that file for what each field means\n'
        '   and the two honest limits of this pipeline (points required for\n'
        '   Stableford, ties share a position rather than a countback).   */\n'
        'const LIVE_ROUNDS = [\n'
        + (',\n'.join('  ' + r for r in live_rounds_rows) + '\n' if live_rounds_rows else '')
        + '];\n\n'
        'const LIVE_STANDINGS = [\n'
        + (',\n'.join(comps_out) + '\n' if comps_out else '')
        + '];\n'
    )
    return block


def main():
    entries = rounds_import.load()
    if entries is None:
        print('nothing configured - ROUNDS_CSV_URL unset or rounds_config.ACTIVE is empty')
        return

    nhs = register_nhs()
    src = open(DATA, encoding='utf-8').read()

    # AN EMPTY FEED IS NEVER A REASON TO PUBLISH AN EMPTY SEASON - the same
    # guard matches_write.py applies, and for the same reason: a secret
    # pointing at the wrong sheet, or a Google outage, must not read as
    # "the season is over, clear the table."
    existing = re.search(r'const LIVE_ROUNDS = \[(.*?)\n\];', src, re.S)
    had_rows = bool(existing and existing.group(1).strip())
    if not entries and had_rows:
        print('REFUSING TO PUBLISH')
        print('   the form returned no submissions at all, but data.js already')
        print('   holds live round entries. Check that ROUNDS_CSV_URL points at')
        print('   the round-scores form\'s responses sheet.')
        sys.exit(1)

    problems = []
    block = build_block(entries, nhs, problems)

    if HEAD in src:
        start = src.index(HEAD)
        end = src.index('\nconst LIVE_STANDINGS', start)
        end = src.index('\n];\n', end) + 4
        new_src = src[:start] + block + src[end:]
    else:
        sep = '' if src.endswith('\n\n') else ('\n' if src.endswith('\n') else '\n\n')
        new_src = src + sep + block

    open(DATA, 'w', encoding='utf-8', newline='').write(new_src)

    print('entries : %d live round entries across %d competition(s)'
          % (len(entries), len(cfg.ACTIVE)))
    for a in cfg.ACTIVE:
        n = sum(1 for e in entries if e['comp'] == a['comp'])
        print('   %-11s: %d entries, %d rounds so far'
              % (a['comp'], n, len({e['date'] for e in entries if e['comp'] == a['comp']})))
    if problems:
        print('\nCHECK:')
        for p in sorted(set(problems)):
            print('   %s' % p)
    else:
        print('no handicap lookups failed')


if __name__ == '__main__':
    main()
