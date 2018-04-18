function datediff(first, second) {
    // Take the difference between the dates and divide by milliseconds per day.
    // Round to nearest whole number to deal with DST.
    return Math.round((second-first)/(1000*60*60*24));
}

var NGame = {
  props: ['game'],
  computed: {
    content: function () {
      if (this.game) {
        return this.game.number
      } else {
        return '...'
      }
    }
  },
  template: '<td>{{ content }}</td>'
}

var NMatchup = {
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
  },
  template: "<tr><n-game v-for='(day, index) in days' :game='day' :key='String(matchup.id) + String(index)'></n-game></tr>"
}

var NRound = {
  props: ['round'],
  components: {
    'n-matchup': NMatchup
  },
  computed: {
    startDate: function() { return new Date(this.round.startDate) },
    endDate: function() { return new Date(this.round.endDate) },
    duration: function () { return datediff(this.startDate, this.endDate) }
  },
  template: "<table class='table table-bordered table-sm'><thead><tr><th scope='col' v-for='i in duration'>4/0{{ i }}</th></tr></thead><tbody><n-matchup v-for='matchup in round.matchups' :matchup='matchup' :duration='duration' :startDate='startDate' :key='matchup.id'></n-matchup></tbody></table>"
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
  },
  template: "<div class='container'><n-round v-for='round in rounds' :round='round' :key='round.id'></n-round></div>"
})
