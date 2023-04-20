var todayGameTemplate = `
<div class='col-xl-4 col-lg-6 col-md-6 col-sm-6' style='padding-bottom: 20px'>
  <div class='card'>
    <div class='card-header'>
      {{ gameNumber }}
      <span style='float: right;'>{{ seriesStatus }}</span>
    </div>
    <div class='card-body'>
      <span class='badge badge-danger' v-if='playing'>LIVE</span>
      <span :class="{'text-danger': playing}">{{ timeLabel }}</span>
      <span style='float: right;'>{{ network }}</span>
      <br>
      <span class='today-scores'>
        <img class='cardimg' :src='awayImageURL'>
        {{ game.awayTeam }}
        <span style='float: right;' v-if='started'>{{ this.game.awayScore }}</span>
        <br>
        <img class='cardimg' :src='homeImageURL'>
        {{ game.homeTeam }}
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
    gameClock: function () {
      return this.game.statusDetail
      // if (this.game.period.isHalftime) {
      //   return 'Halftime'
      // } else if (this.game.period.isEndOfPeriod) {
      //   return 'End of ' + periodName(this.game.period.current)
      // } else {
      //   return periodName(this.game.period.current) + ' ' + this.game.clock
      // }
    },
    startTimeShort: function ()  {
      var time, amPm
      [time, amPm] = new Date(this.game.timeUTC).toLocaleTimeString().split(' ')
      // remove the seconds
      time = time.split(':').slice(0, 2).join(':')
      return `${time} ${amPm}`
    },
    timeLabel: function () {
      switch (this.game.state) {
        case 'pre':
          return this.startTimeShort
        case 'in':
        case 'post':
          return this.gameClock
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
