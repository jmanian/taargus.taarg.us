const footerTemplate = `
<p class='time-zone-note'>
  All times are in your local time zone, {{ localTimeZone }}.
  <br>
  However, the dates in the grids are based on the game time in Secaucus Daylight Time.
</p>
`

const NFooter = {
  template: footerTemplate,
  props: ['dates'],
  computed: {
    localTimeZone: function () {
      const startZone = this.dates.start.offsetNameLong
      const endZone = this.dates.end.offsetNameLong

      if (startZone) {
        if (startZone === endZone || !endZone) {
          return startZone
        } else {
          return `${startZone} or ${endZone}`
        }
      } else if (endZone) {
        return endZone
      }

      return DateTime.now().offsetNameLong
    }
  }
}
