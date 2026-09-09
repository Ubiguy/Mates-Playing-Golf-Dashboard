"""What a season IS, in one place, so next year is a change of data.

    python season.py          what the current season looks like

WHY. Nothing here was hard to work out - the year lives in folder names, page
titles and a schedule - but it lived in a dozen places, so rolling the society
into a new year meant finding all twelve and remembering which mattered. This
is the one file that says which season is running, when it runs, who is in it
and what it publishes. rollover.py reads it; so does the importer.

THE WINDOW IS THE IMPORTANT PART. The captains' form writes to ONE responses
sheet, for ever - it is an append-only log and nothing is deleted from it. So
on the first day of 2027 that sheet still holds every 2026 submission, and the
resolver refuses any fixture it cannot find in the schedule. Without a window,
every one of last year's rows becomes a problem, the job goes red, and it stays
red for the whole season. STARTS is what stops that: a submission made before
the season began belongs to a previous one and is passed over in silence.
"""
import os, sys
from datetime import date, timedelta

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from matches_inputs import SCHEDULE

YEAR = 2026
LABEL = '2026 season'

# Derived from the schedule rather than typed, so it cannot drift away from the
# fixtures it is meant to bracket.
STARTS = date.fromisoformat(SCHEDULE[0][0])
LAST_WEEK = date.fromisoformat(SCHEDULE[-1][0])
ENDS = LAST_WEEK + timedelta(days=6)

# A fortnight past the last week, for results entered late. After that the
# season is closed and rollover.py will stop warning about it.
GRACE_ENDS = ENDS + timedelta(days=14)

TEAM_A, TEAM_B = 'Yaseen', 'Shufqat'

# WHAT BELONGS TO A SEASON, and what belongs to the society.
#
# The distinction matters at rollover. Season pages are archived and reset;
# society pages are neither, because a handicap does not go back to zero in
# January. Both are already titled without a year - "Handicap Register", not
# "2026 Handicap Register" - and the 2025 and 2026 dates inside them are ROUNDS,
# which is precisely what a register spanning years should hold.
SEASON_PAGES = [
    ('matchplay',  'matchplay.html'),
    ('strokeplay', 'strokeplay2026.html'),
    ('awaygames',  'awaygames.html'),
    ('season',     'season.html'),
    ('changes',    'changes.html'),
]

# Year-agnostic. A rollover must not touch these, and must not archive them
# either - there is only ever one of each, and it spans every season.
SOCIETY_PAGES = [
    ('handicaps', 'handicaps.html'),
    ('profiles',  'profiles.html'),
]

# Ran in 2026 with a workbook but no page of their own yet. Named here so a
# rollover does not quietly forget them.
NO_PAGE_YET = ['AsiaCup', 'RosesMatch']


def owns(when):
    """Does a submission made on this date belong to the current season?

    Anything before the first fixture week is a previous season's, still
    sitting in the shared responses sheet. Nothing after is excluded: a result
    entered months late is still this season's until the next one starts.
    """
    return when is None or when >= STARTS


def archive_page():
    """The page this season becomes once it is over - 2026season.html."""
    return '%dseason.html' % YEAR


def archive_data():
    """The frozen copy of data.js for this season."""
    return 'data-%d.js' % YEAR


def main():
    print('%s  (%s)' % (LABEL, TEAM_A + ' v ' + TEAM_B))
    print('  fixtures   : %s to %s, %d weeks'
          % (STARTS, ENDS, len(SCHEDULE)))
    print('  grace ends : %s' % GRACE_ENDS)
    print('  archives as: %s + %s' % (archive_page(), archive_data()))
    print('  season pages (archived and reset each year):')
    for key, page in SEASON_PAGES:
        print('     %-11s %s' % (key, page))
    print('  society pages (year agnostic - never archived, never reset):')
    for key, page in SOCIETY_PAGES:
        print('     %-11s %s' % (key, page))
    if NO_PAGE_YET:
        print('  no page yet : %s' % ', '.join(NO_PAGE_YET))

    today = date.today()
    if today < STARTS:
        print('\n  the season has not started (%d days to go)' % (STARTS - today).days)
    elif today <= ENDS:
        print('\n  IN PROGRESS - %d days of fixtures left' % (ENDS - today).days)
    elif today <= GRACE_ENDS:
        print('\n  fixtures are done; %d days of grace for late results'
              % (GRACE_ENDS - today).days)
    else:
        print('\n  CLOSED since %s - ready to roll over' % GRACE_ENDS)


if __name__ == '__main__':
    main()
