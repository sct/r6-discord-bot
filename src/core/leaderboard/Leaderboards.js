import SimpleLeaderboard from "./SimpleLeaderboard";
import db from "../db";
import { Players } from "../player";

class Leaderboards {
  constructor() {
    this.db = db.leaderboards;
    this.leaderboards = {
      kills: new SimpleLeaderboard(this, {
        name: "All-Time Kills",
        key: "kills",
        keyName: "Kills",
        description: "Showing top murderers from top to bottom"
      }),
      deaths: new SimpleLeaderboard(this, {
        name: "All-Time Deaths",
        key: "deaths",
        keyName: "Deaths",
        description: "Showing top deaths from top to bottom"
      }),
      kd: new SimpleLeaderboard(this, {
        name: "All-Time K/D Ratio",
        key: "kd",
        keyName: "K/D Ratio",
        description: "Showing top K/D ratios from all tracked players"
      }),
      kda: new SimpleLeaderboard(this, {
        name: "All-Time KDA Ratio",
        key: "kda",
        keyName: "KDA Ratio",
        description: "Showing top KDA ratios from all tracked players"
      }),
      wl: new SimpleLeaderboard(this, {
        name: "All-Time W/L Ratio",
        key: "wl",
        keyName: "W/L Ratio",
        description: "Showing top W/L ratios from all tracked players"
      }),
      melee: new SimpleLeaderboard(this, {
        name: "All-Time Melee Kills",
        key: "meleekills",
        keyName: "Melee Kills",
        description: "Showing total melee kills from all tracked players"
      }),
      suicides: new SimpleLeaderboard(this, {
        name: "All-Time Suicides",
        key: "suicides",
        keyName: "Suicides",
        description: "Showing total suicides from all tracked players"
      }),
      accuracy: new SimpleLeaderboard(this, {
        name: "All-Time Accuracy",
        key: "accuracy",
        keyName: "Accuracy",
        description: "Showing accuracy from all tracked players"
      })
    };
  }

  getLeaderboard = id => {
    if (!this.leaderboards[id]) {
      throw new Error("Leaderboard does not exist");
    }

    return this.leaderboards[id];
  };

  async getTrackedPlayers(serverId) {
    return new Promise((resolve, reject) => {
      try {
        this.db.findOne({ _id: serverId }, (err, lb) => {
          if (!lb) {
            return resolve([]);
          }

          return resolve(lb.trackedPlayers);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  async addTrackedPlayer(serverId, playerName) {
    const player = await Players.getPlayer(playerName);

    if (!player) {
      return false;
    }

    await this.db.findOne({ _id: serverId }, (err, lb) => {
      if (!lb) {
        this.db.insert(
          { _id: serverId, trackedPlayers: [playerName.toLowerCase()] },
          () => true
        );
      } else {
        this.db.update(
          { _id: serverId },
          { $addToSet: { trackedPlayers: playerName.toLowerCase() } },
          () => true
        );
      }
    });

    return true;
  }

  async removeTrackedPlayer(serverId, playerName) {
    await this.db.findOne({ _id: serverId }, (err, lb) => {
      if (lb && lb.trackedPlayers.includes(playerName.toLowerCase())) {
        this.db.update(
          { _id: serverId },
          { $pull: { trackedPlayers: playerName.toLowerCase() } },
          () => true
        );
      }
    });
  }
}

const leaderboards = new Leaderboards();

export default leaderboards;
