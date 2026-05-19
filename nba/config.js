// Per-league configuration consumed by the shared/ code.
// teamData is defined by playoffs/data/teams.js, loaded before this file.
const LEAGUE = {
  slug: 'nba',
  teams: teamData,
  regulationPeriods: 4,
  periodSeconds: 12 * 60,
  otSeconds: 5 * 60,
  standings: {
    cutoffs: [
      { index: 5, class: 'playoff-cutoff' },
      { index: 9, class: 'playin-cutoff' }
    ],
    clincher: true
  },
  translateTeamCode(code) {
    switch (code) {
      case 'GS': return 'GSW';
      case 'NY': return 'NYK';
      case 'SA': return 'SAS';
      case 'NO': return 'NOP';
      case 'UTAH': return 'UTA';
      case 'WSH': return 'WAS';
      case 'TBD': return null;
      default: return code;
    }
  },
  teamLogoURL(tricode, mode) {
    const id = this.teams[tricode] && this.teams[tricode].teamId;
    if (!id) return '';
    return `https://cdn.nba.com/logos/nba/${id}/primary/${mode}/logo.svg`;
  },
  scoreboardURL(dateBasic) {
    return `https://site.web.api.espn.com/apis/site/v2/sports/basketball/${this.slug}/scoreboard?region=us&lang=en&contentorigin=espn&limit=100&calendartype=offdays&includeModules=videos&dates=${dateBasic}&tz=America%2FNew_York&buyWindow=1m&showAirings=live&showZipLookup=true`;
  },
  standingsURL() {
    return `https://site.api.espn.com/apis/v2/sports/basketball/${this.slug}/standings`;
  },
  summaryURL(eventId) {
    return `https://site.api.espn.com/apis/site/v2/sports/basketball/${this.slug}/summary?event=${eventId}`;
  }
}
