function datediff(first, second) {
    // Take the difference between the dates and divide by milliseconds per day.
    // Round to nearest whole number to deal with DST.
    return Math.round((second-first)/(1000*60*60*24));
}

var NGame = {
  template: '#game-template',
  props: ['game'],
  computed: {
    content: function () {
      if (this.game) {
        return this.game.number
      } else {
        return '...'
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
