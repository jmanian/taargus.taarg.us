const DateTime = luxon.DateTime;

function teamImageURL(tricode) {
  return 'https://cdn.nba.com/logos/nba/' + teamId(tricode) + '/primary/L/logo.svg';
}

function teamId(tricode) {
  return teamData[tricode].teamId;
}
