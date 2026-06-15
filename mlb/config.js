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
  // Baseball only gets the win-probability chart; the clock-based lead/score
  // flow charts don't apply.
  chartModes: ['winProb'],
  defaultChartMode: 'winProb',
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
  // Vertical gridlines at inning boundaries (1, 2, ... maxInning-1).
  periodGridTimes(maxPeriod) {
    const times = [];
    for (let i = 1; i < maxPeriod; i++) times.push(i);
    return times;
  },
  // Inning-number labels centered within each inning.
  periodLabels(maxPeriod) {
    const labels = [];
    for (let i = 1; i <= maxPeriod; i++) labels.push({ time: i - 0.5, label: String(i) });
    return labels;
  },
  // Don't stretch a live game's axis to the 9th inning; end at the latest play.
  liveMaxTime(maxPeriod, lastDataTime) {
    return lastDataTime;
  },

  // ---- Box score: batting + pitching tables, rendered generically from the
  // ESPN statistics group labels (matches espn.com's MLB box score). ----
  boxScore: { generic: true },

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
  // instead (see espn.js getProbablePitcher), so suppress the team-stats table. ----
  parseTeamStats() {
    return null;
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
