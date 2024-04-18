const matchupTemplate = `
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

const NMatchup = {
  template: matchupTemplate,
  props: ['matchup', 'duration', 'startDate', 'weekends'],
  components: {
    'n-game': NGame
  },
  computed: {
    favoriteLabel: function () {
      if (this.matchup.favorite) {
        return this.matchup.favorite.toUpperCase()
      } else {
        return 'TBD'
      }

    },
    underdogLabel: function () {
      if (this.matchup.underdog) {
        return this.matchup.underdog.toUpperCase()
      } else {
        return 'TBD'
      }
    },
    favoriteImageURL: function () {
      if (this.matchup.favorite) {
        return teamImageURL(this.matchup.favorite)
      }
      return null
    },
    underdogImageURL: function () {
      if (this.matchup.underdog) {
        return teamImageURL(this.matchup.underdog)
      }
      return null
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
      const d = Array(this.duration)
      this.weekends.forEach(weekend =>
        d[weekend] = 'weekend'
      )
      this.matchup.games.forEach((game, i) => {
        game.number = i + 1
        day = datediff(this.startDate, DateTime.fromISO(game.date, {zone: 'America/Los_Angeles'}))
        d[day] = game
      })
      return d
    },
    fwins: function () {
      if (this.matchup.favorite === null) return 0
      let count = 0
      this.matchup.games.forEach((game, i) => {
        if (game.winner == this.matchup.favorite) count++
      })
      return count
    },
    uwins: function () {
      if (this.matchup.underdog === null) return 0
      let count = 0
      this.matchup.games.forEach((game, i) => {
        if (game.winner == this.matchup.underdog) count++
      })
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
