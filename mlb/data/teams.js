// Per-league team data consumed by the shared/ code and mlb/config.js.
// Tricodes are the ESPN abbreviations used by the scoreboard/standings feeds.
// teamId is the MLB Stats API id (statsapi.mlb.com/api/v1/teams?sportId=1),
// which config.js uses to build the official mlbstatic.com logo URLs. The two
// id spaces are unrelated, and a couple of abbreviations differ as well (ESPN
// ARI/CHW vs MLB AZ/CWS), so these were matched up by full team name.
const teamData = {
  "ARI": { "teamId": 109, "abbreviation": "ARI", "teamName": "Arizona Diamondbacks", "simpleName": "Diamondbacks", "location": "Arizona" },
  "ATH": { "teamId": 133, "abbreviation": "ATH", "teamName": "Athletics", "simpleName": "Athletics", "location": "Athletics" },
  "ATL": { "teamId": 144, "abbreviation": "ATL", "teamName": "Atlanta Braves", "simpleName": "Braves", "location": "Atlanta" },
  "BAL": { "teamId": 110, "abbreviation": "BAL", "teamName": "Baltimore Orioles", "simpleName": "Orioles", "location": "Baltimore" },
  "BOS": { "teamId": 111, "abbreviation": "BOS", "teamName": "Boston Red Sox", "simpleName": "Red Sox", "location": "Boston" },
  "CHC": { "teamId": 112, "abbreviation": "CHC", "teamName": "Chicago Cubs", "simpleName": "Cubs", "location": "Chicago" },
  "CHW": { "teamId": 145, "abbreviation": "CHW", "teamName": "Chicago White Sox", "simpleName": "White Sox", "location": "Chicago" },
  "CIN": { "teamId": 113, "abbreviation": "CIN", "teamName": "Cincinnati Reds", "simpleName": "Reds", "location": "Cincinnati" },
  "CLE": { "teamId": 114, "abbreviation": "CLE", "teamName": "Cleveland Guardians", "simpleName": "Guardians", "location": "Cleveland" },
  "COL": { "teamId": 115, "abbreviation": "COL", "teamName": "Colorado Rockies", "simpleName": "Rockies", "location": "Colorado" },
  "DET": { "teamId": 116, "abbreviation": "DET", "teamName": "Detroit Tigers", "simpleName": "Tigers", "location": "Detroit" },
  "HOU": { "teamId": 117, "abbreviation": "HOU", "teamName": "Houston Astros", "simpleName": "Astros", "location": "Houston" },
  "KC": { "teamId": 118, "abbreviation": "KC", "teamName": "Kansas City Royals", "simpleName": "Royals", "location": "Kansas City" },
  "LAA": { "teamId": 108, "abbreviation": "LAA", "teamName": "Los Angeles Angels", "simpleName": "Angels", "location": "Los Angeles" },
  "LAD": { "teamId": 119, "abbreviation": "LAD", "teamName": "Los Angeles Dodgers", "simpleName": "Dodgers", "location": "Los Angeles" },
  "MIA": { "teamId": 146, "abbreviation": "MIA", "teamName": "Miami Marlins", "simpleName": "Marlins", "location": "Miami" },
  "MIL": { "teamId": 158, "abbreviation": "MIL", "teamName": "Milwaukee Brewers", "simpleName": "Brewers", "location": "Milwaukee" },
  "MIN": { "teamId": 142, "abbreviation": "MIN", "teamName": "Minnesota Twins", "simpleName": "Twins", "location": "Minnesota" },
  "NYM": { "teamId": 121, "abbreviation": "NYM", "teamName": "New York Mets", "simpleName": "Mets", "location": "New York" },
  "NYY": { "teamId": 147, "abbreviation": "NYY", "teamName": "New York Yankees", "simpleName": "Yankees", "location": "New York" },
  "PHI": { "teamId": 143, "abbreviation": "PHI", "teamName": "Philadelphia Phillies", "simpleName": "Phillies", "location": "Philadelphia" },
  "PIT": { "teamId": 134, "abbreviation": "PIT", "teamName": "Pittsburgh Pirates", "simpleName": "Pirates", "location": "Pittsburgh" },
  "SD": { "teamId": 135, "abbreviation": "SD", "teamName": "San Diego Padres", "simpleName": "Padres", "location": "San Diego" },
  "SEA": { "teamId": 136, "abbreviation": "SEA", "teamName": "Seattle Mariners", "simpleName": "Mariners", "location": "Seattle" },
  "SF": { "teamId": 137, "abbreviation": "SF", "teamName": "San Francisco Giants", "simpleName": "Giants", "location": "San Francisco" },
  "STL": { "teamId": 138, "abbreviation": "STL", "teamName": "St. Louis Cardinals", "simpleName": "Cardinals", "location": "St. Louis" },
  "TB": { "teamId": 139, "abbreviation": "TB", "teamName": "Tampa Bay Rays", "simpleName": "Rays", "location": "Tampa Bay" },
  "TEX": { "teamId": 140, "abbreviation": "TEX", "teamName": "Texas Rangers", "simpleName": "Rangers", "location": "Texas" },
  "TOR": { "teamId": 141, "abbreviation": "TOR", "teamName": "Toronto Blue Jays", "simpleName": "Blue Jays", "location": "Toronto" },
  "WSH": { "teamId": 120, "abbreviation": "WSH", "teamName": "Washington Nationals", "simpleName": "Nationals", "location": "Washington" }
}
