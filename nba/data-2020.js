function m(id, c, f, u, gs) {
  var numMissing = 7 - gs.length
  for (i = 0; i < numMissing; i++) {
    gs.push(null)
  }
  var invisible = f == null || u == null
  // temporary fix for missing seed data from NBA
  // remove this when they start sending the seeds
  var seeds = {
    '10': [1, 8],
    '11': [4, 5],
    '12': [3, 6],
    '13': [2, 7],
    '14': [1, 8],
    '15': [4, 5],
    '16': [3, 6],
    '17': [2, 7],
  }
  return {
    id: id,
    conference: c,
    favorite: f,
    underdog: u,
    fseed: seeds[id][0],
    useed: seeds[id][1],
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
    startDate: '2020-08-15',
    endDate: '2020-08-30',
    matchups: [
      m(
        '10',
        'West',
        'LAL',
        'TBD',
        [

        ]
      ),
      m(
        '11',
        'West',
        'HOU',
        'OKC',
        [
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
          '2020-08-27',
          '2020-08-29',
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
          '2020-08-27',
          '2020-08-29',
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
          '2020-08-26',
          '2020-08-28',
          '2020-08-30',
        ]
      ),
      m(
        '15',
        'East',
        'IND',
        'MIA',
        [
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
          '2020-08-27',
          '2020-08-29',
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
          '2020-08-27',
          '2020-08-29',
        ]
      ),
    ]
  }
]
