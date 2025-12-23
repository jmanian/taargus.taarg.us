const { createApp } = Vue

const app = createApp({
  setup() {
    // Dark mode state: 'auto', 'light', or 'dark'
    const darkModePreference = Vue.ref(localStorage.getItem('darkModePreference') || 'auto')

    // Reactive system preference
    const systemPrefersDark = Vue.ref(window.matchMedia('(prefers-color-scheme: dark)').matches)

    // Computed: actual dark mode state based on preference and OS setting
    const isDarkMode = Vue.computed(() => {
      if (darkModePreference.value === 'auto') {
        return systemPrefersDark.value
      }
      return darkModePreference.value === 'dark'
    })

    // Apply dark mode class based on current state
    const applyDarkMode = () => {
      if (isDarkMode.value) {
        document.body.classList.add('dark-mode')
      } else {
        document.body.classList.remove('dark-mode')
      }
      // Dispatch event to trigger chart color updates in game-row components
      document.dispatchEvent(new CustomEvent('dark-mode-changed'))
    }

    // Apply on load
    applyDarkMode()

    // Listen for OS dark mode changes and update reactive ref
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQuery.addEventListener('change', (e) => {
      systemPrefersDark.value = e.matches
    })

    // Watch isDarkMode computed property and apply changes
    Vue.watch(isDarkMode, () => {
      applyDarkMode()
    })

    const toggleDarkMode = () => {
      // Cycle through: auto -> light -> dark -> auto
      if (darkModePreference.value === 'auto') {
        darkModePreference.value = 'light'
      } else if (darkModePreference.value === 'light') {
        darkModePreference.value = 'dark'
      } else {
        darkModePreference.value = 'auto'
      }

      localStorage.setItem('darkModePreference', darkModePreference.value)
      applyDarkMode()
    }

    // Get sorted team list for dropdown
    const teamList = Object.values(teamData).sort((a, b) =>
      a.simpleName.localeCompare(b.simpleName)
    )

    const displayedDates = Vue.computed(() => {
      const sourceDates = selectedDate.value ? selectedDateData : dates

      // If no team filter, return all dates
      if (selectedTeams.value.length === 0) {
        return sourceDates
      }

      // Filter games by teams
      const filtered = sourceDates.map(dateObj => ({
        ...dateObj,
        games: dateObj.games.filter(game =>
          selectedTeams.value.includes(game.homeTeam) || selectedTeams.value.includes(game.awayTeam)
        )
      }))

      // If filtering by specific date, always show it even if empty
      // Otherwise, only show dates with games
      if (selectedDate.value) {
        return filtered
      } else {
        return filtered.filter(dateObj => dateObj.games.length > 0)
      }
    })

    const formatSelectedDate = Vue.computed(() => {
      if (selectedDate.value) {
        const date = DateTime.fromISO(selectedDate.value)
        return date.toFormat('EEE, MMM d')
      }
      return ''
    })

    const dateInput = Vue.ref(null)
    const teamSelect = Vue.ref(null)
    const teamSearchInput = Vue.ref(null)
    const teamSearchTerm = Vue.ref('')

    const filteredTeamList = Vue.computed(() => {
      if (!teamSearchTerm.value) return teamList
      const searchLower = teamSearchTerm.value.toLowerCase()
      return teamList.filter(team =>
        team.simpleName.toLowerCase().includes(searchLower) ||
        team.abbreviation.toLowerCase().includes(searchLower) ||
        team.location.toLowerCase().includes(searchLower) ||
        team.teamName.toLowerCase().includes(searchLower)
      )
    })

    const openDatePicker = () => {
      if (dateInput.value) {
        // Try showPicker first (desktop Chrome, Firefox)
        if (dateInput.value.showPicker) {
          try {
            dateInput.value.showPicker()
            return
          } catch (e) {
            // Fall through to focus/click
          }
        }

        // Fallback for mobile Safari and others
        dateInput.value.focus()
        dateInput.value.click()
      }
    }

    const toggleTeamDropdown = () => {
      teamDropdownOpen.value = !teamDropdownOpen.value
    }

    const handleTeamFilterClick = (e) => {
      // Don't open dropdown if clicking the clear button
      if (e && e.target && e.target.closest && e.target.closest('.chip-clear')) return
      toggleTeamDropdown()
    }

    const getTeamLogoURL = (teamAbbr) => {
      // Depend on isDarkMode so logos update when mode changes
      const mode = isDarkMode.value ? 'D' : 'L'
      return teamImageURL(teamAbbr, mode)
    }

    const handleDateClick = (e) => {
      // Don't open picker if clicking the clear button
      if (e.target.closest('.filter-clear') || e.target.classList.contains('filter-clear')) return
      openDatePicker()
    }

    // Watch teamDropdownOpen to focus search input when opened
    Vue.watch(teamDropdownOpen, (isOpen) => {
      if (!isOpen) {
        teamSearchTerm.value = ''
      } else {
        Vue.nextTick(() => {
          if (teamSearchInput.value) {
            teamSearchInput.value.focus()
          }
        })
      }
    })

    // Watch selectedTeams to clear search when selection changes
    Vue.watch(selectedTeams, () => {
      if (teamDropdownOpen.value) {
        teamSearchTerm.value = ''
      }
    })

    const forceRefresh = (event) => {
      // Trigger spin animation
      const button = event.currentTarget
      button.classList.add('spinning')

      // Remove class after animation completes
      setTimeout(() => {
        button.classList.remove('spinning')
      }, 300)

      // Use the same logic as automatic polling - only refresh active games
      // includeSelectedDate=true ensures selected date games are also refreshed
      pollForUpdates(true)

      // If in standings mode, also refresh standings
      if (viewMode.value === 'standings') {
        fetchStandings()
      }
    }

    const handleChartModeChange = (mode) => {
      chartMode.value = mode
      localStorage.setItem('gameFlowChartMode', mode)
    }

    const getStatValue = (stats, statName) => {
      const stat = stats.find(s => s.name === statName)
      return stat ? stat.displayValue : '-'
    }

    const getStandingsTeamLogo = (logos) => {
      if (!logos || logos.length === 0) return ''
      // Prefer dark mode logo if available and in dark mode
      const mode = isDarkMode.value ? 'dark' : 'default'
      const preferredLogo = logos.find(logo => logo.rel && logo.rel.includes(mode))
      return preferredLogo ? preferredLogo.href : logos[0].href
    }

    const getSortedStandings = (entries) => {
      if (!entries) return []
      // Sort by games behind (GB) ascending
      return [...entries].sort((a, b) => {
        const gbA = parseFloat(getStatValue(a.stats, 'gamesBehind')) || 0
        const gbB = parseFloat(getStatValue(b.stats, 'gamesBehind')) || 0
        return gbA - gbB
      })
    }

    // Provide dark mode state to all child components
    Vue.provide('isDarkMode', isDarkMode)

    return {
      darkModePreference: darkModePreference,
      isDarkMode: isDarkMode,
      toggleDarkMode: toggleDarkMode,
      dates: displayedDates,
      todayString: todayString,
      selectedDate: selectedDate,
      selectedTeams: selectedTeams,
      teamDropdownOpen: teamDropdownOpen,
      teamList: teamList,
      filteredTeamList: filteredTeamList,
      teamSearchTerm: teamSearchTerm,
      teamSearchInput: teamSearchInput,
      formatSelectedDate: formatSelectedDate,
      dateInput: dateInput,
      toggleTeamDropdown: toggleTeamDropdown,
      handleTeamFilterClick: handleTeamFilterClick,
      getTeamLogoURL: getTeamLogoURL,
      handleDateClick: handleDateClick,
      loadPrevious: loadPrevious,
      loadMore: loadMore,
      clearDateSelection: clearDateSelection,
      clearTeamSelection: clearTeamSelection,
      forceRefresh: forceRefresh,
      refreshTrigger: refreshTrigger,
      chartMode: chartMode,
      handleChartModeChange: handleChartModeChange,
      viewMode: viewMode,
      standingsData: standingsData,
      standingsLoading: standingsLoading,
      showStandings: showStandings,
      showGames: showGames,
      getStatValue: getStatValue,
      getStandingsTeamLogo: getStandingsTeamLogo,
      getSortedStandings: getSortedStandings
    }
  },
  components: {
    'date-box': DateBox,
    'game-row': GameRow
  },
  watch: {
    selectedDate(newDate) {
      if (newDate) {
        fetchSelectedDate(newDate)
      }
      updateURL()
    },
    selectedTeams() {
      updateURL()
    }
  },
  mounted() {
    // If there's an initial date from URL, fetch it
    if (selectedDate.value) {
      fetchSelectedDate(selectedDate.value)
    }

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (teamDropdownOpen.value && e.target && e.target.closest && !e.target.closest('.filter-group')) {
        teamDropdownOpen.value = false
      }

      // Close all local network tooltips when clicking anywhere except the indicator itself
      if (e.target && e.target.closest && !e.target.closest('.local-indicator')) {
        document.dispatchEvent(new CustomEvent('close-local-tooltips'))
      }
    })

    // Close dropdown when pressing Esc
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && teamDropdownOpen.value) {
        teamDropdownOpen.value = false
      }
    })

    // Handle browser back/forward
    window.addEventListener('popstate', (event) => {
      isNavigating = true

      const params = new URLSearchParams(window.location.search)
      const newTeams = params.get('teams') ? params.get('teams').split(',') : []
      const newDate = params.get('date') || null

      selectedTeams.value = newTeams

      if (newDate) {
        selectedDate.value = newDate
        if (!selectedDateData.some(d => d.dateString === newDate)) {
          fetchSelectedDate(newDate)
        }
      } else {
        selectedDate.value = null
        selectedDateData.length = 0
      }

      // Re-enable URL updates after a tick
      setTimeout(() => {
        isNavigating = false
      }, 0)
    })

    // Sticky header scroll behavior
    let lastScrollY = window.scrollY
    let ticking = false

    const filterBar = document.querySelector('.filter-bar')

    const updateHeaderVisibility = () => {
      const currentScrollY = window.scrollY

      // Add "stuck" class when header is actually stuck to top
      // Check if the header's top position is at the viewport top
      const rect = filterBar.getBoundingClientRect()
      if (rect.top <= 0) {
        filterBar.classList.add('stuck')
      } else {
        filterBar.classList.remove('stuck')
      }

      // Hide/show based on scroll direction
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down & past threshold
        filterBar.classList.add('hidden')
      } else if (currentScrollY < lastScrollY) {
        // Scrolling up
        filterBar.classList.remove('hidden')
      }

      lastScrollY = currentScrollY
      ticking = false
    }

    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(updateHeaderVisibility)
        ticking = true
      }
    })
  }
})

app.mount('#app')
