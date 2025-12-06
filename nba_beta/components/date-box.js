const dateBoxTemplate = `
<div class="date-box" :class="{'date-box-today': isToday}">
  <div class="date-header">
    {{ dateHeader }}
  </div>
  <div class="games-list">
    <game-row
      v-for="game in dateData.games"
      :key="game.id"
      :game="game">
    </game-row>
    <div v-if="dateData.games.length === 0" class="no-games">
      No games scheduled
    </div>
  </div>
</div>
`

const DateBox = {
  template: dateBoxTemplate,
  props: ['dateData', 'isToday'],
  components: {
    'game-row': GameRow
  },
  computed: {
    dateHeader: function () {
      const DateTime = luxon.DateTime
      const date = DateTime.fromISO(this.dateData.dateString)
      const dayOfWeek = date.toFormat('EEE')
      const monthDay = date.toFormat('MMM d')
      return `${dayOfWeek}, ${monthDay}`
    }
  },
  updated() {
    console.log('DateBox updated:', this.dateData.dateString, 'games:', this.dateData.games.length)
  }
}
