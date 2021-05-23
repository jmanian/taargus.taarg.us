var gameTemplate = `
<td class='game' user-select="none" v-tooltip:top="hover" :class="[gameClass, {upset: upset}]" v-if='hasGame'>
  <img class='table-img' :src='winnerImageURL' v-if='played'>
  <div v-else>{{ content }}</div>
</td>
<td v-else :class='{ weekend: isWeekend }'>
</td>
`

var NGame = {
  template: gameTemplate,
  props: ['game', 'favorite', 'underdog', 'matchupFinished', 'minGames'],
  computed: {
    isWeekend: function () {
      return this.game == 'weekend'
    },
    hasGame: function () {
      return this.game != undefined && !this.isWeekend
    },
    scheduled: function () {
      return this.game.time != null
    },
    necessary: function () {
      return this.game.number <= this.minGames
    },
    begun: function () {
      return this.game.fscore != null && this.game.uscore != null
    },
    ongoing: function () {
      return this.game.clock != null && this.game.period != null
    },
    played: function () {
      return this.game.winner != null
    },
    uhome: function () {
      return underdogHome(this.game.number)
    },
    scoreLabel: function () {
      return this.game.fscore + '–' + this.game.uscore
    },
    fscoreLabel: function () {
      return this.favorite + " – " + this.game.fscore
    },
    uscoreLabel: function () {
      return this.underdog + " – " + this.game.uscore
    },
    homeScoreLabel: function () {
      return this.uhome ? this.uscoreLabel : this.fscoreLabel
    },
    awayScoreLabel: function () {
      return this.uhome ? this.fscoreLabel : this.uscoreLabel
    },
    timeAndNetwork: function () {
      return [this.localHoursMinutes, this.localAmPm, this.game.network].join(' ')
    },
    gameClock: function () {
      if (this.game.period.isHalftime) {
        return 'Halftime'
      } else if (this.game.period.isEndOfPeriod) {
        return 'End of ' + periodName(this.game.period.current)
      } else if (!this.played) {
        return periodName(this.game.period.current) + ' ' + this.game.clock
      } else if (this.game.period.current > 4) {
        return periodName(this.game.period.current)
      }
    },
    state: function () {
      if (this.played) {
        return 'played'
      } else if (this.begun && this.ongoing) {
        return 'playing'
      } else if (this.scheduled) {
        if (this.necessary) {
          return 'scheduledDefinite'
        } else {
          return 'scheduledPossible'
        }
      } else if (this.necessary) {
        return 'unscheduled'
      } else if (this.matchupFinished) {
        return 'notNeeded'
      } else if (this.game.loading) {
        return 'loading'
      } else {
        return 'ifNeeded'
      }
    },
    upset: function () {
      if (this.played) {
        if (this.uhome) {
          return this.game.winner == this.favorite
        } else {
          return this.game.winner == this.underdog
        }
      }
    },
    gameClass: function () {
      return 'game' + this.game.number
    },
    localAmPm: function () {
      var d = new Date(this.game.timeUTC)
      if (d.getHours() < 12) {
        return 'am'
      } else {
        return 'pm'
      }
    },
    localHoursMinutes: function () {
      var d = new Date(this.game.timeUTC)
      var hour = d.getHours()
      if (hour === 0) {
        hour = 12
      } else if (hour > 12) {
        hour = hour -12
      }
      var minute = d.getMinutes()
      return `${hour}:${minute.toString(10).padStart(2, '0')}`
    },
    localTimeShort: function () {
      if (this.localAmPm === 'am') {
        return `${this.localHoursMinutes}a`
      } else {
        return `${this.localHoursMinutes}p`
      }
    },
    winnerImageURL: function () {
      return teamImageURL(this.game.winner)
    },
    content: function () {
      switch (this.state) {
        case 'loading':
          return '...'
        case 'notNeeded':
          return '–'
        case 'ifNeeded':
          return '?'
        case 'unscheduled':
          return 'TBD'
        case 'scheduledPossible':
          return this.localTimeShort + '?'
        case 'scheduledDefinite':
          return this.localTimeShort
        case 'playing':
          return this.scoreLabel
        case 'played':
          return this.game.winner.toUpperCase()
      }
    },
    hover: function () {
      switch (this.state) {
        case 'loading':
          return 'loading...'
        case 'notNeeded':
          return 'Not Needed'
        case 'ifNeeded':
          return 'If Needed'
        case 'scheduledPossible':
          return ['If Needed', this.timeAndNetwork].join('\n')
        case 'scheduledDefinite':
          return this.timeAndNetwork
        case 'playing':
        case 'played':
          return [this.timeAndNetwork, this.awayScoreLabel, this.homeScoreLabel, this.gameClock].join("\n")
      }
    }
  }
}
