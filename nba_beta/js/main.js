const { createApp } = Vue

const app = createApp({
  setup() {
    // Get sorted team list for dropdown
    const teamList = Object.values(teamData).sort((a, b) =>
      a.simpleName.localeCompare(b.simpleName)
    )

    const displayedDates = Vue.computed(() => {
      const sourceDates = selectedDate.value ? selectedDateData : dates

      // If no team filter, return all dates
      if (!selectedTeam.value) {
        return sourceDates
      }

      // Filter games by team
      const filtered = sourceDates.map(dateObj => ({
        ...dateObj,
        games: dateObj.games.filter(game =>
          game.homeTeam === selectedTeam.value || game.awayTeam === selectedTeam.value
        )
      }))

      // If filtering by specific date, always show it even if empty
      // Otherwise, only show dates with games
      if (selectedDate.value) {
        return filtered
      } else {
        return filtered.filter(dateObj => dateObj.games.length > 0)
      }
    })

    const formatSelectedDate = Vue.computed(() => {
      if (selectedDate.value) {
        const date = DateTime.fromISO(selectedDate.value)
        return date.toFormat('EEE, MMM d')
      }
      return ''
    })

    const dateInput = Vue.ref(null)
    const teamSelect = Vue.ref(null)

    const openDatePicker = () => {
      if (dateInput.value) {
        // Try showPicker first (desktop Chrome, Firefox)
        if (dateInput.value.showPicker) {
          try {
            dateInput.value.showPicker()
            return
          } catch (e) {
            // Fall through to focus/click
          }
        }

        // Fallback for mobile Safari and others
        dateInput.value.focus()
        dateInput.value.click()
      }
    }

    const openTeamPicker = () => {
      if (teamSelect.value) {
        // Different browsers need different approaches
        teamSelect.value.focus()

        // Try to open the dropdown
        if (teamSelect.value.showPicker) {
          teamSelect.value.showPicker()
        } else {
          // Fallback for browsers that don't support showPicker
          const event = new MouseEvent('mousedown', {
            bubbles: true,
            cancelable: true,
            view: window
          })
          teamSelect.value.dispatchEvent(event)
        }
      }
    }

    const handleTeamClick = (e) => {
      // Don't open picker if clicking the clear button
      if (e.target.closest('.filter-clear')) return
      openTeamPicker()
    }

    const handleDateClick = (e) => {
      // Don't open picker if clicking the clear button
      if (e.target.closest('.filter-clear')) return
      openDatePicker()
    }

    return {
      dates: displayedDates,
      todayString: todayString,
      selectedDate: selectedDate,
      selectedTeam: selectedTeam,
      teamList: teamList,
      formatSelectedDate: formatSelectedDate,
      dateInput: dateInput,
      teamSelect: teamSelect,
      openTeamPicker: openTeamPicker,
      handleTeamClick: handleTeamClick,
      handleDateClick: handleDateClick,
      loadPrevious: loadPrevious,
      loadMore: loadMore,
      clearDateSelection: clearDateSelection,
      clearTeamSelection: clearTeamSelection
    }
  },
  components: {
    'date-box': DateBox,
    'game-row': GameRow
  },
  watch: {
    selectedDate(newDate) {
      if (newDate) {
        fetchSelectedDate(newDate)
      }
      updateURL()
    },
    selectedTeam() {
      updateURL()
    }
  },
  mounted() {
    // If there's an initial date from URL, fetch it
    if (selectedDate.value) {
      fetchSelectedDate(selectedDate.value)
    }

    // Handle browser back/forward
    window.addEventListener('popstate', (event) => {
      isNavigating = true

      const params = new URLSearchParams(window.location.search)
      const newTeam = params.get('team') || ''
      const newDate = params.get('date') || null

      selectedTeam.value = newTeam

      if (newDate) {
        selectedDate.value = newDate
        if (!selectedDateData.some(d => d.dateString === newDate)) {
          fetchSelectedDate(newDate)
        }
      } else {
        selectedDate.value = null
        selectedDateData.length = 0
      }

      // Re-enable URL updates after a tick
      setTimeout(() => {
        isNavigating = false
      }, 0)
    })
  }
})

app.mount('#app')
