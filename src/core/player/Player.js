import logger from "../logger";

// Time to expire player objects
const PLAYER_EXPIRE = 1000 * 60 * 10;

export default class Player {
  constructor(apiHandler, initialData) {
    this.apiHandler = apiHandler;

    this.id = initialData.profileId;
    this.userId = initialData.userId;
    this.platform = initialData.platformType;
    this.platformUrl = apiHandler.getPlatformUrl(this.platform);

    this.url = `https://game-rainbow6.ubi.com/en-us/${
      this.platform
    }/player-statistics/${this.id}/multiplayer`;
    this.icon = `https://ubisoft-avatars.akamaized.net/${
      this.id
    }/default_146_146.png`;

    this.idOnPlatform = initialData.idOnPlatform;
    this.name = initialData.nameOnPlatform;
    this.prepared = false;

    this.lastUpdated = Date.now();
  }

  async prepare() {
    await this.loadGeneralStats();
    this.prepared = true;
  }

  async fetchStatistics(statistics) {
    const url = `/v1/spaces/${this.apiHandler.getSpaceId(
      this.platform
    )}/sandboxes/${this.apiHandler.getPlatformUrl(
      this.platform
    )}/playerstats2/statistics`;

    const data = await this.apiHandler.getWithAuth(url, {
      populations: this.id,
      statistics: Array.isArray(statistics) ? statistics.join(",") : statistics
    });

    return new Promise((resolve, reject) => {
      if (data && data.results && data.results[this.id]) {
        const rData = data.results[this.id];

        const finalData = {};

        Object.keys(rData).forEach(key => {
          const strippedKey = key.split(":")[0];

          finalData[strippedKey] = rData[key];
        });

        this.lastUpdated = Date.now();

        return resolve(finalData);
      }

      return reject(new Error("Statistics failed to fetch."));
    });
  }

  async loadGeneralStats() {
    const stats = [
      "generalpvp_timeplayed",
      "generalpvp_matchplayed",
      "generalpvp_matchwon",
      "generalpvp_matchlost",
      "generalpvp_kills",
      "generalpvp_death",
      "generalpvp_bullethit",
      "generalpvp_bulletfired",
      "generalpvp_killassists",
      "generalpvp_revive",
      "generalpvp_headshot",
      "generalpvp_penetrationkills",
      "generalpvp_meleekills",
      "generalpvp_dbnoassists",
      "generalpvp_suicide",
      "generalpvp_barricadedeployed",
      "generalpvp_reinforcementdeploy",
      "generalpvp_totalxp",
      "generalpvp_rappelbreach",
      "generalpvp_distancetravelled",
      "generalpvp_revivedenied",
      "generalpvp_dbno",
      "generalpvp_gadgetdestroy",
      "generalpvp_blindkills"
    ];

    await this.fetchStatistics(stats)
      .then(data => {
        this.kills = data.generalpvp_kills;
        this.deaths = data.generalpvp_death;
        this.assists = data.generalpvp_killassists;
        this.matchWins = data.generalpvp_matchwon;
        this.matchLosses = data.generalpvp_matchlost;
        this.kd = (this.kills / Math.max(this.deaths, 1)).toFixed(2);
        this.kda = (
          (this.kills + this.assists) /
          Math.max(this.deaths, 1)
        ).toFixed(2);
        this.wl = (this.matchWins / Math.max(this.matchLosses, 1)).toFixed(2);
        this.bullethit = data.generalpvp_bullethit;
        this.bulletfired = data.generalpvp_bulletfired;
        this.accuracy = Math.round((this.bullethit / this.bulletfired) * 100);
        this.suicides = data.generalpvp_suicide;
        this.meleekills = data.generalpvp_meleekills;
        this.revives = data.generalpvp_revive;
        this.headshots = data.generalpvp_headshot;
        this.headshotAccuracy = Math.round((this.headshots / this.kills) * 100);
      })
      .catch(() =>
        logger.log("error", `Failed to load statistics for player ${this.name}`)
      );
  }

  isExpired = () => {
    if (Date.now() >= this.lastUpdated + PLAYER_EXPIRE) {
      return true;
    }

    return false;
  };
}
