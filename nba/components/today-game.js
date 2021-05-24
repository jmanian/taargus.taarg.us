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
        {{ game.vTeam.triCode }}
        <span style='float: right;' v-if='started'>{{ this.game.vTeam.score }}</span>
        <br>
        <img class='cardimg' :src='homeImageURL'>
        {{ game.hTeam.triCode }}
        <span style='float: right;' v-if='started'>{{ this.game.hTeam.score }}</span>
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
      return "Game " + this.game.playoffs.gameNumInSeries
    },
    seriesStatus: function () {
      return this.game.playoffs.seriesSummaryText
    },
    started: function () {
      return this.game.statusNum > 1
    },
    playing: function () {
      return this.game.statusNum == 2
    },
    finished: function () {
      return this.game.statusNum == 3
    },
    gameClock: function () {
      if (this.game.period.isHalftime) {
        return 'Halftime'
      } else if (this.game.period.isEndOfPeriod) {
        return 'End of ' + periodName(this.game.period.current)
      } else {
        return periodName(this.game.period.current) + ' ' + this.game.clock
      }
    },
    startTimeShort: function ()  {
      var time, amPm
      [time, amPm] = new Date(this.game.startTimeUTC).toLocaleTimeString().split(' ')
      // remove the seconds
      time = time.split(':').slice(0, 2).join(':')
      return `${time} ${amPm}`
    },
    timeLabel: function () {
      switch (this.game.statusNum) {
        case 1:
          return this.startTimeShort
        case 2:
          return this.gameClock
        case 3:
          return this.game.period.current > 4 ? 'Final (' + periodName(this.game.period.current) + ')' : 'Final'
      }
    },
    network: function () {
      return broadcasterName(this.game.watch.broadcast.broadcasters.national)
    },
    awayImageURL: function () {
      return teamImageURL(this.game.vTeam.triCode)
    },
    homeImageURL: function () {
      return teamImageURL(this.game.hTeam.triCode)
    },
    nugget: function () {
      return this.game.nugget.text
    },
    hasNugget: function () {
      return this.nugget != null && this.nugget != ''
    }
  }
}
