// enables tooltips in a way that allows them to update as data changes
Vue.directive('tooltip', {
  bind: addTooltip,
  inserted: addTooltip,
  update: addTooltip,
  componentUpdated: addTooltip,
  unbind (el, binding) {
    $(el).tooltip('dispose');
  }
})

function addTooltip(el, binding) {
  $(el).tooltip('dispose')
  if (binding.value != undefined) {
    $(el).tooltip({
      title: binding.value,
      placement: binding.arg,
    })
  }
}

var NTodayGame = {
  template: '#today-game-template',
  props: ['game'],
  computed: {
    gameNumber: function () {
      return "Game " + this.game.playoffs.gameNumInSeries
    },
    seriesStatus: function () {
      return this.game.playoffs.seriesSummaryText
    },
    started: function () {
      return this.game.statusNum > 1
    },
    playing: function () {
      return this.game.statusNum == 2
    },
    finished: function () {
      return this.game.statusNum == 3
    },
    gameClock: function () {
      if (this.game.period.isHalftime) {
        return 'Halftime'
      } else if (this.game.period.isEndOfPeriod) {
        return 'End of ' + periodName(this.game.period.current)
      } else {
        return periodName(this.game.period.current) + ' ' + this.game.clock
      }
    },
    startTimeShort: function ()  {
      var time, amPm
      [time, amPm] = new Date(this.game.startTimeUTC).toLocaleTimeString().split(' ')
      // remove the seconds
      time = time.split(':').slice(0, 2).join(':')
      return `${time} ${amPm}`
    },
    timeLabel: function () {
      switch (this.game.statusNum) {
        case 1:
          return this.startTimeShort
        case 2:
          return this.gameClock
        case 3:
          return this.game.period.current > 4 ? 'Final (' + periodName(this.game.period.current) + ')' : 'Final'
      }
    },
    network: function () {
      var broadcaster = this.game.watch.broadcast.broadcasters.national[0]
      if (broadcaster != undefined) return broadcaster.shortName
    },
    awayImageURL: function () {
      return teamImageURL(this.game.vTeam.triCode)
    },
    homeImageURL: function () {
      return teamImageURL(this.game.hTeam.triCode)
    },
    nugget: function () {
      return this.game.nugget.text
    },
    hasNugget: function () {
      return this.nugget != null && this.nugget != ''
    }
  }
}

var NToday = {
  template: '#today-template',
  props: ['games'],
  components: {
    'n-today-game': NTodayGame
  }
}

var NGame = {
  template: '#game-template',
  props: ['game', 'favorite', 'underdog', 'matchupFinished', 'minGames'],
  computed: {
    isWeekend: function () {
      return this.game == 'weekend'
    },
    hasGame: function () {
      return this.game != undefined && !this.isWeekend
    },
    scheduled: function () {
      return this.game.time != null
    },
    necessary: function () {
      return this.game.number <= this.minGames
    },
    begun: function () {
      return this.game.fscore != null && this.game.uscore != null
    },
    ongoing: function () {
      return this.game.clock != null && this.game.period != null
    },
    played: function () {
      return this.game.winner != null
    },
    uhome: function () {
      return underdogHome(this.game.number)
    },
    scoreLabel: function () {
      return this.game.fscore + '–' + this.game.uscore
    },
    fscoreLabel: function () {
      return this.favorite + " – " + this.game.fscore
    },
    uscoreLabel: function () {
      return this.underdog + " – " + this.game.uscore
    },
    homeScoreLabel: function () {
      return this.uhome ? this.uscoreLabel : this.fscoreLabel
    },
    awayScoreLabel: function () {
      return this.uhome ? this.fscoreLabel : this.uscoreLabel
    },
    timeAndNetwork: function () {
      return [this.localHoursMinutes, this.localAmPm, this.game.network].join(' ')
    },
    gameClock: function () {
      if (this.game.period.isHalftime) {
        return 'Halftime'
      } else if (this.game.period.isEndOfPeriod) {
        return 'End of ' + periodName(this.game.period.current)
      } else if (!this.played) {
        return periodName(this.game.period.current) + ' ' + this.game.clock
      } else if (this.game.period.current > 4) {
        return periodName(this.game.period.current)
      }
    },
    state: function () {
      if (this.played) {
        return 'played'
      } else if (this.begun && this.ongoing) {
        return 'playing'
      } else if (this.scheduled) {
        if (this.necessary) {
          return 'scheduledDefinite'
        } else {
          return 'scheduledPossible'
        }
      } else if (this.necessary) {
        return 'unscheduled'
      } else if (this.matchupFinished) {
        return 'notNeeded'
      } else if (this.game.loading) {
        return 'loading'
      } else {
        return 'ifNeeded'
      }
    },
    upset: function () {
      if (this.played) {
        if (this.uhome) {
          return this.game.winner == this.favorite
        } else {
          return this.game.winner == this.underdog
        }
      }
    },
    gameClass: function () {
      return 'game' + this.game.number
    },
    localAmPm: function () {
      var d = new Date(this.game.timeUTC)
      if (d.getHours() < 12) {
        return 'am'
      } else {
        return 'pm'
      }
    },
    localHoursMinutes: function () {
      var d = new Date(this.game.timeUTC)
      var hour = d.getHours()
      if (hour === 0) {
        hour = 12
      } else if (hour > 12) {
        hour = hour -12
      }
      var minute = d.getMinutes()
      return `${hour}:${minute.toString(10).padStart(2, '0')}`
    },
    localTimeShort: function () {
      if (this.localAmPm === 'am') {
        return `${this.localHoursMinutes}a`
      } else {
        return `${this.localHoursMinutes}p`
      }
    },
    winnerImageURL: function () {
      return teamImageURL(this.game.winner)
    },
    content: function () {
      switch (this.state) {
        case 'loading':
          return '...'
        case 'notNeeded':
          return '–'
        case 'ifNeeded':
          return '?'
        case 'unscheduled':
          return 'TBD'
        case 'scheduledPossible':
          return this.localTimeShort + '?'
        case 'scheduledDefinite':
          return this.localTimeShort
        case 'playing':
          return this.scoreLabel
        case 'played':
          return this.game.winner.toUpperCase()
      }
    },
    hover: function () {
      switch (this.state) {
        case 'loading':
          return 'loading...'
        case 'notNeeded':
          return 'Not Needed'
        case 'ifNeeded':
          return 'If Needed'
        case 'scheduledPossible':
          return ['If Needed', this.timeAndNetwork].join('\n')
        case 'scheduledDefinite':
          return this.timeAndNetwork
        case 'playing':
        case 'played':
          return [this.timeAndNetwork, this.awayScoreLabel, this.homeScoreLabel, this.gameClock].join("\n")
      }
    }
  }
}

var NMatchup = {
  template: '#matchup-template',
  props: ['matchup', 'duration', 'startDate', 'weekends'],
  components: {
    'n-game': NGame
  },
  computed: {
    favoriteLabel: function () {
      return this.matchup.favorite.toUpperCase()
    },
    underdogLabel: function () {
      return this.matchup.underdog.toUpperCase()
    },
    favoriteImageURL: function () {
      return teamImageURL(this.matchup.favorite)
    },
    underdogImageURL: function () {
      return teamImageURL(this.matchup.underdog)
    },
    scoreLabel: function () {
      if (!this.finished && this.matchup.games.some(g => g.winner == null && g.loading && g.date < new Date().toISOString().split('T', 1))) {
        return '...'
      } else {
        return String(this.fwins) + "–" + String(this.uwins)
      }
    },
    teamsHover: function () {
      return this.matchup.conference + ' ' + this.matchup.fseed + ' v ' + this.matchup.useed
    },
    days: function () {
      var d = Array(this.duration)
      for (var i = 0; i < this.weekends.length; i++) {
        d[this.weekends[i]] = 'weekend'
      }
      for (var i = 0; i < this.matchup.games.length; i++) {
        game = this.matchup.games[i]
        game['number'] = i + 1
        day = datediff(this.startDate, new Date(game.date + 'T12:00:00-04:00'))
        d[day] = game
      }
      return d
    },
    fwins: function () {
      var count = 0
      for (var i = 0; i < this.matchup.games.length; i++) {
        if (this.matchup.games[i].winner == this.matchup.favorite) count++
      }
      return count
    },
    uwins: function () {
      var count = 0
      for (var i = 0; i < this.matchup.games.length; i++) {
        if (this.matchup.games[i].winner == this.matchup.underdog) count++
      }
      return count
    },
    fwon: function () {
      return this.fwins == 4
    },
    uwon: function () {
      return this.uwins == 4
    },
    finished: function () {
      return this.fwins == 4 || this.uwins == 4
    },
    minGames: function () {
      return Math.min(this.fwins, this.uwins) + 4
    }
  }
}

var NRound = {
  template: '#round-template',
  props: ['round'],
  components: {
    'n-matchup': NMatchup
  },
  data: function () {
    return {sorting: 'schedule'}
  },
  methods: {
    changeSorting: function () {
      if (this.sorting === 'bracket' || this.sorting === null || this.sorting === undefined) {
        this.sorting = 'schedule'
      } else if (this.sorting === 'schedule') {
        this.sorting = 'nextGame'
      } else {
        this.sorting = 'bracket'
      }
    },
  },
  computed: {
    roundName: function () {
      if (this.round.number < 4) {
        return 'Round ' + String(this.round.number)
      } else {
        return 'Finals'
      }
    },
    currentSortName: function () {
      if (this.sorting === 'nextGame') return 'next game'
      if (this.sorting === null || this.sorting === undefined) return 'schedule'
      return this.sorting
    },
    // do this as a computed property so that it will get recalculated
    // and resorted anytime any of the things it uses is changed
    sortedMatchups: function() {
      if (this.sorting === 'schedule' || this.sorting === null || this.sorting === undefined) {
        this.round.matchups.sort(function(a, b) {
          if (a.scheduleSortKey < b.scheduleSortKey) return -1
          if (a.scheduleSortKey > b.scheduleSortKey) return 1
          return 0
        })
      } else if (this.sorting === 'nextGame') {
        this.round.matchups.sort(function(a, b) {
          if (a.nextGameSortKey < b.nextGameSortKey) return -1
          if (a.nextGameSortKey > b.nextGameSortKey) return 1
          return 0
        })
      } else {
        this.round.matchups.sort(function(a, b) {
          if (Number(a.id) < Number(b.id)) return -1
          else return 1
        })
      }
      return this.round.matchups
    },
    startDate: function () { return new Date(this.round.startDate + 'T12:00:00-04:00') },
    endDate: function () { return new Date(this.round.endDate + 'T12:00:00-04:00') },
    duration: function () { return datediff(this.startDate, this.endDate) + 1 },
    dateLabels: function () {
      var labels = Array(this.duration)
      var date = new Date(this.startDate.getTime())
      var days = ['Su', 'M', 'Tu', 'W', 'Th', 'F', 'Sa']
      var today = new Date()
      for (var i = 0; i < this.duration; i++) {
        var isWeekend = date.getDay() == 0 || date.getDay() == 6
        var isToday = today.getFullYear() == date.getFullYear() && today.getMonth() == date.getMonth() && today.getDate() == date.getDate()
        labels[i] = [days[date.getDay()], String(date.getMonth() + 1) + '/' + String(date.getDate()), isToday, isWeekend]
        date.setDate(date.getDate() + 1)
      }
      return labels
    },
    weekends: function () {
      var indexes = []
      for (i = 0; i < this.dateLabels.length; i++) {
        dateLabel = this.dateLabels[i]
        if (dateLabel[3]) indexes.push(i)
      }
      return indexes
    }
  }
}

var NFooter = {
  template: '#footer-template',
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

new Vue({
  el: '#app',
  components: {
    'n-today': NToday,
    'n-round': NRound,
    'n-footer': NFooter
  },
  data: {
    todayGames: todayGames,
    rounds: rounds
  },
  created: function () {
    // sort the rounds
    this.rounds.sort((a, b) => a.number < b.number ? 1 : -1)
  },
  computed: {
    showTodaysGames: function () {
      return this.todayGames.length > 0
    }
  }
})
