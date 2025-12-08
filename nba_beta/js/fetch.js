const { reactive, ref, computed } = Vue

// Read initial state from URL
const urlParams = new URLSearchParams(window.location.search)
const initialTeam = urlParams.get('team') || ''
const initialDate = urlParams.get('date') || null

// Initialize dates array with one week of data
const dates = reactive([])
const selectedDateData = reactive([])
const todayStringRef = ref(DateTime.now().setZone('America/Los_Angeles').toISODate())
const todayString = computed(() => todayStringRef.value)
const selectedDate = ref(initialDate)
const selectedTeam = ref(initialTeam)
let isNavigating = false

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
    const gamesForDate = []

    if (data.events && data.events.length > 0) {
      data.events.forEach(function(event) {
        const eventData = parseEvent(event)
        gamesForDate.push(eventData)
      })
    }

    const dateObj = dates.find(d => d.dateString === dateString)
    if (dateObj) {
      dateObj.games = gamesForDate
      const now = DateTime.now().setZone('America/Los_Angeles').toLocaleString(DateTime.DATETIME_SHORT_WITH_SECONDS)
      console.log(`[${now}] Loaded ${dateString}: ${gamesForDate.length} games`)
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

// Smart polling: only update dates with live games or today's date
function pollForUpdates() {
  const todayNow = DateTime.now().setZone('America/Los_Angeles').toISODate()

  // Update todayString if date has changed
  if (todayStringRef.value !== todayNow) {
    todayStringRef.value = todayNow
  }

  const datesToUpdate = new Set()
  const now = DateTime.now().setZone('America/Los_Angeles')

  // Poll any date that has active games or games that should have started
  dates.forEach(dateObj => {
    const shouldPoll = dateObj.games.some(game => {
      // Game is currently in progress
      if (game.state === 'in') return true

      // Game hasn't started yet but scheduled start time is in the past
      if (game.state === 'pre' && game.dateTime && game.dateTime < now) return true

      return false
    })

    if (shouldPoll) {
      datesToUpdate.add(dateObj.dateString)
    }
  })

  // Fetch updates for these dates
  datesToUpdate.forEach(dateString => {
    const date = DateTime.fromISO(dateString, {zone: 'America/Los_Angeles'})
    fetchGamesForDate(date)
  })
}

setInterval(pollForUpdates, 15000) // Poll every 15 seconds

// Update when tab becomes visible again
document.addEventListener('visibilitychange', function() {
  if (!document.hidden) {
    pollForUpdates()
  }
})

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

function clearDateSelection() {
  selectedDate.value = null
  selectedDateData.length = 0
  updateURL()
}

function clearTeamSelection() {
  selectedTeam.value = ''
  updateURL()
}

function updateURL() {
  // Don't update URL during browser navigation
  if (isNavigating) return

  const params = new URLSearchParams()

  if (selectedTeam.value) {
    params.set('team', selectedTeam.value)
  }

  if (selectedDate.value) {
    params.set('date', selectedDate.value)
  }

  const newURL = params.toString()
    ? `${window.location.pathname}?${params.toString()}`
    : window.location.pathname

  // Use pushState to create history entries that work with back/forward
  if (window.location.href !== window.location.origin + newURL) {
    window.history.pushState({ team: selectedTeam.value, date: selectedDate.value }, '', newURL)
  }
}

function fetchSelectedDate(dateString) {
  const date = DateTime.fromISO(dateString, {zone: 'America/Los_Angeles'})

  // Clear and set the selected date data
  selectedDateData.length = 0
  selectedDateData.push({
    dateString: dateString,
    games: []
  })

  // Fetch data for it
  fetchGamesForDateIntoArray(date, selectedDateData)
}

function fetchGamesForDateIntoArray(date, targetArray) {
  const dateString = date.toISODate()
  const endpointDate = date.toISODate({format: 'basic'})
  const url = 'https://site.web.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard?region=us&lang=en&contentorigin=espn&limit=100&calendartype=offdays&includeModules=videos&dates=' + endpointDate + '&tz=America%2FNew_York&buyWindow=1m&showAirings=live&showZipLookup=true'

  jQuery.getJSON(url, function (data) {
    const gamesForDate = []

    if (data.events && data.events.length > 0) {
      data.events.forEach(function(event) {
        const eventData = parseEvent(event)
        gamesForDate.push(eventData)
      })
    }

    const dateObj = targetArray.find(d => d.dateString === dateString)
    if (dateObj) {
      dateObj.games = gamesForDate
      const now = DateTime.now().setZone('America/Los_Angeles').toLocaleString(DateTime.DATETIME_SHORT_WITH_SECONDS)
      console.log(`[${now}] Loaded ${dateString}: ${gamesForDate.length} games`)
    }
  }).fail(function(jqXHR, textStatus, errorThrown) {
    console.error('Failed to fetch data for', dateString, ':', textStatus, errorThrown)
  })
}
