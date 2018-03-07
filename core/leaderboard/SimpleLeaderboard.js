import Players from '../player/Players';

const SORT_ASC = 0;
const SORT_DESC = 1;

class SimpleLeaderboard {
  constructor(trackedPlayers, options) {
    this.trackedPlayers = trackedPlayers;
    this.name = options.name;
    this.key = options.key;
    this.keyName = options.keyName;
    this.description = options.description;
    this.updateRate = options.rate;
  }

  async getLeaderboardPlayers(sortOrder = SORT_DESC) {
    const trackedPlayers = await Players.getPlayers(this.trackedPlayers);

    trackedPlayers.sort((a, b) => {
      if (sortOrder === SORT_ASC) {
        return a.kills - b.kills;
      }

      return b.kills - a.kills;
    });

    return trackedPlayers;
  }
}

export default SimpleLeaderboard;
