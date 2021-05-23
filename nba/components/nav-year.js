var navYearTemplate = `
<template v-if='isCurrentYear'>{{ year }}</template>
<a :href='year' v-else>{{ year }}</a>
`
var NNavYear = {
  template: navYearTemplate,
  props: ['year', 'currentYear'],
  computed: {
    isCurrentYear: function () {
      return this.year === this.currentYear
    }
  }
}
