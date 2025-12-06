const DateTime = luxon.DateTime;

function teamImageURL(tricode) {
  if (!tricode || !teamData[tricode]) {
    return '';
  }
  return 'https://cdn.nba.com/logos/nba/' + teamId(tricode) + '/primary/L/logo.svg';
}

function teamId(tricode) {
  if (!tricode || !teamData[tricode]) {
    return null;
  }
  return teamData[tricode].teamId;
}

function shortenTeamName(name) {
  const shortNames = {
    'Trail Blazers': 'Blazers'
  };
  return shortNames[name] || name;
}
