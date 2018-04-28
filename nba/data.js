function g(date) {
  return {
    date: date,
    time: null,
    network: null,
    winner: null,
    fscore: null,
    uscore: null,
    clock: null,
    period: null,
    loading: true
  }
}

var rounds = [
  {
    number: 1,
    startDate: '2018-04-14',
    endDate: '2018-04-29',
    matchups: [
      {
        id: '10',
        conference: 'West',
        favorite: 'HOU',
        underdog: 'MIN',
        fseed: null,
        useed: null,
        games: [
          g('2018-04-15'),
          g('2018-04-18'),
          g('2018-04-21'),
          g('2018-04-23'),
          g('2018-04-25'),
          g('2018-04-27'),
          g('2018-04-29'),
        ]
      },
      {
        id: '13',
        conference: 'West',
        favorite: 'GSW',
        underdog: 'SAS',
        fseed: null,
        useed: null,
        games: [
          g('2018-04-14'),
          g('2018-04-16'),
          g('2018-04-19'),
          g('2018-04-22'),
          g('2018-04-24'),
          g('2018-04-26'),
          g('2018-04-28'),
        ]
      },
      {
        id: '12',
        conference: 'West',
        favorite: 'POR',
        underdog: 'NOP',
        fseed: null,
        useed: null,
        games: [
          g('2018-04-14'),
          g('2018-04-17'),
          g('2018-04-19'),
          g('2018-04-21'),
          g('2018-04-24'),
          g('2018-04-26'),
          g('2018-04-28'),
        ]
      },
      {
        id: '11',
        conference: 'West',
        favorite: 'OKC',
        underdog: 'UTA',
        fseed: null,
        useed: null,
        games: [
          g('2018-04-15'),
          g('2018-04-18'),
          g('2018-04-21'),
          g('2018-04-23'),
          g('2018-04-25'),
          g('2018-04-27'),
          g('2018-04-29'),
        ]
      },
      {
        id: '14',
        conference: 'East',
        favorite: 'TOR',
        underdog: 'WAS',
        fseed: null,
        useed: null,
        games: [
          g('2018-04-14'),
          g('2018-04-17'),
          g('2018-04-20'),
          g('2018-04-22'),
          g('2018-04-25'),
          g('2018-04-27'),
          g('2018-04-29'),
        ]
      },
      {
        id: '17',
        conference: 'East',
        favorite: 'BOS',
        underdog: 'MIL',
        fseed: null,
        useed: null,
        games: [
          g('2018-04-15'),
          g('2018-04-17'),
          g('2018-04-20'),
          g('2018-04-22'),
          g('2018-04-24'),
          g('2018-04-26'),
          g('2018-04-28'),
        ]
      },
      {
        id: '16',
        conference: 'East',
        favorite: 'PHI',
        underdog: 'MIA',
        fseed: null,
        useed: null,
        games: [
          g('2018-04-14'),
          g('2018-04-16'),
          g('2018-04-19'),
          g('2018-04-21'),
          g('2018-04-24'),
          g('2018-04-26'),
          g('2018-04-28'),
        ]
      },
      {
        id: '15',
        conference: 'East',
        favorite: 'CLE',
        underdog: 'IND',
        fseed: null,
        useed: null,
        games: [
          g('2018-04-15'),
          g('2018-04-18'),
          g('2018-04-20'),
          g('2018-04-22'),
          g('2018-04-25'),
          g('2018-04-27'),
          g('2018-04-29'),
        ]
      }
    ]
  },
  {
    number: 2,
    startDate: '2018-04-28',
    endDate: '2018-05-13',
    matchups: [
      {
        id: '20',
        conference: 'West',
        favorite: 'HOU',
        underdog: 'UTA',
        fseed: null,
        useed: null,
        games: [
          g('2018-04-29'),
          g('2018-05-02'),
          g(null),
          g(null),
          g(null),
          g(null),
          g(null)
        ]
      },
      {
        id: '21',
        conference: 'West',
        favorite: 'GSW',
        underdog: 'NOP',
        fseed: null,
        useed: null,
        games: [
          g('2018-04-28'),
          g('2018-05-01'),
          g(null),
          g(null),
          g(null),
          g(null),
          g(null)
        ]
      },
      {
        id: '22',
        conference: 'East',
        favorite: 'TOR',
        underdog: null,
        fseed: null,
        useed: null,
        invisible: true,
        games: [
          g(null),
          g(null),
          g(null),
          g(null),
          g(null),
          g(null),
          g(null)
        ]
      },
      {
        id: '23',
        conference: 'East',
        favorite: null,
        underdog: null,
        fseed: null,
        useed: null,
        invisible: true,
        games: [
          g(null),
          g(null),
          g(null),
          g(null),
          g(null),
          g(null),
          g(null)
        ]
      },
    ]
  }
]
