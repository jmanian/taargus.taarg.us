const DateTime = luxon.DateTime;

function teamImageURL(tricode, mode = 'L') {
  if (!tricode || !LEAGUE.teams[tricode]) {
    return '';
  }
  return LEAGUE.teamLogoURL(tricode, mode);
}

function teamId(tricode) {
  if (!tricode || !LEAGUE.teams[tricode]) {
    return null;
  }
  return LEAGUE.teams[tricode].teamId;
}
