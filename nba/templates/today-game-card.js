var todayGameCardTemplate = `
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
