const todayTemplate = `
<template v-if='visible'>
  <h3><span class="badge text-bg-secondary shadow">Today's Games</span></h3>
  <div class='row row-cols-1 row-cols-md-2 row-cols-xl-3 row-cols-xxl-4'>
    <n-today-game v-for='game in games' :game='game'></n-today-game>
  </div>
</template>
`

const NToday = {
  template: todayTemplate,
  props: ['games'],
  components: {
    'n-today-game': NTodayGame
  },
  computed: {
    visible: function () {
      return this.games.length > 0
    }
  },
}
