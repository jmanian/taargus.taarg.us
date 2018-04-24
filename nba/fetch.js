var date = new Date(rounds[0].startDate + 'T12:00:00-04:00')
var endDate = new Date(rounds[rounds.length-1].endDate + 'T13:00:00-04:00')

while (date < endDate) {
  var endpointDate = date.toISOString().split('T', 1)[0].split('-').join('')
  var url = 'https://m95xx07048.execute-api.us-east-1.amazonaws.com/prod/games/' + endpointDate
  jQuery.getJSON(url, function (data) {
    data.games.forEach(function(game) {
      round = rounds[Number(game.playoffs.roundNum) - 1]
      matchup = round.matchups.find(function(matchup) {
        return matchup.id == game.playoffs.seriesId
      })
      var seeda = Number(game.playoffs.vTeam.seedNum)
      var seedb = Number(game.playoffs.hTeam.seedNum)
      matchup.fseed = Math.min(seeda, seedb)
      matchup.useed = Math.max(seeda, seedb)
      g = matchup.games[Number(game.playoffs.gameNumInSeries) - 1]
      if (game.startTimeEastern != '') {
        g.time = game.startTimeEastern.split(' ', 1)[0]
      }
      var broadcaster = game.watch.broadcast.broadcasters.national[0]
      if (broadcaster != undefined) g.network = broadcaster.shortName
      if (game.vTeam.score != '' && game.hTeam.score != '') {
        if (Number(game.vTeam.score) > Number(game.hTeam.score)) {
          g.winner = game.vTeam.triCode
        } else {
          g.winner = game.hTeam.triCode
        }
      }
    })
  })
  date.setDate(date.getDate() + 1)
}
