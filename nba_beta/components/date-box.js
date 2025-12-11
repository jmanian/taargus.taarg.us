const dateBoxTemplate = `
<div class="date-box" :class="{'date-box-today': isToday, 'date-box-collapsed': !isOpen}">
  <div class="date-header" @click="toggleOpen">
    <span>{{ dateHeader }}</span>
    <span class="header-right">
      <span class="game-count">{{ gameCountText }}</span>
      <span class="toggle-icon">{{ isOpen ? '▼' : '▶' }}</span>
    </span>
  </div>
  <transition name="slide">
    <div class="games-list" v-show="isOpen">
      <game-row
        v-for="game in sortedGames"
        :key="game.id"
        :game="game"
        :refresh-trigger="refreshTrigger">
      </game-row>
      <div v-if="dateData.loading" class="no-games">
        Loading...
      </div>
      <div v-else-if="sortedGames.length === 0" class="no-games">
        No games scheduled
      </div>
    </div>
  </transition>
</div>
`

const DateBox = {
  template: dateBoxTemplate,
  props: ['dateData', 'isToday', 'isPast', 'refreshTrigger'],
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
    gameCountText: function () {
      if (this.dateData.loading) {
        return 'Loading...'
      }
      const count = this.dateData.games.length
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
      this.isOpen = !this.isOpen
    }
  }
}
