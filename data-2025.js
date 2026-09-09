// The 2025 season, frozen on the day it was archived.
// Cut from data.js by freeze_archive.py so this page can never be
// changed by a later season being published. Do not edit.

const STABLEFORD = [
  [1,'Shaan Ahmed',      9, 85,291,72.25],
  [2,'Yaseen Mohammed', 11, 74,268,74.50],
  [3,'Tab Rafique',     14, 71,262,75.25],
  [4,'Waseem Goldenboy',12, 70,265,75.12],
  [5,'Mansoor M',       12, 69,275,74.12],
  [5,'Guftar Hussain',  11, 69,263,75.62],
  [7,'Shazad Hussain',  13, 67,269,74.38],
  [8,'Imran K',         10, 64,259,75.62],
  [9,'Sameer Ahmed',     9, 62,258,75.75],
  [10,'Sid Amin',       11, 59,256,76.12],
  [11,'Mahmood Sadiq',  12, 47,242,77.88]
];

const SF_UNRANKED = [['Shufqat Khan',7],['Basharat2 Ali',7],['Nadeem Ahmed',5],['Tariq Javaid',5],
  ['Raz Shafi',4],['Afrid Iqbal',4],['Haaris Ahmed',3],['Jabar Mughal',3],['Hamza T',2],
  ['Umer Akbar',1],['Ayaz Alam',1],['Naeem Akhtar',1],['Naveen Ahmed',1]];

/* ---------- Handicap register ----------
   SOCIETY RULE: a player's handicap is their NHS handicap unless stated
   otherwise. WHS and the calculated index are held for comparison only and
   are never used as the playing figure.

   THREE handicaps are tracked per player:
     nhs   - NHS handicap. THE PLAYING HANDICAP. Supplied figure, from the
             "NHS App HCP (reference)" column of the Player HC tab.
     whs   - WHS handicap. Supplied figure, from the "WHS" column of the same tab.
     calc  - Calculated HC. Worked out from the hole-by-hole scorecards
             in Golf_Scores_Tracker_19.xlsx (Player HC tab).
   rounds  - scorecards on record; est = true once past 20 rounds.

   Source: Golf-2026/2026/Data2026/Golf_Scores_Tracker_19.xlsx, Player HC tab.
   Anything set to null simply shows as a dash on the page.           */

const BEST = [
  ['Shufqat Khan',64,79,'Stroke Play R6','9 Aug 2026'],
  ['Shaan Ahmed',64,92,'Stableford R2','20 Apr 2025'],
  ['Shaan Ahmed',66,92,'Stableford R9','8 Jun 2025'],
  ['Shazad Hussain',66,88,'Stableford R10','15 Jun 2025'],
  ['Mansoor M',67,85,'Stroke Play R8','23 Aug 2026']
];

/* ---------- Asia Cup 2026 squad ----------
   The event and the members of the squad who are not society players.
   Squad selection itself is an accolade on the player, in REGISTER.honours. */
