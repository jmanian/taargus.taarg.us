// enables tooltips in a way that allows them to update as data changes
Vue.directive('tooltip', {
  bind: addTooltip,
  inserted: addTooltip,
  update: addTooltip,
  componentUpdated: addTooltip,
  unbind (el, binding) {
    bootstrap.Tooltip.getInstance(el)?.dispose()
  }
})

function addTooltip(el, binding) {
  bootstrap.Tooltip.getInstance(el)?.dispose()
  if (binding.value !== undefined) {
    new bootstrap.Tooltip(el, {
      title: binding.value,
      placement: binding.arg,
    })
  }
}

new Vue({
  el: '#app',
  components: {
    'n-page': NPage
  },
  data: {
    todayGames: todayGames,
    rounds: rounds
  },
  created: function () {
    // sort the rounds
    this.rounds.sort((a, b) => a.number < b.number ? 1 : -1)
  }
})
