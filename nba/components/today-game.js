var todayGameTemplate = `
<div class='col' style='padding-bottom: 20px'>
  <div class='card'>
    <div class='card-header'>
      {{ gameNumber }}
      <span style='float: right;'>{{ seriesStatus }}</span>
    </div>
    <div class='card-body'>
      <span class='badge bg-danger' v-if='playing'>LIVE</span>
      <span :class="{'text-danger': playing}">{{ timeLabel }}</span>
      <span style='float: right;'>{{ network }}</span>
      <br>
      <span class='today-scores'>
        <img class='cardimg' :src='awayImageURL'>
        {{ game.awayTeamName }}
        <span style='float: right;' v-if='started'>{{ this.game.awayScore }}</span>
        <br>
        <img class='cardimg' :src='homeImageURL'>
        {{ game.homeTeamName }}
        <span style='float: right;' v-if='started'>{{ this.game.homeScore }}</span>
      </span>
    </div>
    <div class='card-footer' v-if='hasNugget'>
      {{ nugget }}
    </div>
  </div>
</div>
`

var NTodayGame = {
  template: todayGameTemplate,
  props: ['game'],
  computed: {
    gameNumber: function () {
      return "Game " + this.game.gameNum
    },
    seriesStatus: function () {
      return this.game.seriesSummary
    },
    started: function () {
      return this.game.state !== 'pre'
    },
    playing: function () {
      return this.game.state === 'in'
    },
    finished: function () {
      return this.game.state === 'post'
    },
    // gameClock: function () {
    //   if (this.game.period.isHalftime) {
    //     return 'Halftime'
    //   } else if (this.game.period.isEndOfPeriod) {
    //     return 'End of ' + periodName(this.game.period.current)
    //   } else {
    //     return periodName(this.game.period.current) + ' ' + this.game.clock
    //   }
    // },
    startTimeShort: function ()  {
      return this.game.dateTime.setZone().toLocaleString(DateTime.TIME_SIMPLE)
    },
    timeLabel: function () {
      switch (this.game.state) {
        case 'pre':
          return this.startTimeShort
        case 'in':
        case 'post':
          return this.game.statusDetail
          // return this.game.period.current > 4 ? 'Final (' + periodName(this.game.period.current) + ')' : 'Final'
      }
    },
    network: function () {
      return this.game.network
    },
    awayImageURL: function () {
      return teamImageURL(this.game.awayTeam)
    },
    homeImageURL: function () {
      return teamImageURL(this.game.homeTeam)
    },
    nugget: function () {
      return this.game.headline
    },
    hasNugget: function () {
      return this.nugget !== undefined && this.nugget !== null && this.nugget !== ''
    }
  }
}
