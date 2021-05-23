var todayTemplate = `
<div>
<h3>Today's Games</h3>
<div class='row'>
  <n-today-game v-for='game in games' :game='game'></n-today-game>
</div>
</div>
`
