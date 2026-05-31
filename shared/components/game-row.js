const gameRowTemplate = `
<div class="game-row" :class="{'expanded': isExpanded, 'expandable': hasExpandableContent}" :style="teamColorStyles">
  <div class="game-summary" :class="{'pre-game-summary': !started}" @click="hasExpandableContent && toggleExpand()">
    <div class="team-side away-side">
      <img v-if="awayImageURL" class="team-logo" :src="awayImageURL">
      <div v-else class="team-logo-placeholder"></div>
      <span class="team-name"><span v-if="game.awaySeed" class="team-seed">{{ game.awaySeed }}</span>{{ game.awayTeamName }}</span>
      <span class="team-record">{{ game.awaySeed ? '\xa0' : game.awayRecord }}</span>
    </div>

    <div v-if="started" class="score away-score" :class="{'losing-score': isAwayLosing}">{{ displayScoreboard.awayScore }}</div>

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
      <div v-if="!started && game.headline" class="headline">
        <span v-for="(line, i) in headlineLines" :key="i" class="headline-line">{{ line }}</span>
      </div>
    </div>

    <div v-if="started" class="score home-score" :class="{'losing-score': isHomeLosing}">{{ displayScoreboard.homeScore }}</div>

    <div class="team-side home-side">
      <img v-if="homeImageURL" class="team-logo" :src="homeImageURL">
      <div v-else class="team-logo-placeholder"></div>
      <span class="team-name"><span v-if="game.homeSeed" class="team-seed">{{ game.homeSeed }}</span>{{ game.homeTeamName }}</span>
      <span class="team-record">{{ game.homeSeed ? '\xa0' : game.homeRecord }}</span>
    </div>

    <div v-if="started && game.headline" class="headline">
      <span v-for="(line, i) in headlineLines" :key="i" class="headline-line">{{ line }}</span>
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
            <button
              v-if="hasWinProb"
              class="game-flow-tab"
              :class="{'active': chartMode === 'winProb'}"
              @click.stop="setChartMode('winProb')">
              Win Prob.
            </button>
          </div>
        </div>
        <div v-if="gameFlowLoading && !gameFlowData" class="game-flow-loading">Loading...</div>
        <div v-if="gameFlowData" class="game-flow-chart-container">
          <canvas ref="gameFlowCanvas" class="game-flow-canvas" @mousedown="handleCanvasMouseDown" @mousemove="handleCanvasHover" @mouseup="handleCanvasMouseUp" @mouseleave="handleCanvasLeave" @touchstart="handleTouchStart" @touchmove="handleCanvasTouchMove" @touchend="handleTouchEnd"></canvas>
          <button v-if="rangeTooltip" class="game-flow-zoom-action" @click.stop="applyZoomFromSelection">Zoom</button>
          <button v-else-if="isZoomed" class="game-flow-zoom-action" @click.stop="resetZoom" aria-label="Reset zoom">✕ Zoom</button>
          <div v-if="rangeTooltip" class="game-flow-tooltip">
            <button class="tooltip-close" @click.stop="clearChartSelection" aria-label="Clear selection">✕</button>
            <div class="tooltip-time">{{ rangeTooltip.timeRange }}</div>
            <div class="tooltip-score">{{ rangeTooltip.scoreLine }}</div>
          </div>
          <div v-else-if="singlePointTooltip" class="game-flow-tooltip">
            <button v-if="isMobile && rangeStartIndex != null" class="tooltip-close" @click.stop="clearChartSelection" aria-label="Clear selection">✕</button>
            <div class="tooltip-time">{{ singlePointTooltip.time }} - {{ singlePointTooltip.quarter }} · {{ chartMode === 'winProb' && singlePointTooltip.homeWinPct != null ? formatWinProb(singlePointTooltip) : formatLead(singlePointTooltip) }}</div>
            <div class="tooltip-score">{{ singlePointTooltip.awayTeam }} {{ singlePointTooltip.awayScore }} - {{ singlePointTooltip.homeTeam }} {{ singlePointTooltip.homeScore }}</div>
            <div class="tooltip-description">{{ singlePointTooltip.description }}</div>
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
      hoveredPlayIndex: null,
      rangeStartIndex: null,
      rangeEndIndex: null,
      mouseDownX: null,
      mouseDownIndex: null,
      isDraggingRange: false,
      touchStartX: null,
      touchStartY: null,
      touchMoved: false,
      touchMode: null,
      adjustingEndpoint: null,
      resizeTimeout: null,
      showLocalTooltip: false,
      zoomStartIndex: null,
      zoomEndIndex: null,
      zoomAnimMin: null,
      zoomAnimMax: null,
      zoomAnimRAF: null
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
    document.removeEventListener('mousemove', this.handleDocumentMouseMove)
    document.removeEventListener('mouseup', this.handleDocumentMouseUp)
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
    orderedRange(a, b) {
      return a <= b ? [a, b] : [b, a]
    },
    clipToChartArea(ctx, padding, chartWidth, chartHeight) {
      ctx.save()
      ctx.beginPath()
      ctx.rect(padding.left, padding.top, chartWidth, chartHeight)
      ctx.clip()
    },
    getXDomain() {
      if (this.zoomAnimMin != null && this.zoomAnimMax != null) {
        return { minTime: this.zoomAnimMin, maxTime: this.zoomAnimMax }
      }
      if (this.zoomStartIndex != null && this.zoomEndIndex != null && this.chartData) {
        const data = this.chartData
        const [aIdx, bIdx] = this.orderedRange(this.zoomStartIndex, this.zoomEndIndex)
        const a = data[aIdx]
        const b = data[bIdx]
        if (a && b) return { minTime: a.time, maxTime: b.time }
      }
      return { minTime: 0, maxTime: this.getMaxTime() }
    },
    applyZoomFromSelection() {
      if (this.rangeStartIndex == null || this.rangeEndIndex == null) return
      if (this.rangeStartIndex === this.rangeEndIndex) return
      const data = this.chartData
      if (!data) return
      const [aIdx, bIdx] = this.orderedRange(this.rangeStartIndex, this.rangeEndIndex)
      if (data[aIdx].time === data[bIdx].time) return
      this.animateZoomToIndices(aIdx, bIdx)
    },
    animateZoomToIndices(targetStartIdx, targetEndIdx) {
      const data = this.chartData
      if (!data || !data[targetStartIdx] || !data[targetEndIdx]) return
      const fromDomain = this.getXDomain()
      const fromMin = fromDomain.minTime
      const fromMax = fromDomain.maxTime
      const targetMin = data[targetStartIdx].time
      const targetMax = data[targetEndIdx].time

      this.zoomStartIndex = targetStartIdx
      this.zoomEndIndex = targetEndIdx
      this.runZoomAnim(fromMin, fromMax, targetMin, targetMax, () => {
        this.zoomAnimMin = null
        this.zoomAnimMax = null
      })
    },
    resetZoom() {
      if (this.zoomStartIndex == null) return
      const fromDomain = this.getXDomain()
      const targetMin = 0
      const targetMax = this.getMaxTime()
      this.runZoomAnim(fromDomain.minTime, fromDomain.maxTime, targetMin, targetMax, () => {
        this.zoomStartIndex = null
        this.zoomEndIndex = null
        this.zoomAnimMin = null
        this.zoomAnimMax = null
      })
    },
    runZoomAnim(fromMin, fromMax, targetMin, targetMax, onDone) {
      if (this.zoomAnimRAF != null) {
        cancelAnimationFrame(this.zoomAnimRAF)
        this.zoomAnimRAF = null
      }
      const duration = 300
      const startTs = performance.now()
      const ease = (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
      const step = (now) => {
        const elapsed = now - startTs
        const t = Math.min(1, elapsed / duration)
        const k = ease(t)
        if (t < 1) {
          this.zoomAnimMin = fromMin + (targetMin - fromMin) * k
          this.zoomAnimMax = fromMax + (targetMax - fromMax) * k
          this.drawGameFlow()
          this.zoomAnimRAF = requestAnimationFrame(step)
        } else {
          // Clear anim state first so getXDomain returns the index-derived
          // (or unzoomed) domain. The final draw lands on the exact target.
          this.zoomAnimRAF = null
          if (onDone) onDone()
          this.drawGameFlow()
        }
      }
      this.zoomAnimRAF = requestAnimationFrame(step)
    },
    getMaxTime() {
      const data = this.chartData
      if (!data || data.length === 0) return 0

      const lastDataTime = data[data.length - 1].time
      const maxPeriod = Math.max(...data.map(d => d.period))
      const endOfRegulation = LEAGUE.regulationPeriods * LEAGUE.periodSeconds

      // If game is ongoing, extend x-axis to the end of the current period (regulation or OT)
      if (this.playing) {
        if (maxPeriod <= LEAGUE.regulationPeriods) {
          if (lastDataTime < endOfRegulation) return endOfRegulation
        } else {
          const otNum = maxPeriod - LEAGUE.regulationPeriods
          const endOfCurrentOT = endOfRegulation + otNum * LEAGUE.otSeconds
          if (lastDataTime < endOfCurrentOT) return endOfCurrentOT
        }
      }
      return lastDataTime
    },
    getPlayIndexAtEvent(event, { clamp = false } = {}) {
      const canvas = this.$refs.gameFlowCanvas
      const data = this.chartData
      if (!canvas || !data) return null

      const rect = canvas.getBoundingClientRect()
      const clientX = event.touches && event.touches[0]
        ? event.touches[0].clientX
        : (event.changedTouches && event.changedTouches[0]
          ? event.changedTouches[0].clientX
          : event.clientX)
      const mouseX = clientX - rect.left
      // IMPORTANT: These padding values must match the padding used in drawScoreFlow() and drawLeadTracker()
      const padding = { left: this.isMobile ? 0 : 20, right: this.isMobile ? 0 : 20 }
      const chartWidth = canvas.offsetWidth - padding.left - padding.right
      let relativeX = mouseX - padding.left

      if (relativeX < 0 || relativeX > chartWidth) {
        if (!clamp) return null
        relativeX = Math.max(0, Math.min(chartWidth, relativeX))
      }

      const { minTime, maxTime } = this.getXDomain()
      const span = maxTime - minTime || 1
      const xScale = (time) => ((time - minTime) / span) * chartWidth

      // Default to last play so the exact-right-edge case (relativeX === chartWidth)
      // snaps to end-of-game rather than start-of-game
      let selectedIndex = data.length - 1
      for (let i = 1; i < data.length; i++) {
        const currentX = xScale(data[i].time)
        let zoneStart, zoneEnd
        if (i === 1) {
          zoneStart = 0
        } else {
          const prevX = xScale(data[i - 1].time)
          zoneStart = (prevX + currentX) / 2
        }
        if (i === data.length - 1) {
          zoneEnd = chartWidth
        } else {
          const nextX = xScale(data[i + 1].time)
          zoneEnd = (currentX + nextX) / 2
        }
        if (relativeX >= zoneStart && relativeX < zoneEnd) {
          selectedIndex = i
          break
        }
      }
      return selectedIndex
    },
    setHoverFromIndex(index) {
      this.hoveredPlayIndex = index
    },
    clearRange() {
      this.rangeStartIndex = null
      this.rangeEndIndex = null
    },
    clearChartSelection() {
      this.clearRange()
      this.hoveredPlayIndex = null
      this.redrawChart()
    },
    handleCanvasMouseDown(event) {
      if (this.isMobile) return
      const idx = this.getPlayIndexAtEvent(event)
      if (idx == null) return
      this.mouseDownX = event.clientX
      this.mouseDownIndex = idx
      this.isDraggingRange = false
      // If a range is already locked, mousedown near either endpoint grabs that
      // endpoint for dragging instead of starting a fresh selection.
      if (this.rangeStartIndex != null && this.rangeEndIndex != null) {
        const distStart = this.distanceToIndexPx(event, this.rangeStartIndex)
        const distEnd = this.distanceToIndexPx(event, this.rangeEndIndex)
        const grabRadius = 10
        if (Math.min(distStart, distEnd) <= grabRadius) {
          this.adjustingEndpoint = distStart <= distEnd ? 'start' : 'end'
          this.hoveredPlayIndex = null
        }
      }
      // Track movement and release at the document level so the drag continues
      // even when the cursor leaves the canvas
      document.addEventListener('mousemove', this.handleDocumentMouseMove)
      document.addEventListener('mouseup', this.handleDocumentMouseUp)
    },
    handleDocumentMouseMove(event) {
      this.handleCanvasHover(event)
    },
    handleDocumentMouseUp(event) {
      document.removeEventListener('mousemove', this.handleDocumentMouseMove)
      document.removeEventListener('mouseup', this.handleDocumentMouseUp)
      this.finalizeMouseGesture(event)
    },
    handleCanvasMouseUp(event) {
      // No-op: finalization happens via the document-level mouseup
    },
    finalizeMouseGesture(event) {
      if (this.isMobile) return
      if (this.adjustingEndpoint != null) {
        // Endpoint drag finished. If endpoints collapsed, drop the range.
        if (this.rangeStartIndex === this.rangeEndIndex) {
          this.clearRange()
          this.redrawChart()
        }
      } else if (this.isDraggingRange) {
        if (this.rangeStartIndex === this.rangeEndIndex) {
          this.clearRange()
        }
      } else if (this.mouseDownIndex != null) {
        // Plain click - if range was set, clear it; resume hover
        if (this.rangeStartIndex != null || this.rangeEndIndex != null) {
          this.clearRange()
          this.setHoverFromIndex(this.mouseDownIndex)
          this.redrawChart()
        }
      }
      this.adjustingEndpoint = null
      this.isDraggingRange = false
      this.mouseDownX = null
      this.mouseDownIndex = null
    },
    handleCanvasHover(event) {
      // Ignore synthesized mouse events fired after touch on mobile
      if (this.isMobile && event && event.type && event.type.startsWith('mouse')) return

      const canvas = this.$refs.gameFlowCanvas
      if (!canvas || !this.gameFlowData) return

      // Desktop endpoint-adjust drag (mousedown started on an existing endpoint dot)
      if (!this.isMobile && this.adjustingEndpoint != null) {
        const curIdx = this.getPlayIndexAtEvent(event, { clamp: true })
        if (curIdx != null) {
          if (this.adjustingEndpoint === 'start') this.rangeStartIndex = curIdx
          else this.rangeEndIndex = curIdx
          this.redrawChart()
        }
        return
      }

      // Desktop drag-to-select range
      if (!this.isMobile && this.mouseDownIndex != null) {
        const dx = Math.abs(event.clientX - this.mouseDownX)
        if (dx > 5 || this.isDraggingRange) {
          if (!this.isDraggingRange) {
            this.isDraggingRange = true
            this.rangeStartIndex = this.mouseDownIndex
            this.hoveredPlayIndex = null
          }
          const curIdx = this.getPlayIndexAtEvent(event, { clamp: true })
          if (curIdx != null) {
            this.rangeEndIndex = curIdx
            this.redrawChart()
          }
          return
        }
      }

      // If a range is locked (and not currently dragging), don't update hover
      if (!this.isDraggingRange && this.rangeStartIndex != null && this.rangeEndIndex != null) {
        return
      }
      // If only one endpoint is locked (mobile mid-selection), still allow hover preview
      const idx = this.getPlayIndexAtEvent(event)
      this.setHoverFromIndex(idx)
      this.redrawChart()
    },
    handleCanvasLeave() {
      // Ignore synthesized mouseleave on mobile
      if (this.isMobile) return
      // If a drag is in progress, document-level listeners keep tracking — don't finalize
      if (this.mouseDownIndex != null || this.isDraggingRange) return
      this.hoveredPlayIndex = null
      this.redrawChart()
    },
    distanceToIndexPx(event, index) {
      const canvas = this.$refs.gameFlowCanvas
      if (!canvas || index == null) return Infinity
      const rect = canvas.getBoundingClientRect()
      const clientX = event.touches && event.touches[0]
        ? event.touches[0].clientX
        : event.clientX
      if (clientX == null) return Infinity
      const touchX = clientX - rect.left
      const padding = { left: this.isMobile ? 0 : 20, right: this.isMobile ? 0 : 20 }
      const chartWidth = canvas.offsetWidth - padding.left - padding.right
      const { minTime, maxTime } = this.getXDomain()
      const span = maxTime - minTime || 1
      const xScale = (time) => ((time - minTime) / span) * chartWidth
      const data = this.chartData
      if (!data || !data[index]) return Infinity
      const dotX = padding.left + xScale(data[index].time)
      return Math.abs(touchX - dotX)
    },
    handleTouchStart(event) {
      if (!event.touches || !event.touches[0]) return
      this.touchStartX = event.touches[0].clientX
      this.touchStartY = event.touches[0].clientY
      this.touchMoved = false

      // Determine gesture mode from current state and touch position
      if (this.rangeStartIndex != null && this.rangeEndIndex != null) {
        // State C: near either endpoint → adjust that endpoint; far → replace range
        const distStart = this.distanceToIndexPx(event, this.rangeStartIndex)
        const distEnd = this.distanceToIndexPx(event, this.rangeEndIndex)
        const nearest = Math.min(distStart, distEnd)
        if (nearest <= 30) {
          this.touchMode = 'adjust-endpoint'
          this.adjustingEndpoint = distStart <= distEnd ? 'start' : 'end'
          this.hoveredPlayIndex = null
          this.redrawChart()
          return
        }
        // Far from both endpoints: clear range and set a fresh anchor
        this.touchMode = 'set-anchor'
        this.clearRange()
        this.handleCanvasHover(event)
        return
      }
      if (this.rangeStartIndex != null) {
        // State B: near anchor → extend; far → set a fresh anchor
        if (this.distanceToIndexPx(event, this.rangeStartIndex) <= 30) {
          this.touchMode = 'extend'
          const idx = this.getPlayIndexAtEvent(event)
          this.rangeEndIndex = idx
          this.hoveredPlayIndex = null
          this.redrawChart()
          return
        }
        // Clear the old anchor immediately so the visible dot tracks the new touch
        this.clearRange()
      }
      this.touchMode = 'set-anchor'
      // Preview the hovered point while finger is down
      this.handleCanvasHover(event)
    },
    handleCanvasTouchMove(event) {
      if (event.touches && event.touches[0]) {
        const dx = Math.abs(event.touches[0].clientX - (this.touchStartX || 0))
        const dy = Math.abs(event.touches[0].clientY - (this.touchStartY || 0))
        if (dx > 8 || dy > 8) this.touchMoved = true
      }
      if (this.touchMode === 'extend') {
        const idx = this.getPlayIndexAtEvent(event, { clamp: true })
        if (idx != null) {
          this.rangeEndIndex = idx
          this.redrawChart()
        }
        return
      }
      if (this.touchMode === 'adjust-endpoint') {
        const idx = this.getPlayIndexAtEvent(event, { clamp: true })
        if (idx != null) {
          if (this.adjustingEndpoint === 'start') this.rangeStartIndex = idx
          else this.rangeEndIndex = idx
          this.redrawChart()
        }
        return
      }
      this.handleCanvasHover(event)
    },
    handleTouchEnd(event) {
      const mode = this.touchMode
      const moved = this.touchMoved
      const adjusting = this.adjustingEndpoint
      this.touchMode = null
      this.adjustingEndpoint = null
      this.touchMoved = false
      this.touchStartX = null
      this.touchStartY = null

      if (mode === 'extend') {
        if (!moved || this.rangeStartIndex === this.rangeEndIndex) {
          // Tap on the anchor dot, or drag that ended on the anchor → clear it
          this.clearRange()
        }
        this.hoveredPlayIndex = null
        this.redrawChart()
        return
      }

      if (mode === 'adjust-endpoint') {
        if (!moved) {
          // Tap on the endpoint dot without dragging → remove that endpoint
          if (adjusting === 'start') {
            this.rangeStartIndex = this.rangeEndIndex
          }
          this.rangeEndIndex = null
        } else if (this.rangeStartIndex === this.rangeEndIndex) {
          // Endpoint dragged onto the other → collapse to single anchor
          this.rangeEndIndex = null
        }
        this.hoveredPlayIndex = null
        this.redrawChart()
        return
      }

      // 'set-anchor' — lock anchor at release position
      const idx = this.getPlayIndexAtEvent(event)
      this.hoveredPlayIndex = null
      if (idx == null) {
        // Released off-chart — bail without changing state
        this.redrawChart()
        return
      }
      this.rangeStartIndex = idx
      this.rangeEndIndex = null
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
        const url = LEAGUE.summaryURL(this.game.id)
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
          this.gameFlowData = this.processGameFlowData(data.plays, data.winprobability)
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
    processGameFlowData(plays, winprobability) {
      // Build a map of playId -> homeWinPercentage from winprobability array
      const winProbMap = {}
      if (winprobability && winprobability.length) {
        winprobability.forEach(wp => {
          if (wp.playId != null) {
            winProbMap[wp.playId] = wp.homeWinPercentage
          }
        })
      }

      // Filter to only scoring plays and collect data points
      const dataPoints = []

      plays.forEach(play => {
        if (play.awayScore !== undefined && play.homeScore !== undefined) {
          const period = play.period?.number || 1
          const clock = play.clock?.displayValue || '0:00'
          const totalSeconds = clockToElapsedSeconds(period, clock)

          const homeWinPct = winProbMap[play.id]

          dataPoints.push({
            time: totalSeconds,
            awayScore: play.awayScore,
            homeScore: play.homeScore,
            period: period,
            clock: clock,
            periodDisplay: play.period?.displayValue || '',
            description: play.text || '',
            homeWinPct: homeWinPct != null ? homeWinPct : null
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
      if (this.chartMode === 'winProb' && this.hasWinProb) {
        this.drawWinProb()
      } else if (this.chartMode === 'lead') {
        this.drawLeadTracker()
      } else {
        this.drawScoreFlow()
      }
    },
    drawScoreFlow() {
      const canvas = this.$refs.gameFlowCanvas
      const data = this.chartData
      if (!canvas || !data || data.length === 0) return

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
        ...data.map(d => Math.max(d.awayScore, d.homeScore))
      )
      // Round up to nearest 25
      const maxScore = Math.ceil(actualMaxScore / 25) * 25
      const maxTime = this.getMaxTime()
      const { minTime: xMin, maxTime: xMax } = this.getXDomain()
      const xSpan = xMax - xMin || 1
      const maxPeriod = Math.max(...data.map(d => d.period))

      // Scales
      const xScale = (time) => padding.left + ((time - xMin) / xSpan) * chartWidth
      const yScale = (score) => padding.top + chartHeight - (score / maxScore) * chartHeight

      // Draw minor grid lines at every point
      ctx.strokeStyle = this.isDarkMode ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.03)'
      ctx.lineWidth = 1
      for (let score = 1; score <= maxScore; score++) {
        if (score % 25 === 0) continue
        const y = yScale(score)
        ctx.beginPath()
        ctx.moveTo(padding.left, y)
        ctx.lineTo(width - padding.right, y)
        ctx.stroke()
      }

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
      for (let quarter = 1; quarter < LEAGUE.regulationPeriods; quarter++) {
        const x = xScale(quarter * LEAGUE.periodSeconds)
        ctx.beginPath()
        ctx.moveTo(x, padding.top)
        ctx.lineTo(x, height - padding.bottom)
        ctx.stroke()
      }

      // Draw OT lines if game went to overtime
      if (maxPeriod > LEAGUE.regulationPeriods) {
        // Draw line at start of each OT period
        for (let otNum = 1; otNum <= maxPeriod - LEAGUE.regulationPeriods; otNum++) {
          const x = xScale(LEAGUE.regulationPeriods * LEAGUE.periodSeconds + (otNum - 1) * LEAGUE.otSeconds)
          ctx.beginPath()
          ctx.moveTo(x, padding.top)
          ctx.lineTo(x, height - padding.bottom)
          ctx.stroke()
        }
      }
      ctx.setLineDash([])

      // Clip lines/fills/shading to the chart area so off-domain points don't bleed
      // into axis/label space when zoomed. Dot markers are drawn after restore so
      // they remain fully visible when positioned at the very chart edges.
      this.clipToChartArea(ctx, padding, chartWidth, chartHeight)

      // Draw away team line (as steps) with rounded corners
      const chartColors = this.getChartColors()
      const awayColor = `#${chartColors.away}`
      ctx.strokeStyle = awayColor
      ctx.lineWidth = this.isMobile ? 1.5 : 2
      ctx.lineJoin = 'round'
      ctx.lineCap = 'butt'
      ctx.beginPath()
      data.forEach((point, i) => {
        if (point.synthetic) return
        const x = xScale(point.time)
        const y = yScale(point.awayScore)
        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          const prevY = yScale(data[i - 1].awayScore)
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
      data.forEach((point, i) => {
        if (point.synthetic) return
        const x = xScale(point.time)
        const y = yScale(point.homeScore)
        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          const prevY = yScale(data[i - 1].homeScore)
          // Draw horizontal line at previous score level
          ctx.lineTo(x, prevY)
          // Draw vertical line to new score
          ctx.lineTo(x, y)
        }
      })
      ctx.stroke()

      // Shade the range region if two endpoints are set
      if (this.rangeStartIndex != null && this.rangeEndIndex != null && this.rangeStartIndex !== this.rangeEndIndex) {
        const [aIdx, bIdx] = this.orderedRange(this.rangeStartIndex, this.rangeEndIndex)
        const xA = xScale(data[aIdx].time)
        const xB = xScale(data[bIdx].time)
        ctx.fillStyle = this.isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)'
        ctx.fillRect(xA, padding.top, xB - xA, height - padding.top - padding.bottom)
      }

      ctx.restore()

      // Draw disconnected dot(s) for any synthetic trailing point.
      // Diameter matches the score-flow line width.
      const syntheticDotRadius = (this.isMobile ? 1.5 : 2) / 2
      data.forEach(point => {
        if (!point.synthetic) return
        const x = xScale(point.time)
        if (x < padding.left - 1 || x > padding.left + chartWidth + 1) return
        ctx.fillStyle = awayColor
        ctx.beginPath()
        ctx.arc(x, yScale(point.awayScore), syntheticDotRadius, 0, 2 * Math.PI)
        ctx.fill()
        ctx.fillStyle = homeColor
        ctx.beginPath()
        ctx.arc(x, yScale(point.homeScore), syntheticDotRadius, 0, 2 * Math.PI)
        ctx.fill()
      })

      // Highlight selected/hovered points with dots
      const dotRadius = this.isMobile ? 4 : 5
      this.highlightIndices.forEach(i => {
        if (i === 0) return
        const point = data[i]
        if (!point) return
        const x = xScale(point.time)
        if (x < padding.left - dotRadius || x > padding.left + chartWidth + dotRadius) return
        ctx.fillStyle = awayColor
        ctx.beginPath()
        ctx.arc(x, yScale(point.awayScore), dotRadius, 0, 2 * Math.PI)
        ctx.fill()
        ctx.fillStyle = homeColor
        ctx.beginPath()
        ctx.arc(x, yScale(point.homeScore), dotRadius, 0, 2 * Math.PI)
        ctx.fill()
      })

      // Draw axis labels
      ctx.fillStyle = this.isDarkMode ? '#aaa' : '#495057'
      ctx.font = '12px sans-serif'
      ctx.textAlign = 'center'

      // Quarter labels
      const quarterLabels = ['1st', '2nd', '3rd', '4th']
      quarterLabels.forEach((label, i) => {
        const x = xScale((i + 0.5) * LEAGUE.periodSeconds)
        ctx.fillText(label, x, height - 10)
      })

      // OT labels if game went to overtime
      if (maxPeriod > LEAGUE.regulationPeriods) {
        const numOvertimes = maxPeriod - LEAGUE.regulationPeriods
        for (let otNum = 1; otNum <= numOvertimes; otNum++) {
          const otStart = LEAGUE.regulationPeriods * LEAGUE.periodSeconds + (otNum - 1) * LEAGUE.otSeconds
          const otEnd = otNum === numOvertimes ? maxTime : (LEAGUE.regulationPeriods * LEAGUE.periodSeconds + otNum * LEAGUE.otSeconds)
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
    drawWinProb() {
      const canvas = this.$refs.gameFlowCanvas
      const data = this.chartData
      if (!canvas || !data || data.length === 0) return

      const ctx = canvas.getContext('2d')
      const dpr = window.devicePixelRatio || 1

      const width = canvas.offsetWidth
      const height = 300
      canvas.width = width * dpr
      canvas.height = height * dpr
      canvas.style.width = width + 'px'
      canvas.style.height = height + 'px'
      ctx.scale(dpr, dpr)

      const padding = {
        top: 20,
        right: this.isMobile ? 0 : 20,
        bottom: 40,
        left: this.isMobile ? 0 : 20
      }
      const chartWidth = width - padding.left - padding.right
      const chartHeight = height - padding.top - padding.bottom

      // Build win prob data points. Value is awayWinPct - homeWinPct on a -100..+100 scale
      // (positive = away favored, matching lead chart convention).
      // Skip plays with no winprobability entry. Preserve synthetic flag.
      const wpData = data
        .map(point => point.homeWinPct == null ? null : {
          time: point.time,
          // homeWinPct is 0..1. value = (away - home) * 100, where away = 1 - home - tie (tie ~0)
          value: (1 - 2 * point.homeWinPct) * 100,
          homeWinPct: point.homeWinPct,
          period: point.period,
          synthetic: !!point.synthetic
        })
        .filter(p => p !== null)

      if (wpData.length === 0) return

      const maxTime = this.getMaxTime()
      const { minTime: xMin, maxTime: xMax } = this.getXDomain()
      const xSpan = xMax - xMin || 1
      const maxPeriod = Math.max(...data.map(d => d.period))

      // Fixed bounds: ±100
      const maxBound = 100
      const xScale = (time) => padding.left + ((time - xMin) / xSpan) * chartWidth
      const halfHeight = chartHeight / 2
      const zeroY = padding.top + halfHeight
      const yScale = (value) => zeroY - (value / maxBound) * halfHeight

      // Major gridlines at ±50 (75% favored) and ±100 (100% favored)
      ctx.strokeStyle = this.isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.08)'
      ctx.lineWidth = 1
      ;[-100, -50, 50, 100].forEach(v => {
        const y = yScale(v)
        ctx.beginPath()
        ctx.moveTo(padding.left, y)
        ctx.lineTo(width - padding.right, y)
        ctx.stroke()
      })

      // Center line (50/50) thicker
      ctx.strokeStyle = this.isDarkMode ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.3)'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(padding.left, zeroY)
      ctx.lineTo(width - padding.right, zeroY)
      ctx.stroke()

      // Quarter lines
      ctx.strokeStyle = this.isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.12)'
      ctx.lineWidth = 1
      ctx.setLineDash([3, 3])
      for (let quarter = 1; quarter < LEAGUE.regulationPeriods; quarter++) {
        const x = xScale(quarter * LEAGUE.periodSeconds)
        ctx.beginPath()
        ctx.moveTo(x, padding.top)
        ctx.lineTo(x, height - padding.bottom)
        ctx.stroke()
      }
      if (maxPeriod > LEAGUE.regulationPeriods) {
        for (let otNum = 1; otNum <= maxPeriod - LEAGUE.regulationPeriods; otNum++) {
          const x = xScale(LEAGUE.regulationPeriods * LEAGUE.periodSeconds + (otNum - 1) * LEAGUE.otSeconds)
          ctx.beginPath()
          ctx.moveTo(x, padding.top)
          ctx.lineTo(x, height - padding.bottom)
          ctx.stroke()
        }
      }
      ctx.setLineDash([])

      // Clip lines/fills/shading to the chart area. Dots are drawn after restore.
      this.clipToChartArea(ctx, padding, chartWidth, chartHeight)

      // Filled area chart (smooth line, not stepped — win prob updates between plays)
      const realData = wpData.filter(p => !p.synthetic)
      if (realData.length > 0) {
        ctx.beginPath()
        ctx.moveTo(xScale(realData[0].time), zeroY)
        realData.forEach(point => {
          ctx.lineTo(xScale(point.time), yScale(point.value))
        })
        ctx.lineTo(xScale(realData[realData.length - 1].time), zeroY)
        ctx.closePath()

        const chartColors = this.getChartColors()
        const awayColor = `#${chartColors.away}`
        const homeColor = `#${chartColors.home}`

        // Linear opacity ramp: transparent at 50/50, full opacity at 100% certain.
        const opacityMax = 0.8
        const gradient = ctx.createLinearGradient(0, yScale(maxBound), 0, yScale(-maxBound))
        const endAlphaHex = Math.round(opacityMax * 255).toString(16).padStart(2, '0')
        gradient.addColorStop(0, awayColor + endAlphaHex)
        gradient.addColorStop(0.5, '#ffffff00')
        gradient.addColorStop(1, homeColor + endAlphaHex)
        ctx.fillStyle = gradient
        ctx.fill()

        // Draw line, colored by which team is favored at each segment
        ctx.lineWidth = this.isMobile ? 1 : 1.5
        ctx.lineJoin = 'round'
        ctx.lineCap = 'butt'

        for (let i = 1; i < realData.length; i++) {
          const prev = realData[i - 1]
          const curr = realData[i]
          let segColor
          if (curr.value > 0) segColor = awayColor
          else if (curr.value < 0) segColor = homeColor
          else if (prev.value > 0) segColor = awayColor
          else if (prev.value < 0) segColor = homeColor
          else segColor = this.isDarkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.3)'

          ctx.strokeStyle = segColor
          ctx.beginPath()
          ctx.moveTo(xScale(prev.time), yScale(prev.value))
          ctx.lineTo(xScale(curr.time), yScale(curr.value))
          ctx.stroke()
        }
      }

      // Shade selected range
      if (this.rangeStartIndex != null && this.rangeEndIndex != null && this.rangeStartIndex !== this.rangeEndIndex) {
        const [aIdx, bIdx] = this.orderedRange(this.rangeStartIndex, this.rangeEndIndex)
        const xA = xScale(data[aIdx].time)
        const xB = xScale(data[bIdx].time)
        ctx.fillStyle = this.isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)'
        ctx.fillRect(xA, padding.top, xB - xA, height - padding.top - padding.bottom)
      }

      ctx.restore()

      // Highlight selected/hovered points
      const chartColors = this.getChartColors()
      const awayColor = `#${chartColors.away}`
      const homeColor = `#${chartColors.home}`
      const dotRadius = this.isMobile ? 4 : 5
      this.highlightIndices.forEach(i => {
        if (i === 0) return
        const point = data[i]
        if (!point || point.homeWinPct == null) return
        const value = (1 - 2 * point.homeWinPct) * 100
        const x = xScale(point.time)
        if (x < padding.left - dotRadius || x > padding.left + chartWidth + dotRadius) return
        let color
        if (value > 0) color = awayColor
        else if (value < 0) color = homeColor
        else color = this.isDarkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.3)'
        ctx.fillStyle = color
        ctx.beginPath()
        ctx.arc(x, yScale(value), dotRadius, 0, 2 * Math.PI)
        ctx.fill()
      })

      // Axis labels
      ctx.fillStyle = this.isDarkMode ? '#aaa' : '#495057'
      ctx.font = '12px sans-serif'
      ctx.textAlign = 'center'

      const quarterLabels = ['1st', '2nd', '3rd', '4th']
      quarterLabels.forEach((label, i) => {
        const x = xScale((i + 0.5) * LEAGUE.periodSeconds)
        ctx.fillText(label, x, height - 10)
      })
      if (maxPeriod > LEAGUE.regulationPeriods) {
        const numOvertimes = maxPeriod - LEAGUE.regulationPeriods
        for (let otNum = 1; otNum <= numOvertimes; otNum++) {
          const otStart = LEAGUE.regulationPeriods * LEAGUE.periodSeconds + (otNum - 1) * LEAGUE.otSeconds
          const otEnd = otNum === numOvertimes ? maxTime : (LEAGUE.regulationPeriods * LEAGUE.periodSeconds + otNum * LEAGUE.otSeconds)
          const x = xScale((otStart + otEnd) / 2)
          const label = otNum === 1 ? 'OT' : `OT${otNum}`
          ctx.fillText(label, x, height - 10)
        }
      }

      // Y-axis labels: only 50% (centerline) and 100% on each end.
      ctx.textAlign = 'left'
      ctx.font = '11px sans-serif'
      ctx.fillText('50%', padding.left + 5, zeroY - 3)
      ctx.fillText('100%', padding.left + 5, yScale(100) + 12)
      ctx.fillText('100%', padding.left + 5, yScale(-100) - 3)

      // Team labels in corners
      ctx.textAlign = 'left'
      ctx.font = 'bold 11px sans-serif'
      ctx.fillText(this.game.awayTeam, padding.left + 40, padding.top + 12)
      ctx.fillText(this.game.homeTeam, padding.left + 40, padding.top + chartHeight - 3)
    },
    drawLeadTracker() {
      const canvas = this.$refs.gameFlowCanvas
      const data = this.chartData
      if (!canvas || !data || data.length === 0) return

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

      // Calculate lead differential for each point. Preserve synthetic flag so
      // we can skip those points when drawing the connecting line/fill.
      const leadData = data.map(point => ({
        time: point.time,
        lead: point.awayScore - point.homeScore, // positive = away leading, negative = home leading
        period: point.period,
        synthetic: !!point.synthetic
      }))

      // Determine each side's y-axis bound independently from each team's biggest lead.
      // Round up to the nearest 5, with a floor of 5 even if a team never led.
      const awayMaxLead = Math.max(0, ...leadData.map(d => d.lead))
      const homeMaxLead = Math.max(0, ...leadData.map(d => -d.lead))
      const maxAwayLeadRounded = Math.max(5, Math.ceil(awayMaxLead / 5) * 5)
      const maxHomeLeadRounded = Math.max(5, Math.ceil(homeMaxLead / 5) * 5)
      const totalLeadRange = maxAwayLeadRounded + maxHomeLeadRounded
      const maxTime = this.getMaxTime()
      const { minTime: xMin, maxTime: xMax } = this.getXDomain()
      const xSpan = xMax - xMin || 1
      const maxPeriod = Math.max(...data.map(d => d.period))

      // Scales
      const xScale = (time) => padding.left + ((time - xMin) / xSpan) * chartWidth
      const awayHeight = (maxAwayLeadRounded / totalLeadRange) * chartHeight
      const homeHeight = chartHeight - awayHeight
      const zeroY = padding.top + awayHeight
      const yScale = (lead) => lead >= 0
        ? zeroY - (lead / maxAwayLeadRounded) * awayHeight
        : zeroY + (-lead / maxHomeLeadRounded) * homeHeight

      // Draw minor grid lines at every point
      ctx.strokeStyle = this.isDarkMode ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.03)'
      ctx.lineWidth = 1
      for (let lead = -maxHomeLeadRounded; lead <= maxAwayLeadRounded; lead++) {
        if (lead === 0 || lead % 5 === 0) continue
        const y = yScale(lead)
        ctx.beginPath()
        ctx.moveTo(padding.left, y)
        ctx.lineTo(width - padding.right, y)
        ctx.stroke()
      }

      // Draw grid lines at 5-point intervals
      ctx.strokeStyle = this.isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.08)'
      ctx.lineWidth = 1
      const numAwayLines = maxAwayLeadRounded / 5
      const numHomeLines = maxHomeLeadRounded / 5
      for (let i = -numHomeLines; i <= numAwayLines; i++) {
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
      for (let quarter = 1; quarter < LEAGUE.regulationPeriods; quarter++) {
        const x = xScale(quarter * LEAGUE.periodSeconds)
        ctx.beginPath()
        ctx.moveTo(x, padding.top)
        ctx.lineTo(x, height - padding.bottom)
        ctx.stroke()
      }

      // Draw OT lines if game went to overtime
      if (maxPeriod > LEAGUE.regulationPeriods) {
        for (let otNum = 1; otNum <= maxPeriod - LEAGUE.regulationPeriods; otNum++) {
          const x = xScale(LEAGUE.regulationPeriods * LEAGUE.periodSeconds + (otNum - 1) * LEAGUE.otSeconds)
          ctx.beginPath()
          ctx.moveTo(x, padding.top)
          ctx.lineTo(x, height - padding.bottom)
          ctx.stroke()
        }
      }
      ctx.setLineDash([])

      // Clip lines/fills/shading to the chart area. Dots are drawn after restore.
      this.clipToChartArea(ctx, padding, chartWidth, chartHeight)

      // Draw filled area chart (excludes any trailing synthetic point so the
      // disconnected dot doesn't pull the polygon to the new x).
      const realLeadData = leadData.filter(p => !p.synthetic)
      ctx.beginPath()
      ctx.moveTo(xScale(realLeadData[0].time), yScale(0))

      realLeadData.forEach((point, i) => {
        const x = xScale(point.time)
        const y = yScale(point.lead)
        if (i === 0) {
          ctx.lineTo(x, y)
        } else {
          const prevY = yScale(realLeadData[i - 1].lead)
          ctx.lineTo(x, prevY)
          ctx.lineTo(x, y)
        }
      })

      ctx.lineTo(xScale(realLeadData[realLeadData.length - 1].time), yScale(0))
      ctx.closePath()

      // Fill with gradient (capped at 30-point lead = 100% opacity)
      const chartColors = this.getChartColors()
      const awayColor = `#${chartColors.away}`
      const homeColor = `#${chartColors.home}`

      // Opacity tapers exponentially toward an 80% asymptote: opacity(L) = 0.8 * (1 - exp(-|L|/k)).
      // k=8 gives noticeable jumps at small leads and effectively maxes out by ~+20.
      // Sampled at multiple stops since Canvas only interpolates linearly between them.
      const opacityK = 20
      const opacityMax = 0.8
      const gradLMax = 80
      const gradient = ctx.createLinearGradient(0, yScale(gradLMax), 0, yScale(-gradLMax))
      gradient.addColorStop(0.5, '#ffffff00')
      for (let lead = 1; lead <= gradLMax; lead++) {
        const alpha = opacityMax * (1 - Math.exp(-lead / opacityK))
        const alphaHex = Math.round(alpha * 255).toString(16).padStart(2, '0')
        gradient.addColorStop(0.5 - (lead / gradLMax) * 0.5, awayColor + alphaHex)
        gradient.addColorStop(0.5 + (lead / gradLMax) * 0.5, homeColor + alphaHex)
      }
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
        if (point.synthetic) return

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
          // currentLead === 0 (tie)
          // Use the color of the team that had the lead previously
          // This ensures vertical lines are always team-colored, not gray
          if (prevLead > 0) {
            segmentColor = awayColor
          } else if (prevLead < 0) {
            segmentColor = homeColor
          } else {
            // Both current and previous are 0 (horizontal line at 0)
            segmentColor = this.isDarkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.3)'
          }
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

      // Shade the range region if two endpoints are set
      if (this.rangeStartIndex != null && this.rangeEndIndex != null && this.rangeStartIndex !== this.rangeEndIndex) {
        const [aIdx, bIdx] = this.orderedRange(this.rangeStartIndex, this.rangeEndIndex)
        const xA = xScale(leadData[aIdx].time)
        const xB = xScale(leadData[bIdx].time)
        ctx.fillStyle = this.isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)'
        ctx.fillRect(xA, padding.top, xB - xA, height - padding.top - padding.bottom)
      }

      ctx.restore()

      // Highlight selected/hovered points on lead tracker
      const dotRadius = this.isMobile ? 4 : 5
      this.highlightIndices.forEach(i => {
        if (i === 0) return
        const point = leadData[i]
        if (!point) return
        const x = xScale(point.time)
        if (x < padding.left - dotRadius || x > padding.left + chartWidth + dotRadius) return
        let highlightColor
        if (point.lead > 0) highlightColor = awayColor
        else if (point.lead < 0) highlightColor = homeColor
        else highlightColor = this.isDarkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.3)'
        ctx.fillStyle = highlightColor
        ctx.beginPath()
        ctx.arc(x, yScale(point.lead), dotRadius, 0, 2 * Math.PI)
        ctx.fill()
      })

      // Draw disconnected dot for any synthetic trailing point.
      // Diameter matches the lead line width.
      const syntheticLeadDotRadius = (this.isMobile ? 1 : 1.5) / 2
      leadData.forEach(point => {
        if (!point.synthetic) return
        const x = xScale(point.time)
        if (x < padding.left - 1 || x > padding.left + chartWidth + 1) return
        let color
        if (point.lead > 0) color = awayColor
        else if (point.lead < 0) color = homeColor
        else color = this.isDarkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.3)'
        ctx.fillStyle = color
        ctx.beginPath()
        ctx.arc(x, yScale(point.lead), syntheticLeadDotRadius, 0, 2 * Math.PI)
        ctx.fill()
      })

      // Draw axis labels
      ctx.fillStyle = this.isDarkMode ? '#aaa' : '#495057'
      ctx.font = '12px sans-serif'
      ctx.textAlign = 'center'

      // Quarter labels
      const quarterLabels = ['1st', '2nd', '3rd', '4th']
      quarterLabels.forEach((label, i) => {
        const x = xScale((i + 0.5) * LEAGUE.periodSeconds)
        ctx.fillText(label, x, height - 10)
      })

      // OT labels if game went to overtime
      if (maxPeriod > LEAGUE.regulationPeriods) {
        const numOvertimes = maxPeriod - LEAGUE.regulationPeriods
        for (let otNum = 1; otNum <= numOvertimes; otNum++) {
          const otStart = LEAGUE.regulationPeriods * LEAGUE.periodSeconds + (otNum - 1) * LEAGUE.otSeconds
          const otEnd = otNum === numOvertimes ? maxTime : (LEAGUE.regulationPeriods * LEAGUE.periodSeconds + otNum * LEAGUE.otSeconds)
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
      for (let i = -numHomeLines; i <= numAwayLines; i++) {
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
      const bottomGridlineY = yScale(-maxHomeLeadRounded)
      ctx.fillText(this.game.homeTeam, padding.left + 30, bottomGridlineY - 3)
    },
    formatLead(play) {
      const diff = play.awayScore - play.homeScore
      if (diff === 0) return 'Tied'
      const leader = diff > 0 ? play.awayTeam : play.homeTeam
      return `${leader} +${Math.abs(diff)}`
    },
    formatWinProb(play) {
      const homePct = play.homeWinPct * 100
      const awayPct = 100 - homePct
      const fmt = (p) => {
        if (p >= 99.95) return '100%'
        if (p < 0.05) return '0%'
        // One decimal at the extremes so both sides stay symmetric (e.g. 0.1% / 99.9%)
        if (p < 10 || p > 90) return p.toFixed(1) + '%'
        return Math.round(p) + '%'
      }
      return `${this.game.awayTeam} ${fmt(awayPct)} · ${this.game.homeTeam} ${fmt(homePct)}`
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
    isZoomed() {
      return this.zoomStartIndex != null
    },
    highlightIndices() {
      if (this.rangeStartIndex != null && this.rangeEndIndex != null) {
        return [this.rangeStartIndex, this.rangeEndIndex]
      }
      if (this.rangeStartIndex != null) {
        return [this.rangeStartIndex]
      }
      if (this.hoveredPlayIndex != null && this.hoveredPlayIndex > 0) {
        return [this.hoveredPlayIndex]
      }
      return []
    },
    singlePointTooltip() {
      if (this.rangeTooltip) return null
      const indices = this.highlightIndices
      if (indices.length !== 1) return null
      const idx = indices[0]
      if (!this.chartData || idx <= 0) return null
      const play = this.chartData[idx]
      if (!play) return null
      return {
        time: play.clock,
        quarter: play.periodDisplay,
        awayTeam: this.game.awayTeam,
        homeTeam: this.game.homeTeam,
        awayScore: play.awayScore,
        homeScore: play.homeScore,
        homeWinPct: play.homeWinPct,
        description: play.description
      }
    },
    hasWinProb() {
      return !!(this.gameFlowData && this.gameFlowData.some(p => p.homeWinPct != null))
    },
    rangeTooltip() {
      if (this.rangeStartIndex == null || this.rangeEndIndex == null) return null
      if (this.rangeStartIndex === this.rangeEndIndex) return null
      const data = this.chartData
      if (!data) return null
      const [aIdx, bIdx] = this.orderedRange(this.rangeStartIndex, this.rangeEndIndex)
      const a = data[aIdx]
      const b = data[bIdx]
      if (!a || !b) return null
      const awayPts = b.awayScore - a.awayScore
      const homePts = b.homeScore - a.homeScore
      const diff = awayPts - homePts
      const away = this.game.awayTeam
      const home = this.game.homeTeam
      let leadStr
      if (diff === 0) leadStr = 'Even'
      else if (diff > 0) leadStr = `${away} +${diff}`
      else leadStr = `${home} +${Math.abs(diff)}`
      return {
        timeRange: `${a.clock} ${a.periodDisplay} → ${b.clock} ${b.periodDisplay} · ${leadStr}`,
        scoreLine: `${away} ${awayPts} - ${home} ${homePts}`,
      }
    },
    started: function () {
      return this.game.state !== 'pre' && this.game.state !== 'postponed'
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
        case 'postponed':
          return 'Postponed'
        case 'in':
          if (this.freshSource === 'pbp') {
            const pbpLast = this.gameFlowData[this.gameFlowData.length - 1]
            // Preserve statusDetail's "3rd – 5:23" shape; just swap in the
            // fresher clock value from the play-by-play feed.
            const sd = this.game.statusDetail || ''
            if (this.game.clock && sd.includes(this.game.clock)) {
              return sd.replace(this.game.clock, pbpLast.clock)
            }
            return sd
          }
          return this.game.statusDetail
        case 'post':
          return this.game.statusDetail
      }
    },
    // 'pbp' | 'scoreboard' | 'sync' — which source is more up-to-date.
    // Only active while the game is live; otherwise treated as in sync.
    freshSource: function () {
      if (this.game.state !== 'in') return 'sync'
      if (!this.gameFlowData || this.gameFlowData.length === 0) return 'sync'
      const pbpLast = this.gameFlowData[this.gameFlowData.length - 1]
      const sbElapsed = clockToElapsedSeconds(this.game.period, this.game.clock)
      const pbpElapsed = pbpLast.time
      if (pbpElapsed > sbElapsed) return 'pbp'
      if (sbElapsed > pbpElapsed) return 'scoreboard'
      // Tiebreak: higher score for either team wins.
      const sbMax = Math.max(this.game.awayScore, this.game.homeScore)
      const pbpMax = Math.max(pbpLast.awayScore, pbpLast.homeScore)
      if (pbpMax > sbMax) return 'pbp'
      if (sbMax > pbpMax) return 'scoreboard'
      return 'sync'
    },
    displayScoreboard: function () {
      if (this.freshSource === 'pbp') {
        const pbpLast = this.gameFlowData[this.gameFlowData.length - 1]
        return {
          awayScore: pbpLast.awayScore,
          homeScore: pbpLast.homeScore
        }
      }
      return {
        awayScore: this.game.awayScore,
        homeScore: this.game.homeScore
      }
    },
    // PBP data, plus a single trailing synthetic point when the scoreboard
    // is fresher. Consumed by the chart drawing + hover code.
    chartData: function () {
      if (!this.gameFlowData) return null
      if (this.freshSource !== 'scoreboard') return this.gameFlowData
      const sbElapsed = clockToElapsedSeconds(this.game.period, this.game.clock)
      return [
        ...this.gameFlowData,
        {
          time: sbElapsed,
          awayScore: this.game.awayScore,
          homeScore: this.game.homeScore,
          period: this.game.period,
          clock: this.game.clock,
          periodDisplay: this.game.statusDetail || '',
          description: '',
          synthetic: true
        }
      ]
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
      return this.game.state !== 'postponed' && !!(this.game.spreadFormatted || this.game.total || this.game.recap || this.hasStats || this.hasLeaders)
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
    headlineLines: function () {
      const h = this.game.headline
      if (!h) return []
      if (h.length <= 30 || !h.includes(' – ')) return [h]

      const sep = ' – '
      const mid = h.length / 2
      let bestDashIdx = -1
      let bestDist = Infinity
      let searchFrom = 0
      while (true) {
        const idx = h.indexOf(sep, searchFrom)
        if (idx === -1) break
        const dist = Math.abs(idx - mid)
        if (dist < bestDist) {
          bestDist = dist
          bestDashIdx = idx
        }
        searchFrom = idx + sep.length
      }
      return [h.slice(0, bestDashIdx), h.slice(bestDashIdx + sep.length)]
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
