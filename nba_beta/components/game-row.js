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

  <transition name="expand">
    <div v-if="isExpanded" class="game-details">
      <div v-if="showGameFlow" class="game-flow-section">
        <div class="game-flow-header">GAME FLOW</div>
        <div v-if="gameFlowLoading" class="game-flow-loading">Loading...</div>
        <canvas v-else-if="gameFlowData" ref="gameFlowCanvas" class="game-flow-canvas"></canvas>
      </div>
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
      isExpanded: false,
      gameFlowData: null,
      gameFlowLoading: false,
      teamColors: null
    }
  },
  mounted() {
    window.addEventListener('resize', this.handleResize)
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.handleResize)
  },
  watch: {
    gameFlowData(newVal) {
      if (newVal && newVal.length > 0) {
        this.$nextTick(() => {
          console.log('Watch triggered, canvas ref:', this.$refs.gameFlowCanvas)
          this.drawGameFlow()
        })
      }
    }
  },
  methods: {
    handleResize() {
      this.isMobile = window.innerWidth <= 768
    },
    toggleExpand() {
      this.isExpanded = !this.isExpanded

      // Fetch game flow data when expanding if we haven't already
      if (this.isExpanded && !this.gameFlowData && !this.gameFlowLoading && this.started) {
        this.fetchGameFlow()
      }

      // Redraw chart if we already have data
      if (this.isExpanded && this.gameFlowData) {
        this.$nextTick(() => {
          this.drawGameFlow()
        })
      }
    },
    async fetchGameFlow() {
      this.gameFlowLoading = true
      try {
        const url = `https://site.api.espn.com/apis/site/v2/sports/basketball/nba/summary?event=${this.game.id}`
        const response = await fetch(url)
        const data = await response.json()

        console.log('Game flow data received:', data.plays?.length, 'plays')

        // Extract team colors from boxscore
        if (data.boxscore?.teams) {
          const teams = data.boxscore.teams
          this.teamColors = {
            away: teams.find(t => t.homeAway === 'away')?.team?.color || '1e40af',
            home: teams.find(t => t.homeAway === 'home')?.team?.color || 'dc2626'
          }
        }

        if (data.plays && data.plays.length > 0) {
          this.gameFlowData = this.processGameFlowData(data.plays)
          console.log('Processed game flow data:', this.gameFlowData.length, 'points')
          // The watch will handle drawing when the canvas is rendered
        } else {
          console.log('No plays data available')
        }
      } catch (error) {
        console.error('Failed to fetch game flow:', error)
      } finally {
        this.gameFlowLoading = false
      }
    },
    processGameFlowData(plays) {
      // Filter to only scoring plays and collect data points
      const dataPoints = []

      plays.forEach(play => {
        if (play.awayScore !== undefined && play.homeScore !== undefined) {
          // Convert clock to seconds elapsed in game
          const period = play.period?.number || 1
          const clock = play.clock?.displayValue || '0:00'

          // Parse clock - handle formats like "11:31", "0:45.2", "0.0"
          let minutes = 0
          let seconds = 0

          if (clock.includes(':')) {
            const parts = clock.split(':')
            minutes = parseInt(parts[0]) || 0
            seconds = parseFloat(parts[1]) || 0
          } else {
            // Handle formats like "0.0" (just seconds)
            seconds = parseFloat(clock) || 0
          }

          let totalSeconds
          if (period <= 4) {
            // Regular quarters (12 minutes each)
            const secondsIntoQuarter = (12 * 60) - (minutes * 60 + seconds)
            totalSeconds = ((period - 1) * 12 * 60) + secondsIntoQuarter
          } else {
            // Overtime periods (5 minutes each)
            const secondsIntoOT = (5 * 60) - (minutes * 60 + seconds)
            totalSeconds = (4 * 12 * 60) + ((period - 5) * 5 * 60) + secondsIntoOT
          }

          dataPoints.push({
            time: totalSeconds,
            awayScore: play.awayScore,
            homeScore: play.homeScore,
            period: period
          })
        }
      })

      return dataPoints
    },
    drawGameFlow() {
      const canvas = this.$refs.gameFlowCanvas
      if (!canvas || !this.gameFlowData || this.gameFlowData.length === 0) return

      const ctx = canvas.getContext('2d')
      const dpr = window.devicePixelRatio || 1

      // Set canvas size
      const width = canvas.offsetWidth
      const height = 300
      canvas.width = width * dpr
      canvas.height = height * dpr
      canvas.style.width = width + 'px'
      canvas.style.height = height + 'px'
      ctx.scale(dpr, dpr)

      // Chart dimensions
      const padding = { top: 20, right: 40, bottom: 40, left: 40 }
      const chartWidth = width - padding.left - padding.right
      const chartHeight = height - padding.top - padding.bottom

      // Find max score for scaling
      const maxScore = Math.max(
        ...this.gameFlowData.map(d => Math.max(d.awayScore, d.homeScore))
      )
      const maxTime = this.gameFlowData[this.gameFlowData.length - 1].time

      console.log('Drawing chart:', {
        dataPoints: this.gameFlowData.length,
        maxScore,
        maxTime,
        firstPoint: this.gameFlowData[0],
        lastPoint: this.gameFlowData[this.gameFlowData.length - 1]
      })

      // Scales
      const xScale = (time) => padding.left + (time / maxTime) * chartWidth
      const yScale = (score) => padding.top + chartHeight - (score / maxScore) * chartHeight

      // Draw grid lines
      ctx.strokeStyle = '#e0e0e0'
      ctx.lineWidth = 1
      for (let i = 0; i <= 4; i++) {
        const y = padding.top + (chartHeight / 4) * i
        ctx.beginPath()
        ctx.moveTo(padding.left, y)
        ctx.lineTo(width - padding.right, y)
        ctx.stroke()
      }

      // Draw quarter lines
      ctx.strokeStyle = '#d0d0d0'
      ctx.setLineDash([3, 3])
      for (let quarter = 1; quarter <= 3; quarter++) {
        const x = xScale(quarter * 12 * 60)
        ctx.beginPath()
        ctx.moveTo(x, padding.top)
        ctx.lineTo(x, height - padding.bottom)
        ctx.stroke()
      }

      // Draw OT lines if game went to overtime
      const maxPeriod = Math.max(...this.gameFlowData.map(d => d.period))
      if (maxPeriod > 4) {
        // Draw line at start of each OT period
        for (let otNum = 1; otNum <= maxPeriod - 4; otNum++) {
          const x = xScale(4 * 12 * 60 + (otNum - 1) * 5 * 60)
          ctx.beginPath()
          ctx.moveTo(x, padding.top)
          ctx.lineTo(x, height - padding.bottom)
          ctx.stroke()
        }
      }
      ctx.setLineDash([])

      // Draw away team line
      ctx.strokeStyle = this.teamColors ? `#${this.teamColors.away}` : '#1e40af'
      ctx.lineWidth = 2
      ctx.beginPath()
      this.gameFlowData.forEach((point, i) => {
        const x = xScale(point.time)
        const y = yScale(point.awayScore)
        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      })
      ctx.stroke()

      // Draw home team line
      ctx.strokeStyle = this.teamColors ? `#${this.teamColors.home}` : '#dc2626'
      ctx.lineWidth = 2
      ctx.beginPath()
      this.gameFlowData.forEach((point, i) => {
        const x = xScale(point.time)
        const y = yScale(point.homeScore)
        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      })
      ctx.stroke()

      // Draw axis labels
      ctx.fillStyle = '#666'
      ctx.font = '12px sans-serif'
      ctx.textAlign = 'center'

      // Quarter labels
      const quarterLabels = ['1st', '2nd', '3rd', '4th']
      quarterLabels.forEach((label, i) => {
        const x = xScale((i + 0.5) * 12 * 60)
        ctx.fillText(label, x, height - 10)
      })

      // OT labels if game went to overtime
      if (maxPeriod > 4) {
        const numOvertimes = maxPeriod - 4
        for (let otNum = 1; otNum <= numOvertimes; otNum++) {
          const otStart = 4 * 12 * 60 + (otNum - 1) * 5 * 60
          const otEnd = otNum === numOvertimes ? maxTime : (4 * 12 * 60 + otNum * 5 * 60)
          const x = xScale((otStart + otEnd) / 2)
          const label = otNum === 1 ? 'OT' : `OT${otNum}`
          ctx.fillText(label, x, height - 10)
        }
      }

      // Score labels (y-axis)
      ctx.textAlign = 'right'
      for (let i = 0; i <= 4; i++) {
        const score = Math.round((maxScore / 4) * (4 - i))
        const y = padding.top + (chartHeight / 4) * i
        ctx.fillText(score.toString(), padding.left - 10, y + 4)
      }
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
    },
    showGameFlow: function () {
      return this.started
    }
  }
}
