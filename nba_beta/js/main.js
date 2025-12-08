const { createApp } = Vue

const app = createApp({
  setup() {
    const displayedDates = Vue.computed(() => {
      if (selectedDate.value) {
        return selectedDateData
      }
      return dates
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
