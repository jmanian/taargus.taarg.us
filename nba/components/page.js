const pageTemplate = `
<div class='container'>
  <h1>NBA Playoffs Schedules</h1>
  <h2>{{ year }}</h2>
  <n-today :games='todayGames' v-if='showTodaysGames'></n-today>
  <n-round v-for='round in rounds' :round='round' :key='round.id' :year=year></n-round>
  <br>
  <n-footer :rounds='rounds'></n-footer>
  <n-nav :currentYear='year'></n-nav>
  <p class='attribution'>
    Built by
    <a class='attribution' href='https://twitter.com/jeffmanian' target='_blank'>Jeff Manian</a>.
  </p>
</div>
`

const NPage = {
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
