import fs from "fs";
import dotenv from "dotenv";

import logger from "../logger";
import ApiHandler from "./ApiHandler";
import Player from "../player/Player";

dotenv.config();

const AUTH_CACHE_FILE = "authcache.json";

const APP_ID = "39baebad-39e5-4552-8c25-2c9b919064e2";
const CACHE_TIME = 120;
const MAX_ATTEMPTS = 3;
const TOKEN_EXPIRE = 1000 * 60 * 60;

const UBI_AUTH_API = "https://connect.ubi.com/ubiservices/v2";
const UBI_GAME_API = "https://public-ubiservices.ubi.com";

const PLATFORM_URL_NAMES = {
  uplay: "OSBOR_PC_LNCH_A",
  psn: "OSBOR_PS4_LNCH_A",
  xbl: "OSBOR_XBOXONE_LNCH_A"
};
class R6Api {
  constructor(email, password) {
    this.authHandler = new ApiHandler(UBI_AUTH_API);
    this.gameHandler = new ApiHandler(UBI_GAME_API);

    this.email = email;
    this.password = password;
    this.token = this.generateBasicToken(email, password);

    // Required parameters for UBI Api
    this.sessionId = "";
    this.key = "";
    this.uncertainSpaceId = "";
    this.spaceIds = {
      uplay: "5172a557-50b5-4665-b7db-e3f2e8c5041d",
      psn: "05bfb3f7-6c21-4c42-be1f-97a33fb5cf66",
      xbl: "98a601e5-ca91-4440-b1c5-753f601a2c90"
    };
    this.appId = APP_ID;
    this.profileId = "";
    this.userId = "";
    this.genome = "";

    this.cachetime = CACHE_TIME;
    this.cache = {};

    this.lastUpdatedToken = Date.now();

    this.attempts = 0;

    this.loadAuthCache();
  }

  generateBasicToken = () => {
    if (!this.email || !this.password) {
      throw new Error(
        "You must provide an email and password to initialize the API Handler"
      );
    }

    return Buffer.from(`${this.email}:${this.password}`).toString("base64");
  };

  getSpaceId = platform => this.spaceIds[platform];

  getPlatformUrl = platform => PLATFORM_URL_NAMES[platform];

  async connect() {
    const login = await this.authHandler
      .post("/profiles/sessions", null, {
        "Content-Type": "application/json",
        "Ubi-AppId": this.appId,
        Authorization: `Basic ${this.token}`
      })
      .then(response => {
        if (response.data.ticket) {
          this.key = response.data.ticket;
          this.sessionId = response.data.sessionId;
          this.uncertainSpaceId = response.data.spaceId;

          this.saveAuthCache();
          this.lastUpdatedToken = Date.now() + TOKEN_EXPIRE;
          this.attempts = 0;
        } else {
          throw new Error("Failed receive ticket. Please check credentials.");
        }
      })
      .catch(() => {
        this.attempts += 1;
        throw new Error("Failed to authorize. Check credentials");
      });

    return login;
  }

  async getWithAuth(endpoint, params, forceConnect = false) {
    if (!this.key || Date.now() >= this.lastUpdatedToken || forceConnect) {
      await this.connect();
    }

    let data = await this.gameHandler
      .get(endpoint, params, {
        Authorization: `Ubi_v1 t=${this.key}`,
        "Ubi-AppId": this.appId,
        "Ubi-Sessionid": this.sessionId,
        Connection: "keep-alive"
      })
      .then(response => {
        if (response.data) {
          return response.data;
        }

        throw new Error("Failed to receive data from request.");
      })
      .catch(() => {
        throw new Error("Failed to get data");
      });

    if (!data && this.attempts < MAX_ATTEMPTS) {
      data = this.getWithAuth(endpoint, params, true);
    }

    return data;
  }

  async getPlayers(players, platform) {
    if (!players || !platform || !Array.isArray(players)) {
      throw new Error("You must provide an array of player names.");
    }

    const playerData = await this.getWithAuth("/v2/profiles", {
      nameOnPlatform: players.join(","),
      platformType: platform
    });

    return new Promise((resolve, reject) => {
      if (playerData.profiles) {
        const returnedPlayers = [];

        playerData.profiles.forEach(p => {
          returnedPlayers.push(new Player(this, p));
        });

        return resolve(returnedPlayers);
      }
      return reject(new Error("Failed to retrieve player"));
    });
  }

  async getPlayer(player, platform) {
    if (!player || !platform) {
      throw new Error("You must provide a player name and Platform");
    }

    const playerData = await this.getWithAuth("/v2/profiles", {
      nameOnPlatform: player,
      platformType: platform
    });

    return new Promise((resolve, reject) => {
      if (playerData.profiles) {
        return resolve(new Player(this, playerData.profiles[0]));
      }
      return reject(new Error("Failed to retrieve player"));
    });
  }

  saveAuthCache = () => {
    const authData = {
      time: Date.now(),
      key: this.key,
      sessionId: this.sessionId,
      uncertainSpaceId: this.uncertainSpaceId,
      lastUpdatedToken: this.lastUpdatedToken
    };

    fs.writeFile(AUTH_CACHE_FILE, JSON.stringify(authData), "utf8", () => {
      logger.log("debug", "Cached auth data");
    });
  };

  async loadAuthCache() {
    await fs.readFile(AUTH_CACHE_FILE, "utf8", (err, data) => {
      if (err) {
        return fs.writeFile(AUTH_CACHE_FILE, "", () =>
          logger.log("info", "Created Auth Cache")
        );
      }

      if (data) {
        const authData = JSON.parse(data);

        if (authData.time) {
          this.key = authData.key;
          this.sessionId = authData.sessionId;
          this.uncertainSpaceId = authData.uncertainSpaceId;
          this.lastUpdatedToken = authData.lastUpdatedToken || 0;
          logger.log("debug", "Loaded auth cache");
        }

        return true;
      }

      return false;
    });
  }
}

const api = new R6Api(process.env.UPLAY_USERNAME, process.env.UPLAY_PASSWORD);

export default api;
