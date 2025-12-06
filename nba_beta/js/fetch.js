const { reactive } = Vue

// Initialize dates array with one week of data
const dates = reactive([])
const todayString = DateTime.now().setZone('America/Los_Angeles').toISODate()

function initializeDates() {
  const today = DateTime.now().setZone('America/Los_Angeles')
  const startDate = today.minus({ days: 1 })

  for (let i = 0; i < 7; i++) {
    const date = startDate.plus({ days: i })
    const dateString = date.toISODate()
    dates.push({
      dateString: dateString,
      games: []
    })
  }
}

initializeDates()

function fetchGamesForDate(date) {
  const dateString = date.toISODate()
  const endpointDate = date.toISODate({format: 'basic'})
  const url = 'https://site.web.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard?region=us&lang=en&contentorigin=espn&limit=100&calendartype=offdays&includeModules=videos&dates=' + endpointDate + '&tz=America%2FNew_York&buyWindow=1m&showAirings=live&showZipLookup=true'

  jQuery.getJSON(url, function (data) {
    console.log('Fetched data for', dateString, ':', data)
    const gamesForDate = []

    if (data.events && data.events.length > 0) {
      data.events.forEach(function(event) {
        const eventData = parseEvent(event)
        console.log('Parsed event:', eventData)
        gamesForDate.push(eventData)
      })
    } else {
      console.log('No events for', dateString)
    }

    const dateObj = dates.find(d => d.dateString === dateString)
    if (dateObj) {
      dateObj.games = gamesForDate
      console.log('Updated dateObj for', dateString, 'with', gamesForDate.length, 'games')
    }
  }).fail(function(jqXHR, textStatus, errorThrown) {
    console.error('Failed to fetch data for', dateString, ':', textStatus, errorThrown)
  })
}

function fetchAll() {
  dates.forEach(dateObj => {
    const date = DateTime.fromISO(dateObj.dateString, {zone: 'America/Los_Angeles'})
    fetchGamesForDate(date)
  })
}

fetchAll()
setInterval(fetchAll, 30000) // Refresh every 30 seconds

function loadPrevious() {
  const firstDate = DateTime.fromISO(dates[0].dateString, {zone: 'America/Los_Angeles'})

  for (let i = 1; i <= 7; i++) {
    const date = firstDate.minus({ days: i })
    const dateString = date.toISODate()
    dates.unshift({
      dateString: dateString,
      games: []
    })
  }

  // Fetch in reverse order so the dates array is populated correctly
  for (let i = 1; i <= 7; i++) {
    const date = firstDate.minus({ days: i })
    fetchGamesForDate(date)
  }
}

function loadMore() {
  const lastDate = DateTime.fromISO(dates[dates.length - 1].dateString, {zone: 'America/Los_Angeles'})

  for (let i = 1; i <= 7; i++) {
    const date = lastDate.plus({ days: i })
    const dateString = date.toISODate()
    dates.push({
      dateString: dateString,
      games: []
    })
    fetchGamesForDate(date)
  }
}
