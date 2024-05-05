const footerTemplate = `
<p class='time-zone-note'>
  All times are in your local time zone, {{ localTimeZone }}.
  <template v-if='showCaveat'>
    <br>
    However, the games are placed in the grid based on the game time in {{ caveatTimeZone }}.
  </template>
</p>
`

const NFooter = {
  template: footerTemplate,
  props: ['dates'],
  computed: {
    localTimeZone: function () {
      return this.resolveZoneNames('local')
    },

    // Show the caveat if they're at -2 offset or east.
    showCaveat: function () {
      const maxOffset = Math.max(this.dates.start.offset, this.dates.end.offset)
      console.log(maxOffset)
      return maxOffset >= -120
    },

    caveatTimeZone: function () {
      return this.resolveZoneNames('America/New_York')
    },
  },

  methods: {
    resolveZoneNames: function (zoneName) {
      const startZone = this.dates.start.setZone(zoneName).offsetNameLong
      const endZone = this.dates.end.setZone(zoneName).offsetNameLong

      if (startZone) {
        if (startZone === endZone || !endZone) {
          return startZone
        } else {
          return `${startZone} or ${endZone}`
        }
      } else if (endZone) {
        return endZone
      }

      return DateTime.now().setZone(zoneName).offsetNameLong
    }

  },
}
