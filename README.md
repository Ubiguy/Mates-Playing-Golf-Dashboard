# Golf Society 2026

A six-page static site. No build step, no dependencies, nothing to install —
drop the folder in a repo, switch on GitHub Pages, and the society has one permanent link.

**View it:** https://YOUR-USERNAME.github.io/YOUR-REPO/

## What's here

| File | What it is |
|---|---|
| `index.html` | **Season hub** — the five majors, then each running competition |
| `matchplay.html` | **Team match play** — the full Yaseen v Shufqat board |
| `strokeplay2026.html` | **Strokeplay Singles Championship** — final standings and round by round |
| `2025season.html` | **2025 season** — the completed Stableford series |
| `handicaps.html` | **Handicap register** — the NHS playing handicap for all 32 players, with WHS and calculated alongside |
| `profiles.html` | **Player profiles** — a card for all 32 players on the register, in two sections |
| `data.js` | **All the data.** The only file you edit after a round. |
| `style.css` | Shared styling for every page. |

The season has five majors: Stableford Singles (won by Raz Shafi), Strokeplay Singles (Sid Amin),
Doubles Match Play (Haaris Ahmed & Shaan Ahmed), Singles Match Play and Team Games — the last two
still being played. The hub leads with that table, then details each competition most-recent-first.

Every page carries the same nav plus a link back to the society's Google Site at
https://sites.google.com/view/matesplayinggolf, so the pages work equally well embedded
there or opened on their own.

## Updating after a round

Everything lives in `data.js`. Edit it, commit, and GitHub Pages picks it up within a minute —
all six pages recalculate themselves from it.

### A new match play result

Add a line to `MATCHES`:

```js
{date:'2026-09-10', aPlayer:'Nav', aSubFor:null, aPts:15,
                    bPlayer:'Sid', bSubFor:null, bPts:14},
```

- `aPlayer` / `bPlayer` — must match a roster name exactly, or the pairing grid won't credit it
- `aSubFor` / `bSubFor` — `null` normally. Only put a name here when that player stood in for a
  team-mate, and then it's the team-mate's name. This mirrors the blank "Playing For" column in
  the workbook: a stand-in's result counts for the team, but the rostered player's own pairing
  stays open until they play it themselves.
- `aPts` / `bPts` — 9-hole Stableford points

Scores, player records, the race chart and the pairings grid all follow automatically.

### An NHS or WHS handicap

In `REGISTER`, replace the `null` with the figure:

```js
{n:'Yaseen Mohammed', nhs:13, whs:14.2, calc:14.5, rounds:13, est:false},
```

Anything still `null` shows as a dash, and the counts at the top of the handicap page
update themselves as figures come in.

## The three handicaps

**The society rule: a player's handicap is their NHS handicap unless a competition states
otherwise.** That is the figure quoted everywhere on the site — the register, the team match
play rosters and player tables, and anywhere else a handicap appears. The other two are held
for comparison and are never used as a playing figure.

- **NHS** — the playing handicap. Supplied figure, recorded as given. No underlying round data held.
- **WHS** — supplied figure, comparison only.
- **Calculated HC** — comparison only. Computed from the society's hole-by-hole scorecards: score
  differential (round total minus course rating), averaged over the best N differentials, with the
  WHS low-round adjustment. Provisional until 20 rounds are on record, then established. Under four
  rounds it is greyed out and marked `thin`.

Historic net scores are not affected: the season pages use the handicap each player actually
played off on the day, as recorded on the card.

### Changing a handicap

Update the player's `nhs` figure in `REGISTER`. If they are on a team match play roster, update
their entry in `ROSTER_A` / `ROSTER_B` to the same number (the short name is mapped to the
register name in a comment beside each line), and in the `Rosters` tab of
`Team_Matchplay_Leaderboard.xlsx` so the workbook agrees.

## Scoring

**Team match play** — win 1 point, win by 5 or more Stableford points 2 points,
halved match 0.5 each, loss 0.

**Strokeplay Singles Championship** — ranked on the average of a player's best 6 net rounds
(net = gross total minus the handicap played off that day), minimum 6 rounds to qualify.

**Stableford 2025** — ranked on league points: each round's winner takes 12, runner-up 11,
down to 1 for twelfth, nothing below that. A player's best 8 of the 14 rounds count and 8 rounds
are needed to qualify. Players level on points within a round are separated by countback —
back nine, then back six, then back three. Game 12 is a documented exception, left as the
result stood on the day.

## Player profiles

Every player on the register has a card. They come from two different places and the page keeps
them in separate sections, because the numbers are not comparable.

**`PROFILES`** — the nine Asia Cup squad members, transcribed from
`AsiaCuo2026/Asia_Cup_2026_Squad_Profiles.vF2.pptx`, which England Golf compiled. `n` must match a
register name exactly; `deck` carries the England Golf spelling where it differs. `SQUAD_OTHERS`
names the rest of the squad, who are not society players and get no card. These are a **snapshot**,
not a live feed, and CDH membership numbers from the source deck are deliberately not published.

**`SOCIETY_PROFILES`** — the other twenty-three, computed from our own hole-by-hole scorecards in
`Golf_Scores_Tracker_19.xlsx` (348 rounds). The method is the same WHS low-round replay the handicap register
uses: differential = round total − course rating (70 where a CR override is set, otherwise 69),
averaged over the best N with the low-round adjustment. It was checked against the tracker's own
figures for all thirty players who have rounds and matched every one. None of these players has an
England Golf index, so that tile renders blank — fill in the gap by moving the player into
`PROFILES`, or extend their entry, once a figure exists.

In both sections the card leads with **NHS** from `REGISTER`: the index is never the playing figure.
Records under four rounds are greyed and marked `Thin record`, the same threshold the register uses.

## Publishing

Repo **Settings → Pages → Build and deployment → Deploy from a branch**, branch `main`,
folder `/ (root)`. Save, wait a minute, and the URL above goes live.
