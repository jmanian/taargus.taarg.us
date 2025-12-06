const gameRowTemplate = `
<div class="game-row">
  <div class="teams">
    <div class="team-line">
      <img class="team-logo" :src="awayImageURL">
      <span class="team-name">{{ game.awayTeamName }}</span>
      <span class="score" v-if="started">{{ game.awayScore }}</span>
    </div>
    <div class="team-line">
      <img class="team-logo" :src="homeImageURL">
      <span class="team-name">{{ game.homeTeamName }}</span>
      <span class="score" v-if="started">{{ game.homeScore }}</span>
    </div>
  </div>
  <div class="game-status">
    <span v-if="playing" class="badge bg-danger">LIVE</span>
    <span :class="{'text-danger fw-bold': playing}">{{ timeLabel }}</span>
    <span v-if="game.network" class="network">{{ game.network }}</span>
  </div>
</div>
`

const GameRow = {
  template: gameRowTemplate,
  props: ['game'],
  mounted() {
    console.log('GameRow mounted:', this.game)
  },
  computed: {
    started: function () {
      return this.game.state !== 'pre'
    },
    playing: function () {
      return this.game.state === 'in'
    },
    finished: function () {
      return this.game.state === 'post'
    },
    startTimeShort: function () {
      const DateTime = luxon.DateTime
      return this.game.dateTime.toLocal().toLocaleString(DateTime.TIME_SIMPLE)
    },
    timeLabel: function () {
      switch (this.game.state) {
        case 'pre':
          return this.startTimeShort
        case 'in':
        case 'post':
          return this.game.statusDetail
      }
    },
    awayImageURL: function () {
      return teamImageURL(this.game.awayTeam)
    },
    homeImageURL: function () {
      return teamImageURL(this.game.homeTeam)
    }
  }
}
