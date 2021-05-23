console.log(document.cookie)
document.cookie = `test=foo;`
console.log(document.cookie)

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
  var url = 'https://m95xx07048.execute-api.us-east-1.amazonaws.com/prod/games/' + endpointDate
  jQuery.getJSON(url, function (data) {
    data.games.forEach(function(game) {
      if (Number(game.startDateEastern.substr(0, 4)) == pt.getFullYear() && Number(game.startDateEastern.substr(4, 2)) == pt.getMonth() + 1 && Number(game.startDateEastern.substr(6, 2)) == pt.getDate()) {
        todayGames.push(game)
      }
      // find the round
      round = rounds.find(r => r.number == Number(game.playoffs.roundNum))
      if (round != undefined) {
        // find the matchup
        matchup = round.matchups.find(matchup => matchup.id == game.playoffs.seriesId)
        if (matchup != undefined) {
          var gameNum = Number(game.playoffs.gameNumInSeries)
          // fill some matchup data
          if (matchup.favorite == null || matchup.underdog == null || matchup.fseed == null || matchup.useed == null) {
            if (underdogHome(gameNum)) {
              matchup.favorite = game.vTeam.triCode
              matchup.underdog = game.hTeam.triCode
              var fseed = Number(game.playoffs.vTeam.seedNum)
              var useed = Number(game.playoffs.hTeam.seedNum)
            } else {
              matchup.favorite = game.hTeam.triCode
              matchup.underdog = game.vTeam.triCode
              var fseed = Number(game.playoffs.hTeam.seedNum)
              var useed = Number(game.playoffs.vTeam.seedNum)
            }
            // Some game data doesn't have the seeds filled in
            if (fseed > 0) {
              matchup.fseed = fseed
            }
            if (useed > 0) {
              matchup.useed = useed
            }
          }
          if (matchup.invisible && matchup.favorite != null && matchup.underdog != null) {
            matchup.invisible = false
          }
          // find the game
          g = matchup.games[gameNum - 1]
          // fill the start date
          if (g.date == null) {
            g.date = [game.startDateEastern.substr(0, 4), game.startDateEastern.substr(4, 2), game.startDateEastern.substr(6)].join('-')
            matchup.scheduleSortKey = scheduleSortKey(matchup)
          }
          // fill the start time
          if (game.startTimeEastern != '') {
            g.time = game.startTimeEastern.split(' ', 1)[0]
            g.timeUTC = game.startTimeUTC
          }
          // fill the network
          var broadcaster = game.watch.broadcast.broadcasters.national[0]
          if (broadcaster != undefined) g.network = broadcaster.shortName

          // fill the scores, clock, and winner
          g.period = game.period // this is an object
          if (game.statusNum > 1) { // game started
            var vscore = Number(game.vTeam.score)
            var hscore = Number(game.hTeam.score)
            var n = game.playoffs.gameNumInSeries
            if (n == '3' || n == '4' || n == '6') {
              g.fscore = vscore
              g.uscore = hscore
            } else {
              g.fscore = hscore
              g.uscore = vscore
            }
            if (game.statusNum == 2) { // game ongoing
              g.clock = game.clock
            } else if (game.statusNum == 3) { // game finished
              if (vscore > hscore) {
                g.winner = game.vTeam.triCode
              } else {
                g.winner = game.hTeam.triCode
              }
            }
          }
          // mark as not loading
          g.loading = null

          // update sort keys for this matchup based on new data (game time)
          matchup.scheduleSortKey = scheduleSortKey(matchup)
          matchup.nextGameSortKey = nextGameSortKey(matchup)
        }
      }
    })
  })
  date.setDate(date.getDate() + 1)
}
