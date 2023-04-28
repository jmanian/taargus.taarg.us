var DateTime = luxon.DateTime;

function m(id, c, f, u, gs) {
  var numMissing = 7 - gs.length
  for (i = 0; i < numMissing; i++) {
    gs.push(null)
  }
  var invisible = f === null || u === null
  return {
    id: id,
    conference: c,
    favorite: f,
    underdog: u,
    fseed: seeds[f],
    useed: seeds[u],
    invisible: invisible,
    scheduleSortKey: null,
    nextGameSortKey: null,
    games: gs.map(g => makeGame(g))
  }
}

function makeGame(date) {
  return {
    date: date,
    dateTime: null,
    network: null,
    winner: null,
    fscore: null,
    uscore: null,
    clock: null,
    period: null,
    loading: true,
    state: null,
    statusDetail: null
  }
}

function seriesIdForRoundAndTeam(round, team) {
  const seed = seeds[team]
  const conference = conferenceForTeam(team)
  switch (round) {
    case 1:
      switch(conference) {
        case 'west':
          switch(seed) {
            case 1:
            case 8:
              return 10;
            case 2:
            case 7:
              return 11;
            case 3:
            case 6:
              return 12;
            case 4:
            case 5:
              return 13;
          }
        case 'east':
          switch(seed) {
            case 1:
            case 8:
              return 14;
            case 2:
            case 7:
              return 15;
            case 3:
            case 6:
              return 16;
            case 4:
            case 5:
              return 17;
          }
      }
    case 2:
      switch(conference) {
        case 'west':
          switch(seed) {
            case 1:
            case 8:
            case 4:
            case 5:
              return 20;
            case 2:
            case 7:
            case 3:
            case 6:
              return 21;
          }
        case 'east':
          switch(seed) {
            case 1:
            case 8:
            case 4:
            case 5:
              return 22;
            case 2:
            case 7:
            case 3:
            case 6:
              return 23;
          }
      }
    case 3:
      switch(conference) {
        case 'west':
          return 30;
        case 'east':
          return 31;
      }
    case 4:
      return 40;
  }
}

function conferenceForTeam(team) {
  switch(team) {
    case 'ATL':
    case 'BKN':
    case 'BOS':
    case 'CHA':
    case 'CHI':
    case 'CLE':
    case 'DET':
    case 'IND':
    case 'MIA':
    case 'MIL':
    case 'NYK':
    case 'ORL':
    case 'PHI':
    case 'TOR':
    case 'WAS':
      return 'east';
    case 'DAL':
    case 'DEN':
    case 'GSW':
    case 'HOU':
    case 'LAC':
    case 'LAL':
    case 'MEM':
    case 'MIN':
    case 'NOP':
    case 'OKC':
    case 'PHX':
    case 'POR':
    case 'SAC':
    case 'SAS':
    case 'UTA':
      return 'west';
  }
}

function datediff(first, second) {
  // Assumes the dates are set to the right zones and time components
  return second.startOf('day').diff(first.startOf('day'), 'day').days
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
  return games.map(g => g.dateTime.toUTC() || g.date || 'z').join()
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
  var expires = "expires="+ DateTime.now().plus({hours: exdays * 24}).toHTTP();
  var cookie = cname + "=" + cvalue + ";" + expires + ";path=/"
  console.log(`setCookie: ${cookie}`)
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
