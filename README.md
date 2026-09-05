# Golf Society 2026

A four-page static site. No build step, no dependencies, nothing to install —
drop the folder in a repo, switch on GitHub Pages, and the society has one permanent link.

**View it:** https://YOUR-USERNAME.github.io/YOUR-REPO/

## What's here

| File | What it is |
|---|---|
| `index.html` | **Season hub** — team match play, then stroke play 2026, then League Points 2026 |
| `matchplay.html` | **Team match play** — the full Yaseen v Shufqat board |
| `2025season.html` | **2025 season** — the completed Stableford series |
| `handicaps.html` | **Handicap register** — NHS, WHS and calculated, for all 29 players |
| `data.js` | **All the data.** The only file you edit after a round. |
| `style.css` | Shared styling for every page. |

Competitions on the hub run most-recent-first: match play (from 24 Aug 2026), stroke play
(Jul–Aug 2026), League Points (Mar–Jun 2026).

## Updating after a round

Everything lives in `data.js`. Edit it, commit, and GitHub Pages picks it up within a minute —
all four pages recalculate themselves from it.

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

- **NHS** — supplied figure, recorded as given. No underlying round data held.
- **WHS** — supplied figure, same.
- **Calculated HC** — computed from the society's hole-by-hole scorecards: score differential
  (round total minus course rating), averaged over the best N differentials, with the WHS
  low-round adjustment. Provisional until 20 rounds are on record, then established.

## Scoring

**Team match play** — win 1 point, win by 5 or more Stableford points 2 points,
halved match 0.5 each, loss 0.

**Stroke play 2026** — ranked on the average of a player's best 6 net rounds
(net = gross total minus the handicap played off that day), minimum 6 rounds to qualify.

**Stableford 2025** — ranked on league points: each round's winner takes 12, runner-up 11,
down to 1 for twelfth, nothing below that. A player's best 8 of the 14 rounds count and 8 rounds
are needed to qualify. Players level on points within a round are separated by countback —
back nine, then back six, then back three. Game 12 is a documented exception, left as the
result stood on the day.

## Publishing

Repo **Settings → Pages → Build and deployment → Deploy from a branch**, branch `main`,
folder `/ (root)`. Save, wait a minute, and the URL above goes live.
