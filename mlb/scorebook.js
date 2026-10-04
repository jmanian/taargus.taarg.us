// Scorebook tab: a traditional baseball scorecard built from MLB's own Stats
// API live feed. ESPN's play-by-play (used by the plays tab) names the fielder
// a ball was hit to but not who handled it, so it can't produce 6-4-3 style
// notation; MLB's feed credits every assist/putout and records each runner's
// movement base by base. statsapi.mlb.com needs no key and allows CORS.
//
// Loaded after config.js; hangs its hooks off LEAGUE so the shared game row
// only offers the tab on leagues that define it.
LEAGUE.scorebook = {
  // MLB's gamePk for an ESPN game: look up the home team's schedule around the
  // game's date and take the matching matchup closest to ESPN's start time
  // (which also picks the right half of a doubleheader).
  async findGamePk(game) {
    const away = LEAGUE.teams[game.awayTeam] && LEAGUE.teams[game.awayTeam].teamId;
    const home = LEAGUE.teams[game.homeTeam] && LEAGUE.teams[game.homeTeam].teamId;
    if (!away || !home || !game.date) return null;
    const day = DateTime.fromISO(game.date);
    const url = 'https://statsapi.mlb.com/api/v1/schedule?sportId=1' +
      `&teamId=${home}&startDate=${day.minus({ days: 1 }).toISODate()}&endDate=${day.plus({ days: 1 }).toISODate()}`;
    const data = await (await fetch(url)).json();
    const games = (data.dates || [])
      .flatMap(d => d.games)
      .filter(g => g.teams.away.team.id === away && g.teams.home.team.id === home);
    if (!games.length) return null;
    const target = game.dateTime ? game.dateTime.toMillis() : day.toMillis();
    games.sort((a, b) => Math.abs(Date.parse(a.gameDate) - target) - Math.abs(Date.parse(b.gameDate) - target));
    return games[0].gamePk;
  },

  feedURL(gamePk) {
    return `https://statsapi.mlb.com/api/v1.1/game/${gamePk}/feed/live`;
  },

  // Turn the live feed into one scorecard per team:
  //   { away: card, home: card }, card = {
  //     columns: [{ inning, firstOfInning }],        // extra columns when batting around
  //     innings: [{ inning, span, runs, hits }],      // header/footer, colspan'd
  //     rows: [{ spot, players: [{ name, pos }], cells: [box | null per column] }]
  //   }
  // A box is one plate appearance (or a placed extra-innings runner): the
  // bases the batter-runner reached, whether he scored, his out number, the
  // result notation and small marks at the bases for how he advanced.
  process(feed) {
    const players = feed.gameData.players;
    const teams = feed.liveData.boxscore.teams;
    const plays = feed.liveData.plays.allPlays;
    const lastInning = plays.length ? plays[plays.length - 1].about.inning : 1;
    const maxInning = Math.max(9, lastInning);
    return {
      away: this.buildCard(teams.away, plays, 'top', players, maxInning),
      home: this.buildCard(teams.home, plays, 'bottom', players, maxInning)
    };
  },

  buildCard(team, plays, half, players, maxInning) {
    const BASE = { '1B': 1, '2B': 2, '3B': 3, score: 4 };

    // Lineup: battingOrder is spot * 100 + substitution index ("501" is the
    // first player in for the 5th spot's starter).
    const rows = [];
    for (let s = 1; s <= 9; s++) rows.push({ spot: s, players: [], cells: [] });
    const spotOf = {};
    const lineup = Object.values(team.players)
      .filter(p => p.battingOrder)
      .sort((a, b) => Number(a.battingOrder) - Number(b.battingOrder));
    const lastName = p => (players['ID' + p.person.id] || {}).lastName || p.person.fullName;
    // Last names alone, plus a first initial when two players share one.
    const counts = {};
    lineup.forEach(p => { counts[lastName(p)] = (counts[lastName(p)] || 0) + 1; });
    lineup.forEach(p => {
      const spot = Math.floor(Number(p.battingOrder) / 100);
      if (!rows[spot - 1]) return;
      const info = players['ID' + p.person.id] || {};
      let name = lastName(p);
      if (counts[name] > 1 && info.useName) name = `${info.useName[0]}. ${name}`;
      const positions = (p.allPositions || [p.position]).map(pos => pos.abbreviation);
      rows[spot - 1].players.push({ name: name, pos: positions.join('-') });
      spotOf[p.person.id] = spot;
    });

    // Columns: one per inning, plus another whenever a lineup spot comes up a
    // second time in the same inning (batting around).
    const columns = [];
    const colsByInning = {};
    const addColumn = inning => {
      columns.push({ inning: inning, firstOfInning: !colsByInning[inning] });
      rows.forEach(r => r.cells.push(null));
      (colsByInning[inning] = colsByInning[inning] || []).push(columns.length - 1);
      return columns.length - 1;
    };
    for (let i = 1; i <= maxInning; i++) addColumn(i);
    // Insert batting-around columns right after their inning's last column.
    const placeBox = (inning, spot, box) => {
      const cols = colsByInning[inning];
      let col = cols[cols.length - 1];
      if (rows[spot - 1].cells[col]) {
        col += 1;
        columns.splice(col, 0, { inning: inning, firstOfInning: false });
        rows.forEach(r => r.cells.splice(col, 0, null));
        Object.keys(colsByInning).forEach(k => {
          colsByInning[k] = colsByInning[k].map(c => (c >= col ? c + 1 : c));
        });
        colsByInning[inning].push(col);
      }
      rows[spot - 1].cells[col] = box;
      box.inning = inning;
    };

    const newBox = () => ({ reached: 0, scored: false, out: null, code: '', sub: '', looking: false, hit: false, marks: {}, endsHalf: false, inProgress: false });
    const activeBox = {}; // runner id -> the box tracking him while he's on base

    plays.forEach(play => {
      if (play.about.halfInning !== half) return;
      const inning = play.about.inning;
      const batterId = play.matchup.batter.id;

      play.playEvents.forEach(ev => {
        // Pinch runners inherit the box of the runner they replace.
        if (ev.isSubstitution && ev.replacedPlayer && activeBox[ev.replacedPlayer.id]) {
          activeBox[ev.player.id] = activeBox[ev.replacedPlayer.id];
          delete activeBox[ev.replacedPlayer.id];
        }
        // Extra innings start with a runner placed on 2nd; he gets a box in
        // his lineup spot even if he never moves.
        if (ev.details && ev.details.eventType === 'runner_placed' && ev.player && spotOf[ev.player.id]) {
          const placed = newBox();
          placed.reached = ev.base || 2;
          placed.sub = 'ER';
          placeBox(inning, spotOf[ev.player.id], placed);
          activeBox[ev.player.id] = placed;
        }
      });

      const box = newBox();
      box.inProgress = !play.about.isComplete;
      // Balls and strikes before the deciding pitch (or so far, while live):
      // the 3 ball and 2 strike ticks a scorecard has room for.
      if (play.count) {
        box.balls = Math.min(play.count.balls || 0, 3);
        box.strikes = Math.min(play.count.strikes || 0, 2);
      }
      const batterSpot = spotOf[batterId];
      if (batterSpot) placeBox(inning, batterSpot, box);

      const movements = play.runners.slice().sort((a, b) => a.details.playIndex - b.details.playIndex);
      movements.forEach(r => {
        const rid = r.details.runner.id;
        const m = r.movement;
        let b = rid === batterId ? box : activeBox[rid];
        if (!b) {
          // A runner with no box (fallback in case a placed runner's event
          // is missing): start one at the base he's moving from.
          const spot = spotOf[rid];
          if (!spot) return;
          b = newBox();
          b.reached = BASE[m.start] || 0;
          b.code = '';
          b.sub = 'ER';
          placeBox(inning, spot, b);
        }
        const midPA = r.details.event !== play.result.event;
        const label = midPA ? this.runnerEventLabel(r.details.eventType, r.credits) : (rid === batterId ? '' : String(batterSpot || ''));
        if (m.isOut) {
          b.out = m.outNumber;
          // A runner put out on the bases gets the fielders (or CS/PO) there.
          if (rid !== batterId && BASE[m.outBase]) b.marks[BASE[m.outBase]] = (midPA && label) || this.chain([r]);
          delete activeBox[rid];
        } else if (m.end) {
          const to = BASE[m.end];
          if (to > b.reached) {
            b.reached = to;
            if (rid !== batterId || midPA) b.marks[to] = label;
          }
          if (to === 4) {
            b.scored = true;
            delete activeBox[rid];
          } else {
            activeBox[rid] = b;
          }
        }
      });

      if (play.about.isComplete) {
        Object.assign(box, this.notation(play, movements));
        if (play.count && play.count.outs >= 3) box.endsHalf = true;
      }
    });

    const innings = [];
    columns.forEach((c, i) => {
      if (c.firstOfInning) innings.push({ inning: c.inning, span: 0, runs: 0, hits: 0, played: false });
      const inn = innings[innings.length - 1];
      inn.span++;
      rows.forEach(r => {
        const b = r.cells[i];
        if (!b) return;
        inn.played = true;
        if (b.scored) inn.runs++;
        if (b.hit) inn.hits++;
      });
    });

    return { columns: columns, innings: innings, rows: rows };
  },

  // Fielder chain for a set of runner movements (e.g. "6-4-3"): assists then
  // putouts, ordered by out number, with consecutive repeats collapsed.
  chain(movements) {
    const positions = [];
    movements
      .filter(r => r.movement.isOut)
      .sort((a, b) => (a.movement.outNumber || 0) - (b.movement.outNumber || 0))
      .forEach(r => (r.credits || []).forEach(c => {
        if (c.credit !== 'f_assist' && c.credit !== 'f_putout') return;
        const pos = c.position.code;
        if (positions[positions.length - 1] !== pos) positions.push(pos);
      }));
    return positions.join('-');
  },

  // Small mark for how a runner advanced or was put out between pitches.
  runnerEventLabel(type, credits) {
    const t = type || '';
    if (t.startsWith('pickoff_caught_stealing') || t.startsWith('caught_stealing')) return 'CS';
    if (t.startsWith('stolen_base')) return 'SB';
    if (t.startsWith('pickoff_error')) return 'E';
    if (t.startsWith('pickoff')) return 'PO';
    if (t === 'wild_pitch') return 'WP';
    if (t === 'passed_ball') return 'PB';
    if (t === 'balk') return 'BK';
    if (t === 'defensive_indiff') return 'DI';
    if (t.includes('error')) {
      const err = (credits || []).find(c => c.credit.includes('error'));
      return 'E' + (err ? err.position.code : '');
    }
    return '';
  },

  // Scorebook notation for a completed plate appearance.
  notation(play, movements) {
    const type = play.result.eventType;
    const batterId = play.matchup.batter.id;
    const batterMoves = movements.filter(r => r.details.runner.id === batterId);
    const lastPitch = play.playEvents.filter(e => e.isPitch).pop();
    const trajectory = lastPitch && lastPitch.hitData && lastPitch.hitData.trajectory;
    const fielded = () => {
      // Single-fielder outs get a trajectory prefix (F8, L6, P4); a lone
      // ground-ball putout is unassisted (3U).
      const chain = this.chain(batterMoves);
      if (chain.includes('-') || !chain) return chain;
      if (trajectory === 'fly_ball') return 'F' + chain;
      if (trajectory === 'line_drive') return 'L' + chain;
      if (trajectory === 'popup') return 'P' + chain;
      return chain + 'U';
    };
    const errorPos = () => {
      const c = movements.flatMap(r => r.credits || []).find(c => c.credit.includes('error'));
      return c ? c.position.code : '';
    };

    const result = { code: '', sub: '', looking: false, hit: false };
    switch (type) {
      case 'strikeout':
      case 'strikeout_double_play':
      case 'strikeout_triple_play':
        result.code = 'K';
        result.looking = !!(lastPitch && lastPitch.details.call && lastPitch.details.call.code === 'C');
        if (type !== 'strikeout') result.sub = type.endsWith('triple_play') ? 'TP' : 'DP';
        break;
      case 'walk': result.code = 'BB'; break;
      case 'intent_walk': result.code = 'IBB'; break;
      case 'hit_by_pitch': result.code = 'HBP'; break;
      case 'single': result.code = '1B'; result.hit = true; break;
      case 'double': result.code = '2B'; result.hit = true; break;
      case 'triple': result.code = '3B'; result.hit = true; break;
      case 'home_run': result.code = 'HR'; result.hit = true; break;
      case 'field_out': result.code = fielded(); break;
      case 'grounded_into_double_play':
      case 'double_play':
        result.code = this.chain(movements); result.sub = 'DP'; break;
      case 'triple_play':
        result.code = this.chain(movements); result.sub = 'TP'; break;
      case 'force_out':
        result.code = 'FC'; result.sub = this.chain(movements); break;
      case 'fielders_choice':
      case 'fielders_choice_out':
        result.code = 'FC'; break;
      case 'sac_fly':
      case 'sac_fly_double_play':
        result.code = 'SF' + this.chain(batterMoves); break;
      case 'sac_bunt':
      case 'sac_bunt_double_play':
        result.code = 'SH'; result.sub = this.chain(movements); break;
      case 'field_error': result.code = 'E' + errorPos(); break;
      case 'catcher_interf': result.code = 'CI'; break;
      default: result.code = (play.result.event || '').slice(0, 4);
    }
    return result;
  }
};
