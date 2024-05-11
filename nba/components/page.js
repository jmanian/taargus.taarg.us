const pageTemplate = `
<div class='container'>
  <h1><span class="badge text-bg-primary shadow-sm">{{ year }} NBA Playoffs</span></h1>
  <n-today :games='todayGames'></n-today>
  <n-round v-for='round in rounds' :round='round' :nowLocal='nowLocal' :key='round.id' :year=year></n-round>
  <br>
  <n-footer :dates='dates'></n-footer>
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
  props: ['todayGames', 'rounds', 'nowLocal', 'year', 'dates'],
}
