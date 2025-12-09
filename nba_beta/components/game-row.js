const gameRowTemplate = `
<div class="game-row" :class="{'expanded': isExpanded, 'expandable': hasExpandableContent}" @click="hasExpandableContent && toggleExpand()">
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

  <div v-if="hasExpandableContent" class="expand-indicator">
    <span class="dot"></span>
    <span class="dot"></span>
    <span class="dot"></span>
  </div>

  <transition name="expand">
    <div v-if="isExpanded" class="game-details">
      <div v-if="game.spreadFormatted || game.total" class="odds-section">
        <div v-if="game.spreadFormatted" class="odds-item">
          <span class="odds-label">Spread</span>
          <span class="odds-value">{{ game.spreadFormatted }}</span>
        </div>
        <div v-if="game.total" class="odds-item">
          <span class="odds-label">Total</span>
          <span class="odds-value">{{ game.total }}</span>
        </div>
      </div>
      <div v-if="game.recap" class="recap-section">
        {{ game.recap }}
      </div>
      <div v-if="hasStats" class="stats-section">
        <div class="stats-header">TEAM STATS</div>
        <table class="stats-table">
          <thead>
            <tr>
              <th></th>
              <th>FG%</th>
              <th>3P%</th>
              <th>REB</th>
              <th>AST</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="team-abbr">{{ game.awayTeam }}</td>
              <td>{{ game.awayStats.fgPct }}</td>
              <td>{{ game.awayStats.threePct }}</td>
              <td>{{ game.awayStats.rebounds }}</td>
              <td>{{ game.awayStats.assists }}</td>
            </tr>
            <tr>
              <td class="team-abbr">{{ game.homeTeam }}</td>
              <td>{{ game.homeStats.fgPct }}</td>
              <td>{{ game.homeStats.threePct }}</td>
              <td>{{ game.homeStats.rebounds }}</td>
              <td>{{ game.homeStats.assists }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-if="hasLeaders" class="leaders-section">
        <div class="leaders-header">TOP PERFORMERS</div>
        <div class="team-leaders">
          <div class="team-leader-group">
            <div class="leader-team-name">{{ game.awayTeam }}</div>
            <div v-for="leader in formatLeaders(game.awayLeaders)" :key="leader.name" class="leader-line">
              {{ leader.name }} {{ leader.stats }}
            </div>
          </div>
          <div class="team-leader-group">
            <div class="leader-team-name">{{ game.homeTeam }}</div>
            <div v-for="leader in formatLeaders(game.homeLeaders)" :key="leader.name" class="leader-line">
              {{ leader.name }} {{ leader.stats }}
            </div>
          </div>
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
    },
    formatLeaders(leaders) {
      if (!leaders) return []

      // Create a map of players and their stats
      const playerMap = new Map()

      if (leaders.points) {
        const name = leaders.points.name
        if (!playerMap.has(name)) {
          playerMap.set(name, [])
        }
        playerMap.get(name).push(`${leaders.points.value} PTS`)
      }

      if (leaders.rebounds) {
        const name = leaders.rebounds.name
        if (!playerMap.has(name)) {
          playerMap.set(name, [])
        }
        playerMap.get(name).push(`${leaders.rebounds.value} REB`)
      }

      if (leaders.assists) {
        const name = leaders.assists.name
        if (!playerMap.has(name)) {
          playerMap.set(name, [])
        }
        playerMap.get(name).push(`${leaders.assists.value} AST`)
      }

      // Convert map to array of formatted leaders
      return Array.from(playerMap.entries()).map(([name, stats]) => ({
        name: name,
        stats: stats.join(', ')
      }))
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
    hasExpandableContent: function () {
      return !!(this.game.spreadFormatted || this.game.total || this.game.recap || this.hasStats || this.hasLeaders)
    },
    hasStats: function () {
      return !!(this.game.homeStats && this.game.awayStats)
    },
    hasLeaders: function () {
      const homeHasData = this.game.homeLeaders && (this.game.homeLeaders.points || this.game.homeLeaders.rebounds || this.game.homeLeaders.assists)
      const awayHasData = this.game.awayLeaders && (this.game.awayLeaders.points || this.game.awayLeaders.rebounds || this.game.awayLeaders.assists)
      return homeHasData || awayHasData
    }
  }
}
