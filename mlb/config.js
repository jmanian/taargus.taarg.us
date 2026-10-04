// Per-league configuration consumed by the shared/ code.
// teamData is defined by data/teams.js, loaded before this file.
//
// Baseball differs from basketball in a few places the shared code accounts for
// via the optional hooks below (chart axis, box score, leaders, broadcasts).
// NBA/WNBA omit these hooks and keep their original behavior.
const LEAGUE = {
  slug: 'mlb',
  teams: teamData,
  // No game clock in baseball; the win-prob chart's x-axis is measured in
  // innings, with one x-unit per inning (see periodGridTimes/elapsedForPlays).
  regulationPeriods: 9,
  periodSeconds: 1,
  otSeconds: 1,
  standings: {
    // Six teams per league reach the playoffs: draw the cutoff line after #6.
    cutoffs: [{ index: 5, class: 'playoff-cutoff' }],
    clincher: false
  },
  // Baseball gets a "Line & Plays" tab (runs-by-inning line score that picks
  // the half-inning for a pitch-by-pitch plays list), a traditional scorebook
  // (see scorebook.js) and the win-probability chart; the clock-based
  // lead/score flow charts don't apply.
  chartModes: ['plays', 'scorebook', 'winProb'],
  defaultChartMode: 'plays',
  // Win expectancy changes at discrete plays, so draw the chart as steps.
  winProbStepped: true,
  // Shrink the win-prob chart to match the plays tab's minimum height
  // (.plays-wrapper's min-height, in shared/index.css) so switching
  // between MLB's two tabs doesn't resize short half-innings.
  chartHeight: 260,
  // ESPN's scoreboard, standings and teams endpoints all use the same MLB
  // abbreviations, so no remapping is needed.
  translateTeamCode(code) {
    return code === 'TBD' ? null : code;
  },
  // Official MLB cap logos (SVG) rather than ESPN's PNGs, matching how NBA/WNBA
  // pull from their own league CDNs. Cap marks stay legible at the 20-40px the
  // scoreboard renders them at; the "primary" variants are full roundels and
  // wordmarks that turn to mush that small. teamId is the MLB Stats API id
  // (see data/teams.js).
  teamLogoURL(tricode, mode) {
    const id = this.teams[tricode] && this.teams[tricode].teamId;
    if (!id) return '';
    const variant = mode === 'D' ? 'on-dark' : 'on-light';
    return `https://www.mlbstatic.com/team-logos/team-cap-${variant}/${id}.svg`;
  },
  scoreboardURL(dateBasic) {
    return `https://site.web.api.espn.com/apis/site/v2/sports/baseball/${this.slug}/scoreboard?region=us&lang=en&contentorigin=espn&limit=100&calendartype=offdays&dates=${dateBasic}&tz=America%2FNew_York`;
  },
  // level=3 groups standings by division (children[conference].children[division])
  // instead of just by conference — needed for the Divisional/Wild Card tabs
  // (see shared/js/standings.js).
  standingsURL() {
    return `https://site.api.espn.com/apis/v2/sports/baseball/${this.slug}/standings?level=3`;
  },
  summaryURL(eventId) {
    return `https://site.api.espn.com/apis/site/v2/sports/baseball/${this.slug}/summary?event=${eventId}`;
  },

  // ---- Win-probability chart axis (innings instead of a game clock) ----
  // ESPN emits a play for every pitch; the win-probability chart should step
  // once per plate appearance. Each winprobability entry is one completed plate
  // appearance, so keep only the plays that carry a win-probability value
  // (this also drops mid-at-bat baserunning "Play Result" plays like steals).
  selectChartPlays(plays, winprobability) {
    const wpPlayIds = new Set((winprobability || []).map(wp => wp.playId));
    return plays.filter(p => wpPlayIds.has(p.id));
  },
  // Each inning occupies one x-unit. Plays are spread evenly within their
  // inning so the line reads left-to-right like the NBA chart.
  elapsedForPlays(plays) {
    const counts = {};
    plays.forEach(p => {
      const n = (p.period && p.period.number) || 1;
      counts[n] = (counts[n] || 0) + 1;
    });
    const seen = {};
    return plays.map(p => {
      const n = (p.period && p.period.number) || 1;
      const j = seen[n] || 0;
      seen[n] = j + 1;
      return (n - 1) + (j + 0.5) / counts[n];
    });
  },
  // Vertical gridlines at inning boundaries (1, 2, ... maxInning-1). Always
  // covers a full regulation game so the axis reads 1-9 even before the game
  // has reached the later innings.
  periodGridTimes(maxPeriod) {
    const total = Math.max(maxPeriod, this.regulationPeriods);
    const times = [];
    for (let i = 1; i < total; i++) times.push(i);
    return times;
  },
  // Top/bottom-of-inning labels (T1, B1, T2, B2, ...), each centered within
  // its half of the inning. While the game is still being played, stop at
  // the half-inning currently in progress instead of pre-labeling the rest
  // of the game — full regulation is only shown once the game has reached it
  // (or is over).
  periodLabels(maxPeriod, maxTime, playing, currentHalf) {
    const total = playing ? maxPeriod : Math.max(maxPeriod, this.regulationPeriods);
    const labels = [];
    for (let i = 1; i <= total; i++) {
      labels.push({ time: i - 0.75, label: `T${i}` });
      // The bottom half of the current (live) inning hasn't started yet
      // unless we're actually in it.
      if (!playing || i < maxPeriod || currentHalf === 'Bot') {
        labels.push({ time: i - 0.25, label: `B${i}` });
      }
    }
    return labels;
  },

  // ---- Line score: runs-by-inning table with R/H/E totals, shown atop the
  // plays tab as its half-inning picker. Baseball-only shape (no other league
  // defines this hook, so its fetch-time parsing is skipped for NBA/WNBA). ----
  // competitors is the summary endpoint's header.competitions[0].competitors
  // (each has a per-inning linescores array plus score/hits/errors totals).
  processLineScore(competitors, playing, awayAbbr, homeAbbr) {
    const away = competitors.find(c => c.homeAway === 'away');
    const home = competitors.find(c => c.homeAway === 'home');
    if (!away || !home) return null;

    const rawMaxInnings = Math.max(
      (away.linescores || []).length,
      (home.linescores || []).length
    );
    if (rawMaxInnings === 0) return null;

    // While the game's still in progress, pad the table out to a full
    // regulation-length game so the remaining innings show up as blank
    // columns instead of the table growing inning by inning.
    const maxInnings = playing ? Math.max(rawMaxInnings, this.regulationPeriods) : rawMaxInnings;

    const innings = [];
    for (let i = 1; i <= maxInnings; i++) innings.push(i);

    const columns = [
      { key: 'r', label: 'R', class: 'line-score-total line-score-runs' },
      { key: 'h', label: 'H', class: 'line-score-total' },
      { key: 'e', label: 'E', class: 'line-score-total' }
    ];

    const buildRow = (comp, abbr) => {
      const ls = comp.linescores || [];
      const runs = [];
      // Once the game's over, a missing inning is one that was never played
      // (the home team leading after the top of the last inning): show a
      // hyphen. While live, missing innings are just still to come.
      const unplayed = playing ? '' : '-';
      for (let i = 0; i < maxInnings; i++) runs.push(ls[i] ? ls[i].displayValue : unplayed);
      return {
        abbr: abbr,
        runs: runs,
        totals: {
          r: comp.score != null ? String(comp.score) : '',
          h: comp.hits != null ? String(comp.hits) : '',
          e: comp.errors != null ? String(comp.errors) : ''
        }
      };
    };

    // Away team on top, home team on the bottom.
    return {
      innings: innings,
      columns: columns,
      rows: [
        buildRow(away, awayAbbr),
        buildRow(home, homeAbbr)
      ]
    };
  },

  // ---- Plays: plate appearances grouped by half-inning, each expandable to
  // its pitches. Baseball-only (no other league defines this hook, so the
  // plays tab is skipped for NBA/WNBA). ----
  // ESPN's summary `plays` is a flat, chronological list: every play carries
  // the atBatId of the plate appearance it belongs to. Within one PA you get
  // any pre-PA notes (pitching changes, pinch hitters), a start-batterpitcher
  // play, one play per pitch (summaryType 'P'), mid-PA events (steals, wild
  // pitches) and finally the batter's result — the only play-result that
  // carries `bats`. Half-inning boundary plays (start/end-inning) are skipped.
  processPlays(plays, playing, awayAbbr, homeAbbr) {
    const halves = [];
    const halfByKey = {};
    let pa = null;

    // Runners on base as of this play (the batter's result play carries the
    // state after the PA; pitch plays carry the state going into the pitch).
    const basesOf = play => ({ first: !!play.onFirst, second: !!play.onSecond, third: !!play.onThird });

    // Statcast-style call buckets for the pitch dot: ball, strike, in play.
    const pitchKind = type => {
      if (type.startsWith('ball') || type === 'hit-by-pitch') return 'ball';
      if (type.startsWith('strike') || type === 'foul-ball' || type === 'bunted-foul') return 'strike';
      return 'inplay';
    };

    plays.forEach(play => {
      const period = play.period || {};
      const half = period.type;
      if (half !== 'Top' && half !== 'Bottom') return;
      const type = (play.type && play.type.type) || '';
      if (type === 'start-inning' || type === 'end-inning' || type === 'end-batterpitcher') return;

      const key = `${half}-${period.number}`;
      let group = halfByKey[key];
      if (!group) {
        group = {
          key: key,
          inning: period.number,
          half: half,
          battingAbbr: half === 'Top' ? awayAbbr : homeAbbr,
          items: []
        };
        halfByKey[key] = group;
        halves.push(group);
        pa = null;
      }

      if (type === 'start-batterpitcher') {
        const m = /^(.*) pitches to (.*)$/.exec(play.text || '');
        if (pa && pa.id === play.atBatId) {
          // Pitching change mid-PA: ESPN restarts the matchup under the same
          // atBatId, so keep the PA and just update who's pitching.
          if (m) pa.pitcher = m[1];
          return;
        }
        pa = {
          kind: 'pa',
          id: play.atBatId,
          pitcher: m ? m[1] : '',
          batter: m ? m[2] : '',
          batOrder: play.batOrder || null,
          matchup: play.text || '',
          result: null,
          scoring: false,
          scoreText: '',
          outs: play.outs || 0,
          bases: basesOf(play),
          count: { balls: 0, strikes: 0 },
          pitches: 0,
          events: [],
          notes: []
        };
        group.items.push(pa);
        return;
      }

      const inPA = pa && pa.id === play.atBatId;

      if (play.summaryType === 'P') {
        if (!inPA) return;
        const kind = pitchKind(type);
        const rc = play.resultCount || {};
        const terminal = kind === 'inplay' || rc.balls >= 4 || rc.strikes >= 3 || type === 'hit-by-pitch';
        const pt = play.pitchType;
        pa.pitches++;
        pa.bases = basesOf(play);
        pa.count = { balls: Math.min(rc.balls || 0, 3), strikes: Math.min(rc.strikes || 0, 2) };
        pa.events.push({
          kind: 'pitch',
          id: play.id,
          num: play.atBatPitchNumber,
          call: (play.type && play.type.text) || '',
          pitchKind: kind,
          pitch: pt ? pt.text : '',
          velo: play.pitchVelocity ? `${play.pitchVelocity}` : '',
          count: terminal ? '' : `${rc.balls || 0}-${rc.strikes || 0}`
        });
        return;
      }

      if (type !== 'play-result') {
        // Steals, wild pitches, pickoffs, ... are each followed by a
        // play-result with the same text; use that one instead.
        return;
      }

      // The batter's own result.
      if (inPA && play.bats) {
        pa.result = play.text;
        pa.outs = play.outs || 0;
        // On the inning-ending play ESPN keeps the runners who were stranded,
        // which is handy to see, so leave them.
        pa.bases = basesOf(play);
        if (play.scoringPlay) {
          pa.scoring = true;
          pa.scoreText = `${awayAbbr} ${play.awayScore}, ${homeAbbr} ${play.homeScore}`;
        }
        return;
      }

      const note = { kind: 'note', id: play.id, text: play.text, scoring: !!play.scoringPlay };
      if (play.scoringPlay) note.scoreText = `${awayAbbr} ${play.awayScore}, ${homeAbbr} ${play.homeScore}`;
      if (inPA) {
        pa.bases = basesOf(play);
        // Mid-PA event: show in the pitch sequence and under the result.
        pa.events.push(note);
        pa.notes.push(note);
      } else {
        // Before the PA's matchup starts (pitching change, pinch hitter, ...).
        group.items.push(note);
      }
    });

    if (halves.length === 0) return null;

    // The last PA of a live game is the one in progress.
    const lastHalf = halves[halves.length - 1];
    const lastItems = lastHalf.items.filter(i => i.kind === 'pa');
    const lastPA = lastItems[lastItems.length - 1];
    if (playing && lastPA && !lastPA.result) lastPA.inProgress = true;

    return { halves: halves, current: lastHalf.key };
  },

  // ---- Box score: batting + pitching tables, rendered generically from the
  // ESPN statistics group labels (matches espn.com's MLB box score). ----
  boxScore: {
    generic: true,
    playerLabels: { Pitching: 'Pitchers', default: 'Hitters' }
  },

  // ---- Broadcasts: baseball has no "League Pass"; fall back to local TV. ----
  parseBroadcast(broadcasts) {
    const lower = m => (m || '').toLowerCase();
    const national = broadcasts.find(bc => lower(bc.market) === 'national');
    const localNetworks = broadcasts
      .filter(bc => lower(bc.market) === 'home' || lower(bc.market) === 'away')
      .flatMap(bc => bc.names);
    if (national) {
      return { primary: national.names[0], hasLocal: localNetworks.length > 0, localNetworks };
    }
    // No national broadcast: show the first local network, list the rest.
    return {
      primary: localNetworks[0] || '',
      hasLocal: localNetworks.length > 1,
      localNetworks: localNetworks.slice(1)
    };
  },

  // ---- Pre-game has no team shooting stats; the probable pitchers are shown
  // instead. No parseTeamStats override needed — the default getTeamStats
  // (shared/js/espn.js) returns null itself when none of its basketball-
  // specific fields are present on competitor.statistics, which is always
  // true for baseball. ----

  // ---- Probable starting pitcher, shown pre-game in place of team stats. ----
  parseProbable(competitor) {
    const probables = competitor.probables;
    if (!probables || !probables.length) return null;
    const probable = probables.find(p => p.name === 'probableStartingPitcher') || probables[0];
    const athlete = probable && probable.athlete;
    if (!athlete) return null;
    const stat = name => {
      const s = probable.statistics && probable.statistics.find(s => s.name === name);
      return s ? s.displayValue : null;
    };
    const wins = stat('wins');
    const losses = stat('losses');
    const era = stat('ERA');
    const parts = [];
    if (wins != null && losses != null) parts.push(`${wins}-${losses}`);
    if (era != null) parts.push(`${era} ERA`);
    return {
      name: athlete.shortName || athlete.displayName,
      line: parts.join(', ')
    };
  },

  // ---- Leaders: batting average, home runs, RBIs. ----
  parseLeaders(competitor) {
    if (!competitor.leaders) return null;
    const find = name => {
      const cat = competitor.leaders.find(l => l.name === name);
      const top = cat && cat.leaders && cat.leaders[0];
      return top ? { name: top.athlete.shortName, value: top.displayValue } : null;
    };
    const leaders = { avg: find('avg'), homeRuns: find('homeRuns'), rbi: find('RBIs') };
    return (leaders.avg || leaders.homeRuns || leaders.rbi) ? leaders : null;
  },
  formatLeaders(leaders) {
    if (!leaders) return [];
    const byPlayer = new Map();
    const add = entry => {
      if (!entry) return;
      if (!byPlayer.has(entry.name)) byPlayer.set(entry.name, entry.value);
    };
    // A single "best hitter" line already summarises the game (e.g. "2-4, HR, 2 RBI").
    add(leaders.avg);
    add(leaders.homeRuns);
    add(leaders.rbi);
    return Array.from(byPlayer.entries()).map(([name, stats]) => ({ name, stats }));
  }
}
