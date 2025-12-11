// Parse data from espn api

function parseEvent(event) {
  const competition = event.competitions[0];
  const homeTeam = findTeam(competition.competitors, 'home');
  const awayTeam = findTeam(competition.competitors, 'away');
  const dateTime = DateTime.fromISO(event.date).setZone('America/Los_Angeles')
  const date = dateTime.toISODate()
  const headline = competition.notes?.find(note => note.type === 'event')?.headline;
  return {
    round: translateEspnRound(competition.type.abbreviation),
    homeTeam: teamTricode(homeTeam),
    awayTeam: teamTricode(awayTeam),
    homeTeamName: homeTeam.team.name,
    awayTeamName: awayTeam.team.name,
    gameNum: extractGameNum(headline),
    headline: headline.replaceAll(' - ', ' – '),
    dateTime: competition.timeValid ? dateTime : null,
    date: date,
    homeScore: Number(homeTeam.score),
    awayScore: Number(awayTeam.score),
    network: findNationalBroadcast(competition.broadcasts),
    state: event.status.type.state,
    statusDetail: event.status.type.shortDetail.replace('-', '–'),
    clock: event.status.displayClock,
    seriesSummary: fixSummary(competition.series?.summary, homeTeam, awayTeam),
    recap: findRecap(competition.headlines)
  }
}

function translateEspnRound(round) {
  switch(round) {
    case 'RD16':
      return 1;
    case 'QTR':
      return 2;
    case 'SEMI':
      return 3;
    case 'FINAL':
      return 4;
  }
}

function fixSummary(summary, homeTeam, awayTeam) {
  return summary?.replace(homeTeam.team.abbreviation, teamTricode(homeTeam))
                ?.replace(awayTeam.team.abbreviation, teamTricode(awayTeam))
}

function findTeam(competitors, homeAway) {
  return competitors.find(c => c.homeAway === homeAway);
}

function teamTricode(competitor) {
  // When a team is not yet determined it can say something like "Heat/Hawks"
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

function extractGameNum(headline) {
  const regex = /game ([1-7])/i;
  if (headline) {
    const match = regex.exec(headline);
    if (match) {
      return Number(match[1]);
    }
  }
  return null;
}

function findNationalBroadcast(broadcasts) {
  const broadcast = broadcasts.find(bc => bc.market.toLowerCase() === 'national')
  if (broadcast) {
    return broadcast.names[0];
  }
}

function findRecap(headlines) {
  if (headlines) {
    const headline = headlines.find(hl => hl.type.toLowerCase() === 'recap')
    if (headline) {
      return headline.shortLinkText
    }
  }
}
