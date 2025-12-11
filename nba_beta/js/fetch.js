const { reactive, ref, computed } = Vue

// Read initial state from URL
const urlParams = new URLSearchParams(window.location.search)
const initialTeams = urlParams.get('teams') ? urlParams.get('teams').split(',') : []
const initialDate = urlParams.get('date') || null

// Initialize dates array with one week of data
const dates = reactive([])
const selectedDateData = reactive([])
const todayStringRef = ref(DateTime.now().setZone('America/Los_Angeles').toISODate())
const todayString = computed(() => todayStringRef.value)
const selectedDate = ref(initialDate)
const selectedTeams = ref(initialTeams)
const teamDropdownOpen = ref(false)
const refreshTrigger = ref(0)
const chartMode = ref(localStorage.getItem('gameFlowChartMode') || 'lead')
let isNavigating = false

function initializeDates() {
  const today = DateTime.now().setZone('America/Los_Angeles')
  const startDate = today.minus({ days: 1 })

  for (let i = 0; i < 7; i++) {
    const date = startDate.plus({ days: i })
    const dateString = date.toISODate()
    dates.push({
      dateString: dateString,
      games: [],
      loading: true
    })
  }
}

initializeDates()

function fetchGamesForDate(date) {
  const dateString = date.toISODate()
  const endpointDate = date.toISODate({format: 'basic'})
  const url = 'https://site.web.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard?region=us&lang=en&contentorigin=espn&limit=100&calendartype=offdays&includeModules=videos&dates=' + endpointDate + '&tz=America%2FNew_York&buyWindow=1m&showAirings=live&showZipLookup=true'

  jQuery.ajax({
    url: url,
    dataType: 'json',
    cache: false,
    success: function (data) {
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
      dateObj.loading = false
      const now = DateTime.now().setZone('America/Los_Angeles').toLocaleString(DateTime.DATETIME_SHORT_WITH_SECONDS)
      console.log(`[${now}] Loaded ${dateString}: ${gamesForDate.length} games`)
    }
    },
    error: function(jqXHR, textStatus, errorThrown) {
      console.error('Failed to fetch data for', dateString, ':', textStatus, errorThrown)
      const dateObj = dates.find(d => d.dateString === dateString)
      if (dateObj) {
        dateObj.loading = false
      }
    }
  })
}

function fetchAll() {
  dates.forEach(dateObj => {
    const date = DateTime.fromISO(dateObj.dateString, {zone: 'America/Los_Angeles'})
    fetchGamesForDate(date)
  })
  // Trigger refresh in all game-row components
  refreshTrigger.value++
}

fetchAll()

// Smart polling: only update dates with live games or today's date
function pollForUpdates(includeSelectedDate = false) {
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

  // Also check selectedDateData if requested
  if (includeSelectedDate) {
    selectedDateData.forEach(dateObj => {
      // Skip if we're already updating this date in the main dates array
      if (datesToUpdate.has(dateObj.dateString)) {
        return
      }

      const shouldPoll = dateObj.games.some(game => {
        if (game.state === 'in') return true
        if (game.state === 'pre' && game.dateTime && game.dateTime < now) return true
        return false
      })

      if (shouldPoll) {
        const date = DateTime.fromISO(dateObj.dateString, {zone: 'America/Los_Angeles'})
        fetchGamesForDateIntoArray(date, selectedDateData)
      }
    })
  }

  // Fetch updates for these dates
  datesToUpdate.forEach(dateString => {
    const date = DateTime.fromISO(dateString, {zone: 'America/Los_Angeles'})
    fetchGamesForDate(date)
  })

  // Trigger refresh in game-row components if we updated anything
  if (datesToUpdate.size > 0 || includeSelectedDate) {
    refreshTrigger.value++
  }
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
      games: [],
      loading: true
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
      games: [],
      loading: true
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
  selectedTeams.value = []
}

function updateURL() {
  // Don't update URL during browser navigation
  if (isNavigating) return

  const params = new URLSearchParams()

  if (selectedTeams.value.length > 0) {
    params.set('teams', selectedTeams.value.join(','))
  }

  if (selectedDate.value) {
    params.set('date', selectedDate.value)
  }

  const newURL = params.toString()
    ? `${window.location.pathname}?${params.toString()}`
    : window.location.pathname

  // Use pushState to create history entries that work with back/forward
  if (window.location.href !== window.location.origin + newURL) {
    window.history.pushState({
      teams: selectedTeams.value.length > 0 ? selectedTeams.value.join(',') : null,
      date: selectedDate.value
    }, '', newURL)
  }
}

function fetchSelectedDate(dateString) {
  const date = DateTime.fromISO(dateString, {zone: 'America/Los_Angeles'})

  // Clear and set the selected date data
  selectedDateData.length = 0
  selectedDateData.push({
    dateString: dateString,
    games: [],
    loading: true
  })

  // Fetch data for it
  fetchGamesForDateIntoArray(date, selectedDateData)
}

function fetchGamesForDateIntoArray(date, targetArray) {
  const dateString = date.toISODate()
  const endpointDate = date.toISODate({format: 'basic'})
  const url = 'https://site.web.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard?region=us&lang=en&contentorigin=espn&limit=100&calendartype=offdays&includeModules=videos&dates=' + endpointDate + '&tz=America%2FNew_York&buyWindow=1m&showAirings=live&showZipLookup=true'

  jQuery.ajax({
    url: url,
    dataType: 'json',
    cache: false,
    success: function (data) {
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
      dateObj.loading = false
      const now = DateTime.now().setZone('America/Los_Angeles').toLocaleString(DateTime.DATETIME_SHORT_WITH_SECONDS)
      console.log(`[${now}] Loaded ${dateString}: ${gamesForDate.length} games`)
    }
    },
    error: function(jqXHR, textStatus, errorThrown) {
      console.error('Failed to fetch data for', dateString, ':', textStatus, errorThrown)
      const dateObj = targetArray.find(d => d.dateString === dateString)
      if (dateObj) {
        dateObj.loading = false
      }
    }
  })
}
