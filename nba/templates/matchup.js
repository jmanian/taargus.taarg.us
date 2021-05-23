var matchupTemplate = `
<tr>
  <td class='team' :class='{ winner: fwon, loser: uwon }' v-tooltip:left="teamsHover">
    <img class='table-img' :src='favoriteImageURL'>
    {{ favoriteLabel }}
  </td>
  <td class='v' v-tooltip:left="teamsHover">
    –
  </td>
  <td class='team' :class='{ winner: uwon, loser: fwon }' v-tooltip:left="teamsHover">
    <img class='table-img' :src='underdogImageURL'>
    {{ underdogLabel }}
  </td>
  <td class='score'>
    {{ scoreLabel }}
  </td>
  <n-game v-for='(day, index) in days' :game='day' :favorite='matchup.favorite' :underdog='matchup.underdog' :matchupFinished='finished' :minGames='minGames' :key='String(matchup.id) + String(index)'></n-game>
</tr>
`
