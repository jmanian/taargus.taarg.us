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
  return 'https://cdn.nba.net/assets/logos/teams/secondary/web/' + tricode + '.svg'
}

// Cookie functions from https://www.w3schools.com/js/js_cookies.asp

function setCookie(cname, cvalue, exdays) {
  var d = new Date();
  d.setTime(d.getTime() + (exdays*24*60*60*1000));
  var expires = "expires="+ d.toUTCString();
  var cookie = cname + "=" + cvalue + ";" + expires + ";path=/"
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
      return c.substring(name.length, c.length);
    }
  }
  return null;
}
