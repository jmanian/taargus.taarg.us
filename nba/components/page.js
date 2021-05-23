var pageTemplate = `
<div class='container'>
  <h1>NBA Playoffs Schedules</h1>
  <h2>{{ year }}</h2>
  <n-today :games='todayGames' v-if='showTodaysGames'></n-today>
  <n-round v-for='round in rounds' :round='round' :key='round.id'></n-round>
  <br>
  <n-footer :rounds='rounds'></n-footer>
  <n-nav :currentYear='year'></n-nav>
</div>
`

var NPage = {
  template: pageTemplate,
  components: {
    'n-today': NToday,
    'n-round': NRound,
    'n-footer': NFooter,
    'n-nav': NNav
  },
  props: ['todayGames', 'rounds', 'year'],
  computed: {
    showTodaysGames: function () {
      return this.todayGames.length > 0
    }
  }
}
