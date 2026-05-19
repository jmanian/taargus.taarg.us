// Per-league configuration consumed by the shared/ code.
// Tricodes/teamIds match cdn.wnba.com (staticData/scheduleLeagueV2.json);
// ESPN uses different abbreviations, remapped in translateTeamCode().
const teamData = {
  "ATL": { "teamId": 1611661330, "abbreviation": "ATL", "teamName": "Atlanta Dream", "simpleName": "Dream", "location": "Atlanta" },
  "CHI": { "teamId": 1611661329, "abbreviation": "CHI", "teamName": "Chicago Sky", "simpleName": "Sky", "location": "Chicago" },
  "CON": { "teamId": 1611661323, "abbreviation": "CON", "teamName": "Connecticut Sun", "simpleName": "Sun", "location": "Connecticut" },
  "DAL": { "teamId": 1611661321, "abbreviation": "DAL", "teamName": "Dallas Wings", "simpleName": "Wings", "location": "Dallas" },
  "GSV": { "teamId": 1611661331, "abbreviation": "GSV", "teamName": "Golden State Valkyries", "simpleName": "Valkyries", "location": "Golden State" },
  "IND": { "teamId": 1611661325, "abbreviation": "IND", "teamName": "Indiana Fever", "simpleName": "Fever", "location": "Indiana" },
  "LAS": { "teamId": 1611661320, "abbreviation": "LAS", "teamName": "Los Angeles Sparks", "simpleName": "Sparks", "location": "Los Angeles" },
  "LVA": { "teamId": 1611661319, "abbreviation": "LVA", "teamName": "Las Vegas Aces", "simpleName": "Aces", "location": "Las Vegas" },
  "MIN": { "teamId": 1611661324, "abbreviation": "MIN", "teamName": "Minnesota Lynx", "simpleName": "Lynx", "location": "Minnesota" },
  "NYL": { "teamId": 1611661313, "abbreviation": "NYL", "teamName": "New York Liberty", "simpleName": "Liberty", "location": "New York" },
  "PDX": { "teamId": 1611661327, "abbreviation": "PDX", "teamName": "Portland Fire", "simpleName": "Fire", "location": "Portland" },
  "PHX": { "teamId": 1611661317, "abbreviation": "PHX", "teamName": "Phoenix Mercury", "simpleName": "Mercury", "location": "Phoenix" },
  "SEA": { "teamId": 1611661328, "abbreviation": "SEA", "teamName": "Seattle Storm", "simpleName": "Storm", "location": "Seattle" },
  "TOR": { "teamId": 1611661332, "abbreviation": "TOR", "teamName": "Toronto Tempo", "simpleName": "Tempo", "location": "Toronto" },
  "WAS": { "teamId": 1611661322, "abbreviation": "WAS", "teamName": "Washington Mystics", "simpleName": "Mystics", "location": "Washington" }
}

const LEAGUE = {
  slug: 'wnba',
  teams: teamData,
  regulationPeriods: 4,
  periodSeconds: 10 * 60,
  otSeconds: 5 * 60,
  standings: {
    cutoffs: [],
    clincher: false
  },
  translateTeamCode(code) {
    switch (code) {
      case 'GS': return 'GSV';
      case 'LV': return 'LVA';
      case 'LA': return 'LAS';
      case 'NY': return 'NYL';
      case 'POR': return 'PDX';
      case 'WSH': return 'WAS';
      case 'TBD': return null;
      default: return code;
    }
  },
  teamLogoURL(tricode, mode) {
    const id = this.teams[tricode] && this.teams[tricode].teamId;
    if (!id) return '';
    return `https://cdn.wnba.com/logos/wnba/${id}/primary/${mode}/logo.svg`;
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
