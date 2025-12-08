const { createApp } = Vue

const app = createApp({
  setup() {
    return {
      dates: dates,
      todayString: todayString,
      loadPrevious: loadPrevious,
      loadMore: loadMore
    }
  },
  components: {
    'date-box': DateBox,
    'game-row': GameRow
  }
})

app.mount('#app')
