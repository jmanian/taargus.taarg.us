const navTemplate = `
<p>
  <template v-for='year in years' :key='year'>
    <n-nav-year  :year='year' :currentYear='currentYear'></n-nav-year>
    //
  </template>
  <a href='archive' class='year'>older schedules</a>
</p>
`

const NNav = {
  template: navTemplate,
  components: {
    'n-nav-year': NNavYear
  },
  data: function () {
    return {years: ['2025', '2024', '2023', '2022', '2021', '2020', '2019', '2018']}
  },
  props: ['currentYear']
}
