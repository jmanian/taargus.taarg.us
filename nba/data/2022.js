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
    startDate: '2022-04-16',
    endDate: '2022-05-01',
    matchups: [
      m(
        '10',
        'West',
        'PHX',
        'NOP',
        [
          // '2021-05-23',
          // '2021-05-26',
          // '2021-05-29',
          // '2021-05-31',
          // '2021-06-02',
          // '2021-06-04',
          // '2021-06-06',
        ]
      ),
      m(
        '11',
        'West',
        'DAL',
        'UTA',
        [
          '2022-04-16',
          '2022-04-18',
          '2022-04-21',
          '2022-04-23',
          '2022-04-25',
          '2022-04-28',
          '2022-04-30',
        ]
      ),
      m(
        '12',
        'West',
        'GSW',
        'DEN',
        [
          '2022-04-16',
          '2022-04-18',
          '2022-04-21',
          '2022-04-24',
          '2022-04-27',
          '2022-04-29',
          '2022-05-01',
        ]
      ),
      m(
        '13',
        'West',
        'MEM',
        'MIN',
        [
          '2022-04-16',
          '2022-04-19',
          '2022-04-21',
          '2022-04-23',
          '2022-04-26',
          '2022-04-29',
          '2022-05-01',
        ]
      ),
      m(
        '14',
        'East',
        'MIA',
        'ATL',
        [
          '2022-04-17',
          '2022-04-19',
          '2022-04-22',
          '2022-04-24',
          '2022-04-26',
          '2022-04-28',
          '2022-04-30',
        ]
      ),
      m(
        '15',
        'East',
        'PHI',
        'TOR',
        [
          '2022-04-16',
          '2022-04-18',
          '2022-04-20',
          '2022-04-23',
          '2022-04-25',
          '2022-04-28',
          '2022-04-30',
        ]
      ),
      m(
        '16',
        'East',
        'MIL',
        'CHI',
        [
          '2022-04-17',
          '2022-04-20',
          '2022-04-22',
          '2022-04-24',
          '2022-04-27',
          '2022-04-29',
          '2022-05-01',
        ]
      ),
      m(
        '17',
        'East',
        'BOS',
        'BKN',
        [
          '2022-04-17',
          '2022-04-20',
          '2022-04-23',
          '2022-04-25',
          '2022-04-27',
          '2022-04-29',
          '2022-05-01',
        ]
      ),
    ]
  }
]
