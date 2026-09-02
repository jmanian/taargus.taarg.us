// Division / Wild Card standings helpers (MLB). Operate on the grouped
// standings response (LEAGUE.standingsURL() requesting ?level=3 for MLB):
// data.children = conferences (AL/NL), each conference's .children =
// divisions (East/Central/West), each division has .standings.entries.
// Unused by NBA/WNBA, whose standingsURL() stays ungrouped.

const DIVISION_ORDER = ['ALE', 'ALC', 'ALW', 'NLE', 'NLC', 'NLW'];

function standingsFindStat(stats, name) {
  return (stats || []).find(s => s.name === name) || null;
}

function standingsStatNumber(stats, name) {
  const stat = standingsFindStat(stats, name);
  return stat && stat.value != null ? stat.value : null;
}

// Divisions in AL East, Central, West, NL East, Central, West order, each
// with its own entries sorted by division rank (division leader first).
function getDivisionStandings(standingsData) {
  const divisions = (standingsData.children || []).flatMap(conf => conf.children || []);
  const byAbbr = {};
  divisions.forEach(div => { byAbbr[div.abbreviation] = div; });

  return DIVISION_ORDER.map(abbr => byAbbr[abbr]).filter(Boolean).map(div => {
    const entries = [...(div.standings?.entries || [])].sort((a, b) => {
      const gbA = standingsStatNumber(a.stats, 'divisionGamesBehind') ?? 0;
      const gbB = standingsStatNumber(b.stats, 'divisionGamesBehind') ?? 0;
      return gbA - gbB;
    });
    const league = div.name.includes('American') ? 'AL' : 'NL';
    return {
      id: div.id,
      shortName: `${league} ${div.name.split(' ').pop()}`,
      entries: entries
    };
  });
}

// Standard "games behind" of a team's record relative to a reference record.
// Positive means the team trails the reference; negative means it leads it.
function gamesBehind(refWins, refLosses, teamWins, teamLosses) {
  return ((refWins - teamWins) + (teamLosses - refLosses)) / 2;
}

function formatWildCardGB(gb) {
  if (gb === 0) return '-';
  return gb < 0 ? `+${Math.abs(gb).toFixed(1)}` : gb.toFixed(1);
}

// Per-league { id, name, abbreviation, leaders, wildCard } groups. Leaders
// are the 3 division winners (playoffSeed 1-3); wildCard is the remaining
// 12 teams (playoffSeed 4+) ranked by seed, each carrying a wcgb string
// relative to the last wild-card-eligible team (pool position 3) — "-" at
// the cutoff, "+N" ahead of it, "N" behind it. Matches mlb.com/standings/wild-card.
function getWildCardStandings(standingsData) {
  return (standingsData.children || []).map(conf => {
    const withSeed = (conf.children || [])
      .flatMap(div => (div.standings?.entries || []).map(entry => ({
        entry: entry,
        divisionAbbr: (div.abbreviation || '').slice(-1),
        seed: standingsStatNumber(entry.stats, 'playoffSeed')
      })))
      .filter(item => item.seed != null)
      .sort((a, b) => a.seed - b.seed);

    const leaders = withSeed.filter(item => item.seed <= 3);
    const pool = withSeed.filter(item => item.seed > 3);

    const cutoff = pool[2] || null;
    const cutoffWins = cutoff ? standingsStatNumber(cutoff.entry.stats, 'wins') : null;
    const cutoffLosses = cutoff ? standingsStatNumber(cutoff.entry.stats, 'losses') : null;

    const wildCard = pool.map((item, index) => {
      let wcgb = '-';
      if (cutoff && item !== cutoff) {
        const wins = standingsStatNumber(item.entry.stats, 'wins');
        const losses = standingsStatNumber(item.entry.stats, 'losses');
        wcgb = formatWildCardGB(gamesBehind(cutoffWins, cutoffLosses, wins, losses));
      }
      return { ...item, wcgb: wcgb, isCutoff: index === 2 };
    });

    return {
      id: conf.id,
      name: conf.name,
      abbreviation: conf.abbreviation,
      leaders: leaders,
      wildCard: wildCard
    };
  });
}
