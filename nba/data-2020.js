function m(id, c, f, u, gs) {
  var numMissing = 7 - gs.length
  for (i = 0; i < numMissing; i++) {
    gs.push(null)
  }
  var invisible = f == null || u == null
  return {
    id: id,
    conference: c,
    favorite: f,
    underdog: u,
    fseed: null,
    useed: null,
    invisible: invisible,
    scheduleSortKey: null,
    nextGameSortKey: null,
    games: gs.map(g => makeGame(g))
  }
}

function makeGame(date) {
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
    startDate: '2020-08-17',
    endDate: '2020-09-02',
    matchups: [
      m(
        '10',
        'West',
        'LAL',
        'POR',
        [
          '2020-08-18',
          '2020-08-20',
          '2020-08-22',
          '2020-08-24',
          '2020-08-29',
          '2020-08-31',
          '2020-09-02',
        ]
      ),
      m(
        '11',
        'West',
        'HOU',
        'OKC',
        [
          '2020-08-18',
          '2020-08-20',
          '2020-08-22',
          '2020-08-24',
          '2020-08-29',
          '2020-08-31',
          '2020-09-02',
        ]
      ),
      m(
        '12',
        'West',
        'DEN',
        'UTA',
        [
          '2020-08-17',
          '2020-08-19',
          '2020-08-21',
          '2020-08-23',
          '2020-08-25',
          '2020-08-30',
          '2020-09-01',
        ]
      ),
      m(
        '13',
        'West',
        'LAC',
        'DAL',
        [
          '2020-08-17',
          '2020-08-19',
          '2020-08-21',
          '2020-08-23',
          '2020-08-25',
          '2020-08-30',
          '2020-09-01',
        ]
      ),
      m(
        '14',
        'East',
        'MIL',
        'ORL',
        [
          '2020-08-18',
          '2020-08-20',
          '2020-08-22',
          '2020-08-24',
          '2020-08-29',
          '2020-08-31',
          '2020-09-02',
        ]
      ),
      m(
        '15',
        'East',
        'IND',
        'MIA',
        [
          '2020-08-18',
          '2020-08-20',
          '2020-08-22',
          '2020-08-24',
          '2020-08-29',
          '2020-08-31',
          '2020-09-02',
        ]
      ),
      m(
        '16',
        'East',
        'BOS',
        'PHI',
        [
          '2020-08-17',
          '2020-08-19',
          '2020-08-21',
          '2020-08-23',
          '2020-08-25',
          '2020-08-30',
          '2020-09-01',
        ]
      ),
      m(
        '17',
        'East',
        'TOR',
        'BKN',
        [
          '2020-08-17',
          '2020-08-19',
          '2020-08-21',
          '2020-08-23',
          '2020-08-25',
          '2020-08-30',
          '2020-09-01',
        ]
      ),
    ]
  },
  {
    number: 2,
    startDate: '2020-08-30',
    endDate: '2020-09-12',
    matchups: [
      m(
        '20',
        'West',
        null,
        null,
        [
        ]
      ),
      m(
        '21',
        'West',
        null,
        null,
        [
        ]
      ),
      m(
        '22',
        'East',
        null,
        null,
        [
        ]
      ),
      m(
        '23',
        'East',
        'TOR',
        'BOS',
        [
        ]
      ),
    ]
  },
]
