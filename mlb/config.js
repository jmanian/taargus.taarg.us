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
  // Baseball gets a runs-by-inning line score plus the win-probability chart;
  // the clock-based lead/score flow charts don't apply.
  chartModes: ['lineScore', 'winProb'],
  defaultChartMode: 'lineScore',
  // Win expectancy changes at discrete plays, so draw the chart as steps.
  winProbStepped: true,
  // Shrink the win-prob chart to match the line-score tab's height
  // (.line-score-wrapper's min-height, in shared/index.css) so switching
  // between MLB's two tabs doesn't resize the card.
  chartHeight: 260,
  // ESPN's scoreboard, standings and teams endpoints all use the same MLB
  // abbreviations, so no remapping is needed.
  translateTeamCode(code) {
    return code === 'TBD' ? null : code;
  },
  teamLogoURL(tricode, mode) {
    if (!this.teams[tricode]) return '';
    const abbr = tricode.toLowerCase();
    return mode === 'D'
      ? `https://a.espncdn.com/i/teamlogos/mlb/500-dark/scoreboard/${abbr}.png`
      : `https://a.espncdn.com/i/teamlogos/mlb/500/${abbr}.png`;
  },
  scoreboardURL(dateBasic) {
    return `https://site.web.api.espn.com/apis/site/v2/sports/baseball/${this.slug}/scoreboard?region=us&lang=en&contentorigin=espn&limit=100&calendartype=offdays&dates=${dateBasic}&tz=America%2FNew_York`;
  },
  standingsURL() {
    return `https://site.api.espn.com/apis/v2/sports/baseball/${this.slug}/standings`;
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
  // its half of the inning.
  periodLabels(maxPeriod) {
    const total = Math.max(maxPeriod, this.regulationPeriods);
    const labels = [];
    for (let i = 1; i <= total; i++) {
      labels.push({ time: i - 0.75, label: `T${i}` });
      labels.push({ time: i - 0.25, label: `B${i}` });
    }
    return labels;
  },

  // ---- Line score: runs-by-inning table with R/H/E totals. Baseball-only
  // shape (no other league defines this hook, so the lineScore tab and its
  // fetch-time parsing are both skipped for NBA/WNBA). ----
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
      for (let i = 0; i < maxInnings; i++) runs.push(ls[i] ? ls[i].displayValue : '');
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
