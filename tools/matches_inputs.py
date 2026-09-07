"""Fixed reference data for the team match play competition.

Short names mapped to register names, and the published fixture list.

The team sheets use nicknames; the register uses full names. This map is
the only place that correspondence is written down - it used to live in
comments inside data.js, where a regeneration would have erased it.

SCHEDULE is the published 10-week round robin: (week commencing, pairings).
Checked on entry - 100 pairings, every Team Yaseen player against every Team
Shufqat player exactly once, ten matches each week, every week a Monday. The
rules allow a match to be played ahead of its week, so a result can appear
before its scheduled date; that is expected, not an error.
"""

SHORT_TO_REGISTER = {
    "Yaseen (C)": "Yaseen Mohammed",
    "Amriaz": "Afrid Iqbal",
    "Bash": "Basharat2 Ali",
    "Imran": "Imran K",
    "Mansoor": "Mansoor M",
    "Moody": "Mahmood Sadiq",
    "Nav": "Naveen Ahmed",
    "Shaan": "Shaan Ahmed",
    "Shahzad": "Shazad Hussain",
    "Waseem": "Waseem Goldenboy",
    "Shufqat (C)": "Shufqat Khan",
    "Gaff": "Guftar Hussain",
    "Haaris": "Haaris Ahmed",
    "Jabar": "Jabar Mughal",
    "Tab": "Tab Rafique",
    "Raz": "Raz Shafi",
    "Raza": "Raza Efendi",
    "Sam": "Sameer Ahmed",
    "Sid": "Sid Amin",
    "Tariq": "Tariq Javaid"
}

SCHEDULE = [
    ('2026-08-24', [('Yaseen (C)','Shufqat (C)'), ('Amriaz','Gaff'), ('Bash','Haaris'), ('Imran','Jabar'), ('Mansoor','Tab'), ('Moody','Raz'), ('Nav','Raza'), ('Shaan','Sam'), ('Shahzad','Sid'), ('Waseem','Tariq')]),
    ('2026-08-31', [('Yaseen (C)','Gaff'), ('Amriaz','Haaris'), ('Bash','Jabar'), ('Imran','Tab'), ('Mansoor','Raz'), ('Moody','Raza'), ('Nav','Sam'), ('Shaan','Sid'), ('Shahzad','Tariq'), ('Waseem','Shufqat (C)')]),
    ('2026-09-07', [('Yaseen (C)','Haaris'), ('Amriaz','Jabar'), ('Bash','Tab'), ('Imran','Raz'), ('Mansoor','Raza'), ('Moody','Sam'), ('Nav','Sid'), ('Shaan','Tariq'), ('Shahzad','Shufqat (C)'), ('Waseem','Gaff')]),
    ('2026-09-14', [('Yaseen (C)','Jabar'), ('Amriaz','Tab'), ('Bash','Raz'), ('Imran','Raza'), ('Mansoor','Sam'), ('Moody','Sid'), ('Nav','Tariq'), ('Shaan','Shufqat (C)'), ('Shahzad','Gaff'), ('Waseem','Haaris')]),
    ('2026-09-21', [('Yaseen (C)','Tab'), ('Amriaz','Raz'), ('Bash','Raza'), ('Imran','Sam'), ('Mansoor','Sid'), ('Moody','Tariq'), ('Nav','Shufqat (C)'), ('Shaan','Gaff'), ('Shahzad','Haaris'), ('Waseem','Jabar')]),
    ('2026-09-28', [('Yaseen (C)','Raz'), ('Amriaz','Raza'), ('Bash','Sam'), ('Imran','Sid'), ('Mansoor','Tariq'), ('Moody','Shufqat (C)'), ('Nav','Gaff'), ('Shaan','Haaris'), ('Shahzad','Jabar'), ('Waseem','Tab')]),
    ('2026-10-05', [('Yaseen (C)','Raza'), ('Amriaz','Sam'), ('Bash','Sid'), ('Imran','Tariq'), ('Mansoor','Shufqat (C)'), ('Moody','Gaff'), ('Nav','Haaris'), ('Shaan','Jabar'), ('Shahzad','Tab'), ('Waseem','Raz')]),
    ('2026-10-12', [('Yaseen (C)','Sam'), ('Amriaz','Sid'), ('Bash','Tariq'), ('Imran','Shufqat (C)'), ('Mansoor','Gaff'), ('Moody','Haaris'), ('Nav','Jabar'), ('Shaan','Tab'), ('Shahzad','Raz'), ('Waseem','Raza')]),
    ('2026-10-19', [('Yaseen (C)','Sid'), ('Amriaz','Tariq'), ('Bash','Shufqat (C)'), ('Imran','Gaff'), ('Mansoor','Haaris'), ('Moody','Jabar'), ('Nav','Tab'), ('Shaan','Raz'), ('Shahzad','Raza'), ('Waseem','Sam')]),
    ('2026-10-26', [('Yaseen (C)','Tariq'), ('Amriaz','Shufqat (C)'), ('Bash','Gaff'), ('Imran','Haaris'), ('Mansoor','Jabar'), ('Moody','Tab'), ('Nav','Raz'), ('Shaan','Raza'), ('Shahzad','Sam'), ('Waseem','Sid')])
]

# Handicaps played off in THIS competition where they differ from the player's
# NHS figure. Raza Efendi was raised to 36 for the team games only; his NHS on
# the register is unchanged and is still what he plays off everywhere else.
# Anything not listed here uses the register, which stays the single source.
COMP_HANDICAP = {
    "Raza": 36.0,
}

# Fixtures that are known in advance to need a stand-in, so the fixture list
# can say so rather than showing them as ordinary matches still to play.
# Moody does not play Sam or Raz, so both of those fixtures will be covered by
# a substitute. Rule 4 caps a player at being substituted twice, and these two
# are exactly that allowance - there is no margin left for other absences.
SUB_REQUIRED = {
    ("Moody", "Raz"): "Moody does not play Raz",
    ("Moody", "Sam"): "Moody does not play Sam",
}
