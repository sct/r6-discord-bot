import logger from '../logger';
import SimpleLeaderboard from './SimpleLeaderboard';

class Leaderboards {
  constructor() {
    this.trackedPlayers = [];
    this.leaderboards = {
      kills: new SimpleLeaderboard(this.trackedPlayers, {
        name: 'All-Time Kills',
        key: 'kills',
        keyName: 'Kills',
        description: 'Showing top murderers from top to bottom',
      }),
      deaths: new SimpleLeaderboard(this.trackedPlayers, {
        name: 'All-Time Deaths',
        key: 'deaths',
        keyName: 'Deaths',
        description: 'Showing top deaths from top to bottom',
      }),
      kd: new SimpleLeaderboard(this.trackedPlayers, {
        name: 'All-Time K/D Ratio',
        key: 'kd',
        keyName: 'K/D Ratio',
        description: 'Showing top K/D ratios from all tracked players',
      }),
    };
  }

  getLeaderboard = (id) => {
    if (!this.leaderboards[id]) {
      throw new Error('Leaderboard does not exist');
    }

    return this.leaderboards[id];
  }

  addTrackedPlayer = (playerName) => {
    if (!this.trackedPlayers.includes(playerName.toLowerCase())) {
      this.trackedPlayers.push(playerName.toLowerCase());

      return true;
    }

    return false;
  }

  removeTrackedPlayer = (playerName) => {
    if (this.trackedPlayers.includes(playerName.toLowerCase())) {
      const index = this.trackedPlayers.findIndex(p => p === playerName.toLowerCase());

      this.trackedPlayers.splice(index, 1);

      return true;
    }

    return false;
  }
}

const leaderboards = new Leaderboards();

export default leaderboards;
