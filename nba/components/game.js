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
      if (this.game.timeUTC === null) {
        return false
      }
      var date = new Date(this.game.timeUTC)
      var hour = date.getUTCHours()
      return hour !== 4
    },
    necessary: function () {
      return this.game.number <= this.minGames
    },
    ongoing: function () {
      return this.game.state === 'in'
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
      return this.game.clock;
    },
    state: function () {
      if (this.played) {
        return 'played'
      } else if (this.ongoing) {
        return 'playing'
      } else if (this.matchupFinished) {
        return 'notNeeded'
      } else if (this.scheduled) {
        if (this.necessary) {
          return 'scheduledDefinite'
        } else {
          return 'scheduledPossible'
        }
      } else if (this.necessary) {
        return 'unscheduled'
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
