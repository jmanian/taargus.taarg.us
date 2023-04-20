// initialize sort keys
rounds.forEach(round => round.matchups.forEach(matchup => matchup.scheduleSortKey = scheduleSortKey(matchup)))
rounds.forEach(round => round.matchups.forEach(matchup => matchup.nextGameSortKey = nextGameSortKey(matchup)))

var date = rounds.map(r => new Date(r.startDate + 'T12:00:00-04:00')).reduce((r, current) => r < current ? r : current)
var endDate = rounds.map(r => new Date(r.endDate + 'T13:00:00-04:00')).reduce((r, current) => r > current ? r : current)

var todayGames = []
var now = new Date();
var utc = now.getTime() + (now.getTimezoneOffset() * 60000);
var pt = new Date(utc + (3600000*(-7)));

while (date < endDate) {
  var endpointDate = date.toISOString().split('T', 1)[0].split('-').join('')
  var url = 'https://site.web.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard?region=us&lang=en&contentorigin=espn&limit=100&calendartype=offdays&includeModules=videos&dates=' + endpointDate + '&tz=America%2FNew_York&buyWindow=1m&showAirings=live&showZipLookup=true'
  jQuery.getJSON(url, function (data) {
    data.events.forEach(function(event) {
      eventData = parseEvent(event);

      if (new Date(eventData.timeUTC).toDateString() === pt.toDateString()) {
        // todayGames.push(game)
      }
      // find the round
      round = rounds.find(r => r.number === eventData.round)
      if (round !== undefined) {
        // find the matchup
        matchup = round.matchups.find(matchup =>
          (matchup.favorite === eventData.homeTeam || matchup.favorite === eventData.awayTeam) &&
          (matchup.underdog === eventData.homeTeam || matchup.underdog === eventData.awayTeam)
        )
        if (matchup != undefined) {
          var gameNum = eventData.gameNum
          // fill some matchup data

          // Set teams and seeds
          if (matchup.favorite === null || matchup.underdog === null) {
            if (underdogHome(gameNum)) {
              matchup.favorite = eventData.awayTeam
              matchup.underdog = eventData.homeTeam
            } else {
              matchup.favorite = eventData.homeTeam
              matchup.underdog = eventData.awayTeam
            }
          }

          //
          if (matchup.invisible && matchup.favorite != null && matchup.underdog != null) {
            matchup.invisible = false
          }
          // find the game
          g = matchup.games[gameNum - 1]
          // fill the start date and time
          if (g.date === null) {
            g.date = eventData.date
            matchup.scheduleSortKey = scheduleSortKey(matchup)
          }
          if (g.timeUTC === null) {
            g.timeUTC = eventData.timeUTC
          }
          // fill the network
          g.network = eventData.network;

          // fill the scores, clock, and winner
          g.state = eventData.state // this is an object
          g.statusDetail = eventData.statusDetail
          if (g.state !== 'pre') { // game started
            if (underdogHome(gameNum)) {
              g.fscore = eventData.awayScore
              g.uscore = eventData.homeScore
            } else {
              g.fscore = eventData.homeScore
              g.uscore = eventData.awayScore
            }
            if (g.state === 'in') { // game ongoing
              g.clock = eventData.clock;
            } else if (g.state === 'post') { // game finished
              if (eventData.awayScore > eventData.homeScore) {
                g.winner = eventData.awayTeam
              } else {
                g.winner = eventData.homeTeam
              }
            }
          }
          // mark as not loading
          g.loading = false

          // update sort keys for this matchup based on new data (game time)
          matchup.scheduleSortKey = scheduleSortKey(matchup)
          matchup.nextGameSortKey = nextGameSortKey(matchup)
        }
      }
    })
  })
  date.setDate(date.getDate() + 1)
}
