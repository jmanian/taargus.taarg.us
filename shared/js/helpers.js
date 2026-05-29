const DateTime = luxon.DateTime;

function teamImageURL(tricode, mode = 'L') {
  if (!tricode || !LEAGUE.teams[tricode]) {
    return '';
  }
  return LEAGUE.teamLogoURL(tricode, mode);
}

function teamId(tricode) {
  if (!tricode || !LEAGUE.teams[tricode]) {
    return null;
  }
  return LEAGUE.teams[tricode].teamId;
}

// Convert a (period, clock) pair into total seconds elapsed in the game.
// `clock` is the remaining time in the current period, formatted as
// "mm:ss", "ss.t", or "0.0". Used to compare freshness across data sources.
function clockToElapsedSeconds(period, clock) {
  if (!period) return 0;

  let minutes = 0;
  let seconds = 0;
  const str = clock == null ? '0:00' : String(clock);
  if (str.includes(':')) {
    const parts = str.split(':');
    minutes = parseInt(parts[0]) || 0;
    seconds = parseFloat(parts[1]) || 0;
  } else {
    seconds = parseFloat(str) || 0;
  }
  const remaining = minutes * 60 + seconds;

  if (period <= LEAGUE.regulationPeriods) {
    const secondsIntoQuarter = LEAGUE.periodSeconds - remaining;
    return ((period - 1) * LEAGUE.periodSeconds) + secondsIntoQuarter;
  }
  const secondsIntoOT = LEAGUE.otSeconds - remaining;
  return (LEAGUE.regulationPeriods * LEAGUE.periodSeconds)
    + ((period - LEAGUE.regulationPeriods - 1) * LEAGUE.otSeconds)
    + secondsIntoOT;
}
