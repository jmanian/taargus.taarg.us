var matchupTemplate = `
<tr>
  <td class='team' :class='{ winner: fwon, loser: uwon }' v-tooltip:left="teamsHover">
    <img class='table-img' :src='favoriteImageURL'>
    {{ favoriteLabel }}
  </td>
  <td class='v' v-tooltip:left="teamsHover">
    –
  </td>
  <td class='team' :class='{ winner: uwon, loser: fwon }' v-tooltip:left="teamsHover">
    <img class='table-img' :src='underdogImageURL'>
    {{ underdogLabel }}
  </td>
  <td class='score'>
    {{ scoreLabel }}
  </td>
  <n-game v-for='(day, index) in days' :game='day' :favorite='matchup.favorite' :underdog='matchup.underdog' :matchupFinished='finished' :minGames='minGames' :key='String(matchup.id) + String(index)'></n-game>
</tr>
`

var NMatchup = {
  template: matchupTemplate,
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
    favoriteImageURL: function () {
      return teamImageURL(this.matchup.favorite)
    },
    underdogImageURL: function () {
      return teamImageURL(this.matchup.underdog)
    },
    scoreLabel: function () {
      if (!this.finished && this.matchup.games.some(g => g.winner === null && g.loading && g.date < DateTime.now().toISODate())) {
        return '...'
      } else {
        return String(this.fwins) + "–" + String(this.uwins)
      }
    },
    teamsHover: function () {
      if (this.matchup.fseed && this.matchup.useed) {
        return this.matchup.conference + ' ' + this.matchup.fseed + ' v ' + this.matchup.useed
      }
    },
    days: function () {
      var d = Array(this.duration)
      for (var i = 0; i < this.weekends.length; i++) {
        d[this.weekends[i]] = 'weekend'
      }
      for (var i = 0; i < this.matchup.games.length; i++) {
        game = this.matchup.games[i]
        game.number = i + 1
        if (game.dateTime) {
          day = datediff(this.startDate, game.dateTime)
        } else {
          day = datediff(this.startDate, DateTime.fromISO(game.date, {zone: 'America/New_York'}))
        }
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
      return this.fwon || this.uwon
    },
    minGames: function () {
      return Math.min(this.fwins, this.uwins) + 4
    }
  }
}
