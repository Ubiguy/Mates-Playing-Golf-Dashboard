"""The weekly singles competitions: how each one is scored, and how many count.

    python rounds_config.py         what is configured, and what is running

EVERY TOURNAMENT COUNTS A DIFFERENT NUMBER OF ROUNDS, and has its own minimum
to qualify, so neither is a constant. The 2026 strokeplay counted a player's
best 6 of 9 and needed 6 to be ranked; the 2025 stableford league counted the
best 8 and needed 8. Both are set per competition below.

THE VALUES HERE WERE READ OFF THE PUBLISHED PAGES, not invented:

    strokeplay2026.html  "best 6 of 9" and "6 rounds needed to qualify"
    2025season.html      "best 8 rounds count", "eight of the fourteen rounds
                         were needed to appear in the ranked table", and the
                         12-11-10...1 league points for finishing position

The strokeplay model was then checked against the published standings: for all
six ranked players the best-6 total divided by 6 equals the average shown, so
"average of the best 6 net rounds" is right rather than assumed.

NOTHING IS LIVE UNTIL RUNNING IS SET. Leave it None and the whole feature is
inert: no page changes, no data written, the 2026 tables untouched.
"""
import os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)

# Which competition is currently taking scores. None means none - the live
# scores page stays empty and nothing is published.
RUNNING = None

# Scoring models
#   avg_net        average of the best N net rounds; LOWER is better
#   league_points  points for finishing position each round, best N summed;
#                  HIGHER is better
#   total_points   Stableford points, best N summed; HIGHER is better
COMPETITIONS = {
    'strokeplay': {
        'label':      'Strokeplay Singles',
        'scoring':    'avg_net',
        'best_n':     6,      # how many rounds count towards the standing
        'qualify':    6,      # how many a player needs to be ranked at all
        'needs_points': False,  # gross is enough; net comes off the handicap
        'low_wins':   True,
    },
    'stableford': {
        'label':      'Stableford League',
        'scoring':    'league_points',
        'best_n':     8,
        'qualify':    8,
        # A blown-up hole floors at nought instead of going negative, so points
        # can never be worked back from a gross total. The card has to be read.
        'needs_points': True,
        'low_wins':   False,
        # 12 for the round's winner, 11 the runner-up, down to 1 for twelfth.
        # Thirteenth and below score nothing.
        'position_points': [12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1],
    },
}


def running():
    """The competition taking scores, or None."""
    return COMPETITIONS.get(RUNNING) if RUNNING else None


def points_for(comp, position):
    """League points for finishing in this position, or 0 past the table."""
    table = comp.get('position_points') or []
    return table[position - 1] if 1 <= position <= len(table) else 0


def main():
    print('Weekly singles competitions\n')
    for key, c in COMPETITIONS.items():
        live = ' <- RUNNING' if key == RUNNING else ''
        print('%s (%s)%s' % (c['label'], key, live))
        print('   scoring    : %s (%s wins)'
              % (c['scoring'], 'low' if c['low_wins'] else 'high'))
        print('   counts     : best %d rounds' % c['best_n'])
        print('   qualifies  : %d rounds played' % c['qualify'])
        print('   the form   : gross%s'
              % (' AND Stableford points' if c['needs_points'] else ' only'))
        if c.get('position_points'):
            t = c['position_points']
            print('   positions  : %d for 1st down to %d for %dth, then nothing'
                  % (t[0], t[-1], len(t)))
        print()

    if RUNNING is None:
        print('NOTHING IS RUNNING. The live scores page stays empty and no')
        print('data is written. Set RUNNING to a key above to switch it on.')
    else:
        print('Taking scores for: %s' % COMPETITIONS[RUNNING]['label'])


if __name__ == '__main__':
    main()
