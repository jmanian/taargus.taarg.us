const { createApp } = Vue

const app = createApp({
  setup() {
    return {
      dates: dates,
      todayString: todayString
    }
  },
  components: {
    'date-box': DateBox,
    'game-row': GameRow
  },
  mounted() {
    console.log('App mounted')
    console.log('dates:', this.dates)
    console.log('todayString:', this.todayString)
  }
})

app.mount('#app')
