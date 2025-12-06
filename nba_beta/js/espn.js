// Parse data from espn api

function parseEvent(event) {
  const competition = event.competitions[0];
  const homeTeam = findTeam(competition.competitors, 'home');
  const awayTeam = findTeam(competition.competitors, 'away');
  const dateTime = DateTime.fromISO(event.date).setZone('America/Los_Angeles')
  const date = dateTime.toISODate()
  const headline = competition.notes?.find(note => note.type === 'event')?.headline;
  return {
    id: event.id,
    homeTeam: teamTricode(homeTeam),
    awayTeam: teamTricode(awayTeam),
    homeTeamName: homeTeam.team.name,
    awayTeamName: awayTeam.team.name,
    homeRecord: getOverallRecord(homeTeam),
    awayRecord: getOverallRecord(awayTeam),
    headline: headline?.replaceAll(' - ', ' – '),
    dateTime: competition.timeValid ? dateTime : null,
    date: date,
    homeScore: Number(homeTeam.score),
    awayScore: Number(awayTeam.score),
    network: getBroadcastInfo(competition.broadcasts),
    state: event.status.type.state,
    statusDetail: event.status.type.shortDetail.replace('-', '–'),
    clock: event.status.displayClock
  }
}

function getOverallRecord(competitor) {
  const overallRecord = competitor.records?.find(r => r.name === 'overall');
  return overallRecord?.summary || '';
}

function findTeam(competitors, homeAway) {
  return competitors.find(c => c.homeAway === homeAway);
}

function teamTricode(competitor) {
  if (competitor.team.abbreviation.includes('/')) {
    return null;
  }
  return translateEspnTeamCode(competitor.team.abbreviation);
}

function translateEspnTeamCode(code) {
  switch(code) {
    case 'GS':
      return 'GSW';
    case 'NY':
      return 'NYK';
    case 'SA':
      return 'SAS';
    case 'NO':
      return 'NOP';
    case 'UTAH':
      return 'UTA';
    case 'WSH':
      return 'WAS';
    case 'TBD':
      return null;
    default:
      return code;
  }
}

function findNationalBroadcast(broadcasts) {
  const broadcast = broadcasts.find(bc => bc.market.toLowerCase() === 'national')
  if (broadcast) {
    return broadcast.names[0];
  }
}

function getBroadcastInfo(broadcasts) {
  // First check for national broadcast
  const national = broadcasts.find(bc => bc.market.toLowerCase() === 'national')
  if (national) {
    return national.names[0];
  }

  // Otherwise, look for League Pass
  const allNetworks = broadcasts
    .filter(bc => bc.names && bc.names.length > 0)
    .flatMap(bc => bc.names);

  const leaguePass = allNetworks.find(name => name.includes('League Pass'));
  return leaguePass ? 'League Pass' : '';
}
