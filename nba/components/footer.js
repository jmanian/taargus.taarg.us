var footerTemplate = `
<p class='time-zone-note'>
  All times are in your local time zone, {{ localTimeZone }}.
  <br>
  However, the dates in the grids are based on the game time in Secaucus Daylight Time.
</p>
<p><a href='archive'>older schedules >></a></p>
`

var NFooter = {
  template: footerTemplate,
  props: ['rounds'],
  computed: {
    localTimeZone: function () {
      var startDate = new Date(this.rounds[this.rounds.length - 1].startDate)
      var endDate = new Date(this.rounds[0].endDate)

      var startZone = timeZoneName(startDate)
      var endZone = timeZoneName(endDate)

      if (startZone) {
        if (startZone === endZone || !endZone) {
          return startZone
        } else {
          return `${startZone} or ${endZone}`
        }
      } else if (endZone) {
        return endZone
      }

      return Intl.DateTimeFormat().resolvedOptions().timeZone
    }
  }
}
