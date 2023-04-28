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
  const tooltip = bootstrap.Tooltip.getInstance(el)

  if (binding.value !== undefined && binding.value !== null) {
    if (tooltip !== null) {
      tooltip.setContent({'.tooltip-inner': binding.value})
    } else {
      new bootstrap.Tooltip(el, {
        title: binding.value,
        placement: binding.arg,
      })
    }
  } else if (tooltip !== null) {
    tooltip.dispose()
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
