const DateTime = luxon.DateTime;

function teamImageURL(tricode, mode = 'L') {
  if (!tricode || !teamData[tricode]) {
    return '';
  }
  return 'https://cdn.nba.com/logos/nba/' + teamId(tricode) + '/primary/' + mode + '/logo.svg';
}

function teamId(tricode) {
  if (!tricode || !teamData[tricode]) {
    return null;
  }
  return teamData[tricode].teamId;
}
