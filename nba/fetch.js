var date = rounds.map(r => new Date(r.startDate + 'T12:00:00-04:00')).reduce((r, current) => r < current ? r : current)
var endDate = rounds.map(r => new Date(r.endDate + 'T13:00:00-04:00')).reduce((r, current) => r > current ? r : current)

while (date < endDate) {
  var endpointDate = date.toISOString().split('T', 1)[0].split('-').join('')
  var url = 'https://m95xx07048.execute-api.us-east-1.amazonaws.com/prod/games/' + endpointDate
  jQuery.getJSON(url, function (data) {
    data.games.forEach(function(game) {
      // find the round
      round = rounds.find(r => r.number == Number(game.playoffs.roundNum))
      if (round != undefined) {
        // find the matchup
        matchup = round.matchups.find(matchup => matchup.id == game.playoffs.seriesId)
        if (matchup != undefined) {
          // fill some matchup data
          var seeda = Number(game.playoffs.vTeam.seedNum)
          var seedb = Number(game.playoffs.hTeam.seedNum)
          matchup.fseed = Math.min(seeda, seedb)
          matchup.useed = Math.max(seeda, seedb)
          // find the game
          g = matchup.games[Number(game.playoffs.gameNumInSeries) - 1]
          // mark as not loading
          g.loading = null
          // fill the start date
          g.date = [game.startDateEastern.substr(0, 4), game.startDateEastern.substr(4, 2), game.startDateEastern.substr(6)].join('-')
          // fill the start time
          if (game.startTimeEastern != '') {
            g.time = game.startTimeEastern.split(' ', 1)[0]
          }
          // fill the network
          var broadcaster = game.watch.broadcast.broadcasters.national[0]
          if (broadcaster != undefined) g.network = broadcaster.shortName

          // fill the scores, clock, and winner
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
              g.period = game.period // this is an object
            } else if (game.statusNum == 3) { // game finished
              if (vscore > hscore) {
                g.winner = game.vTeam.triCode
              } else {
                g.winner = game.hTeam.triCode
              }
            }
          }
        }
      }
    })
  })
  date.setDate(date.getDate() + 1)
}
