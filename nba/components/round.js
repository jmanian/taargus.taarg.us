var roundTemplate = `
<div>
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
      <n-matchup v-for='matchup in sortedMatchups' v-if='!matchup.invisible' :matchup='matchup' :duration='duration' :startDate='startDate' :weekends='weekends' :key='matchup.id'></n-matchup>
    </transition-group>
  </table>
</div>
`

var NRound = {
  template: roundTemplate,
  props: ['round', 'year'],
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
      return this.round.matchups
    },
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
