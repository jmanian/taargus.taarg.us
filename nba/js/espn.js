// Parse data from espn api

function parseEvent(event) {
  var competition = event.competitions[0];
  var homeTeam = findTeam(competition.competitors, 'home');
  var awayTeam = findTeam(competition.competitors, 'away');
  return {
    round: translateEspnRound(competition.type.abbreviation),
    homeTeam: teamTricode(homeTeam),
    awayTeam: teamTricode(awayTeam),
    gameNum: extractGameNum(competition.notes),
    timeUTC: event.date,
    date: event.date.split('T')[0],
    homeScore: Number(homeTeam.score),
    awayScore: Number(awayTeam.score),
    network: findNationalBroadcast(competition.broadcasts),
    state: event.status.type.state,
    statusDetail: event.status.type.shortDetail,
    clock: event.status.displayClock,
    seriesSummary: fixSummary(competition.series.summary, homeTeam, awayTeam),
    headline: findRecap(competition.headlines)
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
  return summary.replace(homeTeam.team.abbreviation, teamTricode(homeTeam))
                .replace(awayTeam.team.abbreviation, teamTricode(awayTeam))
}

function findTeam(competitors, homeAway) {
  return competitors.find(c => c.homeAway === homeAway);
}

function teamTricode(competitor) {
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
    default:
      return code;
  }
}

function extractGameNum(notes) {
  var regex = /game ([1-7])/i;
  var headline = notes.find(note => note.type === 'event').headline;
  return Number(regex.exec(headline)[1]);
}

function findNationalBroadcast(broadcasts) {
  var broadcast = broadcasts.find(bc => bc.market.toLowerCase() === 'national')
  if (broadcast) {
    return broadcast.names[0];
  }
}

function findRecap(headlines) {
  if (headlines) {
    var headline = headlines.find(hl => hl.type.toLowerCase() === 'recap')
    if (headline) {
      return headline.shortLinkText
    }
  }
}
