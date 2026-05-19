// Parse data from espn api

// Tricode -> playoff seed, populated from the standings endpoint.
const playoffSeeds = {};

function parseEvent(event) {
  const competition = event.competitions[0];
  const homeTeam = findTeam(competition.competitors, 'home');
  const awayTeam = findTeam(competition.competitors, 'away');
  const dateTime = DateTime.fromISO(event.date).setZone('America/Los_Angeles')
  const date = dateTime.toISODate()
  const rawHeadline = competition.notes?.find(note => note.type === 'event')?.headline;
  const isPlayoff = competition.series?.type === 'playoff';
  const headline = isPlayoff
    ? competition.series.summary
    : rawHeadline?.replaceAll(' - ', ' – ');
  const homeTricode = teamTricode(homeTeam);
  const awayTricode = teamTricode(awayTeam);
  const homeSeed = isPlayoff ? playoffSeeds[homeTricode] || null : null;
  const awaySeed = isPlayoff ? playoffSeeds[awayTricode] || null : null;
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
  const isPostponed = event.status.type.name === 'STATUS_POSTPONED';
  const gameStarted = gameState !== 'pre' && !isPostponed;

  return {
    id: event.id,
    homeTeam: homeTricode,
    awayTeam: awayTricode,
    homeTeamName: homeTeam.team.name,
    awayTeamName: awayTeam.team.name,
    homeRecord: getOverallRecord(homeTeam),
    awayRecord: getOverallRecord(awayTeam),
    homeSeed: homeSeed,
    awaySeed: awaySeed,
    isPlayoff: isPlayoff,
    homeTeamColor: homeTeam.team.color,
    awayTeamColor: awayTeam.team.color,
    homeTeamAltColor: homeTeam.team.alternateColor,
    awayTeamAltColor: awayTeam.team.alternateColor,
    headline: headline,
    dateTime: competition.timeValid ? dateTime : null,
    date: date,
    homeScore: Number(homeTeam.score),
    awayScore: Number(awayTeam.score),
    network: getBroadcastInfo(competition.broadcasts),
    state: isPostponed ? 'postponed' : gameState,
    statusDetail: event.status.type.shortDetail.replace('-', '–'),
    clock: event.status.displayClock,
    spread: odds?.details,
    spreadFormatted: spreadFormatted,
    total: odds?.overUnder,
    homeMoneyline: odds?.moneyline?.home?.close?.odds,
    awayMoneyline: odds?.moneyline?.away?.close?.odds,
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
  return LEAGUE.translateTeamCode(code);
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

  // Collect local networks (home and away markets), excluding League Pass
  const localNetworks = broadcasts
    .filter(bc => bc.market.toLowerCase() === 'home' || bc.market.toLowerCase() === 'away')
    .flatMap(bc => bc.names)
    .filter(name => !name.includes('League Pass'))

  const primaryNetwork = national ? national.names[0] : 'League Pass';

  return {
    primary: primaryNetwork,
    hasLocal: localNetworks.length > 0,
    localNetworks: localNetworks
  };
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
