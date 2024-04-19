// initialize sort keys
rounds.forEach(round => round.matchups.forEach(matchup => matchup.scheduleSortKey = scheduleSortKey(matchup)))
rounds.forEach(round => round.matchups.forEach(matchup => matchup.nextGameSortKey = nextGameSortKey(matchup)))

const roundStarts = rounds.filter(r => r.startDate !== null)
                        .map(r => DateTime.fromISO(r.startDate, {zone: 'America/Los_Angeles'}))
const startFetchDate = DateTime.min(...roundStarts)

const roundEnds = rounds.filter(r => r.endDate !== null)
                      .map(r => DateTime.fromISO(r.endDate, {zone: 'America/Los_Angeles'}))
const endFetchDate = DateTime.max(...roundEnds)

const todayGames = []
const refreshDates = {}
const datesMissingSchedules = new Set()
let nowLocal = DateTime.now()

function fetchAll() {
  let thisFetchDate = startFetchDate
  while (thisFetchDate <= endFetchDate) {
    fetchGamesForDate(thisFetchDate);
    thisFetchDate = thisFetchDate.plus({days: 1});
  }
}
fetchAll()
setInterval(refresh, 5000)

function refresh() {
  console.log('beginning refresh')
  nowLocal = DateTime.now()
  for (const dateString in refreshDates) {
    const {refreshTime, date} = refreshDates[dateString]
    // console.log(`should refresh ${dateString} at ${refreshTime}`)
    if (refreshTime.diffNow() <= 0) {
      console.log(`refreshing ${dateString} now`)
      delete refreshDates[dateString]
      fetchGamesForDate(date)
    }
  }
}

function scheduleRefreshOfMissingDates() {
  for (const dateString of datesMissingSchedules) {
    const date = DateTime.fromISO(dateString, {zone: 'America/Los_Angeles'})
    const refreshTime = DateTime.now()
    datesMissingSchedules.delete(dateString)
    console.log(`scheduled refresh of ${dateString} at ${refreshTime} for missing dates`)
    refreshDates[dateString] = {
      refreshTime,
      date
    }
  }
}

function fetchGamesForDate(date) {
  const dateString = date.toISODate()
  delete refreshDates[dateString]
  datesMissingSchedules.delete(dateString)

  const endpointDate = date.toISODate({format: 'basic'})
  const url = 'https://site.web.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard?region=us&lang=en&contentorigin=espn&limit=100&calendartype=offdays&includeModules=videos&dates=' + endpointDate + '&tz=America%2FNew_York&buyWindow=1m&showAirings=live&showZipLookup=true'

  jQuery.getJSON(url, function (data) {
    const now = DateTime.now().setZone('America/Los_Angeles')
    const possibleRefreshTimes = []
    let gameFinished = false
    const isToday = dateString == now.toISODate()
    if (isToday) {
      todayGames.length = 0
    } else if (dateString > now.toISODate()) {
      possibleRefreshTimes.push(date.startOf('day').setZone())
    }
    data.events.forEach(function(event) {
      eventData = parseEvent(event);

      if (isToday) {
        todayGames.push(eventData)
      }
      // find the round
      const round = rounds.find(r => r.number === eventData.round)
      if (round !== undefined) {

        // Update round start and end
        if (round.startDate === null || round.startDate > dateString) {
          round.startDate = dateString
        }
        if (round.endDate === null || round.endDate < dateString) {
          round.endDate = dateString
        }

        // find the matchup (only if the API game has both teams)
        let matchup
        if (eventData.homeTeam && eventData.awayTeam) {
          matchup = round.matchups.find(matchup =>
            (matchup.favorite === eventData.homeTeam || matchup.favorite === eventData.awayTeam) &&
            (matchup.underdog === eventData.homeTeam || matchup.underdog === eventData.awayTeam)
          )
          if (matchup === null || matchup === undefined) {
            const id = seriesIdForRoundAndTeam(eventData.round, eventData.homeTeam)
            matchup = round.matchups.find(matchup => Number(matchup.id) === id )
          }
        }
        if (matchup !== undefined) {
          const gameNum = eventData.gameNum
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
            matchup.fseed = seeds[matchup.favorite]
            matchup.useed = seeds[matchup.underdog]
          }

          //
          if (!matchup.teamsKnown && matchup.favorite !== null && matchup.underdog !== null) {
            matchup.teamsKnown = true
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
          const priorState = g.state
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
              possibleRefreshTimes.push(DateTime.now())
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
            if (g.dateTime) {
              possibleRefreshTimes.push(g.dateTime.setZone())
            } else {
              possibleRefreshTimes.push(DateTime.fromISO(dateString, {zone: 'America/Los_Angeles'}).setZone())
              datesMissingSchedules.add(dateString)
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

    if (gameFinished) {
      // New games tend to get scheduled when a series finishes,
      // so when a game has just finished refetch everything.
      console.log('game finished, scheduling refreshes')
      scheduleRefreshOfMissingDates()
    }

    if (possibleRefreshTimes.length > 0) {
      const refreshTime = DateTime.min(...possibleRefreshTimes)
      console.log(`scheduled refresh of ${dateString} at ${refreshTime}`)
      refreshDates[dateString] = {
        refreshTime,
        date
      }
    }
  })
}
