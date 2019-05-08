function datediff(first, second) {
    // Take the difference between the dates and divide by milliseconds per day.
    // Round to nearest whole number to deal with DST.
    return Math.round((second-first)/(1000*60*60*24));
}

function scheduleSortKey(matchup) {
  return matchup.games.map(g => g.date).join()
}

function nextGameSortKey(matchup) {
  var games = matchup.games.filter(g => (g.winner == null && g.loading != true))
  if (games === undefined || games === null || games.length === 0) return `z${scheduleSortKey(matchup)}`
  return `x${games.map(g => g.timeUTC).join()}`
}

function underdogHome(n) {
  switch (n) {
    case 3:
    case 4:
    case 6:
      return true
    default:
      return false
  }
}

function periodName(n) {
  if (n <= 4) {
    return 'Q' + n
  } else if (n == 5) {
    return 'OT'
  } else {
    return 'OT' + (n - 4)
  }
}

function timeZoneName(date) {
  var regex = /\((.+)\)/
  var result = regex.exec(date.toString())
  if (result) {
    return result[1]
  }
}
