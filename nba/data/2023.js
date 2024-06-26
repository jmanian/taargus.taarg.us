const seeds = {
  'DEN': 1,
  'MEM': 2,
  'SAC': 3,
  'PHX': 4,
  'LAC': 5,
  'GSW': 6,
  'LAL': 7,
  'MIN': 8,
  'MIL': 1,
  'BOS': 2,
  'PHI': 3,
  'CLE': 4,
  'NYK': 5,
  'BKN': 6,
  'ATL': 7,
  'MIA': 8
}

const dates = {
  start: '2023-04-15',
  end: '2023-06-18',
}

const initRounds = [
  {
    number: 1,
    matchups: [
      m(
        '10',
        'West',
        'DEN',
        'MIN',
        [
          '2023-04-16',
          '2023-04-19',
          '2023-04-21',
          '2023-04-23',
          '2023-04-25',
          '2023-04-27',
          '2023-04-29',
        ]
      ),
      m(
        '11',
        'West',
        'MEM',
        'LAL',
        [
          '2023-04-16',
          '2023-04-19',
          '2023-04-22',
          '2023-04-24',
          '2023-04-26',
          '2023-04-28',
          '2023-04-30',
        ]
      ),
      m(
        '12',
        'West',
        'SAC',
        'GSW',
        [
          '2023-04-15',
          '2023-04-17',
          '2023-04-20',
          '2023-04-23',
          '2023-04-26',
          '2023-04-28',
          '2023-04-30',
        ]
      ),
      m(
        '13',
        'West',
        'PHX',
        'LAC',
        [
          '2023-04-16',
          '2023-04-18',
          '2023-04-20',
          '2023-04-22',
          '2023-04-25',
          '2023-04-27',
          '2023-04-29',
        ]
      ),
      m(
        '14',
        'East',
        'MIL',
        'MIA',
        [
          '2023-04-16',
          '2023-04-19',
          '2023-04-22',
          '2023-04-24',
          '2023-04-26',
          '2023-04-28',
          '2023-04-30',
        ]
      ),
      m(
        '15',
        'East',
        'BOS',
        'ATL',
        [
          '2023-04-15',
          '2023-04-18',
          '2023-04-21',
          '2023-04-23',
          '2023-04-25',
          '2023-04-27',
          '2023-04-29',
        ]
      ),
      m(
        '16',
        'East',
        'PHI',
        'BKN',
        [
          '2023-04-15',
          '2023-04-17',
          '2023-04-20',
          '2023-04-22',
          '2023-04-24',
          '2023-04-27',
          '2023-04-29',
        ]
      ),
      m(
        '17',
        'East',
        'CLE',
        'NYK',
        [
          '2023-04-15',
          '2023-04-18',
          '2023-04-21',
          '2023-04-23',
          '2023-04-26',
          '2023-04-28',
          '2023-04-30',
        ]
      ),
    ]
  },
  {
    number: 2,
    matchups: [
      m(
        '20',
        'West',
        'DEN',
        'PHX',
        [
          '2023-04-29',
          '2023-05-01',
          '2023-05-05',
          '2023-05-07',
          '2023-05-09',
          '2023-05-11',
          '2023-05-14',
        ]
      ),
      m(
        '21',
        'West',
        'GSW',
        'LAL',
        [
          '2023-05-02',
          '2023-05-04',
          '2023-05-06',
          '2023-05-08',
          '2023-05-10',
          '2023-05-12',
          '2023-05-14',
        ]
      ),
      m(
        '22',
        'East',
        'NYK',
        'MIA',
        [
          '2023-04-30',
          '2023-05-02',
          '2023-05-06',
          '2023-05-08',
          '2023-05-10',
          '2023-05-12',
          '2023-05-15',
        ]
      ),
      m(
        '23',
        'East',
        'BOS',
        'PHI',
        [
          '2023-05-01',
          '2023-05-03',
          '2023-05-05',
          '2023-05-07',
          '2023-05-09',
          '2023-05-11',
          '2023-05-14',
        ]
      ),
    ]
  },
  {
    number: 3,
    matchups: [
      m(
        '30',
        'West',
        'DEN',
        'LAL',
        [
          '2023-05-16',
          '2023-05-18',
          '2023-05-20',
          '2023-05-22',
          '2023-05-24',
          '2023-05-26',
          '2023-05-28',
        ]
      ),
      m(
        '31',
        'East',
        'BOS',
        'MIA',
        [
          '2023-05-17',
          '2023-05-19',
          '2023-05-21',
          '2023-05-23',
          '2023-05-25',
          '2023-05-27',
          '2023-05-29',
        ]
      )
    ]
  },
  {
    number: 4,
    matchups: [
      m(
        '40',
        'Finals',
        'DEN',
        'MIA',
        [
          '2023-06-01',
          '2023-06-04',
          '2023-06-07',
          '2023-06-09',
          '2023-06-12',
          '2023-06-15',
          '2023-06-18',
        ]
      )
    ]
  }
]
