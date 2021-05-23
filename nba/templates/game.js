var gameTemplate = `
<td class='game' user-select="none" v-tooltip:top="hover" :class="[gameClass, {upset: upset}]" v-if='hasGame'>
  <img class='table-img' :src='winnerImageURL' v-if='played'>
  <div v-else>{{ content }}</div>
</td>
<td v-else :class='{ weekend: isWeekend }'>
</td>
`
