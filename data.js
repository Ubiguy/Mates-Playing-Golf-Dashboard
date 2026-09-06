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
   player stood in for a team-mate — then it's the team-mate's name.

   HANDICAPS. The society rule is that a player's handicap is their NHS
   handicap unless stated otherwise, so the figures below are the current
   NHS handicaps from REGISTER (short name -> register name in brackets).
   Update them here and on REGISTER together.                          */
const ROSTER_A = [
  ['Yaseen (C)',13.4],   // Yaseen Mohammed
  ['Amriaz',10.6],       // Afrid Iqbal
  ['Bash',15.9],         // Basharat2 Ali
  ['Imran',14.0],        // Imran K
  ['Mansoor',16.1],      // Mansoor M
  ['Moody',17.0],        // Mahmood Sadiq
  ['Nav',18.7],          // Naveen Ahmed
  ['Shaan',18.1],        // Shaan Ahmed
  ['Shahzad',19.9],      // Shazad Hussain
  ['Waseem',15.6]        // Waseem Goldenboy
];
const ROSTER_B = [
  ['Shufqat (C)',12.7],  // Shufqat Khan
  ['Gaff',7.9],          // Guftar Hussain
  ['Haaris',12.4],       // Haaris Ahmed
  ['Jabar',15.7],        // Jabar Mughal
  ['Tab',10.1],          // Tab Rafique
  ['Raz',10.6],          // Raz Shafi
  ['Raza',28.1],         // Raza Efendi
  ['Sam',16.9],          // Sameer Ahmed
  ['Sid',17.2],          // Sid Amin
  ['Tariq',22.7]         // Tariq Javaid
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

/* ---------- Asia Cup 2026 player profiles ----------
   Source: Asia_Cup_2026_Squad_Profiles.vF2.pptx, compiled from England Golf
   round-history data for the 18-player Asia Cup squad (2 Aug 2026, The
   Warwickshire). Only the NINE squad members who are also on our register
   appear here; the other nine are not society players.

   `idx` is the ENGLAND GOLF handicap index from that deck — a different
   figure from the society's NHS handicap, which stays the playing number
   per the society rule. Both are shown side by side on the page.

   deck  - the name England Golf holds, where it differs from ours
   kind  - whether `mark` is that player's highest ('peak') or lowest ('low')
           recorded index
   net   - change in index over the whole history; negative is improvement

   CDH membership numbers from the deck are deliberately NOT published.   */
const PROFILES = [
  {n:'Guftar Hussain', deck:null, init:'GH', role:null,
   idx:10.1, since:'May 2025', scores:30, avgDiff:12.4,
   best:{v:5.3, d:'31 Oct 2025'}, mark:{v:8.3, d:'Apr 2026', kind:'low'}, net:0.3,
   home:'Leeds Golf Centre',
   courses:[['Leeds GC — White','18 rounds'],['Leeds GC — Yellow/Indigo/Red','7 rounds'],
            ['Tankersley Park / Hollins Hall','1 round each'],
            ['Dewsbury / Whitefield / Doncaster','1 round each']],
   note:'One of the lowest handicaps in the squad — second only to Tab. Several rounds carry a WHS exceptional-score reduction (−1.0) marker.'},

  {n:'Tab Rafique', deck:'Tabbussam Rafique', init:'TR', role:null,
   idx:9.9, since:'May 2026', scores:6, avgDiff:14.7,
   best:{v:9.9, d:'17 Jun 2026'}, mark:{v:11.7, d:'9 May 2026', kind:'peak'}, net:-1.8,
   home:'Leeds Golf Centre',
   courses:[['Leeds GC — Yellow','5 rounds'],['Leeds GC — White','1 round']],
   note:'Lowest index in the squad, but a very short history — six rounds, all at Leeds. Improved fast (11.7 to 8.9) then bounced back to 9.9; still a small sample.'},

  {n:'Afrid Iqbal', deck:null, init:'AI', role:null,
   idx:13.0, since:'Jul 2023', scores:20, avgDiff:16.9,
   best:{v:9.8, d:'17 Aug 2024'}, mark:{v:13.1, d:'18 Apr 2026', kind:'peak'}, net:0.5,
   home:'Leeds Golf Centre',
   courses:[['Leeds GC — White','10 rounds'],['Leeds GC — Indigo','4 rounds'],
            ['Leeds GC — Yellow','3 rounds'],['Leeds GC — Red','2 rounds'],
            ['Leeds GC — Red F9','1 round']],
   note:'Remarkably stable — 12.2 to 13.1 across nearly three years, every round at Leeds, with two long reporting gaps. The 29 Jul 2023 round was missing its adjusted gross and was back-calculated to about 89 from the differential.'},

  {n:'Shufqat Khan', deck:null, init:'SK', role:'Vice-captain',
   idx:16.4, since:'Sep 2025', scores:31, avgDiff:20.1,
   best:{v:11.6, d:'25 Apr 2026'}, mark:{v:20.4, d:'13 Sep 2025', kind:'peak'}, net:-4.0,
   home:'Leeds Golf Centre',
   courses:[['Leeds GC — mixed tees','25 rounds'],['Woburn — Marquess','1 round'],
            ['Forest Pines','1 round'],['Bradford GC / Calderfields','1 round each'],
            ['Away front-nine rounds','2 rounds']],
   note:'Steady, consistent improvement across the whole season with no major setbacks — the squad profile called him its steadiest player.'},

  {n:'Yaseen Mohammed', deck:'Yaseen Mohammad', init:'YM', role:null,
   idx:15.7, since:'Jun 2023', scores:21, avgDiff:19.9,
   best:{v:10.8, d:'8 Sep 2024'}, mark:{v:13.4, d:'17 Aug 2023', kind:'low'}, net:1.5,
   home:'Leeds Golf Centre',
   courses:[['Leeds GC — Yellow','14 rounds'],['Leeds GC — White','2 rounds'],
            ['Rudding Park / Forest Pines','1 round each'],
            ['Bradford / Wetherby / Formby Hall','1 round each']],
   note:'Also filed as “Yaseen Mohammed” and “Mohammad Yassen” in England Golf data — same player, name order varies. The index has drifted up from a 13.4 low in 2023.'},

  {n:'Imran K', deck:'Imran Abbas', init:'IA', role:null,
   idx:16.0, since:'Aug 2025', scores:21, avgDiff:19.6,
   best:{v:12.6, d:'8 Nov 2025'}, mark:{v:16.0, d:'4 Jul 2026', kind:'peak'}, net:1.5,
   home:'Leeds Golf Centre',
   courses:[['Leeds GC — Yellow','12 rounds'],['Leeds GC — White','6 rounds'],
            ['Leeds GC — Indigo','2 rounds'],['Leeds GC — Red','1 round']],
   note:'Every round at Leeds. Has climbed out of a tight 14.5 to 15.5 band to a new high of 16.0 as of 4 Jul 2026 — worth watching.'},

  {n:'Basharat2 Ali', deck:'Basharat Ali', init:'BA', role:null,
   idx:18.3, since:'May 2024', scores:21, avgDiff:23.4,
   best:{v:14.5, d:'28 May 2025'}, mark:{v:23.5, d:'Jun–Jul 2024', kind:'peak'}, net:-5.1,
   home:'Leeds Golf Centre',
   courses:[['Leeds GC — Yellow','14 rounds'],['Leeds GC — Red','2 rounds'],
            ['Leeds GC — White / Yellow F9','1 round each'],
            ['Bradford / Wychwood / The Mere','1 round each']],
   note:'Strong long-term improvement, 23.4 down to 18.3, with a temporary rise back to about 20.6 in early 2025.'},

  {n:'Waseem Goldenboy', deck:'Waseem Javeed', init:'WJ', role:'Captain',
   idx:18.4, since:'Jul 2025', scores:40, avgDiff:21.8,
   best:{v:11.8, d:'28 Jul 2025'}, mark:{v:26.9, d:'3 Jul 2025', kind:'peak'}, net:-8.5,
   home:'Leeds Golf Centre',
   courses:[['Leeds GC — Yellow','17 rounds'],['Leeds GC — White','7 rounds'],
            ['Leeds GC — Red','4 rounds'],['Hollins Hall','2 rounds'],
            ['Tankersley Park','2 rounds'],['6 other away courses','1 round each']],
   note:'Biggest improvement in the squad — 8.5 strokes gone inside the first month, then settled into the 15 to 19 range. Most rounds logged of anyone here, at 40.'},

  {n:'Tariq Javaid', deck:'Tariq Javid', init:'TJ', role:'Vice-captain',
   idx:25.0, since:'May 2018', scores:29, avgDiff:30.3,
   best:{v:20.8, d:'19 Aug 2024'}, mark:{v:31.0, d:'8 Aug 2023', kind:'peak'}, net:-1.2,
   home:'Leeds Golf Centre',
   courses:[['Leeds GC — Yellow','21 rounds'],['Leeds GC — White','2 rounds'],
            ['Bradford / Forest Pines / The Mere','1 round each'],
            ['Scarcroft / Formby Hall','1 round each']],
   note:'The longest history here by far — eight years, with a five-year gap between 2018 and 2023. One extreme outlier, a 60.0 differential back in 2018. Has ticked up recently, 24.3 to 25.0.'}
];

/* The other nine of the eighteen-strong Asia Cup squad. Not society players,
   so they have no profile card here.                                    */
const SQUAD_OTHERS = ['Kamran Jawaid','Sajid Mahmood','Ikhlaq Sulaman','Adam Butt',
  'Owais Mohammad','Shabir Hussain','Zain Ul-Abidin','Abdullah Noor','Tahir Shah'];

/* Where the profiles were compiled and when.                            */
const ASIA_CUP = {
  event:'Asia Cup 2026', date:'2 August 2026',
  venue:'The Warwickshire, Leek Wootton', squad:18,
  format:'Four-team round robin — Manchester, Yorkshire, East London, West London'
};

/* ---------- Society player profiles ----------
   The other 23 on the register: everyone who is NOT in the Asia Cup squad.
   Unlike PROFILES above, these are computed here from the society's own
   hole-by-hole scorecards in Golf_Scores_Tracker_19.xlsx, not from England
   Golf. None of them has an England Golf / WHS index on file yet, so that
   figure is deliberately left blank on their card until one is supplied.

   idx   - the society calculated index: score differential (round total minus
           course rating, 70 at Forest Pines, otherwise 69) averaged over the
           best N differentials with the WHS low-round adjustment. Verified to
           match the tracker exactly for all 30 players who have rounds.
   avg   - mean score differential across every round logged
   mark  - the peak index for players who have improved, the lowest for those
           who have not; `kind` says which
   net   - change in index from their first round to now; negative is better
   ev    - how their rounds break down by competition
   rounds:0 means nothing logged yet, so only their NHS handicap shows.   */
const SOCIETY_PROFILES = [
  {n:'Hamza T', init:'HT', rounds:3, first:'Jul 2025', last:'Mar 2026',
   idx:-3.0, avg:3.7, best:{v:-1, d:'13 Jul 2025'}, mark:{v:5.0, d:'Jul 2025', kind:'peak'}, net:-8.0,
   ev:[['Stableford rounds',2],['Forest Pines away day',1]]},
  {n:'Aftab Iqbal', init:'AI', rounds:2, first:'Mar 2026', last:'Aug 2026',
   idx:6.0, avg:14.5, best:{v:8, d:'1 Aug 2026'}, mark:{v:19.0, d:'Mar 2026', kind:'peak'}, net:-13.0,
   ev:[['Forest Pines away day',1],['Strokeplay rounds',1]]},
  {n:'Noor', init:'NO', rounds:0},
  {n:'Raz Shafi', init:'RS', rounds:11, first:'Apr 2025', last:'Aug 2026',
   idx:15.0, avg:19.2, best:{v:13, d:'4 Jul 2026'}, mark:{v:24.0, d:'Apr 2025', kind:'peak'}, net:-9.0,
   ev:[['Strokeplay rounds',7],['Stableford rounds',4]]},
  {n:'Umer Akbar', init:'UA', rounds:2, first:'Jul 2025', last:'Mar 2026',
   idx:10.0, avg:14.5, best:{v:12, d:'13 Jul 2025'}, mark:{v:10.0, d:'Jul 2025', kind:'low'}, net:0.0,
   ev:[['Stableford rounds',1],['Forest Pines away day',1]]},
  {n:'Gazanfar Afzal', init:'GA', rounds:1, first:'Apr 2024', last:'Apr 2024',
   idx:18.0, avg:20.0, best:{v:20, d:'27 Apr 2024'}, mark:{v:18.0, d:'Apr 2024', kind:'low'}, net:0.0,
   ev:[['Stableford rounds',1]]},
  {n:'Haaris Ahmed', init:'HA', rounds:4, first:'May 2025', last:'Aug 2026',
   idx:14.0, avg:21.8, best:{v:15, d:'15 Aug 2026'}, mark:{v:28.0, d:'May 2025', kind:'peak'}, net:-14.0,
   ev:[['Stableford rounds',3],['Strokeplay rounds',1]]},
  {n:'Nadeem Ahmed', init:'NA', rounds:8, first:'Apr 2025', last:'Aug 2026',
   idx:14.5, avg:20.9, best:{v:13, d:'20 Apr 2025'}, mark:{v:11.0, d:'Apr 2025', kind:'low'}, net:3.5,
   ev:[['Stableford rounds',5],['Strokeplay rounds',2],['Forest Pines away day',1]]},
  {n:'Ayaz Alam', init:'AA', rounds:1, first:'Apr 2025', last:'Apr 2025',
   idx:22.0, avg:24.0, best:{v:24, d:'20 Apr 2025'}, mark:{v:22.0, d:'Apr 2025', kind:'low'}, net:0.0,
   ev:[['Stableford rounds',1]]},
  {n:'Naeem Akhtar', init:'NA', rounds:3, first:'Apr 2025', last:'Jul 2026',
   idx:23.0, avg:28.3, best:{v:25, d:'11 Jul 2026'}, mark:{v:30.0, d:'Apr 2025', kind:'peak'}, net:-7.0,
   ev:[['Strokeplay rounds',2],['Stableford rounds',1]]},
  {n:'Jabar Mughal', init:'JM', rounds:10, first:'Apr 2025', last:'Aug 2026',
   idx:17.0, avg:21.8, best:{v:16, d:'1 Aug 2026'}, mark:{v:23.0, d:'Apr 2025', kind:'peak'}, net:-6.0,
   ev:[['Strokeplay rounds',7],['Stableford rounds',3]]},
  {n:'Mansoor M', init:'MM', rounds:17, first:'Apr 2024', last:'Aug 2026',
   idx:19.0, avg:26.5, best:{v:16, d:'23 Aug 2026'}, mark:{v:38.0, d:'Apr 2024', kind:'peak'}, net:-19.0,
   ev:[['Stableford rounds',13],['Strokeplay rounds',3],['Forest Pines away day',1]]},
  {n:'Sameer Ahmed', init:'SA', rounds:15, first:'May 2025', last:'Aug 2026',
   idx:20.2, avg:25.9, best:{v:19, d:'23 Aug 2026'}, mark:{v:18.0, d:'May 2025', kind:'low'}, net:2.2,
   ev:[['Stableford rounds',9],['Strokeplay rounds',5],['Forest Pines away day',1]]},
  {n:'Mahmood Sadiq', init:'MS', rounds:23, first:'Apr 2024', last:'Aug 2026',
   idx:22.5, avg:27.6, best:{v:18, d:'29 Jun 2025'}, mark:{v:24.0, d:'Apr 2024', kind:'peak'}, net:-1.5,
   ev:[['Stableford rounds',13],['Strokeplay rounds',9],['Forest Pines away day',1]]},
  {n:'Sid Amin', init:'SA', rounds:19, first:'Apr 2025', last:'Aug 2026',
   idx:22.9, avg:27.2, best:{v:20, d:'20 Apr 2025'}, mark:{v:24.0, d:'Apr 2025', kind:'peak'}, net:-1.1,
   ev:[['Stableford rounds',11],['Strokeplay rounds',7],['Forest Pines away day',1]]},
  {n:'Hanif Malik', init:'HM', rounds:1, first:'Mar 2026', last:'Mar 2026',
   idx:56.0, avg:58.0, best:{v:58, d:'23 Mar 2026'}, mark:{v:56.0, d:'Mar 2026', kind:'low'}, net:0.0,
   ev:[['Forest Pines away day',1]]},
  {n:'Shaan Ahmed', init:'SA', rounds:14, first:'Apr 2024', last:'Aug 2026',
   idx:24.5, avg:30.8, best:{v:23, d:'20 Apr 2025'}, mark:{v:33.0, d:'Apr 2024', kind:'peak'}, net:-8.5,
   ev:[['Stableford rounds',10],['Strokeplay rounds',4]]},
  {n:'Matt T', init:'MT', rounds:1, first:'Mar 2026', last:'Mar 2026',
   idx:36.0, avg:38.0, best:{v:38, d:'23 Mar 2026'}, mark:{v:36.0, d:'Mar 2026', kind:'low'}, net:0.0,
   ev:[['Forest Pines away day',1]]},
  {n:'Naveen Ahmed', init:'NA', rounds:2, first:'Apr 2025', last:'Mar 2026',
   idx:22.0, avg:30.0, best:{v:24, d:'23 Mar 2026'}, mark:{v:34.0, d:'Apr 2025', kind:'peak'}, net:-12.0,
   ev:[['Stableford rounds',1],['Forest Pines away day',1]]},
  {n:'Shazad Hussain', init:'SH', rounds:22, first:'Apr 2024', last:'Aug 2026',
   idx:23.1, avg:29.0, best:{v:19, d:'15 Jun 2025'}, mark:{v:20.0, d:'Jul 2025', kind:'low'}, net:1.1,
   ev:[['Stableford rounds',14],['Strokeplay rounds',7],['Forest Pines away day',1]]},
  {n:'Sabar Riaz', init:'SR', rounds:3, first:'Jul 2026', last:'Aug 2026',
   idx:28.0, avg:38.7, best:{v:30, d:'11 Jul 2026'}, mark:{v:52.0, d:'Jul 2026', kind:'peak'}, net:-24.0,
   ev:[['Strokeplay rounds',3]]},
  {n:'Mustapha T', init:'MT', rounds:1, first:'Mar 2026', last:'Mar 2026',
   idx:44.0, avg:46.0, best:{v:46, d:'23 Mar 2026'}, mark:{v:44.0, d:'Mar 2026', kind:'low'}, net:0.0,
   ev:[['Forest Pines away day',1]]},
  {n:'Raza Efendi', init:'RE', rounds:0}
];
