const roundTemplate = `
<template v-if='visible'>
  <h3>{{ roundName }}</h3>
  <table>
    <thead>
      <tr class='no-hover'>
        <td class='keystone' @click='changeSorting' colspan="4">
          sort by
          <br>
          <transition name='sort-toggle' mode='out-in'>
            <div :key='this.sorting'>
              {{ currentSortName }}
            </div>
          </transition>
        </td>
        <td class='date' scope='col' :class='{ today: dateLabel[2], weekend: dateLabel[3] }' v-for='dateLabel in dateLabels'>
          {{ dateLabel[0] }}
          <br>
          {{ dateLabel[1] }}
        </td>
      </tr>
    </thead>
    <transition-group name='sort-matchups' tag='tbody'>
      <n-matchup v-for='matchup in sortedMatchups' :matchup='matchup' :duration='duration' :startDate='startDate' :weekends='weekends' :key='matchup.id'></n-matchup>
    </transition-group>
  </table>
</template>
`

const NRound = {
  template: roundTemplate,
  props: ['round', 'nowLocal', 'year'],
  components: {
    'n-matchup': NMatchup
  },
  data: function () {
    return {sorting: null}
  },
  created: function () {
    this.sorting = getCookie(this.sortingCookieName) || 'schedule'
  },
  methods: {
    changeSorting: function () {
      if (this.sorting === 'bracket' || this.sorting === null || this.sorting === undefined) {
        this.sorting = 'schedule'
      } else if (this.sorting === 'schedule') {
        this.sorting = 'nextGame'
      } else {
        this.sorting = 'bracket'
      }
      setCookie(this.sortingCookieName, this.sorting, 180)
    },
  },
  computed: {
    visible: function () {
      return this.round.matchups.some(matchup => matchup.teamsKnown)
    },
    sortingCookieName: function () {
      return `${this.year}-${this.round.number}-sorting`
    },
    roundName: function () {
      if (this.round.number < 4) {
        return 'Round ' + String(this.round.number)
      } else {
        return 'Finals'
      }
    },
    currentSortName: function () {
      if (this.sorting === 'nextGame') return 'next game'
      if (this.sorting === null || this.sorting === undefined) return 'schedule'
      return this.sorting
    },
    // do this as a computed property so that it will get recalculated
    // and resorted anytime any of the things it uses is changed
    sortedMatchups: function() {
      if (this.sorting === 'schedule' || this.sorting === null || this.sorting === undefined) {
        this.round.matchups.sort(function(a, b) {
          if (a.scheduleSortKey < b.scheduleSortKey) return -1
          if (a.scheduleSortKey > b.scheduleSortKey) return 1
          return 0
        })
      } else if (this.sorting === 'nextGame') {
        this.round.matchups.sort(function(a, b) {
          if (a.nextGameSortKey < b.nextGameSortKey) return -1
          if (a.nextGameSortKey > b.nextGameSortKey) return 1
          return 0
        })
      } else {
        this.round.matchups.sort(function(a, b) {
          if (Number(a.id) < Number(b.id)) return -1
          else return 1
        })
      }
      return this.round.matchups.filter(matchup => matchup.teamsKnown)
    },
    gameDates: function() {
      return this.round.matchups.flatMap(matchup =>
        matchup.games.map(game =>
          game.date
        )
      ).filter(d => d)
    },
    startDate: function () {
      const firstDate = this.gameDates.reduce((min, d) => d < min ? d : min)
      return DateTime.fromISO(firstDate, {zone: 'America/Los_Angeles'})
    },
    endDate: function () {
      const lastDate = this.gameDates.reduce((max, d) => d > max ? d : max)
      return DateTime.fromISO(lastDate, {zone: 'America/Los_Angeles'})
    },
    duration: function () { return datediff(this.startDate, this.endDate) + 1 },
    dateLabels: function () {
      const labels = Array(this.duration)
      let date = this.startDate
      const days = [null, 'M', 'Tu', 'W', 'Th', 'F', 'Sa', 'Su']
      for (let i = 0; i < this.duration; i++) {
        const isWeekend = date.weekday >= 6
        const isToday = date.toISODate() === this.nowLocal.toISODate()
        labels[i] = [days[date.weekday], date.toLocaleString({month: 'numeric', day: 'numeric'}), isToday, isWeekend]
        date = date.plus({days: 1})
      }
      return labels
    },
    weekends: function () {
      const indexes = []
      for (let i = 0; i < this.dateLabels.length; i++) {
        dateLabel = this.dateLabels[i]
        if (dateLabel[3]) indexes.push(i)
      }
      return indexes
    }
  }
}
