/* ============================================================
   Golf Society 2026 — all data for every page lives here.
   Edit this file after a round; the pages recalculate themselves.
   ============================================================ */

/* ---------- Society totals (from the Rounds tab of the tracker) ------ */
const SOCIETY = {
  players: 30,          // players with at least one logged round
  onBooks: 32,          // names on the handicap register
  rounds: 297,          // scorecards logged, hole by hole
  firstRound: 'April 2024',
  lastRound: '5 September 2026'
};

/* ---------- The season's five majors ----------
   [name, status, champion, note, page link or null]
   status: 'done' | 'live'                                            */
const MAJORS = [
  ['Stableford Singles Championship','done','Raz Shafi','13 rounds, Mar-Jun 2026',null],
  ['Strokeplay Singles Championship','done','Sid Amin','9 rounds, Jul-Aug 2026','strokeplay2026.html'],
  ['Doubles Match Play','done','Haaris Ahmed & Shaan Ahmed','Pairs knockout',null],
  ['Singles Match Play','live',null,'In progress',null],
  ['Team Games','live',null,'Yaseen v Shufqat, 20 matches played','matchplay.html']
];

/* ---------- Team match play (TeamGames2026) ----------
   Mirrors the Match Log tab of Team_Matchplay_Leaderboard.xlsx.
   aSubFor / bSubFor: null normally. Put a name there ONLY when that
   player stood in for a team-mate — then it's the team-mate's name.  */
const ROSTER_A = [
  ['Yaseen (C)',13.4],['Amriaz',10.4],['Bash',17.4],['Imran',13.8],['Mansoor',16.0],['Moody',16.8],['Nav',18.7],['Shaan',18.1],['Shahzad',20.4],['Waseem',15.4]
];
const ROSTER_B = [
  ['Shufqat (C)',12.6],['Gaff',8.2],['Haaris',12.4],['Jabar',15.5],['Tab',10.1],['Raz',10.4],['Raza',28.0],['Sam',17.2],['Sid',18.0],['Tariq',22.6]
];
const BIG_WIN = 5;   // margin that turns a win into 2 points

const MATCHES = [
  {date:'2026-08-24',aPlayer:'Yaseen (C)',aSubFor:null,aPts:13,bPlayer:'Shufqat (C)',bSubFor:null,bPts:18},
  {date:'2026-08-25',aPlayer:'Mansoor',aSubFor:'Moody',aPts:13,bPlayer:'Raz',bSubFor:null,bPts:10},
  {date:'2026-08-25',aPlayer:'Moody',aSubFor:null,aPts:14,bPlayer:'Sam',bSubFor:null,bPts:10},
  {date:'2026-08-25',aPlayer:'Imran',aSubFor:null,aPts:17,bPlayer:'Jabar',bSubFor:null,bPts:12},
  {date:'2026-08-25',aPlayer:'Waseem',aSubFor:null,aPts:10,bPlayer:'Raz',bSubFor:'Tariq',bPts:11},
  {date:'2026-08-25',aPlayer:'Mansoor',aSubFor:null,aPts:10,bPlayer:'Tab',bSubFor:null,bPts:16},
  {date:'2026-08-25',aPlayer:'Amriaz',aSubFor:null,aPts:16,bPlayer:'Gaff',bSubFor:null,bPts:16},
  {date:'2026-08-25',aPlayer:'Nav',aSubFor:null,aPts:16,bPlayer:'Raza',bSubFor:null,bPts:7},
  {date:'2026-08-25',aPlayer:'Bash',aSubFor:null,aPts:21,bPlayer:'Tab',bSubFor:'Haaris',bPts:15},
  {date:'2026-08-25',aPlayer:'Shahzad',aSubFor:null,aPts:15,bPlayer:'Sid',bSubFor:null,bPts:16},
  {date:'2026-08-31',aPlayer:'Yaseen (C)',aSubFor:null,aPts:17,bPlayer:'Tariq',bSubFor:null,bPts:17},
  {date:'2026-09-01',aPlayer:'Bash',aSubFor:null,aPts:12,bPlayer:'Jabar',bSubFor:null,bPts:19},
  {date:'2026-09-01',aPlayer:'Waseem',aSubFor:null,aPts:21,bPlayer:'Shufqat (C)',bSubFor:null,bPts:16},
  {date:'2026-09-02',aPlayer:'Mansoor',aSubFor:null,aPts:18,bPlayer:'Raz',bSubFor:null,bPts:19},
  {date:'2026-09-02',aPlayer:'Waseem',aSubFor:null,aPts:17,bPlayer:'Haaris',bSubFor:null,bPts:16},
  {date:'2026-09-02',aPlayer:'Amriaz',aSubFor:null,aPts:19,bPlayer:'Haaris',bSubFor:null,bPts:20},
  {date:'2026-09-02',aPlayer:'Imran',aSubFor:null,aPts:10,bPlayer:'Sid',bSubFor:null,bPts:15},
  {date:'2026-09-03',aPlayer:'Nav',aSubFor:null,aPts:13,bPlayer:'Jabar',bSubFor:null,bPts:16},
  {date:'2026-09-03',aPlayer:'Imran',aSubFor:null,aPts:13,bPlayer:'Tab',bSubFor:null,bPts:16},
  {date:'2026-09-05',aPlayer:'Moody',aSubFor:null,aPts:13,bPlayer:'Raza',bSubFor:null,bPts:15}
];

/* ---------- Stableford Singles Championship 2026 ----------
   The society's Stableford singles major, won by Raz Shafi.
   13 rounds, Mar-Jun 2026. Points = MAX(0, 13 - finishing position).
   (The variable stays LEAGUE - it is the league-points table for that major.)
   [player, total points, rounds played]                              */
const LEAGUE = [
  ['Raz Shafi',109,11],['Mahmood Sadiq',92,13],['Shufqat Khan',83,12],['Waseem Goldenboy',75,10],
  ['Tab Rafique',70,10],['Guftar Hussain',62,9],['Yaseen Mohammed',49,8],['Jabar Mughal',42,6],
  ['Tariq Javaid',39,7],['Afrid Iqbal',39,9],['Sid Amin',38,7],['Shaan Ahmed',36,5],
  ['Imran K',35,8],['Sameer Ahmed',35,4],['Naeem Akhtar',34,5],['Mansoor M',30,7],
  ['Shazad Hussain',29,7],['Aftab Iqbal',26,3],['Basharat2 Ali',21,5],['Sabar Riaz',16,3],
  ['Haaris Ahmed',12,1],['Raza Efendi',4,2],['Nadeem Ahmed',3,2]
];

/* ---------- Strokeplay Singles Championship 2026 (final) ----------
   9 rounds, Jul-Aug 2026. Best 6 net rounds, minimum 6 to qualify.
   [rank, player, rounds, best-6 total, best-6 average]               */
const STROKEPLAY = [
  [1,'Sid Amin',7,446,74.33],[2,'Jabar Mughal',7,447,74.50],[3,'Raz Shafi',7,454,75.67],
  [4,'Mahmood Sadiq',9,460,76.67],[4,'Imran K',7,460,76.67],[6,'Shazad Hussain',7,461,76.83]
];
const SP_UNRANKED = [['Waseem Goldenboy',5],['Tariq Javaid',5],['Shufqat Khan',5],['Tab Rafique',5],
  ['Sameer Ahmed',5],['Basharat2 Ali',4],['Shaan Ahmed',4],['Guftar Hussain',4],['Afrid Iqbal',4],
  ['Mansoor M',3],['Sabar Riaz',3],['Yaseen Mohammed',2],['Naeem Akhtar',2],['Nadeem Ahmed',2],
  ['Aftab Iqbal',1],['Haaris Ahmed',1]];

/* ---------- Strokeplay Singles: round by round ----------
   [round label, date, field size, winner, winning net, winning gross]  */
const SP_ROUNDS = [
  ['R1','4 Jul 2026',14,'Raz Shafi',72,82],
  ['R2','11 Jul 2026',8,'Sid Amin',70,90],
  ['R3','18 Jul 2026',6,'Tab Rafique',73,83],
  ['R4','26 Jul 2026',15,'Sid Amin',70,90],
  ['R5','1 Aug 2026',7,'Jabar Mughal',70,85],
  ['R6','9 Aug 2026',11,'Shufqat Khan',64,79],
  ['R7','15 Aug 2026',10,'Imran K',70,84],
  ['R8','23 Aug 2026',13,'Mansoor M',67,85],
  ['R9','30 Aug 2026',15,'Basharat2 Ali',67,84]
];

/* ---------- Strokeplay Singles: lowest nets of the season ----------
   [player, net, gross, round]                                        */
const SP_BEST = [
  ['Shufqat Khan',64,79,'R6'],
  ['Basharat2 Ali',67,84,'R9'],
  ['Mansoor M',67,85,'R8'],
  ['Aftab Iqbal',70,77,'R5'],
  ['Guftar Hussain',70,78,'R8']
];

/* ---------- Stableford Series 2025 (final) ----------
   14 rounds, Apr-Jul 2025 (complete). Minimum 8 rounds to qualify.
   Ranked on LEAGUE POINTS: each round the winner takes 12, runner-up 11,
   down to 1 for 12th; 13th and below score 0. A player's best 8 count.
   Players level on Stableford points are separated by countback: highest
   back nine, then back six, then back three, then the 18th. That settled
   every tie in the season, so each place is awarded outright.
   ONE EXCEPTION - Game 12: Shazad Hussain and Mahmood Sadiq both scored 39
   and were level on back nine and back six; countback on the back three
   favours Mahmood, but the result stood on the day as Shazad's win and has
   been left that way. The standings below reflect the result as played.
   Two comparison columns come along for the ride - the same best-8 idea
   applied to raw Stableford points, and to net strokes.
   [league rank, player, rounds, league pts, stableford pts, avg net]  */
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
   THREE handicaps are tracked per player:
     nhs   - NHS handicap. Supplied figure, from the "NHS App HCP (reference)"
             column of the Player HC tab.
     whs   - WHS handicap. Supplied figure, from the "WHS" column of the same tab.
     calc  - Calculated HC. Worked out from the hole-by-hole scorecards
             in Golf_Scores_Tracker_19.xlsx (Player HC tab).
   rounds  - scorecards on record; est = true once past 20 rounds.

   Source: Golf-2026/2026/Data2026/Golf_Scores_Tracker_19.xlsx, Player HC tab.
   Anything set to null simply shows as a dash on the page.           */
const REGISTER = [
  {n:'Yaseen Mohammed',     nhs:13.4,  whs:16,    calc:15.5,  rounds:14, est:false},
  {n:'Hamza T',             nhs:3,     whs:3,     calc:-3,    rounds: 3, est:false},
  {n:'Waseem Goldenboy',    nhs:15.6,  whs:18,    calc:19.6,  rounds:19, est:false},
  {n:'Sameer Ahmed',        nhs:16.9,  whs:17,    calc:20.2,  rounds:15, est:false},
  {n:'Naveen Ahmed',        nhs:18.7,  whs:19,    calc:22,    rounds: 2, est:false},
  {n:'Umer Akbar',          nhs:11.2,  whs:12,    calc:10,    rounds: 2, est:false},
  {n:'Sid Amin',            nhs:17.2,  whs:20,    calc:22.9,  rounds:19, est:false},
  {n:'Nadeem Ahmed',        nhs:13.7,  whs:14,    calc:14.5,  rounds: 8, est:false},
  {n:'Tab Rafique',         nhs:10.1,  whs:10,    calc:15.5,  rounds:21, est:true},
  {n:'Mahmood Sadiq',       nhs:17.0,  whs:17,    calc:22.5,  rounds:23, est:true},
  {n:'Basharat2 Ali',       nhs:15.9,  whs:18,    calc:18.3,  rounds:13, est:false},
  {n:'Shazad Hussain',      nhs:19.9,  whs:22,    calc:23.1,  rounds:22, est:true},
  {n:'Aftab Iqbal',         nhs:6.8,   whs:7,     calc:6,     rounds: 2, est:false},
  {n:'Mansoor M',           nhs:16.1,  whs:16,    calc:19,    rounds:17, est:false},
  {n:'Tariq Javaid',        nhs:22.7,  whs:25,    calc:29,    rounds:12, est:false},
  {n:'Mustapha T',          nhs:28,    whs:24,    calc:44,    rounds: 1, est:false},
  {n:'Matt T',              nhs:18.6,  whs:19,    calc:36,    rounds: 1, est:false},
  {n:'Hanif Malik',         nhs:17.6,  whs:19,    calc:56,    rounds: 1, est:false},
  {n:'Shufqat Khan',        nhs:12.7,  whs:17,    calc:15.5,  rounds:13, est:false},
  {n:'Imran K',             nhs:14.0,  whs:16,    calc:18.5,  rounds:18, est:false},
  {n:'Shaan Ahmed',         nhs:18.1,  whs:18,    calc:24.5,  rounds:14, est:false},
  {n:'Gazanfar Afzal',      nhs:12,    whs:12,    calc:18,    rounds: 1, est:false},
  {n:'Guftar Hussain',      nhs:7.9,   whs:10,    calc:10.6,  rounds:16, est:false},
  {n:'Raz Shafi',           nhs:10.6,  whs:12,    calc:15,    rounds:11, est:false},
  {n:'Afrid Iqbal',         nhs:10.6,  whs:10,    calc:14,    rounds: 8, est:false},
  {n:'Haaris Ahmed',        nhs:12.4,  whs:18,    calc:14,    rounds: 4, est:false},
  {n:'Jabar Mughal',        nhs:15.7,  whs:16,    calc:17,    rounds:10, est:false},
  {n:'Sabar Riaz',          nhs:24.3,  whs:24,    calc:28,    rounds: 3, est:false},
  {n:'Naeem Akhtar',        nhs:14.3,  whs:14,    calc:23,    rounds: 3, est:false},
  {n:'Noor',                nhs:8.5,   whs:null,  calc:null,  rounds: 0, est:false},
  {n:'Raza Efendi',         nhs:28.1,  whs:null,  calc:null,  rounds: 0, est:false},
  {n:'Ayaz Alam',           nhs:14,    whs:null,  calc:22,    rounds: 1, est:false}
];

/* ---------- Lowest net rounds on record ----------
   [player, net, gross, event, date]                                  */
const BEST = [
  ['Shufqat Khan',64,79,'Stroke Play R6','9 Aug 2026'],
  ['Shaan Ahmed',64,92,'Stableford R2','20 Apr 2025'],
  ['Shaan Ahmed',66,92,'Stableford R9','8 Jun 2025'],
  ['Shazad Hussain',66,88,'Stableford R10','15 Jun 2025'],
  ['Mansoor M',67,85,'Stroke Play R8','23 Aug 2026']
];
