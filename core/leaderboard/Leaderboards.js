import logger from '../logger';
import SimpleLeaderboard from './SimpleLeaderboard';

class Leaderboards {
  constructor() {
    this.trackedPlayers = ['sctx', 'keep_one', 'solusian', 'ausgap'];
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
    };
  }

  getLeaderboard = (id) => {
    if (!this.leaderboards[id]) {
      throw new Error('Leaderboard does not exist');
    }

    return this.leaderboards[id];
  }
}

const leaderboards = new Leaderboards();

export default leaderboards;
