const dateBoxTemplate = `
<div class="date-box" :class="{'date-box-today': isToday, 'date-box-collapsed': !isOpen}">
  <div class="date-header" :class="{'date-header-no-games': hasNoGames}" @click="toggleOpen">
    <span>{{ dateHeader }}</span>
    <span class="header-right">
      <span class="game-count">{{ gameCountText }}</span>
      <span v-if="!hasNoGames" class="toggle-icon">{{ isOpen ? '▼' : '▶' }}</span>
    </span>
  </div>
  <transition name="slide">
    <div class="games-list" v-show="isOpen && !hasNoGames">
      <game-row
        v-for="game in sortedGames"
        :key="game.id"
        :game="game"
        :refresh-trigger="refreshTrigger"
        :chart-mode="chartMode"
        @chart-mode-change="$emit('chart-mode-change', $event)">
      </game-row>
      <div v-if="dateData.loading" class="no-games">
        Loading...
      </div>
    </div>
  </transition>
</div>
`

const DateBox = {
  template: dateBoxTemplate,
  props: ['dateData', 'isToday', 'isPast', 'refreshTrigger', 'chartMode'],
  emits: ['chart-mode-change'],
  components: {
    'game-row': GameRow
  },
  data() {
    return {
      isOpen: !this.isPast
    }
  },
  computed: {
    dateHeader: function () {
      const DateTime = luxon.DateTime
      const date = DateTime.fromISO(this.dateData.dateString)
      const dayOfWeek = date.toFormat('EEE')
      const monthDay = date.toFormat('MMM d')
      return `${dayOfWeek}, ${monthDay}`
    },
    hasNoGames: function () {
      return !this.dateData.loading && this.dateData.games.length === 0
    },
    gameCountText: function () {
      if (this.dateData.loading) {
        return 'Loading...'
      }
      const count = this.dateData.games.length
      if (count === 0) return 'No games'
      return count === 1 ? '1 game' : `${count} games`
    },
    sortedGames: function () {
      return [...this.dateData.games].sort((a, b) => {
        // Live games first
        if (a.state === 'in' && b.state !== 'in') return -1
        if (a.state !== 'in' && b.state === 'in') return 1

        // Both live or both not live - sort by start time
        const aTime = a.dateTime?.toMillis() || 0
        const bTime = b.dateTime?.toMillis() || 0
        return aTime - bTime
      })
    }
  },
  methods: {
    toggleOpen() {
      if (this.hasNoGames) return
      this.isOpen = !this.isOpen
    }
  }
}
