// initialize sort keys
rounds.forEach(round => round.matchups.forEach(matchup => matchup.scheduleSortKey = scheduleSortKey(matchup)))
rounds.forEach(round => round.matchups.forEach(matchup => matchup.nextGameSortKey = nextGameSortKey(matchup)))

var roundStarts = rounds.filter(r => r.startDate !== null)
                        .map(r => DateTime.fromISO(r.startDate, {zone: 'America/Los_Angeles'}))
var startFetchDate = DateTime.min(...roundStarts)

var roundEnds = rounds.filter(r => r.endDate !== null)
                      .map(r => DateTime.fromISO(r.endDate, {zone: 'America/Los_Angeles'}))
var endFetchDate = DateTime.max(...roundEnds)

var todayGames = []

function fetchAll() {
  var thisFetchDate = startFetchDate
  while (thisFetchDate <= endFetchDate) {
    fetchGamesForDate(thisFetchDate);
    thisFetchDate = thisFetchDate.plus({days: 1});
  }
}
fetchAll()

function refreshToday(lastRefreshDate) {
  var todayGamesDate = DateTime.now().setZone('America/Los_Angeles').startOf('day')
  var thisDate = lastRefreshDate
  while (thisDate <= todayGamesDate) {
    console.log(`refreshing ${thisDate.toISODate()}`)
    fetchGamesForDate(thisDate)
    thisDate = thisDate.plus({days: 1})
  }
}

function fetchGamesForDate(date) {
  var dateString = date.toISODate()
  var endpointDate = date.toISODate({format: 'basic'})
  var url = 'https://site.web.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard?region=us&lang=en&contentorigin=espn&limit=100&calendartype=offdays&includeModules=videos&dates=' + endpointDate + '&tz=America%2FNew_York&buyWindow=1m&showAirings=live&showZipLookup=true'

  jQuery.getJSON(url, function (data) {
    const now = DateTime.now().setZone('America/Los_Angeles')
    var possibleRefreshTimes = []
    var gameFinished = false
    var isToday = dateString == now.toISODate()
    if (isToday) {
      possibleRefreshTimes.push(now.plus({days: 1}).startOf('day'))
      todayGames.length = 0
    }
    data.events.forEach(function(event) {
      eventData = parseEvent(event);

      if (isToday) {
        todayGames.push(eventData)
      }
      // find the round
      round = rounds.find(r => r.number === eventData.round)
      if (round !== undefined) {

        // Update round start and end
        if (round.startDate === null || round.startDate > dateString) {
          round.startDate = dateString
        }
        if (round.endDate === null || round.endDate < dateString) {
          round.endDate = dateString
        }

        // find the matchup
        matchup = round.matchups.find(matchup =>
          (matchup.favorite === eventData.homeTeam || matchup.favorite === eventData.awayTeam) &&
          (matchup.underdog === eventData.homeTeam || matchup.underdog === eventData.awayTeam)
        )
        if (matchup === null || matchup === undefined) {
          var id = seriesIdForRoundAndTeam(eventData.round, eventData.homeTeam)
          matchup = round.matchups.find(matchup => Number(matchup.id) === id )
        }
        if (matchup !== undefined) {
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
          if (matchup.invisible && matchup.favorite !== null && matchup.underdog !== null) {
            matchup.invisible = false
          }
          // find the game
          g = matchup.games[gameNum - 1]
          // fill the start date and time
          if (g.date === null) {
            g.date = dateString
            matchup.scheduleSortKey = scheduleSortKey(matchup)
          }
          if (g.dateTime === null) {
            g.dateTime = eventData.dateTime
          }
          // fill the network
          g.network = eventData.network;

          // fill the scores, clock, and winner
          var priorState = g.state
          g.state = eventData.state
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
              possibleRefreshTimes.push(DateTime.now().plus({seconds: 5}))
            } else if (g.state === 'post') { // game finished
              if (eventData.awayScore > eventData.homeScore) {
                g.winner = eventData.awayTeam
              } else {
                g.winner = eventData.homeTeam
              }
              if (priorState && priorState !== 'post') {
                gameFinished = true
              }
            }
          } else { // game in future
            if (isToday && g.dateTime) possibleRefreshTimes.push(g.dateTime)
          }
          // mark as not loading
          g.loading = false

          // update sort keys for this matchup based on new data (game time)
          matchup.scheduleSortKey = scheduleSortKey(matchup)
          matchup.nextGameSortKey = nextGameSortKey(matchup)
        }
      }
    })

    if (gameFinished) {
      // New games tend to get scheduled when a series finishes,
      // so when a game has just finished refetch everything.
      console.log('game finished, refreshing all')
      fetchAll()
    } else if (possibleRefreshTimes.length > 0) {
      refreshTime = DateTime.min(...possibleRefreshTimes)
      milliseconds = refreshTime.diffNow().milliseconds
      console.log(`set refresh of ${date.toISODate()} at ${refreshTime} in ${milliseconds} ms`)
      setTimeout(refreshToday, milliseconds, date)
    }
  })
}
