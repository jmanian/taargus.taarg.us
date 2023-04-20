function m(id, c, f, u, gs) {
  var numMissing = 7 - gs.length
  for (i = 0; i < numMissing; i++) {
    gs.push(null)
  }
  var invisible = f == null || u == null
  return {
    id: id,
    conference: c,
    favorite: f,
    underdog: u,
    fseed: null,
    useed: null,
    invisible: invisible,
    scheduleSortKey: null,
    nextGameSortKey: null,
    games: gs.map(g => makeGame(g))
  }
}

function makeGame(date) {
  return {
    date: date,
    timeUTC: null,
    network: null,
    winner: null,
    fscore: null,
    uscore: null,
    clock: null,
    period: null,
    loading: true,
    state: null
  }
}

function datediff(first, second) {
    // Take the difference between the dates and divide by milliseconds per day.
    // Round to nearest whole number to deal with DST.
    return Math.round((second-first)/(1000*60*60*24));
}

function scheduleSortKey(matchup) {
  // Sort by dates (not times) of all games
  var games = matchup.games
  if (games === undefined || games === null || games.length === 0) return `z-${matchup.id}`
  return games.map(g => g.date || 'z').join()
}

function nextGameSortKey(matchup) {
  // Sort by times of remaining games
  var games = matchup.games
  if (games === undefined || games === null || games.length === 0) return `z-${matchup.id}`
  games = games.filter(g => (g.winner == null && g.loading != true))
  if (games.length === 0) return `y-${scheduleSortKey(matchup)}`
  return games.map(g => g.timeUTC || g.date || 'z').join()
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

function teamImageURL(tricode) {
  // Replace L with D for dark mode versions
  return 'https://cdn.nba.com/logos/nba/' + teamId(tricode) + '/primary/L/logo.svg';
}

function teamId(tricode) {
  return teamData[tricode].teamId;
}

// Extract the relevant national broadcaster(s) from the data.
// Soemtimes TNTOT appears in addition to TNT -- ignore it.
function broadcasterName(broadcasters) {
  if (broadcasters.length > 0) {
    return broadcasters.map(b => b.shortName).filter(n => n !== 'TNTOT').join()
  } else {
    return null
  }
}

// Cookie functions from https://www.w3schools.com/js/js_cookies.asp

function setCookie(cname, cvalue, exdays) {
  var d = new Date();
  d.setTime(d.getTime() + (exdays*24*60*60*1000));
  var expires = "expires="+ d.toUTCString();
  var cookie = cname + "=" + cvalue + ";" + expires + ";path=/"
  // console.log(`setCookie: ${cookie}`)
  document.cookie = cookie;
}

function getCookie(cname) {
  var name = cname + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(';');
  for(var i = 0; i <ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      var cvalue = c.substring(name.length, c.length)
      // console.log(`getCookie: ${cname}=${cvalue}`)
      return cvalue;
    }
  }
  // console.log(`getCookie ${cname}: null`)
  return null;
}
