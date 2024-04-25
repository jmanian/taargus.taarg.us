const seeds = {
  'OKC': 1,
  'DEN': 2,
  'MIN': 3,
  'PHX': 4,
  'LAC': 5,
  'DAL': 6,
  'LAL': 7,
  'NOP': 8,
  'BOS': 1,
  'NYK': 2,
  'MIL': 3,
  'CLE': 4,
  'ORL': 5,
  'IND': 6,
  'PHI': 7,
  'MIA': 8
}

const rounds = [
  {
    number: 1,
    startDate: '2024-04-20',
    endDate: '2024-05-05',
    matchups: [
      m(
        '10',
        'West',
        'OKC',
        'NOP',
        [
          '2024-04-21',
          '2024-04-24',
          '2024-04-27',
          '2024-04-29',
          '2024-05-01',
          '2024-05-03',
          '2024-05-05',
        ]
      ),
      m(
        '11',
        'West',
        'DEN',
        'LAL',
        [
          '2024-04-20',
          '2024-04-22',
          '2024-04-25',
          '2024-04-27',
          '2024-04-29',
          '2024-05-02',
          '2024-05-04',
        ]
      ),
      m(
        '12',
        'West',
        'MIN',
        'PHX',
        [
          '2024-04-20',
          '2024-04-23',
          '2024-04-26',
          '2024-04-28',
          '2024-04-30',
          '2024-05-02',
          '2024-05-04',
        ]
      ),
      m(
        '13',
        'West',
        'LAC',
        'DAL',
        [
          '2024-04-21',
          '2024-04-23',
          '2024-04-26',
          '2024-04-28',
          '2024-05-01',
          '2024-05-03',
          '2024-05-05',
        ]
      ),
      m(
        '14',
        'East',
        'BOS',
        'MIA',
        [
          '2024-04-21',
          '2024-04-24',
          '2024-04-27',
          '2024-04-29',
          '2024-05-01',
          '2024-05-03',
          '2024-05-05',
        ]
      ),
      m(
        '15',
        'East',
        'NYK',
        'PHI',
        [
          '2024-04-20',
          '2024-04-22',
          '2024-04-25',
          '2024-04-28',
          '2024-04-30',
          '2024-05-02',
          '2024-05-04',
        ]
      ),
      m(
        '16',
        'East',
        'MIL',
        'IND',
        [
          '2024-04-21',
          '2024-04-23',
          '2024-04-26',
          '2024-04-28',
          '2024-04-30',
          '2024-05-02',
          '2024-05-04',
        ]
      ),
      m(
        '17',
        'East',
        'CLE',
        'ORL',
        [
          '2024-04-20',
          '2024-04-22',
          '2024-04-25',
          '2024-04-27',
          '2024-04-30',
          '2024-05-03',
          '2024-05-05',
        ]
      ),
    ]
  },
  // {
  //   number: 2,
  //   startDate: '2024-04-29',
  //   endDate: '2024-05-15',
  //   matchups: [
  //     m(
  //       '20',
  //       'West',
  //       'DEN',
  //       'PHX',
  //       [
  //         '2024-04-29',
  //         '2024-05-01',
  //         '2024-05-05',
  //         '2024-05-07',
  //         '2024-05-09',
  //         '2024-05-11',
  //         '2024-05-14',
  //       ]
  //     ),
  //     m(
  //       '21',
  //       'West',
  //       'GSW',
  //       'LAL',
  //       [
  //         '2024-05-02',
  //         '2024-05-04',
  //         '2024-05-06',
  //         '2024-05-08',
  //         '2024-05-10',
  //         '2024-05-12',
  //         '2024-05-14',
  //       ]
  //     ),
  //     m(
  //       '22',
  //       'East',
  //       'NYK',
  //       'MIA',
  //       [
  //         '2024-04-30',
  //         '2024-05-02',
  //         '2024-05-06',
  //         '2024-05-08',
  //         '2024-05-10',
  //         '2024-05-12',
  //         '2024-05-15',
  //       ]
  //     ),
  //     m(
  //       '23',
  //       'East',
  //       'BOS',
  //       'PHI',
  //       [
  //         '2024-05-01',
  //         '2024-05-03',
  //         '2024-05-05',
  //         '2024-05-07',
  //         '2024-05-09',
  //         '2024-05-11',
  //         '2024-05-14',
  //       ]
  //     ),
  //   ]
  // },
  // {
  //   number: 3,
  //   startDate: '2024-05-16',
  //   endDate: '2024-05-29',
  //   matchups: [
  //     m(
  //       '30',
  //       'West',
  //       'DEN',
  //       'LAL',
  //       [
  //         '2024-05-16',
  //         '2024-05-18',
  //         '2024-05-20',
  //         '2024-05-22',
  //         '2024-05-24',
  //         '2024-05-26',
  //         '2024-05-28',
  //       ]
  //     ),
  //     m(
  //       '31',
  //       'East',
  //       'BOS',
  //       'MIA',
  //       [
  //         '2024-05-17',
  //         '2024-05-19',
  //         '2024-05-21',
  //         '2024-05-23',
  //         '2024-05-25',
  //         '2024-05-27',
  //         '2024-05-29',
  //       ]
  //     )
  //   ]
  // },
  // {
  //   number: 4,
  //   startDate: '2024-06-01',
  //   endDate: '2024-06-18',
  //   matchups: [
  //     m(
  //       '40',
  //       'Finals',
  //       'DEN',
  //       'MIA',
  //       [
  //         '2024-06-01',
  //         '2024-06-04',
  //         '2024-06-07',
  //         '2024-06-09',
  //         '2024-06-12',
  //         '2024-06-15',
  //         '2024-06-18',
  //       ]
  //     )
  //   ]
  // }
]
