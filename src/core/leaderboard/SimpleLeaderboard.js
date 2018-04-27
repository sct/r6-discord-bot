import Players from '../player/Players';

const SORT_ASC = 0;
const SORT_DESC = 1;

class SimpleLeaderboard {
  constructor(leaderboards, options) {
    this.leaderboards = leaderboards;
    this.name = options.name;
    this.key = options.key;
    this.keyName = options.keyName;
    this.description = options.description;
    this.updateRate = options.rate;
  }

  async getLeaderboardPlayers(serverId, sortOrder = SORT_DESC) {
    const players = await this.leaderboards.getTrackedPlayers(serverId);
    const trackedPlayers = await Players.getPlayers(players);

    trackedPlayers.sort((a, b) => {
      if (sortOrder === SORT_ASC) {
        return (a[this.key] || 0) - (b[this.key] || 0);
      }

      return (b[this.key] || 0) - (a[this.key] || 0);
    });

    return trackedPlayers;
  }
}

export default SimpleLeaderboard;
