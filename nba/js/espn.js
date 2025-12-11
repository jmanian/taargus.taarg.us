// Parse data from espn api

function parseEvent(event) {
  const competition = event.competitions[0];
  const homeTeam = findTeam(competition.competitors, 'home');
  const awayTeam = findTeam(competition.competitors, 'away');
  const dateTime = DateTime.fromISO(event.date).setZone('America/Los_Angeles')
  const date = dateTime.toISODate()
  const headline = competition.notes?.find(note => note.type === 'event')?.headline;
  const odds = competition.odds?.[0];

  // Build spread string with full team name
  let spreadFormatted = null;
  if (odds?.spread) {
    let favoriteTeamName = null;
    let spreadValue = odds.spread;

    if (odds.homeTeamOdds?.favorite) {
      favoriteTeamName = odds.homeTeamOdds?.team?.name;
    } else if (odds.awayTeamOdds?.favorite) {
      favoriteTeamName = odds.awayTeamOdds?.team?.name;
      // When away team is favorite, flip the spread sign
      spreadValue = odds.spread * -1;
    }

    if (favoriteTeamName) {
      spreadFormatted = `${favoriteTeamName} ${spreadValue}`;
    }
  }

  const gameState = event.status.type.state;
  const gameStarted = gameState !== 'pre';

  return {
    id: event.id,
    homeTeam: teamTricode(homeTeam),
    awayTeam: teamTricode(awayTeam),
    homeTeamName: homeTeam.team.name,
    awayTeamName: awayTeam.team.name,
    homeRecord: getOverallRecord(homeTeam),
    awayRecord: getOverallRecord(awayTeam),
    homeTeamColor: homeTeam.team.color,
    awayTeamColor: awayTeam.team.color,
    homeTeamAltColor: homeTeam.team.alternateColor,
    awayTeamAltColor: awayTeam.team.alternateColor,
    headline: headline?.replaceAll(' - ', ' – '),
    dateTime: competition.timeValid ? dateTime : null,
    date: date,
    homeScore: Number(homeTeam.score),
    awayScore: Number(awayTeam.score),
    network: getBroadcastInfo(competition.broadcasts),
    state: gameState,
    statusDetail: event.status.type.shortDetail.replace('-', '–'),
    clock: event.status.displayClock,
    spread: odds?.details,
    spreadFormatted: spreadFormatted,
    total: odds?.overUnder,
    recap: findRecap(competition.headlines),
    homeStats: getTeamStats(homeTeam, gameStarted),
    awayStats: getTeamStats(awayTeam, gameStarted),
    homeLeaders: getTeamLeaders(homeTeam),
    awayLeaders: getTeamLeaders(awayTeam)
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

function findRecap(headlines) {
  if (headlines) {
    const headline = headlines.find(hl => hl.type.toLowerCase() === 'recap')
    if (headline) {
      const description = headline.description
      // Strip "— " from the beginning if it exists
      return description?.startsWith('— ') ? description.slice(2) : description
    }
  }
}

function getTeamStats(competitor, gameStarted) {
  if (!competitor.statistics) return null;

  const stats = competitor.statistics;
  const findStat = (name) => {
    const stat = stats.find(s => s.name === name);
    return stat?.displayValue || null;
  };

  return {
    fgPct: findStat('fieldGoalPct'),
    threePct: findStat('threePointFieldGoalPct'),
    rebounds: gameStarted ? findStat('rebounds') : findStat('avgRebounds'),
    assists: gameStarted ? findStat('assists') : findStat('avgAssists')
  };
}

function getTeamLeaders(competitor) {
  if (!competitor.leaders) return null;

  const leaders = competitor.leaders;

  const pointsLeader = leaders.find(l => l.name === 'points');
  const reboundsLeader = leaders.find(l => l.name === 'rebounds');
  const assistsLeader = leaders.find(l => l.name === 'assists');

  return {
    points: pointsLeader?.leaders?.[0] ? {
      name: pointsLeader.leaders[0].athlete.shortName,
      value: pointsLeader.leaders[0].displayValue
    } : null,
    rebounds: reboundsLeader?.leaders?.[0] ? {
      name: reboundsLeader.leaders[0].athlete.shortName,
      value: reboundsLeader.leaders[0].displayValue
    } : null,
    assists: assistsLeader?.leaders?.[0] ? {
      name: assistsLeader.leaders[0].athlete.shortName,
      value: assistsLeader.leaders[0].displayValue
    } : null
  };
}
