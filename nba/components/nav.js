var navTemplate = `
<p>
  <template v-for='year in years'>
    <n-nav-year  :year='year' :key='year' :currentYear='currentYear'></n-nav-year>
    //
  </template>
  <a href='archive'>older schedules</a>
</p>
`

var NNav = {
  template: navTemplate,
  components: {
    'n-nav-year': NNavYear
  },
  data: function () {
    return {years: ['2021', '2020', '2019', '2018']}
  },
  props: ['currentYear']
}
