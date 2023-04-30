const footerTemplate = `
<p class='time-zone-note'>
  All times are in your local time zone, {{ localTimeZone }}.
  <br>
  However, the dates in the grids are based on the game time in Secaucus Daylight Time.
</p>
`

const NFooter = {
  template: footerTemplate,
  props: ['rounds'],
  computed: {
    localTimeZone: function () {
      const startZone = DateTime.fromISO(this.rounds[this.rounds.length - 1].startDate).offsetNameLong
      const endZone = DateTime.fromISO(this.rounds[0].endDate).offsetNameLong

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
