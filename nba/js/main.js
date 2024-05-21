function addTooltip(el, binding) {
  const tooltip = bootstrap.Tooltip.getInstance(el)

  if (binding.value !== undefined && binding.value !== null) {
    if (tooltip !== null) {
      tooltip.setContent({'.tooltip-inner': binding.value})
    } else {
      let args = {title: binding.value}
      if (binding.arg) args.placement = binding.arg
      new bootstrap.Tooltip(el, args)
    }
  } else if (tooltip !== null) {
    tooltip.dispose()
  }
}

const { createApp } = Vue

const app = createApp({
  components: {
    'n-page': NPage
  },
  data() {
    return {
      rounds,
      todayGames,
      nowLocal,
      dates,
    }
  },
  created: function () {
    // sort the rounds
    this.rounds.sort((a, b) => a.number < b.number ? 1 : -1)
  }
})

// A custom vue directive for adding tooltips. This allows the tooltips
// to update along with the underlying element.
app.directive('tooltip', {
  mounted: addTooltip,
  updated: addTooltip,
  unmounted (el, binding) {
    bootstrap.Tooltip.getInstance(el)?.dispose()
  }
})

app.mount('#app')
