function datediff(first, second) {
    // Take the difference between the dates and divide by milliseconds per day.
    // Round to nearest whole number to deal with DST.
    return Math.round((second-first)/(1000*60*60*24));
}

function matchupKey(matchup) {
  return matchup.games.map(g => g.date).join()
}

// enable all popovers
$(function () {
  $('[data-toggle="tooltip"]').tooltip()
})

var NGame = {
  template: '#game-template',
  props: ['game', 'favorite', 'underdog', 'matchupFinished', 'minGames'],
  computed: {
    isWeekend: function () {
      return this.game == 'weekend'
    },
    hasGame: function () {
      return this.game != undefined && !this.isWeekend
    },
    scheduled: function () {
      return this.game.time != undefined
    },
    necessary: function () {
      return this.game.number <= this.minGames
    },
    played: function () {
      return this.game.winner != undefined
    },
    upset: function () {
      if (this.played) {
        if ([3, 4, 6].indexOf(this.game.number) > -1) {
          return this.game.winner == this.favorite
        } else {
          return this.game.winner == this.underdog
        }
      }
    },
    gameClass: function () {
      return 'game' + this.game.number
    },
    content: function () {
      if (this.played) {
        return this.game.winner.toUpperCase()
      } else if (this.scheduled) {
        return this.game.time
      } else if (this.matchupFinished) {
        return '–'
      } else if (this.necessary) {
        return 'TBD'
      } else {
        return '?'
      }
    },
    hover: function () {
      if (this.scheduled) {
        return [this.game.time, 'pm', this.game.network].join(' ')
      } else if (!this.necessary && !this.matchupFinished) {
        return ['If Needed']
      }
    }
  }
}

var NMatchup = {
  template: '#matchup-template',
  props: ['matchup', 'duration', 'startDate', 'weekends'],
  components: {
    'n-game': NGame
  },
  computed: {
    favoriteLabel: function () {
      return this.matchup.favorite.toUpperCase()
    },
    underdogLabel: function () {
      return this.matchup.underdog.toUpperCase()
    },
    scoreLabel: function () {
      return String(this.fwins) + "–" + String(this.uwins)
    },
    teamsHover: function () {
      return this.matchup.conference + ' ' + this.matchup.fseed + ' v ' + this.matchup.useed
    },
    days: function () {
      var d = Array(this.duration)
      for (var i = 0; i < this.weekends.length; i++) {
        d[this.weekends[i]] = 'weekend'
      }
      for (var i = 0; i < this.matchup.games.length; i++) {
        game = this.matchup.games[i]
        game['number'] = i + 1
        day = datediff(this.startDate, new Date(game.date + 'T12:00:00-04:00'))
        d[day] = game
      }
      return d
    },
    fwins: function () {
      var count = 0
      for (var i = 0; i < this.matchup.games.length; i++) {
        if (this.matchup.games[i].winner == this.matchup.favorite) count++
      }
      return count
    },
    uwins: function () {
      var count = 0
      for (var i = 0; i < this.matchup.games.length; i++) {
        if (this.matchup.games[i].winner == this.matchup.underdog) count++
      }
      return count
    },
    fwon: function () {
      return this.fwins == 4
    },
    uwon: function () {
      return this.uwins == 4
    },
    finished: function () {
      return this.fwins == 4 || this.uwins == 4
    },
    minGames: function () {
      return Math.min(this.fwins, this.uwins) + 4
    }
  }
}

var NRound = {
  template: '#round-template',
  props: ['round'],
  components: {
    'n-matchup': NMatchup
  },
  created: function () {
    // sort the matchups
    this.round.matchups.sort(function(a, b) {
      var keyA = matchupKey(a)
      var keyB = matchupKey(b)
      if (keyA < keyB) return -1
      if (keyA > keyB) return 1
      return 0
    })
  },
  computed: {
    startDate: function () { return new Date(this.round.startDate + 'T12:00:00-04:00') },
    endDate: function () { return new Date(this.round.endDate + 'T12:00:00-04:00') },
    duration: function () { return datediff(this.startDate, this.endDate) + 1 },
    dateLabels: function () {
      var labels = Array(this.duration)
      var date = new Date(this.startDate.getTime())
      var days = ['Su', 'M', 'Tu', 'W', 'Th', 'F', 'Sa']
      var today = new Date()
      for (var i = 0; i < this.duration; i++) {
        var isWeekend = date.getDay() == 0 || date.getDay() == 6
        var isToday = today.getFullYear() == date.getFullYear() && today.getMonth() == date.getMonth() && today.getDate() == date.getDate()
        labels[i] = [days[date.getDay()], String(date.getMonth() + 1) + '/' + String(date.getDate()), isToday, isWeekend]
        date.setDate(date.getDate() + 1)
      }
      return labels
    },
    weekends: function () {
      var indexes = []
      for (i = 0; i < this.dateLabels.length; i++) {
        dateLabel = this.dateLabels[i]
        if (dateLabel[3]) indexes.push(i)
      }
      return indexes
    }
  }
}

new Vue({
  el: '#app',
  components: {
    'n-round': NRound
  },
  data() {
    return {
      rounds: rounds
    }
  }
})
