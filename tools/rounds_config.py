"""Configuration for the live weekly singles rounds pipeline.

This is the on/off switch for LIVE scoring of the Stableford Singles and
Strokeplay Singles championships - the two weekly individual competitions.
Team match play already publishes live from the captains' form (see
matches_inputs.py / results_import.py); this is the same idea for the
singles rounds.

ACTIVE is a list and starts empty. While it is empty, rounds_import.py
skips quietly - the same way the captains' results step skips quietly when
RESULTS_CSV_URL is not set - so this can sit dormant in the repo with no
effect until a society officer switches it on.

TO START LIVE TRACKING FOR THE NEXT SEASON

Add one entry to ACTIVE, commit, and the next form submission will start
building a table. Do this once the first round of the new season has been
played, not before - an empty live table with a "Live" chip sitting on the
site looking abandoned is worse than no table at all.

    ACTIVE = [
        {'comp': 'strokeplay', 'season': 2027, 'label': 'Strokeplay Singles',
         'bestOf': 6, 'qualify': 6},
    ]

    comp      'stableford' or 'strokeplay' - must match a Competition option
              on the form (see README's "Live weekly singles scores").
    season    the year, shown on the live page.
    label     the name shown on the page and used to match the form's
              Competition dropdown value ("<label>").
    bestOf    rounds counted towards a player's total/average. Mirrors the
              historic pattern - Strokeplay averages the best 6, Stableford
              sums the best 8 - but is not required to match it.
    qualify   rounds needed before a player is ranked rather than listed
              as short of the minimum.

Both competitions can run at once, as they effectively do across the
season (Stableford in spring, Strokeplay in summer) - just add two
entries. TWO IMPORTANT LIMITS OF THIS PIPELINE, so the numbers it publishes
are trusted rather than quietly wrong:

STABLEFORD NEEDS POINTS, NOT JUST A GROSS SCORE. A Stableford round is
judged on points, not strokes - a blow-up hole is capped at zero rather
than counting every shot, so a player's points total cannot be reconstructed
from their gross score and handicap the way a strokeplay net score can.
The form asks for points on every Stableford submission and rounds_import.py
refuses a Stableford row that has none.

TIES SHARE A POSITION, THEY DO NOT GET A COUNTBACK. The 2025 and 2026
Stableford tables split a tie by back nine, then back six, then back three
- hole-by-hole detail this pipeline never sees, because the form only
collects a gross score or a points total, not a scorecard. Tied players
here are given the same league points and marked T, matching how the
Strokeplay page already marks a shared position. If a countback matters to
the society, it still has to be worked out by hand from the cards and the
result entered as a correction on the form.
"""
ACTIVE = []
