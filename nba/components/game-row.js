const gameRowTemplate = `
<div class="game-row" :class="{'expanded': isExpanded, 'expandable': hasExpandableContent}" :style="teamColorStyles">
  <div class="game-summary" @click="hasExpandableContent && toggleExpand()">
    <div class="team-side away-side">
      <img v-if="awayImageURL" class="team-logo" :src="awayImageURL">
      <div v-else class="team-logo-placeholder"></div>
      <span class="team-name">{{ game.awayTeamName }}</span>
      <span class="team-record">{{ game.awayRecord }}</span>
    </div>

    <div class="score away-score" :class="{'losing-score': isAwayLosing}">{{ started ? game.awayScore : '' }}</div>

    <div class="game-center">
      <span class="game-time" :class="{'live-time': playing, 'pre-game': !started}">{{ timeLabel }}</span>
      <div class="network">
        <span class="network-primary">
          <span v-if="game.network">{{ game.network.primary }}</span>
          <span v-else>&nbsp;</span>
        </span>
        <span v-if="game.network && game.network.hasLocal" class="local-indicator" @mouseenter="handleMouseEnter" @mouseleave="handleMouseLeave" @click.stop="toggleLocalTooltip">
          <span v-html="game.network.primary === 'League Pass' ? 'or&nbsp;local' : 'and&nbsp;local'"></span>
          <span v-if="showLocalTooltip" class="local-tooltip">
            <span v-for="(network, index) in game.network.localNetworks" :key="index" class="tooltip-network">{{ network }}</span>
          </span>
        </span>
      </div>
      <span v-if="game.headline" class="headline">{{ game.headline }}</span>
    </div>

    <div class="score home-score" :class="{'losing-score': isHomeLosing}">{{ started ? game.homeScore : '' }}</div>

    <div class="team-side home-side">
      <img v-if="homeImageURL" class="team-logo" :src="homeImageURL">
      <div v-else class="team-logo-placeholder"></div>
      <span class="team-name">{{ game.homeTeamName }}</span>
      <span class="team-record">{{ game.homeRecord }}</span>
    </div>
  </div>

  <transition name="expand">
    <div v-if="isExpanded" class="game-details">
      <div v-if="showGameFlow" class="game-flow-section">
        <div class="game-flow-header-container">
          <div class="game-flow-tabs">
            <button
              class="game-flow-tab"
              :class="{'active': chartMode === 'lead'}"
              @click.stop="setChartMode('lead')">
              Lead
            </button>
            <button
              class="game-flow-tab"
              :class="{'active': chartMode === 'score'}"
              @click.stop="setChartMode('score')">
              Scores
            </button>
          </div>
        </div>
        <div v-if="gameFlowLoading && !gameFlowData" class="game-flow-loading">Loading...</div>
        <div v-if="gameFlowData" class="game-flow-chart-container">
          <canvas ref="gameFlowCanvas" class="game-flow-canvas" @mousemove="handleCanvasHover" @mouseleave="handleCanvasLeave"></canvas>
          <div v-if="hoveredPlay && !isMobile" class="game-flow-tooltip">
            <div class="tooltip-time">{{ hoveredPlay.time }} - {{ hoveredPlay.quarter }}</div>
            <div class="tooltip-score">{{ hoveredPlay.awayTeam }} {{ hoveredPlay.awayScore }} - {{ hoveredPlay.homeTeam }} {{ hoveredPlay.homeScore }}</div>
            <div class="tooltip-description">{{ hoveredPlay.description }}</div>
          </div>
        </div>
      </div>
      <div v-if="game.spreadFormatted || game.total || (game.homeMoneyline && game.awayMoneyline)" class="odds-section">
        <div v-if="game.spreadFormatted" class="odds-item">
          <span class="odds-label">Spread</span>
          <span class="odds-value">{{ game.spreadFormatted }}</span>
        </div>
        <div v-if="game.total" class="odds-item">
          <span class="odds-label">Total</span>
          <span class="odds-value">{{ game.total }}</span>
        </div>
        <div v-if="game.homeMoneyline && game.awayMoneyline" class="odds-item">
          <span class="odds-label">Moneyline</span>
          <span class="odds-value">{{ game.awayMoneyline }}/{{ game.homeMoneyline }}</span>
        </div>
      </div>
      <div v-if="game.recap" class="recap-section">
        {{ game.recap }}
      </div>
      <div v-if="boxScoreData && boxScoreData.away && boxScoreData.home && started" class="box-score-section">
        <div class="box-score-header">BOX SCORE</div>
        <div class="box-score-tabs">
          <button
            class="box-score-tab"
            :class="{'active': boxScoreActiveTeam === 'away'}"
            @click.stop="boxScoreActiveTeam = 'away'">
            {{ boxScoreData.away.teamName }}
          </button>
          <button
            class="box-score-tab"
            :class="{'active': boxScoreActiveTeam === 'home'}"
            @click.stop="boxScoreActiveTeam = 'home'">
            {{ boxScoreData.home.teamName }}
          </button>
        </div>
        <div class="box-score-table-wrapper">
          <div class="box-score-table-scroll">
            <table class="box-score-table">
            <thead>
              <tr>
                <th class="sticky-col">Player</th>
                <th>MIN</th>
                <th>PTS</th>
                <th class="stat-group-left">FG</th>
                <th class="stat-group-right">FG%</th>
                <th class="stat-group-left">3PT</th>
                <th class="stat-group-right">3PT%</th>
                <th class="stat-group-left">FT</th>
                <th class="stat-group-right">FT%</th>
                <th class="stat-group-left">OREB</th>
                <th>DREB</th>
                <th>REB</th>
                <th class="stat-group-left">AST</th>
                <th>STL</th>
                <th>BLK</th>
                <th class="stat-group-left">TO</th>
                <th>PF</th>
                <th class="stat-group-left">+/-</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="player in boxScoreData[boxScoreActiveTeam].players" :key="player.name">
                <td class="sticky-col player-name">
                  {{ player.name }}
                  <span v-if="player.starter" class="player-position">{{ player.position }}</span>
                </td>
                <td>{{ player.stats.min }}</td>
                <td>{{ player.stats.pts }}</td>
                <td class="stat-group-left">{{ player.stats.fgMade }}</td>
                <td class="stat-group-right">{{ player.stats.fgPct }}</td>
                <td class="stat-group-left">{{ player.stats.threePtMade }}</td>
                <td class="stat-group-right">{{ player.stats.threePtPct }}</td>
                <td class="stat-group-left">{{ player.stats.ftMade }}</td>
                <td class="stat-group-right">{{ player.stats.ftPct }}</td>
                <td class="stat-group-left">{{ player.stats.oreb }}</td>
                <td>{{ player.stats.dreb }}</td>
                <td>{{ player.stats.reb }}</td>
                <td class="stat-group-left">{{ player.stats.ast }}</td>
                <td>{{ player.stats.stl }}</td>
                <td>{{ player.stats.blk }}</td>
                <td class="stat-group-left">{{ player.stats.to }}</td>
                <td>{{ player.stats.pf }}</td>
                <td class="stat-group-left">{{ player.stats.plusMinus }}</td>
              </tr>
              <tr v-if="boxScoreData[boxScoreActiveTeam].totals" class="totals-row">
                <td class="sticky-col">TEAM</td>
                <td>{{ boxScoreData[boxScoreActiveTeam].totals.min }}</td>
                <td>{{ boxScoreData[boxScoreActiveTeam].totals.pts }}</td>
                <td class="stat-group-left">{{ boxScoreData[boxScoreActiveTeam].totals.fgMade }}</td>
                <td class="stat-group-right">{{ boxScoreData[boxScoreActiveTeam].totals.fgPct }}</td>
                <td class="stat-group-left">{{ boxScoreData[boxScoreActiveTeam].totals.threePtMade }}</td>
                <td class="stat-group-right">{{ boxScoreData[boxScoreActiveTeam].totals.threePtPct }}</td>
                <td class="stat-group-left">{{ boxScoreData[boxScoreActiveTeam].totals.ftMade }}</td>
                <td class="stat-group-right">{{ boxScoreData[boxScoreActiveTeam].totals.ftPct }}</td>
                <td class="stat-group-left">{{ boxScoreData[boxScoreActiveTeam].totals.oreb }}</td>
                <td>{{ boxScoreData[boxScoreActiveTeam].totals.dreb }}</td>
                <td>{{ boxScoreData[boxScoreActiveTeam].totals.reb }}</td>
                <td class="stat-group-left">{{ boxScoreData[boxScoreActiveTeam].totals.ast }}</td>
                <td>{{ boxScoreData[boxScoreActiveTeam].totals.stl }}</td>
                <td>{{ boxScoreData[boxScoreActiveTeam].totals.blk }}</td>
                <td class="stat-group-left">{{ boxScoreData[boxScoreActiveTeam].totals.to }}</td>
                <td>{{ boxScoreData[boxScoreActiveTeam].totals.pf }}</td>
                <td class="stat-group-left">{{ boxScoreData[boxScoreActiveTeam].totals.plusMinus }}</td>
              </tr>
            </tbody>
          </table>
          </div>
        </div>
      </div>
      <div v-if="hasStats && !started" class="stats-section">
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
  props: ['game', 'refreshTrigger', 'chartMode'],
  emits: ['chart-mode-change'],
  inject: {
    isDarkMode: {
      default: () => Vue.ref(false)
    }
  },
  data() {
    return {
      isMobile: window.innerWidth <= 768,
      isExpanded: false,
      gameFlowData: null,
      gameFlowLoading: false,
      boxScoreData: null,
      boxScoreActiveTeam: 'away', // 'away' or 'home'
      teamColors: null,
      hoveredPlay: null,
      hoveredPlayIndex: null,
      resizeTimeout: null,
      showLocalTooltip: false
    }
  },
  mounted() {
    window.addEventListener('resize', this.handleResize)
    document.addEventListener('close-local-tooltips', this.handleCloseTooltip)
    this.initializeTeamColors()
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.handleResize)
    document.removeEventListener('close-local-tooltips', this.handleCloseTooltip)
  },
  watch: {
    gameFlowData(newVal) {
      if (newVal && newVal.length > 0) {
        this.$nextTick(() => {
          console.log('Watch triggered, canvas ref:', this.$refs.gameFlowCanvas)
          this.drawGameFlow()
        })
      }
    },
    game: {
      handler() {
        this.initializeTeamColors()
      },
      deep: true
    },
    'game.statusDetail'(newVal, oldVal) {
      // When game status changes (score updates, quarter changes, etc.)
      // and we have already loaded game flow data, refresh it
      // Only refresh if card is currently expanded
      if (newVal !== oldVal && this.isExpanded && this.gameFlowData && !this.gameFlowLoading && this.started) {
        this.fetchGameFlow()
      }
    },
    refreshTrigger(newVal, oldVal) {
      // When refresh is triggered and we have already loaded game flow data, refresh it
      // Only refresh if card is currently expanded
      if (newVal !== oldVal && this.isExpanded && this.gameFlowData && !this.gameFlowLoading && this.started) {
        this.fetchGameFlow()
      }
    },
    isDarkMode: {
      handler() {
        // Re-initialize colors when dark mode changes
        this.initializeTeamColors()
        // Redraw chart if currently expanded
        if (this.isExpanded && this.gameFlowData) {
          this.$nextTick(() => {
            this.drawGameFlow()
          })
        }
      },
      deep: true
    },
    chartMode(newVal, oldVal) {
      // When chart mode changes from outside (other game cards), redraw the chart
      if (newVal !== oldVal && this.isExpanded && this.gameFlowData) {
        this.redrawChart()
      }
    },
  },
  methods: {
    handleMouseEnter() {
      if (!this.isMobile) {
        this.showLocalTooltip = true
      }
    },
    handleMouseLeave() {
      if (!this.isMobile) {
        this.showLocalTooltip = false
      }
    },
    toggleLocalTooltip(event) {
      const wasOpen = this.showLocalTooltip

      // Close all other tooltips
      document.dispatchEvent(new CustomEvent('close-local-tooltips'))

      // Toggle this one (if it was closed, open it)
      this.showLocalTooltip = !wasOpen
    },
    handleCloseTooltip() {
      this.showLocalTooltip = false
    },
    handleResize() {
      this.isMobile = window.innerWidth <= 768

      // Debounce resize events
      if (this.resizeTimeout) {
        clearTimeout(this.resizeTimeout)
      }

      // Update tooltip position if visible
      if (this.showLocalTooltip) {
        this.updateTooltipPosition()
      }

      // Redraw chart if it's currently visible
      if (this.isExpanded && this.gameFlowData) {
        // Clear canvas inline styles to let it resize
        const canvas = this.$refs.gameFlowCanvas
        if (canvas) {
          canvas.style.width = ''
          canvas.style.height = ''
        }

        // Wait for DOM to settle after resize
        this.resizeTimeout = setTimeout(() => {
          this.drawGameFlow()
        }, 200)
      }
    },
    initializeTeamColors() {
      // Set team colors from game data if available
      const awayPrimary = this.game.awayTeamColor || '1e40af'  // default blue
      const homePrimary = this.game.homeTeamColor || 'dc2626'  // default red
      const awayAlt = this.game.awayTeamAltColor
      const homeAlt = this.game.homeTeamAltColor

      // Build all possible color combinations
      const combinations = []
      const isDark = this.isDarkMode

      // Helper to score a color (higher is better)
      const scoreColor = (color) => {
        const luminance = this.getColorLuminance(color)
        if (isDark) {
          // In dark mode: prefer lighter colors, heavily penalize very dark ones
          return luminance < 80 ? luminance - 300 : luminance
        } else {
          // In light mode: prefer darker colors, heavily penalize very light ones
          return luminance > 220 ? (255 - luminance) - 300 : (255 - luminance)
        }
      }

      // Helper to score a combination (higher is better)
      const scoreCombination = (away, home) => {
        // Calculate similarity penalty (gradient, not binary)
        let similarityPenalty = this.getColorSimilarityPenalty(away, home)

        // Additional penalty if both colors are in the same luminance zone
        // (both very dark or both very light), even if they're different hues
        const awayLum = this.getColorLuminance(away)
        const homeLum = this.getColorLuminance(home)

        if ((awayLum < 60 && homeLum < 60) || (awayLum > 200 && homeLum > 200)) {
          // Both colors are in the same extreme zone - add penalty
          similarityPenalty += 400
        }

        // Sum individual color scores minus similarity penalty
        return scoreColor(away) + scoreColor(home) - similarityPenalty
      }

      // Try all combinations
      combinations.push({
        away: awayPrimary,
        home: homePrimary,
        score: scoreCombination(awayPrimary, homePrimary)
      })

      if (awayAlt) {
        combinations.push({
          away: awayAlt,
          home: homePrimary,
          score: scoreCombination(awayAlt, homePrimary)
        })
      }

      if (homeAlt) {
        combinations.push({
          away: awayPrimary,
          home: homeAlt,
          score: scoreCombination(awayPrimary, homeAlt)
        })
      }

      if (awayAlt && homeAlt) {
        combinations.push({
          away: awayAlt,
          home: homeAlt,
          score: scoreCombination(awayAlt, homeAlt)
        })
      }

      // Pick the best combination
      const best = combinations.sort((a, b) => b.score - a.score)[0]

      // Debug logging (enabled with ?debugColors query param)
      const urlParams = new URLSearchParams(window.location.search)
      if (urlParams.has('debugColors')) {
        console.log(`🎨 Color selection for ${this.game.awayTeam} @ ${this.game.homeTeam}:`)
        console.log('Available colors:', {
          awayPrimary,
          awayAlt,
          homePrimary,
          homeAlt
        })
        console.log('All combinations evaluated:')
        combinations.forEach((combo, i) => {
          const dist = this.getColorDistance(combo.away, combo.home)
          const awayLum = this.getColorLuminance(combo.away)
          const homeLum = this.getColorLuminance(combo.home)
          const zonePenalty = (awayLum < 60 && homeLum < 60) || (awayLum > 200 && homeLum > 200) ? 400 : 0
          console.log(`  ${i + 1}. Away: ${combo.away} (lum: ${awayLum.toFixed(1)}), Home: ${combo.home} (lum: ${homeLum.toFixed(1)}), Score: ${combo.score.toFixed(1)}, Distance: ${dist.toFixed(1)}, Zone penalty: ${zonePenalty}`)
        })
        console.log('✅ Selected:', best)
      }

      this.teamColors = {
        away: best.away,
        home: best.home
      }
    },
    getChartColors() {
      // Chart colors are now determined in initializeTeamColors
      return this.teamColors || { away: '1e40af', home: 'dc2626' }
    },
    getColorLuminance(hexColor) {
      // Calculate relative luminance of a color
      if (!hexColor) return 0
      const r = parseInt(hexColor.substring(0, 2), 16)
      const g = parseInt(hexColor.substring(2, 4), 16)
      const b = parseInt(hexColor.substring(4, 6), 16)
      // Weighted luminance formula
      return (0.299 * r) + (0.587 * g) + (0.114 * b)
    },
    isWhitish(hexColor) {
      // Check if color is white or very light (near white)
      // Luminance > 220 is considered too light for light backgrounds
      return this.getColorLuminance(hexColor) > 220
    },
    isBlackish(hexColor) {
      // Check if color is black or very dark (near black)
      // Luminance < 80 is considered too dark for dark backgrounds
      return this.getColorLuminance(hexColor) < 80
    },
    isUnreadableColor(hexColor) {
      // In light mode, avoid white colors; in dark mode, avoid black colors
      return this.isDarkMode ? this.isBlackish(hexColor) : this.isWhitish(hexColor)
    },
    toggleExpand() {
      this.isExpanded = !this.isExpanded

      // Fetch fresh game flow data when expanding a started game
      if (this.isExpanded && !this.gameFlowLoading && this.started) {
        this.fetchGameFlow()
      }

      // Redraw chart if we already have data (for immediate visual feedback while fetching)
      if (this.isExpanded && this.gameFlowData) {
        this.$nextTick(() => {
          this.drawGameFlow()
        })
      }
    },
    redrawChart() {
      this.$nextTick(() => {
        this.drawGameFlow()
      })
    },
    setChartMode(mode) {
      this.$emit('chart-mode-change', mode)
      this.redrawChart()
    },
    getMaxTime() {
      if (!this.gameFlowData || this.gameFlowData.length === 0) return 0

      const lastDataTime = this.gameFlowData[this.gameFlowData.length - 1].time
      const maxPeriod = Math.max(...this.gameFlowData.map(d => d.period))
      const endOf4thQuarter = 4 * 12 * 60 // 2880 seconds

      // If game is ongoing and hasn't reached end of 4th quarter, extend x-axis to end of 4th
      return this.playing && maxPeriod <= 4 && lastDataTime < endOf4thQuarter
        ? endOf4thQuarter
        : lastDataTime
    },
    handleCanvasHover(event) {
      if (this.isMobile) return
      const canvas = this.$refs.gameFlowCanvas
      if (!canvas || !this.gameFlowData) return

      const rect = canvas.getBoundingClientRect()
      const mouseX = event.clientX - rect.left
      const padding = { left: 40, right: 40 }
      const chartWidth = canvas.offsetWidth - padding.left - padding.right

      const relativeX = mouseX - padding.left

      // If mouse is outside chart area, don't show tooltip
      if (relativeX < 0 || relativeX > chartWidth) {
        this.hoveredPlay = null
        this.hoveredPlayIndex = null
        this.redrawChart()
        return
      }

      // Calculate x-positions for all plays based on game time
      const maxTime = this.getMaxTime()
      const xScale = (time) => (time / maxTime) * chartWidth

      // Create zones for each play based on midpoints between adjacent plays
      // This ensures every play is accessible
      let selectedIndex = 1

      for (let i = 1; i < this.gameFlowData.length; i++) {
        const currentX = xScale(this.gameFlowData[i].time)

        // Determine zone boundaries
        let zoneStart, zoneEnd

        if (i === 1) {
          // First play: zone starts at 0
          zoneStart = 0
        } else {
          // Zone starts at midpoint with previous play
          const prevX = xScale(this.gameFlowData[i - 1].time)
          zoneStart = (prevX + currentX) / 2
        }

        if (i === this.gameFlowData.length - 1) {
          // Last play: zone extends to end
          zoneEnd = chartWidth
        } else {
          // Zone ends at midpoint with next play
          const nextX = xScale(this.gameFlowData[i + 1].time)
          zoneEnd = (currentX + nextX) / 2
        }

        // Check if mouse is in this zone
        if (relativeX >= zoneStart && relativeX < zoneEnd) {
          selectedIndex = i
          break
        }
      }

      const play = this.gameFlowData[selectedIndex]
      this.hoveredPlayIndex = selectedIndex
      this.hoveredPlay = {
        time: play.clock,
        quarter: play.periodDisplay,
        awayTeam: this.game.awayTeam,
        homeTeam: this.game.homeTeam,
        awayScore: play.awayScore,
        homeScore: play.homeScore,
        description: play.description
      }
      this.redrawChart()
    },
    handleCanvasLeave() {
      if (this.isMobile) return
      this.hoveredPlay = null
      this.hoveredPlayIndex = null
      this.redrawChart()
    },
    getColorDistance(hex1, hex2) {
      // Convert hex to RGB
      const hexToRgb = (hex) => {
        const clean = hex.replace('#', '')
        return {
          r: parseInt(clean.substring(0, 2), 16),
          g: parseInt(clean.substring(2, 4), 16),
          b: parseInt(clean.substring(4, 6), 16)
        }
      }

      const color1 = hexToRgb(hex1)
      const color2 = hexToRgb(hex2)

      // Calculate Euclidean distance in RGB space
      return Math.sqrt(
        Math.pow(color1.r - color2.r, 2) +
        Math.pow(color1.g - color2.g, 2) +
        Math.pow(color1.b - color2.b, 2)
      )
    },
    getColorSimilarityPenalty(hex1, hex2) {
      const distance = this.getColorDistance(hex1, hex2)

      // Gradient penalty based on distance
      // Different enough (>= 80): No penalty (orange vs gold is ~82)
      // Somewhat similar (50-80): Moderate penalty
      // Very similar (< 50): Heavy penalty (e.g. two blues)
      if (distance >= 80) {
        // Different enough - no penalty
        return 0
      } else if (distance >= 50) {
        // Somewhat similar - moderate penalty that increases as colors get closer
        // At distance 50: penalty = 0
        // At distance 80: penalty = 0
        // Linear gradient: 0 to 300
        return (80 - distance) * 10
      } else {
        // Very similar colors - steep penalty
        // At distance 0: penalty = 800
        // At distance 50: penalty = 300
        return 300 + (50 - distance) * 10
      }
    },
    areColorsSimilar(hex1, hex2) {
      // Legacy method - still used for reference
      // Colors are similar if distance is less than 80
      return this.getColorDistance(hex1, hex2) < 80
    },
    async fetchGameFlow() {
      this.gameFlowLoading = true
      try {
        const url = `https://site.api.espn.com/apis/site/v2/sports/basketball/nba/summary?event=${this.game.id}`
        const response = await fetch(url)
        const data = await response.json()

        const now = DateTime.now().setZone('America/Los_Angeles').toLocaleString(DateTime.DATETIME_SHORT_WITH_SECONDS)
        console.log(`[${now}] Loaded event ${this.game.id}: ${data.plays?.length || 0} plays`)
        console.log('Game flow data received:', data.plays?.length, 'plays')

        // Team colors are already set from scoreboard data via initializeTeamColors()
        // No need to extract them again from the event API

        // Extract player box scores
        if (data.boxscore?.players && data.boxscore?.teams) {
          this.boxScoreData = this.processBoxScoreData(data.boxscore.players, data.boxscore.teams)
          console.log('Box score data processed:', this.boxScoreData)
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
            period: period,
            clock: clock,
            periodDisplay: play.period?.displayValue || '',
            description: play.text || ''
          })
        }
      })

      return dataPoints
    },
    parseStat(stat) {
      if (!stat) return { made: stat, pct: '' }
      if (stat === '0-0') return { made: '0-0', pct: '0.0' }

      const parts = stat.split('-')
      if (parts.length !== 2) return { made: stat, pct: '' }

      const made = parseInt(parts[0])
      const attempted = parseInt(parts[1])

      if (attempted === 0) return { made: stat, pct: '0.0' }

      const percentage = Math.round((made / attempted) * 1000) / 10
      return { made: stat, pct: percentage.toFixed(1) }
    },
    processBoxScoreData(playersData, teamsData) {
      const result = { away: null, home: null }

      // Create a map of team ID to homeAway from teamsData
      const teamHomeAwayMap = {}
      teamsData.forEach(teamData => {
        teamHomeAwayMap[teamData.team.id] = teamData.homeAway
      })

      playersData.forEach(teamData => {
        const teamId = teamData.team.id
        const homeAway = teamHomeAwayMap[teamId]
        const statistics = teamData.statistics[0]

        // Parse players
        const players = statistics.athletes.map(playerData => {
          const athlete = playerData.athlete
          const stats = playerData.stats

          const fg = this.parseStat(stats[2])
          const threePt = this.parseStat(stats[3])
          const ft = this.parseStat(stats[4])

          return {
            name: athlete.shortName || athlete.displayName,
            position: athlete.position?.abbreviation || '',
            jersey: athlete.jersey || '',
            starter: playerData.starter || false,
            stats: {
              min: stats[0],
              pts: stats[1],
              fgMade: fg.made,
              fgPct: fg.pct,
              threePtMade: threePt.made,
              threePtPct: threePt.pct,
              ftMade: ft.made,
              ftPct: ft.pct,
              reb: stats[5],
              ast: stats[6],
              to: stats[7],
              stl: stats[8],
              blk: stats[9],
              oreb: stats[10],
              dreb: stats[11],
              pf: stats[12],
              plusMinus: stats[13]
            }
          }
        })

        // Sort so starters are first
        players.sort((a, b) => {
          if (a.starter && !b.starter) return -1
          if (!a.starter && b.starter) return 1
          return 0
        })

        // Get team totals (last row in labels)
        const totals = statistics.totals || null

        let totalsParsed = null
        if (totals) {
          const fgTotal = this.parseStat(totals[2])
          const threePtTotal = this.parseStat(totals[3])
          const ftTotal = this.parseStat(totals[4])

          totalsParsed = {
            min: totals[0],
            pts: totals[1],
            fgMade: fgTotal.made,
            fgPct: fgTotal.pct,
            threePtMade: threePtTotal.made,
            threePtPct: threePtTotal.pct,
            ftMade: ftTotal.made,
            ftPct: ftTotal.pct,
            reb: totals[5],
            ast: totals[6],
            to: totals[7],
            stl: totals[8],
            blk: totals[9],
            oreb: totals[10],
            dreb: totals[11],
            pf: totals[12],
            plusMinus: totals[13]
          }
        }

        result[homeAway] = {
          teamName: teamData.team.name,
          players: players,
          totals: totalsParsed
        }
      })

      return result
    },
    drawGameFlow() {
      if (this.chartMode === 'lead') {
        this.drawLeadTracker()
      } else {
        this.drawScoreFlow()
      }
    },
    drawScoreFlow() {
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

      // Chart dimensions - no horizontal padding on mobile for maximum chart space
      const padding = {
        top: 20,
        right: this.isMobile ? 0 : 20,
        bottom: 40,
        left: this.isMobile ? 0 : 20
      }
      const chartWidth = width - padding.left - padding.right
      const chartHeight = height - padding.top - padding.bottom

      // Find max score for scaling
      const actualMaxScore = Math.max(
        ...this.gameFlowData.map(d => Math.max(d.awayScore, d.homeScore))
      )
      // Round up to nearest 25
      const maxScore = Math.ceil(actualMaxScore / 25) * 25
      const maxTime = this.getMaxTime()
      const maxPeriod = Math.max(...this.gameFlowData.map(d => d.period))

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

      // Draw grid lines at 25-point intervals
      ctx.strokeStyle = this.isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.08)'
      ctx.lineWidth = 1
      const numLines = maxScore / 25
      for (let i = 0; i <= numLines; i++) {
        const score = i * 25
        const y = yScale(score)
        ctx.beginPath()
        ctx.moveTo(padding.left, y)
        ctx.lineTo(width - padding.right, y)
        ctx.stroke()
      }

      // Draw quarter lines
      ctx.strokeStyle = this.isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.12)'
      ctx.setLineDash([3, 3])
      for (let quarter = 1; quarter <= 3; quarter++) {
        const x = xScale(quarter * 12 * 60)
        ctx.beginPath()
        ctx.moveTo(x, padding.top)
        ctx.lineTo(x, height - padding.bottom)
        ctx.stroke()
      }

      // Draw OT lines if game went to overtime
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

      // Draw away team line (as steps) with rounded corners
      const chartColors = this.getChartColors()
      const awayColor = `#${chartColors.away}`
      ctx.strokeStyle = awayColor
      ctx.lineWidth = this.isMobile ? 1.5 : 2
      ctx.lineJoin = 'round'
      ctx.lineCap = 'butt'
      ctx.beginPath()
      this.gameFlowData.forEach((point, i) => {
        const x = xScale(point.time)
        const y = yScale(point.awayScore)
        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          const prevY = yScale(this.gameFlowData[i - 1].awayScore)
          // Draw horizontal line at previous score level
          ctx.lineTo(x, prevY)
          // Draw vertical line to new score
          ctx.lineTo(x, y)
        }
      })
      ctx.stroke()

      // Draw home team line (as steps) with rounded corners
      const homeColor = `#${chartColors.home}`
      ctx.strokeStyle = homeColor
      ctx.lineWidth = this.isMobile ? 1.5 : 2
      ctx.lineJoin = 'round'
      ctx.lineCap = 'butt'
      ctx.beginPath()
      this.gameFlowData.forEach((point, i) => {
        const x = xScale(point.time)
        const y = yScale(point.homeScore)
        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          const prevY = yScale(this.gameFlowData[i - 1].homeScore)
          // Draw horizontal line at previous score level
          ctx.lineTo(x, prevY)
          // Draw vertical line to new score
          ctx.lineTo(x, y)
        }
      })
      ctx.stroke()

      // Highlight hovered segment
      if (this.hoveredPlayIndex !== null && this.hoveredPlayIndex > 0) {
        const i = this.hoveredPlayIndex
        const point = this.gameFlowData[i]
        const prevPoint = this.gameFlowData[i - 1]
        const x = xScale(point.time)

        // Highlight away team vertical segment
        ctx.strokeStyle = awayColor
        ctx.lineWidth = this.isMobile ? 3 : 4
        ctx.beginPath()
        ctx.moveTo(x, yScale(prevPoint.awayScore))
        ctx.lineTo(x, yScale(point.awayScore))
        ctx.stroke()

        // Highlight home team vertical segment
        ctx.strokeStyle = homeColor
        ctx.lineWidth = this.isMobile ? 3 : 4
        ctx.beginPath()
        ctx.moveTo(x, yScale(prevPoint.homeScore))
        ctx.lineTo(x, yScale(point.homeScore))
        ctx.stroke()
      }

      // Draw axis labels
      ctx.fillStyle = this.isDarkMode ? '#aaa' : '#495057'
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

      // Score labels (y-axis) - show every 25 points, skip 0, draw inside chart
      // Labels should be below the gridline
      ctx.textAlign = 'left'
      ctx.font = '11px sans-serif'
      for (let i = 1; i <= numLines; i++) { // Start at 1 to skip 0
        const score = i * 25
        const y = yScale(score)
        // Draw label just inside the chart area, below the gridline
        ctx.fillText(score.toString(), padding.left + 5, y + 12)
      }
    },
    drawLeadTracker() {
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

      // Chart dimensions - no horizontal padding on mobile for maximum chart space
      const padding = {
        top: 20,
        right: this.isMobile ? 0 : 20,
        bottom: 40,
        left: this.isMobile ? 0 : 20
      }
      const chartWidth = width - padding.left - padding.right
      const chartHeight = height - padding.top - padding.bottom

      // Calculate lead differential for each point
      const leadData = this.gameFlowData.map(point => ({
        time: point.time,
        lead: point.awayScore - point.homeScore, // positive = away leading, negative = home leading
        period: point.period
      }))

      // Find max lead (in either direction) for determining y-axis range
      const maxLead = Math.max(...leadData.map(d => Math.abs(d.lead)))
      const maxLeadRounded = Math.ceil(maxLead / 5) * 5 // Round up to nearest 5
      const maxTime = this.getMaxTime()
      const maxPeriod = Math.max(...this.gameFlowData.map(d => d.period))

      // Scales
      const xScale = (time) => padding.left + (time / maxTime) * chartWidth
      const yScale = (lead) => padding.top + chartHeight / 2 - (lead / maxLeadRounded) * (chartHeight / 2)

      // Scale for gradient (capped at 30)
      const yScaleGradient = (lead) => {
        const clampedLead = Math.max(-30, Math.min(30, lead))
        return padding.top + chartHeight / 2 - (clampedLead / 30) * (chartHeight / 2)
      }

      // Draw grid lines at 5-point intervals
      ctx.strokeStyle = this.isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.08)'
      ctx.lineWidth = 1
      const numLines = maxLeadRounded / 5
      for (let i = -numLines; i <= numLines; i++) {
        const lead = i * 5
        const y = yScale(lead)
        ctx.beginPath()
        ctx.moveTo(padding.left, y)
        ctx.lineTo(width - padding.right, y)
        ctx.stroke()
      }

      // Draw center line (0 lead) thicker
      ctx.strokeStyle = this.isDarkMode ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.3)'
      ctx.lineWidth = 2
      const centerY = yScale(0)
      ctx.beginPath()
      ctx.moveTo(padding.left, centerY)
      ctx.lineTo(width - padding.right, centerY)
      ctx.stroke()

      // Draw quarter lines
      ctx.strokeStyle = this.isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.12)'
      ctx.lineWidth = 1
      ctx.setLineDash([3, 3])
      for (let quarter = 1; quarter <= 3; quarter++) {
        const x = xScale(quarter * 12 * 60)
        ctx.beginPath()
        ctx.moveTo(x, padding.top)
        ctx.lineTo(x, height - padding.bottom)
        ctx.stroke()
      }

      // Draw OT lines if game went to overtime
      if (maxPeriod > 4) {
        for (let otNum = 1; otNum <= maxPeriod - 4; otNum++) {
          const x = xScale(4 * 12 * 60 + (otNum - 1) * 5 * 60)
          ctx.beginPath()
          ctx.moveTo(x, padding.top)
          ctx.lineTo(x, height - padding.bottom)
          ctx.stroke()
        }
      }
      ctx.setLineDash([])

      // Draw filled area chart
      ctx.beginPath()
      ctx.moveTo(xScale(leadData[0].time), yScale(0))

      leadData.forEach((point, i) => {
        const x = xScale(point.time)
        const y = yScale(point.lead)
        if (i === 0) {
          ctx.lineTo(x, y)
        } else {
          const prevY = yScale(leadData[i - 1].lead)
          ctx.lineTo(x, prevY)
          ctx.lineTo(x, y)
        }
      })

      ctx.lineTo(xScale(leadData[leadData.length - 1].time), yScale(0))
      ctx.closePath()

      // Fill with gradient (capped at 30-point lead = 100% opacity)
      const chartColors = this.getChartColors()
      const awayColor = `#${chartColors.away}`
      const homeColor = `#${chartColors.home}`

      // Create gradient based on 30-point scale
      const gradient = ctx.createLinearGradient(0, yScaleGradient(30), 0, yScaleGradient(-30))
      gradient.addColorStop(0, awayColor + 'CC') // 80% opacity at +30
      gradient.addColorStop(0.5, '#ffffff00') // transparent at center (0)
      gradient.addColorStop(1, homeColor + 'CC') // 80% opacity at -30
      ctx.fillStyle = gradient
      ctx.fill()

      // Draw the lead line with color matching team in lead
      // Group consecutive segments by color for continuous paths
      ctx.lineWidth = this.isMobile ? 1 : 1.5
      ctx.lineJoin = 'round'
      ctx.lineCap = 'butt'

      let currentPath = null
      let currentColor = null

      leadData.forEach((point, i) => {
        if (i === 0) {
          currentPath = { color: null, segments: [] }
          return
        }

        const x = xScale(point.time)
        const y = yScale(point.lead)
        const prevLead = leadData[i - 1].lead
        const currentLead = point.lead
        const prevY = yScale(prevLead)
        const prevX = xScale(leadData[i - 1].time)

        // Use color based on the lead AFTER this play (current point)
        let segmentColor
        if (currentLead > 0) {
          segmentColor = awayColor
        } else if (currentLead < 0) {
          segmentColor = homeColor
        } else {
          segmentColor = this.isDarkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.3)'
        }

        // If color changed, draw accumulated path and start new one
        if (currentColor && segmentColor !== currentColor) {
          ctx.strokeStyle = currentColor
          ctx.beginPath()
          currentPath.segments.forEach((seg, idx) => {
            if (idx === 0) {
              ctx.moveTo(seg.x1, seg.y1)
            } else {
              ctx.lineTo(seg.x1, seg.y1)
            }
            ctx.lineTo(seg.x2, seg.y2)
            ctx.lineTo(seg.x3, seg.y3)
          })
          ctx.stroke()
          currentPath = { color: segmentColor, segments: [] }
        }

        currentColor = segmentColor
        currentPath.segments.push({
          x1: prevX, y1: prevY,
          x2: x, y2: prevY,
          x3: x, y3: y
        })
      })

      // Draw final accumulated path
      if (currentPath && currentPath.segments.length > 0) {
        ctx.strokeStyle = currentColor
        ctx.beginPath()
        currentPath.segments.forEach((seg, idx) => {
          if (idx === 0) {
            ctx.moveTo(seg.x1, seg.y1)
          } else {
            ctx.lineTo(seg.x1, seg.y1)
          }
          ctx.lineTo(seg.x2, seg.y2)
          ctx.lineTo(seg.x3, seg.y3)
        })
        ctx.stroke()
      }

      // Highlight hovered segment on lead tracker
      if (this.hoveredPlayIndex !== null && this.hoveredPlayIndex > 0) {
        const i = this.hoveredPlayIndex
        const point = leadData[i]
        const prevPoint = leadData[i - 1]
        const x = xScale(point.time)

        // Determine color based on the lead
        let highlightColor
        if (point.lead > 0) {
          highlightColor = awayColor
        } else if (point.lead < 0) {
          highlightColor = homeColor
        } else {
          highlightColor = this.isDarkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.3)'
        }

        ctx.strokeStyle = highlightColor
        ctx.lineWidth = this.isMobile ? 2 : 3
        ctx.beginPath()
        ctx.moveTo(x, yScale(prevPoint.lead))
        ctx.lineTo(x, yScale(point.lead))
        ctx.stroke()
      }

      // Draw axis labels
      ctx.fillStyle = this.isDarkMode ? '#aaa' : '#495057'
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

      // Lead labels (y-axis) - skip 0, draw inside chart
      // Top half (positive): labels below gridline
      // Bottom half (negative): labels above gridline
      ctx.textAlign = 'left'
      ctx.font = '11px sans-serif'
      for (let i = -numLines; i <= numLines; i++) {
        if (i === 0) continue // Skip 0 label
        const lead = i * 5
        const y = yScale(lead)
        // For positive values (top half), place label below the line
        // For negative values (bottom half), place label above the line
        const yOffset = lead > 0 ? 12 : -3
        ctx.fillText(Math.abs(lead).toString(), padding.left + 5, y + yOffset)
      }

      // Team labels on y-axis - moved farther right to avoid collision
      // Home team label aligned with bottom-most gridline label
      ctx.textAlign = 'left'
      ctx.font = 'bold 11px sans-serif'
      ctx.fillText(this.game.awayTeam, padding.left + 30, padding.top + 12)
      const bottomGridlineY = yScale(-maxLeadRounded)
      ctx.fillText(this.game.homeTeam, padding.left + 30, bottomGridlineY - 3)
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
      // Depend on isDarkMode so this recomputes when dark mode changes
      const mode = this.isDarkMode ? 'D' : 'L'
      return teamImageURL(this.game.awayTeam, mode)
    },
    homeImageURL: function () {
      // Depend on isDarkMode so this recomputes when dark mode changes
      const mode = this.isDarkMode ? 'D' : 'L'
      return teamImageURL(this.game.homeTeam, mode)
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
    },
    teamColorStyles: function () {
      if (this.teamColors && this.teamColors.away && this.teamColors.home) {
        return {
          '--away-team-color': `#${this.teamColors.away}`,
          '--home-team-color': `#${this.teamColors.home}`,
          '--away-team-alt-color': this.game.awayTeamAltColor ? `#${this.game.awayTeamAltColor}` : `#${this.teamColors.away}`,
          '--home-team-alt-color': this.game.homeTeamAltColor ? `#${this.game.homeTeamAltColor}` : `#${this.teamColors.home}`
        }
      }
      return {}
    }
  }
}
