var roundTemplate = `
<div>
  <h3>{{ roundName }}</h3>
  <table>
    <thead>
      <tr class='no-hover'>
        <td class='keystone' @click='changeSorting' colspan="4">
          sort by
          <br>
          <transition name='sort-toggle' mode='out-in'>
            <div :key='this.sorting'>
              {{ currentSortName }}
            </div>
          </transition>
        </td>
        <td class='date' scope='col' :class='{ today: dateLabel[2], weekend: dateLabel[3] }' v-for='dateLabel in dateLabels'>
          {{ dateLabel[0] }}
          <br>
          {{ dateLabel[1] }}
        </td>
      </tr>
    </thead>
    <transition-group name='sort-matchups' tag='tbody'>
      <n-matchup v-for='matchup in sortedMatchups' v-if='!matchup.invisible' :matchup='matchup' :duration='duration' :startDate='startDate' :weekends='weekends' :key='matchup.id'></n-matchup>
    </transition-group>
  </table>
</div>
`
