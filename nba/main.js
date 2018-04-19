function datediff(first, second) {
    // Take the difference between the dates and divide by milliseconds per day.
    // Round to nearest whole number to deal with DST.
    return Math.round((second-first)/(1000*60*60*24));
}

// enable all tooltips
$(function () {
  $('[data-toggle="tooltip"]').tooltip()
})

var NGame = {
  template: '#game-template',
  props: ['game', 'favorite', 'underdog'],
  computed: {
    hasGame: function () {
      return this.game != undefined
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
      } else {
        return this.game.time
      }
    },
    hover: function () {
      return [this.game.time, 'pm', this.game.network].join(' ')
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
        day = datediff(this.startDate, new Date(game.date))
        d[day] = game
      }
      return d
    }
  }
}

var NRound = {
  template: '#round-template',
  props: ['round'],
  components: {
    'n-matchup': NMatchup
  },
  computed: {
    startDate: function() { return new Date(this.round.startDate) },
    endDate: function() { return new Date(this.round.endDate) },
    duration: function () { return datediff(this.startDate, this.endDate) }
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
