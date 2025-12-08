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

    const openDatePicker = () => {
      if (dateInput.value) {
        dateInput.value.showPicker()
      }
    }

    return {
      dates: displayedDates,
      todayString: todayString,
      selectedDate: selectedDate,
      selectedTeam: selectedTeam,
      teamList: teamList,
      formatSelectedDate: formatSelectedDate,
      dateInput: dateInput,
      openDatePicker: openDatePicker,
      loadPrevious: loadPrevious,
      loadMore: loadMore,
      clearDateSelection: clearDateSelection
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
    }
  }
})

app.mount('#app')
