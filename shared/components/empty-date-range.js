const emptyDateRangeTemplate = `
<div class="date-box" :class="{'date-box-today': containsToday}">
  <div class="date-header date-header-no-games">
    <span>{{ rangeText }}</span>
    <span class="header-right">
      <span class="game-count">No games</span>
    </span>
  </div>
</div>
`

const EmptyDateRange = {
  template: emptyDateRangeTemplate,
  props: ['dates', 'containsToday'],
  computed: {
    rangeText() {
      const DateTime = luxon.DateTime
      const start = DateTime.fromISO(this.dates[0].dateString)
      const end = DateTime.fromISO(this.dates[this.dates.length - 1].dateString)
      return `${start.toFormat('EEE, MMM d')} – ${end.toFormat('EEE, MMM d')}`
    }
  }
}
