const gameRowTemplate = `
<div class="game-row">
  <div class="team-side away-side">
    <img v-if="awayImageURL" class="team-logo" :src="awayImageURL">
    <div v-else class="team-logo-placeholder"></div>
    <span class="team-name">{{ displayAwayName }}</span>
    <span class="team-record">{{ game.awayRecord }}</span>
  </div>

  <div class="score away-score" :class="{'losing-score': isAwayLosing}">{{ started ? game.awayScore : '' }}</div>

  <div class="game-center">
    <span class="game-time" :class="{'live-time': playing, 'pre-game': !started}">{{ timeLabel }}</span>
    <span class="network">{{ game.network || '&nbsp;' }}</span>
  </div>

  <div class="score home-score" :class="{'losing-score': isHomeLosing}">{{ started ? game.homeScore : '' }}</div>

  <div class="team-side home-side">
    <img v-if="homeImageURL" class="team-logo" :src="homeImageURL">
    <div v-else class="team-logo-placeholder"></div>
    <span class="team-name">{{ displayHomeName }}</span>
    <span class="team-record">{{ game.homeRecord }}</span>
  </div>
</div>
`

const GameRow = {
  template: gameRowTemplate,
  props: ['game'],
  data() {
    return {
      isMobile: window.innerWidth <= 768
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
    },
    displayAwayName: function () {
      return this.isMobile ? shortenTeamName(this.game.awayTeamName) : this.game.awayTeamName
    },
    displayHomeName: function () {
      return this.isMobile ? shortenTeamName(this.game.homeTeamName) : this.game.homeTeamName
    }
  }
}
