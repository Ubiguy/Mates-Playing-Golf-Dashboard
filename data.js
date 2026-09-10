// feed rows: 38
/* ============================================================
   Golf Society 2026 — all data for every page lives here.
   Edit this file after a round; the pages recalculate themselves.
   ============================================================ */

/* ---------- Society totals (from the Rounds tab of the tracker) ------ */
const SOCIETY = {
  players: 29,          // players with at least one logged round
  onBooks: 30,          // names on the handicap register
  rounds: 358,        // scorecards logged, hole by hole
  firstRound: 'April 2024',
  lastRound: '6 September 2026'
};

/* ---------- 2026 season tournaments ----------
   [name, status, champion or result, note, page link or null]
   status: 'done' | 'live'

   The first five are the society's own majors. The last two are the
   Yorkshire representative fixtures our players were picked for - the
   result goes in the champion column, and the squads and awards are on
   the player profiles page.                                          */
const MAJORS = [
  ['Stableford Singles Championship','done','Raz Shafi','13 rounds, Mar-Jun 2026',null],
  ['Strokeplay Singles Championship','done','Sid Amin','9 rounds, Jul-Aug 2026','strokeplay2026.html'],
  ['Doubles Match Play','done','Haaris Ahmed & Shaan Ahmed','Pairs knockout',null],
  ['Singles Match Play','live',null,'In progress',null],
  ['Team Games','live',null,'Yaseen v Shufqat, 20 matches played','matchplay.html'],
  ['Asia Cup 2026','done','Joint 2nd in the section',
   'Yorkshire representative fixture · 2 Aug 2026, The Warwickshire Golf Club','profiles.html'],
  ['War of the Roses 2026','done','Yorkshire won 4-2',
   'Yorkshire representative fixture · Thursday 3 Sep 2026, Worsley','profiles.html'],
  ['Golfathon 2026','done','5 players took part',
   'Charity, The Park Lane Foundation · 72 holes in a day · 18 Jun 2026, Wike Ridge',null]
];

/* ---------- Golfathon ----------
   An annual charity event, not a society competition: four rounds in one day,
   72 holes, teeing off at 5am and aiming to finish by 6pm, played for
   The Park Lane Foundation.

   rounds: [round, player, handicap played off, gross, Stableford points,
            position in that round's field]
   Every card here was checked hole by hole - Out, In, gross and all 18
   Stableford points reproduce from the handicap and stroke index. Cards were
   only captured for three of the five who took part, so the table is
   deliberately incomplete rather than filled in with guesses.           */
const GOLFATHON = {
  event:'Golfathon 2026', date:'18 June 2026',
  venue:'Leeds Golf Centre — Wike Ridge', par:72,
  charity:'The Park Lane Foundation',
  format:'72 holes in a day, four rounds from a 5am start, aiming to finish by 6pm',
  players:['Waseem Goldenboy','Naeem Akhtar','Naveen Ahmed','Sameer Ahmed','Shaan Ahmed'],
  rounds:[
    [1,'Waseem Goldenboy',16, 93,33,1],
    [1,'Naeem Akhtar',    14,100,23,3],
    [2,'Waseem Goldenboy',16, 88,36,1],
    [2,'Naeem Akhtar',    14, 96,26,2],
    [3,'Waseem Goldenboy',16, 90,34,1],
    [3,'Naveen Ahmed',    19,100,29,2],
    [4,'Waseem Goldenboy',16, 88,36,1],
    [4,'Naveen Ahmed',    19,106,22,3]
  ],
  note:'An annual charity day rather than a society competition. Cards were kept for ' +
       'some of the round-by-round scoring and are held in the society tracker; none of ' +
       'these rounds counts towards a handicap.'
};

/* ---------- Where each player has played ----------
   play  : society rounds by venue, from the tracker's Rounds sheet.
   extra : other courses in that player's own My England Golf record -
           their general play, not society golf. Search only.
   Built by venues_write.py; do not hand-edit.              */
const VENUES = {
  'Afrid Iqbal':{play:[['Leeds Golf Centre — Wike Ridge',9]], extra:[]},
  'Aftab Iqbal':{play:[['Forest Pines',1],['Leeds Golf Centre — Wike Ridge',1]], extra:['Waterton Park','York']},
  'Ayaz Alam':{play:[['Leeds Golf Centre — Wike Ridge',1]], extra:[]},
  'Basharat2 Ali':{play:[['Leeds Golf Centre — Wike Ridge',12],['Forest Pines',1]], extra:['Bradford','The Mere Golf Resort & Spa','Wychwood Park']},
  'Guftar Hussain':{play:[['Leeds Golf Centre — Wike Ridge',19],['Hollins Hall',1]], extra:['Dewsbury District','Doncaster Town Moor','Stoke Rochford','Tankersley Park','Whitefield']},
  'Haaris Ahmed':{play:[['Leeds Golf Centre — Wike Ridge',4]], extra:['Farleigh-Green (Yellow & Blue)','Finchley','Foxhills Country Club & Resort- Longcross','Moor Allerton-Blackmoor','Moor Allerton-High','Moor Allerton-Lakes','Pike Hills','Rudding Park Hotel Spa & Golf Course','ScotlandDunbar','Stoneham','Tadcaster','The Alwoodley']},
  'Hamza T':{play:[['Leeds Golf Centre — Wike Ridge',2],['Forest Pines',1]], extra:[]},
  'Hanif Malik':{play:[['Forest Pines',1]], extra:[]},
  'Imran K':{play:[['Leeds Golf Centre — Wike Ridge',20],['Hollins Hall',1]], extra:[]},
  'Jabar Mughal':{play:[['Leeds Golf Centre — Wike Ridge',13]], extra:[]},
  'Mahmood Sadiq':{play:[['Leeds Golf Centre — Wike Ridge',27],['Forest Pines',1],['Hollins Hall',1]], extra:[]},
  'Mansoor M':{play:[['Leeds Golf Centre — Wike Ridge',18],['Forest Pines',1],['Hollins Hall',1]], extra:[]},
  'Matt T':{play:[['Forest Pines',1]], extra:[]},
  'Nadeem Ahmed':{play:[['Leeds Golf Centre — Wike Ridge',7],['Forest Pines',1]], extra:[]},
  'Naeem Akhtar':{play:[['Leeds Golf Centre — Wike Ridge',3]], extra:[]},
  'Naveen Ahmed':{play:[['Forest Pines',1],['Hollins Hall',1],['Leeds Golf Centre — Wike Ridge',1]], extra:[]},
  'Raz Shafi':{play:[['Leeds Golf Centre — Wike Ridge',16],['Hollins Hall',1]], extra:['Moor Allerton-Blackmoor','Moor Allerton-High','Moor Allerton-Lakes','Walsall']},
  'Sabar Riaz':{play:[['Leeds Golf Centre — Wike Ridge',3]], extra:[]},
  'Sameer Ahmed':{play:[['Leeds Golf Centre — Wike Ridge',15],['Forest Pines',1]], extra:[]},
  'Shaan Ahmed':{play:[['Leeds Golf Centre — Wike Ridge',15]], extra:[]},
  'Shazad Hussain':{play:[['Leeds Golf Centre — Wike Ridge',26],['Forest Pines',1],['Hollins Hall',1]], extra:[]},
  'Shufqat Khan':{play:[['Leeds Golf Centre — Wike Ridge',18],['Hollins Hall',1]], extra:['Birley Wood','Bradford','Burnley','Calderfields Golf & Country Club','Coventry Hearsall','Denton','Dewsbury District','Forest Of Arden Marriott Golf & Country Club-Arden','Forest Pines-Forest Pines','Lees Hall','Moor Allerton-Blackmoor','Pike Fold','Pleasington','Walsall','Woburn-Marquess Course']},
  'Sid Amin':{play:[['Leeds Golf Centre — Wike Ridge',21],['Forest Pines',1],['Hollins Hall',1]], extra:['Bradford','Bradley Park','Dewsbury District','Scarcroft','Worsley']},
  'Tab Rafique':{play:[['Leeds Golf Centre — Wike Ridge',25],['Forest Pines',1]], extra:[]},
  'Tariq Javaid':{play:[['Leeds Golf Centre — Wike Ridge',13],['Forest Pines',1]], extra:['Bradford','Formby Hall Golf Resort & Spa','Scarcroft','The Mere Golf Resort & Spa','The Warwickshire Golf & Country Club-The Kings Course']},
  'Umer Akbar':{play:[['Forest Pines',1],['Leeds Golf Centre — Wike Ridge',1]], extra:[]},
  'Waseem Goldenboy':{play:[['Leeds Golf Centre — Wike Ridge',23],['Forest Pines',1],['Hollins Hall',1]], extra:['Bradford','Cookridge Hall','Tankersley Park']},
  'Yaseen Mohammed':{play:[['Leeds Golf Centre — Wike Ridge',16],['Forest Pines',1],['Hollins Hall',1]], extra:['Bradford','Dewsbury District','Formby Hall Golf Resort & Spa','Horsforth','Rudding Park Hotel Spa & Golf Course','The Warwickshire Golf & Country Club-The Earls Course','Wetherby','Woodsome Hall','Worsley']}
};

/* ---------- Team match play (TeamGames2026) ----------
   Generated by matches_write.py from Team_Matchplay_Leaderboard.xlsx.
   Add a match as a row on that workbook's Match Log, then re-run it;
   do not edit these lists by hand.

   aSubFor / bSubFor: null normally. A name there means that player
   stood in for a team-mate, and it is the team-mate's name.

   Handicaps are the NHS figures from REGISTER, the single source.
   A third entry 'comp' marks a handicap agreed for this competition
   only, which is NOT that player's NHS.                          */
const ROSTER_A = [
  ['Yaseen (C)',13.4],       // Yaseen Mohammed
  ['Amriaz',10.6],           // Afrid Iqbal
  ['Bash',15.9],             // Basharat2 Ali
  ['Imran',14.0],            // Imran K
  ['Mansoor',16.1],          // Mansoor M
  ['Moody',17.0],            // Mahmood Sadiq
  ['Nav',18.7],              // Naveen Ahmed
  ['Shaan',18.1],            // Shaan Ahmed
  ['Shahzad',19.9],          // Shazad Hussain
  ['Waseem',15.6]           // Waseem Goldenboy
];
const ROSTER_B = [
  ['Shufqat (C)',12.7],       // Shufqat Khan
  ['Gaff',7.9],               // Guftar Hussain
  ['Haaris',12.4],            // Haaris Ahmed
  ['Jabar',15.7],             // Jabar Mughal
  ['Tab',10.1],               // Tab Rafique
  ['Raz',10.6],               // Raz Shafi
  ['Raza',36.0,'comp'],       // Raza Efendi - team games only, NHS is 28.1
  ['Sam',16.9],               // Sameer Ahmed
  ['Sid',17.2],               // Sid Amin
  ['Tariq',22.7]             // Tariq Javaid
];
const BIG_WIN = 5;   // margin that turns a win into 2 points

const MATCHES = [
  {date:'2026-08-24',aPlayer:'Yaseen (C)',aSubFor:null,aPts:13,bPlayer:'Shufqat (C)',bSubFor:null,bPts:18},
  {date:'2026-08-25',aPlayer:'Mansoor',aSubFor:'Moody',aPts:13,bPlayer:'Raz',bSubFor:null,bPts:10},
  {date:'2026-08-25',aPlayer:'Moody',aSubFor:'Shaan',aPts:14,bPlayer:'Sam',bSubFor:null,bPts:10},
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
  {date:'2026-09-02',aPlayer:'Amriaz',aSubFor:null,aPts:19,bPlayer:'Haaris',bSubFor:null,bPts:20},
  {date:'2026-09-02',aPlayer:'Waseem',aSubFor:null,aPts:17,bPlayer:'Haaris',bSubFor:null,bPts:16},
  {date:'2026-09-02',aPlayer:'Imran',aSubFor:null,aPts:10,bPlayer:'Sid',bSubFor:null,bPts:15},
  {date:'2026-09-03',aPlayer:'Imran',aSubFor:null,aPts:13,bPlayer:'Tab',bSubFor:null,bPts:16},
  {date:'2026-09-03',aPlayer:'Nav',aSubFor:null,aPts:13,bPlayer:'Jabar',bSubFor:null,bPts:16},
  {date:'2026-09-05',aPlayer:'Moody',aSubFor:null,aPts:13,bPlayer:'Raza',bSubFor:null,bPts:15},
  {date:'2026-09-07',aPlayer:'Shahzad',aSubFor:null,aPts:9,bPlayer:'Tariq',bSubFor:null,bPts:10},
  {date:'2026-09-07',aPlayer:'Nav',aSubFor:null,aPts:14,bPlayer:'Sid',bSubFor:null,bPts:23},
  {date:'2026-09-09',aPlayer:'Mansoor',aSubFor:null,aPts:15,bPlayer:'Raza',bSubFor:null,bPts:18},
  {date:'2026-09-09',aPlayer:'Waseem',aSubFor:null,aPts:18,bPlayer:'Jabar',bSubFor:null,bPts:19}
];

/* The published 10-week round robin. A match may be played ahead of
   its week by agreement, so a result can carry a date earlier than
   the week it belongs to.                                        */
const TEAM_SCHEDULE = [
  {week:1, from:'2026-08-24', pairs:[['Yaseen (C)','Shufqat (C)'],['Amriaz','Gaff'],['Bash','Haaris'],['Imran','Jabar'],['Mansoor','Tab'],['Moody','Raz'],['Nav','Raza'],['Shaan','Sam'],['Shahzad','Sid'],['Waseem','Tariq']]},
  {week:2, from:'2026-08-31', pairs:[['Yaseen (C)','Gaff'],['Amriaz','Haaris'],['Bash','Jabar'],['Imran','Tab'],['Mansoor','Raz'],['Moody','Raza'],['Nav','Sam'],['Shaan','Sid'],['Shahzad','Tariq'],['Waseem','Shufqat (C)']]},
  {week:3, from:'2026-09-07', pairs:[['Yaseen (C)','Haaris'],['Amriaz','Jabar'],['Bash','Tab'],['Imran','Raz'],['Mansoor','Raza'],['Moody','Sam'],['Nav','Sid'],['Shaan','Tariq'],['Shahzad','Shufqat (C)'],['Waseem','Gaff']]},
  {week:4, from:'2026-09-14', pairs:[['Yaseen (C)','Jabar'],['Amriaz','Tab'],['Bash','Raz'],['Imran','Raza'],['Mansoor','Sam'],['Moody','Sid'],['Nav','Tariq'],['Shaan','Shufqat (C)'],['Shahzad','Gaff'],['Waseem','Haaris']]},
  {week:5, from:'2026-09-21', pairs:[['Yaseen (C)','Tab'],['Amriaz','Raz'],['Bash','Raza'],['Imran','Sam'],['Mansoor','Sid'],['Moody','Tariq'],['Nav','Shufqat (C)'],['Shaan','Gaff'],['Shahzad','Haaris'],['Waseem','Jabar']]},
  {week:6, from:'2026-09-28', pairs:[['Yaseen (C)','Raz'],['Amriaz','Raza'],['Bash','Sam'],['Imran','Sid'],['Mansoor','Tariq'],['Moody','Shufqat (C)'],['Nav','Gaff'],['Shaan','Haaris'],['Shahzad','Jabar'],['Waseem','Tab']]},
  {week:7, from:'2026-10-05', pairs:[['Yaseen (C)','Raza'],['Amriaz','Sam'],['Bash','Sid'],['Imran','Tariq'],['Mansoor','Shufqat (C)'],['Moody','Gaff'],['Nav','Haaris'],['Shaan','Jabar'],['Shahzad','Tab'],['Waseem','Raz']]},
  {week:8, from:'2026-10-12', pairs:[['Yaseen (C)','Sam'],['Amriaz','Sid'],['Bash','Tariq'],['Imran','Shufqat (C)'],['Mansoor','Gaff'],['Moody','Haaris'],['Nav','Jabar'],['Shaan','Tab'],['Shahzad','Raz'],['Waseem','Raza']]},
  {week:9, from:'2026-10-19', pairs:[['Yaseen (C)','Sid'],['Amriaz','Tariq'],['Bash','Shufqat (C)'],['Imran','Gaff'],['Mansoor','Haaris'],['Moody','Jabar'],['Nav','Tab'],['Shaan','Raz'],['Shahzad','Raza'],['Waseem','Sam']]},
  {week:10, from:'2026-10-26', pairs:[['Yaseen (C)','Tariq'],['Amriaz','Shufqat (C)'],['Bash','Gaff'],['Imran','Haaris'],['Mansoor','Jabar'],['Moody','Tab'],['Nav','Raz'],['Shaan','Raza'],['Shahzad','Sam'],['Waseem','Sid']]}
];

/* Fixtures known in advance to need a stand-in, with the reason, so
   the fixture list can say so rather than showing them as ordinary
   matches still to arrange.                                      */
const SUB_REQUIRED = {
  'Moody|Raz':'Moody does not play Raz',
  'Moody|Sam':'Moody does not play Sam'
};

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
  {n:'Yaseen Mohammed',     nhs:13.4, honours:[{t:'Yorkshire · Asia Cup 2026', k:'squad'}, {t:'Yorkshire · War of the Roses 2026', k:'squad'}],  whs:15.2,    whsOfficial:true, calc:14.9,  rounds:18, est:false},
  {n:'Hamza T',             nhs:3,     whs:3,     calc:-3,    rounds: 3, est:false},
  {n:'Waseem Goldenboy',    nhs:15.6, honours:[{t:'Yorkshire · Asia Cup 2026 (captain)', k:'squad'}, {t:'Yorkshire · War of the Roses 2026 (captain)', k:'squad'}, {t:'Highest doubles score · 45 pts · with Tariq Javaid', k:'award'}, {t:'Golfathon 2026', k:'charity'}],  whs:18,    whsOfficial:true, calc:19.6,  rounds:25, est:true},
  {n:'Sameer Ahmed',        nhs:16.9, honours:[{t:'Golfathon 2026', k:'charity'}],  whs:17,    calc:20.2,  rounds:16, est:false},
  {n:'Naveen Ahmed',        nhs:18.7, honours:[{t:'Golfathon 2026', k:'charity'}],  whs:19,    calc:22,    rounds: 3, est:false},
  {n:'Umer Akbar',          nhs:11.2,  whs:12,    calc:10,    rounds: 2, est:false},
  {n:'Sid Amin',            nhs:17.2, honours:[{t:'Yorkshire · War of the Roses 2026', k:'squad'}],  whs:20.1,    whsOfficial:true, calc:22,  rounds:23, est:true},
  {n:'Nadeem Ahmed',        nhs:13.7,  whs:14,    calc:14.5,  rounds: 8, est:false},
  {n:'Tab Rafique',         nhs:10.1, honours:[{t:'Yorkshire · Asia Cup 2026', k:'squad'}],  whs:9.9,    calc:14.7,  rounds:26, est:true},
  {n:'Mahmood Sadiq',       nhs:17.0,  whs:17,    calc:20.9,  rounds:29, est:true},
  {n:'Basharat2 Ali',       nhs:15.9, honours:[{t:'Yorkshire · Asia Cup 2026', k:'squad'}, {t:'Yorkshire · War of the Roses 2026', k:'squad'}],  whs:18.3,    whsOfficial:true, calc:18.3,  rounds:13, est:false},
  {n:'Shazad Hussain',      nhs:19.9, honours:[{t:'Yorkshire · War of the Roses 2026', k:'squad'}],  whs:21.6,    whsOfficial:true, calc:22.4,  rounds:28, est:true},
  {n:'Aftab Iqbal',         nhs:6.8,   whs:9.4,     whsOfficial:true, calc:6,     rounds: 2, est:false},
  {n:'Mansoor M',           nhs:16.1,  whs:19.9,    whsOfficial:true, calc:20.9,    rounds:20, est:true},
  {n:'Tariq Javaid',        nhs:22.7, honours:[{t:'Yorkshire · Asia Cup 2026 (vice-captain)', k:'squad'}, {t:'Yorkshire · War of the Roses 2026', k:'squad'}, {t:'Highest doubles score · 45 pts · with Waseem', k:'award'}],  whs:24.1,    whsOfficial:true, calc:29.5,    rounds:14, est:false},
  {n:'Matt T',              nhs:18.6,  whs:19,    calc:36,    rounds: 1, est:false},
  {n:'Hanif Malik',         nhs:17.6,  whs:19,    calc:56,    rounds: 1, est:false},
  {n:'Shufqat Khan',        nhs:12.7, honours:[{t:'Yorkshire · Asia Cup 2026 (vice-captain)', k:'squad'}, {t:'Yorkshire · War of the Roses 2026', k:'squad'}, {t:'Highest individual score · 40 pts', k:'award'}],  whs:15.9,    whsOfficial:true, calc:16.2,  rounds:19, est:false},
  {n:'Imran K',             nhs:14.0, honours:[{t:'Yorkshire · Asia Cup 2026', k:'squad'}, {t:'Yorkshire · War of the Roses 2026', k:'squad'}, {t:'Nearest the pin', k:'award'}],  whs:17,    whsOfficial:true, calc:18.6,  rounds:21, est:true},
  {n:'Shaan Ahmed',         nhs:18.1, honours:[{t:'Golfathon 2026', k:'charity'}],  whs:18,    calc:23.3,  rounds:15, est:false},
  {n:'Guftar Hussain',      nhs:7.9, honours:[{t:'Yorkshire · Asia Cup 2026', k:'squad'}, {t:'Yorkshire · War of the Roses 2026', k:'squad'}],   whs:9.6,    whsOfficial:true, calc:11.7,  rounds:20, est:true},
  {n:'Raz Shafi',           nhs:10.6, honours:[{t:'Yorkshire · War of the Roses 2026', k:'squad'}],  whs:11.7,    whsOfficial:true, calc:14.2,    rounds:17, est:false},
  {n:'Afrid Iqbal',         nhs:10.6, honours:[{t:'Yorkshire · Asia Cup 2026', k:'squad'}],  whs:13.0,    calc:14.3,    rounds: 9, est:false},
  {n:'Haaris Ahmed',        nhs:12.4,  whs:16.6,    whsOfficial:true, calc:12.5,    rounds: 4, est:false},
  {n:'Jabar Mughal',        nhs:15.7,  whs:17.7,  calc:17,    rounds:13, est:false},
  {n:'Sabar Riaz',          nhs:24.3,  whs:24,    calc:28,    rounds: 3, est:false},
  {n:'Naeem Akhtar',        nhs:14.3, honours:[{t:'Golfathon 2026', k:'charity'}],  whs:14,    calc:23,    rounds: 3, est:false},
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

/* ---------- Asia Cup 2026 squad ----------
   The event and the members of the squad who are not society players.
   Squad selection itself is an accolade on the player, in REGISTER.honours. */
const SQUAD_OTHERS = ['Kamran Jawaid','Sajid Mahmood','Ikhlaq Sulaman','Adam Butt',
  'Owais Mohammad','Shabir Hussain','Zain Ul-Abidin','Abdullah Noor','Tahir Shah'];

const ASIA_CUP = {
  event:'Asia Cup 2026', date:'2 August 2026',
  venue:'The Warwickshire, Leek Wootton', squad:18,
  format:'Four-team round robin — Manchester, Yorkshire, East London, West London'
};

/* ---------- Profile cards ----------
   One card per player. SOCIETY_STATS is what our own scorecards say,
   WHS_STATS what that player's My England Golf export says; a card shows
   whichever it has, and the two are never merged - they are built the
   same way but from different rounds, so they are not comparable.

   Generated by cards_write.py from the tracker. Do not hand-edit: the
   block this replaced was hand-built and had drifted out of step with
   the handicap register after the tee corrections.

   noExport marks a WHS record carried from an earlier figure rather than
   a current export. kind says whether mark is a peak or a low.        */
const EG_NAMES = {
  'Basharat2 Ali':'Basharat Ali',
  'Imran K':'Imran Abbas',
  'Tab Rafique':'Tabbussam Rafique',
  'Tariq Javaid':'Tariq Javid',
  'Waseem Goldenboy':'Waseem Javeed',
  'Yaseen Mohammed':'Yaseen Mohammad'
};

const SOCIETY_STATS = {
  'Afrid Iqbal':{rounds:9, first:'Apr 2025', last:'Aug 2026', idx:14.3, avg:21.8,
    best:{v:13, d:'9 Aug 2026'}, mark:{v:18, d:'Apr 2026', kind:'peak'}, net:-1.7, ev:[['Stableford rounds',5],['Strokeplay rounds',4]]},
  'Aftab Iqbal':{rounds:2, first:'Mar 2026', last:'Aug 2026', idx:6, avg:14.5,
    best:{v:8, d:'1 Aug 2026'}, mark:{v:19, d:'Mar 2026', kind:'peak'}, net:-13, ev:[['Forest Pines away day',1],['Strokeplay rounds',1]]},
  'Ayaz Alam':{rounds:1, first:'Apr 2025', last:'Apr 2025', idx:22, avg:24,
    best:{v:24, d:'20 Apr 2025'}, mark:{v:22, d:'Apr 2025', kind:'peak'}, net:0, ev:[['Stableford rounds',1]]},
  'Basharat2 Ali':{rounds:13, first:'Apr 2024', last:'Aug 2026', idx:18.3, avg:26.3,
    best:{v:15, d:'30 Aug 2026'}, mark:{v:22, d:'Jun 2025', kind:'peak'}, net:-0.7, ev:[['Stableford rounds',8],['Strokeplay rounds',4],['Forest Pines away day',1]]},
  'Guftar Hussain':{rounds:20, first:'Apr 2024', last:'Sep 2026', idx:11.7, avg:14.9,
    best:{v:9, d:'13 Jul 2025'}, mark:{v:18, d:'Apr 2024', kind:'peak'}, net:-6.3, ev:[['Stableford rounds',15],['Strokeplay rounds',4],['Hollins Hall away day',1]]},
  'Haaris Ahmed':{rounds:4, first:'May 2025', last:'Aug 2026', idx:12.5, avg:19.9,
    best:{v:13.5, d:'21 Jun 2025'}, mark:{v:25.5, d:'May 2025', kind:'peak'}, net:-13, ev:[['Stableford rounds',3],['Strokeplay rounds',1]]},
  'Hamza T':{rounds:3, first:'Jul 2025', last:'Mar 2026', idx:-3, avg:2.8,
    best:{v:-1, d:'13 Jul 2025'}, mark:{v:2.5, d:'Jul 2025', kind:'peak'}, net:-5.5, ev:[['Stableford rounds',2],['Forest Pines away day',1]]},
  'Hanif Malik':{rounds:1, first:'Mar 2026', last:'Mar 2026', idx:56, avg:58,
    best:{v:58, d:'23 Mar 2026'}, mark:{v:56, d:'Mar 2026', kind:'peak'}, net:0, ev:[['Forest Pines away day',1]]},
  'Imran K':{rounds:21, first:'Apr 2024', last:'Sep 2026', idx:18.6, avg:22.4,
    best:{v:15, d:'19 Apr 2026'}, mark:{v:14.5, d:'Apr 2025', kind:'low'}, net:-2.4, ev:[['Stableford rounds',13],['Strokeplay rounds',7],['Hollins Hall away day',1]]},
  'Jabar Mughal':{rounds:13, first:'Apr 2025', last:'Aug 2026', idx:17, avg:21.6,
    best:{v:16, d:'1 Aug 2026'}, mark:{v:23, d:'Apr 2025', kind:'peak'}, net:-6, ev:[['Strokeplay rounds',7],['Stableford rounds',6]]},
  'Mahmood Sadiq':{rounds:29, first:'Apr 2024', last:'Sep 2026', idx:20.9, avg:26.7,
    best:{v:15.9, d:'5 Apr 2026'}, mark:{v:24, d:'Apr 2024', kind:'peak'}, net:-3.1, ev:[['Stableford rounds',18],['Strokeplay rounds',9],['Forest Pines away day',1],['Hollins Hall away day',1]]},
  'Mansoor M':{rounds:20, first:'Apr 2024', last:'Sep 2026', idx:20.9, avg:27.1,
    best:{v:16, d:'23 Aug 2026'}, mark:{v:38, d:'Apr 2024', kind:'peak'}, net:-17.1, ev:[['Stableford rounds',15],['Strokeplay rounds',3],['Forest Pines away day',1],['Hollins Hall away day',1]]},
  'Matt T':{rounds:1, first:'Mar 2026', last:'Mar 2026', idx:36, avg:38,
    best:{v:38, d:'23 Mar 2026'}, mark:{v:36, d:'Mar 2026', kind:'peak'}, net:0, ev:[['Forest Pines away day',1]]},
  'Mustapha T':{rounds:1, first:'Mar 2026', last:'Mar 2026', idx:44, avg:46,
    best:{v:46, d:'23 Mar 2026'}, mark:{v:44, d:'Mar 2026', kind:'peak'}, net:0, ev:[['Forest Pines away day',1]]},
  'Nadeem Ahmed':{rounds:8, first:'Apr 2025', last:'Aug 2026', idx:14.5, avg:20.9,
    best:{v:13, d:'20 Apr 2025'}, mark:{v:11, d:'Apr 2025', kind:'low'}, net:3.5, ev:[['Stableford rounds',5],['Strokeplay rounds',2],['Forest Pines away day',1]]},
  'Naeem Akhtar':{rounds:3, first:'Apr 2025', last:'Jul 2026', idx:23, avg:28.3,
    best:{v:25, d:'11 Jul 2026'}, mark:{v:30, d:'Apr 2025', kind:'peak'}, net:-7, ev:[['Strokeplay rounds',2],['Stableford rounds',1]]},
  'Naveen Ahmed':{rounds:3, first:'Apr 2025', last:'Sep 2026', idx:22, avg:35,
    best:{v:24, d:'23 Mar 2026'}, mark:{v:34, d:'Apr 2025', kind:'peak'}, net:-12, ev:[['Forest Pines away day',1],['Hollins Hall away day',1],['Stableford rounds',1]]},
  'Raz Shafi':{rounds:17, first:'Apr 2025', last:'Sep 2026', idx:14.2, avg:19.1,
    best:{v:13, d:'19 Apr 2026'}, mark:{v:24, d:'Apr 2025', kind:'peak'}, net:-9.8, ev:[['Stableford rounds',9],['Strokeplay rounds',7],['Hollins Hall away day',1]]},
  'Sabar Riaz':{rounds:3, first:'Jul 2026', last:'Aug 2026', idx:28, avg:38.7,
    best:{v:30, d:'11 Jul 2026'}, mark:{v:52, d:'Jul 2026', kind:'peak'}, net:-24, ev:[['Strokeplay rounds',3]]},
  'Sameer Ahmed':{rounds:16, first:'May 2025', last:'Aug 2026', idx:20.2, avg:25.7,
    best:{v:19, d:'23 Aug 2026'}, mark:{v:22.5, d:'Apr 2026', kind:'peak'}, net:2.2, ev:[['Stableford rounds',10],['Strokeplay rounds',5],['Forest Pines away day',1]]},
  'Shaan Ahmed':{rounds:15, first:'Apr 2024', last:'Aug 2026', idx:23.3, avg:30.1,
    best:{v:20.5, d:'8 Jun 2025'}, mark:{v:33, d:'Apr 2024', kind:'peak'}, net:-9.7, ev:[['Stableford rounds',11],['Strokeplay rounds',4]]},
  'Shazad Hussain':{rounds:28, first:'Apr 2024', last:'Sep 2026', idx:22.4, avg:29.2,
    best:{v:18.5, d:'5 Jul 2025'}, mark:{v:25.8, d:'May 2025', kind:'peak'}, net:0.4, ev:[['Stableford rounds',19],['Strokeplay rounds',7],['Forest Pines away day',1],['Hollins Hall away day',1]]},
  'Shufqat Khan':{rounds:19, first:'Apr 2024', last:'Sep 2026', idx:16.2, avg:23.9,
    best:{v:10, d:'9 Aug 2026'}, mark:{v:22, d:'Jun 2025', kind:'peak'}, net:-1.8, ev:[['Stableford rounds',13],['Strokeplay rounds',5],['Hollins Hall away day',1]]},
  'Sid Amin':{rounds:23, first:'Apr 2025', last:'Sep 2026', idx:22, avg:26.8,
    best:{v:20, d:'20 Apr 2025'}, mark:{v:18, d:'Apr 2025', kind:'low'}, net:0.5, ev:[['Stableford rounds',14],['Strokeplay rounds',7],['Forest Pines away day',1],['Hollins Hall away day',1]]},
  'Tab Rafique':{rounds:26, first:'Apr 2024', last:'Aug 2026', idx:14.7, avg:18.3,
    best:{v:11, d:'27 Apr 2024'}, mark:{v:9, d:'Apr 2024', kind:'low'}, net:5.7, ev:[['Stableford rounds',20],['Strokeplay rounds',5],['Forest Pines away day',1]]},
  'Tariq Javaid':{rounds:14, first:'Apr 2024', last:'Aug 2026', idx:29.5, avg:34.4,
    best:{v:27, d:'13 Jul 2025'}, mark:{v:27.5, d:'Jul 2025', kind:'low'}, net:-0.5, ev:[['Stableford rounds',8],['Strokeplay rounds',5],['Forest Pines away day',1]]},
  'Umer Akbar':{rounds:2, first:'Jul 2025', last:'Mar 2026', idx:10, avg:14.5,
    best:{v:12, d:'13 Jul 2025'}, mark:{v:10, d:'Jul 2025', kind:'peak'}, net:0, ev:[['Forest Pines away day',1],['Stableford rounds',1]]},
  'Waseem Goldenboy':{rounds:25, first:'Apr 2024', last:'Sep 2026', idx:19.6, avg:24.6,
    best:{v:18, d:'18 May 2025'}, mark:{v:17.7, d:'Jun 2025', kind:'low'}, net:1.6, ev:[['Stableford rounds',18],['Strokeplay rounds',5],['Forest Pines away day',1],['Hollins Hall away day',1]]},
  'Yaseen Mohammed':{rounds:18, first:'Apr 2025', last:'Sep 2026', idx:14.9, avg:19.7,
    best:{v:14, d:'15 Jun 2025'}, mark:{v:25, d:'Apr 2025', kind:'peak'}, net:-10.1, ev:[['Stableford rounds',14],['Strokeplay rounds',2],['Forest Pines away day',1],['Hollins Hall away day',1]]}
};

const WHS_STATS = {
  'Afrid Iqbal':{idx:13, scores:20, since:'Jul 2023', avgDiff:16.9,
    best:{v:9.8, d:'17 Aug 2024'}, mark:{v:13.1, d:'18 Apr 2026', kind:'peak'}, net:0.5, noExport:true, note:'Remarkably stable — 12.2 to 13.1 across nearly three years, every round at Leeds, with two long reporting gaps. The 29 Jul 2023 round was missing its adjusted gross and was back-calculated to about 89 from the differential.'},
  'Aftab Iqbal':{idx:9.4, scores:51, since:'Aug 2018', avgDiff:12.1,
    best:{v:4.2, d:'30 May 2026'}, mark:{v:10.6, d:'28 Nov 2023', kind:'peak'}, net:-0.2},
  'Basharat2 Ali':{idx:18.3, scores:39, since:'Jul 2021', avgDiff:24.9,
    best:{v:14.5, d:'28 May 2025'}, mark:{v:25.3, d:'30 Oct 2022', kind:'peak'}, net:-5.1, note:'The biggest long-run improvement here - 25.3 in late 2022 to 18.3 now, and gradually rather than in jumps. One June 2026 round was missing its score differential in the export; it was rebuilt from the course rating, slope and PCC.'},
  'Guftar Hussain':{idx:9.6, scores:124, since:'May 2018', avgDiff:12.6,
    best:{v:4.8, d:'2 Jul 2022'}, mark:{v:5.7, d:'11 Aug 2018', kind:'low'}, net:1, note:'Much the longest record in the squad - 124 rounds over eight years, nearly all at Leeds. The index has held between roughly 7.5 and 10.5 throughout, so the 5.7 in 2018 stands well clear of everything since. Thirteen rounds through 2025 carry a WHS exceptional-score reduction of 1.0 shot.'},
  'Haaris Ahmed':{idx:16.6, scores:59, since:'Aug 2020', avgDiff:20.4,
    best:{v:10.8, d:'19 Jun 2025'}, mark:{v:19, d:'26 Mar 2022', kind:'peak'}, net:-2.1},
  'Imran K':{idx:17, scores:60, since:'Apr 2023', avgDiff:19.6,
    best:{v:11.6, d:'22 Aug 2026'}, mark:{v:14.5, d:'3 Aug 2025', kind:'low'}, net:0.9, note:'Remarkably level - the index has sat between about 14.5 and 19 across three years with no real trend either way. Rounds split almost evenly between the Leeds yellow and white tees. The export stops at England Golf&rsquo;s 60-round limit.'},
  'Mansoor M':{idx:19.9, scores:19, since:'Apr 2026', avgDiff:24.9,
    best:{v:16.3, d:'21 Jun 2026'}, mark:{v:21, d:'25 Apr 2026', kind:'peak'}, net:-1.1},
  'Raz Shafi':{idx:11.7, scores:60, since:'Jul 2023', avgDiff:15.4,
    best:{v:9, d:'26 Aug 2026'}, mark:{v:12.6, d:'6 Apr 2025', kind:'peak'}, net:0.1},
  'Shazad Hussain':{idx:21.6, scores:40, since:'Aug 2022', avgDiff:27.5,
    best:{v:14.5, d:'10 Sep 2023'}, mark:{v:18.7, d:'11 Sep 2022', kind:'low'}, net:2.9},
  'Shufqat Khan':{idx:15.9, scores:60, since:'May 2025', avgDiff:21.3,
    best:{v:10.8, d:'9 Aug 2026'}, mark:{v:20.4, d:'3 Aug 2025', kind:'peak'}, net:-2, note:'The steepest improver here: 20.4 at the peak in August 2025 down to 15.9 now, though the run is uneven rather than a steady slide. The export stops at England Golf&rsquo;s 60-round limit, so this history starts in May 2025 rather than at his first card.'},
  'Sid Amin':{idx:20.1, scores:60, since:'Aug 2023', avgDiff:24.4,
    best:{v:18.1, d:'20 Apr 2025'}, mark:{v:24.7, d:'16 Jun 2024', kind:'peak'}, net:-4.2},
  'Tab Rafique':{idx:9.9, scores:6, since:'May 2026', avgDiff:14.7,
    best:{v:9.9, d:'17 Jun 2026'}, mark:{v:11.7, d:'9 May 2026', kind:'peak'}, net:-1.8, noExport:true, note:'Lowest index in the squad, but a very short history — six rounds, all at Leeds. Improved fast (11.7 to 8.9) then bounced back to 9.9; still a small sample.'},
  'Tariq Javaid':{idx:24.1, scores:33, since:'May 2018', avgDiff:29.6,
    best:{v:20.8, d:'19 Aug 2024'}, mark:{v:31, d:'8 Aug 2023', kind:'peak'}, net:-2.1, note:'The highest index in the squad, off a long but sparse record - 33 rounds spread over eight years, with a four-year gap between 2018 and 2023. Almost everything is played off the Leeds yellow tees.'},
  'Waseem Goldenboy':{idx:18, scores:28, since:'Apr 2025', avgDiff:22.1,
    best:{v:11.8, d:'28 Jul 2025'}, mark:{v:26.9, d:'3 Jul 2025', kind:'peak'}, net:-4, note:'The sharpest swing in the squad - out to 26.9 in early July 2025, back to 18.0 since. Three April 2025 rounds in the England Golf record carry an adjusted gross higher than the society scorecard for the same day, which is a data-entry error to be corrected with England Golf.'},
  'Yaseen Mohammed':{idx:15.2, scores:29, since:'Jan 2023', avgDiff:19.1,
    best:{v:10.8, d:'8 Sep 2024'}, mark:{v:12.2, d:'26 Jan 2023', kind:'low'}, net:3, note:'Has drifted about three shots up from the 12.2 first recorded in January 2023. Plays away from Leeds more than most of the squad, which is why his average differential sits above where his index alone would suggest.'}
};

/* ---------- Away day fixtures ----------
   Days that are booked but not yet played. Generated by
   fixtures_write.py from the Fixtures sheet of the tracker; add a
   row there rather than editing this list.

   cr null means the club has not supplied a rating yet, and the page
   says so instead of standing par in for it.                    */
const FIXTURES = [
  {date:'2026-09-13', venue:'Cookridge Hall Golf Club', place:'Cookridge Ln, Cookridge, Leeds LS16 7NL', tee:null, cr:null, slope:null, par:null, note:'12:30 tee time'}
];

/* ---------- WHS Away Games ----------
   Tournaments played away from Leeds Golf Centre. Each entry carries its own
   par and course rating, because the differential behind every handicap is
   gross minus that course's rating, not minus par.

   crPlaceholder:true means the rating is NOT the official one - par is standing
   in until the real figure is supplied. Say so on the page; do not quietly
   present a placeholder as a rating.

   slope is recorded where known but is NEVER used: every differential in this
   society, home or away, is gross minus course rating, with slope and PCC
   excluded by standing instruction.

   rows: [position, player, handicap played off, gross, net, Stableford points]
   points are null where the round was logged without a points card.

   format:'matchplay' marks a fixture played as matches rather than cards.
   Those have no leaderboard - rows stays empty - and carry `result`, the
   `squad` that represented us, and any `awards`. Do not invent gross or net
   figures for them: none were recorded.                                */
const AWAY_GAMES = [
  /* War of the Roses - a Yorkshire representative fixture, not a society
     competition. Played as matches, so there is no card leaderboard. Course
     rating, slope and tee are taken from the two squad members whose round
     that day appears in their own England Golf record; par is not known. */
  {venue:'Worsley GC', place:'Worsley, Manchester', date:'3 September 2026',
   par:null, cr:69.8, tee:'Yellow', slope:128, crPlaceholder:false, hasPoints:false,
   format:'matchplay', result:'Yorkshire won 4-2',
   title:'War of the Roses 2026', side:'Yorkshire',
   squad:['Waseem Goldenboy','Guftar Hussain','Raz Shafi','Yaseen Mohammed','Imran K',
          'Shufqat Khan','Basharat2 Ali','Sid Amin','Shazad Hussain','Tariq Javaid'],
   awards:[['Highest doubles score, 45 pts','Waseem Goldenboy & Tariq Javaid'],
           ['Highest individual score, 40 pts','Shufqat Khan'],
           ['Nearest the pin','Imran K']],
   note:'Two of the squad have this round in their England Golf record — ' +
        'Yaseen Mohammed an adjusted gross of 86 and Sid Amin 98. No society ' +
        'scorecards were collected, so there is no leaderboard and these rounds ' +
        'are not in the handicap tracker.',
   rows:[]},

  {venue:'Hollins Hall GC', place:'Baildon, BD17 7QW', date:'6 September 2026', par:71, cr:71.0, tee:'White', slope:130, crPlaceholder:false, hasPoints:true,
   rows:[
    [1,'Mahmood Sadiq',20,94,74,33],
    [2,'Yaseen Mohammed',15,93,78,29],
    [3,'Mansoor M',19,99,80,28],
    [4,'Sid Amin',20,99,79,28],
    [5,'Raz Shafi',12,92,80,27],
    [6,'Shufqat Khan',15,96,81,26],
    [7,'Guftar Hussain',9,93,84,25],
    [8,'Waseem Goldenboy',18,102,84,24],
    [9,'Imran K',16,100,84,23],
    [10,'Shazad Hussain',23,111,88,20],
    [11,'Naveen Ahmed',22,116,94,14]
   ]},
  {venue:'Forest Pines', place:'Broughton, North Lincolnshire', date:'23 March 2026', par:70, cr:70, tee:null, slope:null, crPlaceholder:false, hasPoints:false,
   rows:[
    [1,'Yaseen Mohammed',13,85,72,29],
    [2,'Hamza T',0,75,75,null],
    [3,'Waseem Goldenboy',15,90,75,24],
    [4,'Sameer Ahmed',18,96,78,null],
    [5,'Naveen Ahmed',19,94,75,14],
    [6,'Umer Akbar',11,87,76,null],
    [8,'Sid Amin',20,98,78,28],
    [9,'Nadeem Ahmed',12,93,81,null],
    [10,'Tab Rafique',10,90,80,null],
    [11,'Mahmood Sadiq',18,99,81,33],
    [12,'Basharat2 Ali',18,101,83,null],
    [13,'Shazad Hussain',19,103,84,20],
    [14,'Aftab Iqbal',7,91,84,null],
    [15,'Mansoor M',18,106,88,28],
    [16,'Tariq Javaid',21,107,86,null],
    [18,'Mustapha T',28,116,88,null],
    [19,'Matt T',19,108,89,null],
    [20,'Hanif Malik',19,128,109,null]
   ]}
];
