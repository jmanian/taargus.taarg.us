const DateTime = luxon.DateTime;

function teamImageURL(tricode) {
  if (!tricode || !teamData[tricode]) {
    return '';
  }
  // Use dark mode logos (/D/) when in dark mode, otherwise light mode logos (/L/)
  const mode = document.body.classList.contains('dark-mode') ? 'D' : 'L';
  return 'https://cdn.nba.com/logos/nba/' + teamId(tricode) + '/primary/' + mode + '/logo.svg';
}

function teamId(tricode) {
  if (!tricode || !teamData[tricode]) {
    return null;
  }
  return teamData[tricode].teamId;
}
