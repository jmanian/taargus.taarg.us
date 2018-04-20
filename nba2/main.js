function datediff(first, second) {
    // Take the difference between the dates and divide by milliseconds per day.
    // Round to nearest whole number to deal with DST.
    return Math.round((second-first)/(1000*60*60*24));
}

function matchupKey(matchup) {
  return matchup.games.map(g => g.date).join()
}

// enable all tooltips
$(function () {
  $('[data-toggle="tooltip"]').tooltip()
})

var NGame = {
  template: '#game-template',
  props: ['game', 'favorite', 'underdog', 'matchupFinished', 'minGames'],
  computed: {
    hasGame: function () {
      return this.game != undefined
    },
    scheduled: function () {
      return this.game.time != undefined
    },
    played: function () {
      return this.game.winner != undefined
    },
    badgeClass: function () {
      var suffix = ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'dark'][this.game.number-1]
      return 'badge-' + suffix
    },
    content: function () {
      if (this.played) {
        return this.game.winner.toUpperCase()
      } else if (this.scheduled) {
        return this.game.time
      } else if (this.matchupFinished) {
        return '–'
      } else if (this.game.number <= this.minGames) {
        return 'TBD'
      } else {
        return '?'
      }
    },
    hover: function () {
      if (this.scheduled) {
        return [this.game.time, 'pm', this.game.network].join(' ')
      }
    }
  }
}

var NMatchup = {
  template: '#matchup-template',
  props: ['matchup', 'duration', 'startDate'],
  components: {
    'n-game': NGame
  },
  computed: {
    days: function () {
      var d = Array(this.duration)
      for (var i = 0; i < this.matchup.games.length; i++) {
        game = this.matchup.games[i]
        game['number'] = i + 1
        day = datediff(this.startDate, new Date(game.date + ' 12:00:00 EDT -4'))
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
    startDate: function () { return new Date(this.round.startDate + ' 12:00:00 EDT -4') },
    endDate: function () { return new Date(this.round.endDate + ' 12:00:00 EDT -4') },
    duration: function () { return datediff(this.startDate, this.endDate) + 1 },
    dateLabels: function () {
      var labels = Array(this.duration)
      var date = new Date(this.startDate.getTime())
      var days = ['Su', 'M', 'Tu', 'W', 'Th', 'F', 'Sa']
      for (var i = 0; i < this.duration; i++) {
        labels[i] = [days[date.getDay()], String(date.getMonth() + 1) + '/' + String(date.getDate())]
        date.setDate(date.getDate() + 1)
      }
      return labels
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
