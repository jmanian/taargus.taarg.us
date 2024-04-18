const todayTemplate = `
<div>
  <h3>Today's Games</h3>
  <div class='row row-cols-1 row-cols-md-2 row-cols-xl-3 row-cols-xxl-4'>
    <n-today-game v-for='game in games' :game='game'></n-today-game>
  </div>
</div>
`

const NToday = {
  template: todayTemplate,
  props: ['games'],
  components: {
    'n-today-game': NTodayGame
  }
}
