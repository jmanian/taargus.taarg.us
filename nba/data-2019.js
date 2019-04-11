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
    startDate: '2019-04-13',
    endDate: '2019-04-28',
    matchups: [
      m(
        '10',
        'West',
        'GSW',
        'LAC',
        [
          '2019-04-13',
          '2019-04-15',
          '2019-04-18',
          '2019-04-21',
          '2019-04-24',
          '2019-04-26',
          '2019-04-28',
        ]
      ),
      m(
        '11',
        'West',
        'HOU',
        'UTA',
        [
          '2019-04-14',
          '2019-04-17',
          '2019-04-20',
          '2019-04-22',
          '2019-04-24',
          '2019-04-26',
          '2019-04-28',
        ]
      ),
      m(
        '12',
        'West',
        'POR',
        'OKC',
        [
          '2019-04-14',
          '2019-04-16',
          '2019-04-19',
          '2019-04-21',
          '2019-04-23',
          '2019-04-25',
          '2019-04-27',
        ]
      ),
      m(
        '13',
        'West',
        'DEN',
        'SAS',
        [
          '2019-04-13',
          '2019-04-16',
          '2019-04-18',
          '2019-04-20',
          '2019-04-23',
          '2019-04-25',
          '2019-04-27',
        ]
      ),
      m(
        '14',
        'East',
        'MIL',
        'DET',
        [
          '2019-04-14',
          '2019-04-17',
          '2019-04-20',
          '2019-04-22',
          '2019-04-24',
          '2019-04-26',
          '2019-04-28',
        ]
      ),
      m(
        '15',
        'East',
        'BOS',
        'IND',
        [
          '2019-04-14',
          '2019-04-17',
          '2019-04-19',
          '2019-04-21',
          '2019-04-24',
          '2019-04-26',
          '2019-04-28',
        ]
      ),
      m(
        '16',
        'East',
        'PHI',
        'BKN',
        [
          '2019-04-13',
          '2019-04-15',
          '2019-04-18',
          '2019-04-20',
          '2019-04-23',
          '2019-04-25',
          '2019-04-27',
        ]
      ),
      m(
        '17',
        'East',
        'TOR',
        'ORL',
        [
          '2019-04-13',
          '2019-04-16',
          '2019-04-19',
          '2019-04-21',
          '2019-04-23',
          '2019-04-25',
          '2019-04-27',
        ]
      )
    ]
  },
]
