const gameRowTemplate = `
<div class="game-row" :class="{'expanded': isExpanded}" @click="toggleExpand">
  <div class="team-side away-side">
    <img v-if="awayImageURL" class="team-logo" :src="awayImageURL">
    <div v-else class="team-logo-placeholder"></div>
    <span class="team-name">{{ game.awayTeamName }}</span>
    <span class="team-record">{{ game.awayRecord }}</span>
  </div>

  <div class="score away-score" :class="{'losing-score': isAwayLosing}">{{ started ? game.awayScore : '' }}</div>

  <div class="game-center">
    <span class="game-time" :class="{'live-time': playing, 'pre-game': !started}">{{ timeLabel }}</span>
    <span class="network">{{ game.network || '&nbsp;' }}</span>
    <span v-if="game.headline" class="headline">{{ game.headline }}</span>
  </div>

  <div class="score home-score" :class="{'losing-score': isHomeLosing}">{{ started ? game.homeScore : '' }}</div>

  <div class="team-side home-side">
    <img v-if="homeImageURL" class="team-logo" :src="homeImageURL">
    <div v-else class="team-logo-placeholder"></div>
    <span class="team-name">{{ game.homeTeamName }}</span>
    <span class="team-record">{{ game.homeRecord }}</span>
  </div>

  <transition name="expand">
    <div v-if="isExpanded" class="game-details">
      <div v-if="game.spread || game.total" class="odds-section">
        <div v-if="game.spread" class="odds-item">
          <span class="odds-label">Spread:</span>
          <span class="odds-value">{{ game.spread }}</span>
        </div>
        <div v-if="game.total" class="odds-item">
          <span class="odds-label">Total:</span>
          <span class="odds-value">{{ game.total }}</span>
        </div>
      </div>
    </div>
  </transition>
</div>
`

const GameRow = {
  template: gameRowTemplate,
  props: ['game'],
  data() {
    return {
      isMobile: window.innerWidth <= 768,
      isExpanded: false
    }
  },
  mounted() {
    window.addEventListener('resize', this.handleResize)
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.handleResize)
  },
  methods: {
    handleResize() {
      this.isMobile = window.innerWidth <= 768
    },
    toggleExpand() {
      this.isExpanded = !this.isExpanded
    }
  },
  computed: {
    started: function () {
      return this.game.state !== 'pre'
    },
    playing: function () {
      return this.game.state === 'in'
    },
    finished: function () {
      return this.game.state === 'post'
    },
    isAwayLosing: function () {
      return this.finished && this.game.awayScore < this.game.homeScore
    },
    isHomeLosing: function () {
      return this.finished && this.game.homeScore < this.game.awayScore
    },
    startTimeShort: function () {
      const DateTime = luxon.DateTime
      return this.game.dateTime.toLocal().toLocaleString(DateTime.TIME_SIMPLE)
    },
    timeLabel: function () {
      switch (this.game.state) {
        case 'pre':
          return this.startTimeShort
        case 'in':
        case 'post':
          return this.game.statusDetail
      }
    },
    awayImageURL: function () {
      return teamImageURL(this.game.awayTeam)
    },
    homeImageURL: function () {
      return teamImageURL(this.game.homeTeam)
    }
  }
}
