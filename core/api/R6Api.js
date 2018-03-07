import fs from 'fs';

import logger from '../logger';
import ApiHandler from './ApiHandler';
import Player from '../player/Player';

const AUTH_CACHE_FILE = 'authcache.json';

const APP_ID = '39baebad-39e5-4552-8c25-2c9b919064e2';
const CACHE_TIME = 120;

const UBI_AUTH_API = 'https://connect.ubi.com/ubiservices/v2';
const UBI_GAME_API = 'https://public-ubiservices.ubi.com';

const PLATFORM_URL_NAMES = {
  uplay: 'OSBOR_PC_LNCH_A',
  psn: 'OSBOR_PS4_LNCH_A',
  xbl: 'OSBOR_XBOXONE_LNCH_A',
};

export default class R6Api {
  constructor(email, password) {
    this.authHandler = new ApiHandler(UBI_AUTH_API);
    this.gameHandler = new ApiHandler(UBI_GAME_API);

    this.email = email;
    this.password = password;
    this.token = this.generateBasicToken(email, password);

    // Required parameters for UBI Api
    this.sessionId = '';
    this.key = '';
    this.uncertainSpaceId = '';
    this.spaceIds = {
      uplay: '5172a557-50b5-4665-b7db-e3f2e8c5041d',
      psn: '05bfb3f7-6c21-4c42-be1f-97a33fb5cf66',
      xbl: '98a601e5-ca91-4440-b1c5-753f601a2c90',
    };
    this.appId = APP_ID;
    this.profileId = '';
    this.userId = '';
    this.genome = '';

    this.cachetime = CACHE_TIME;
    this.cache = {};

    this.loadAuthCache();
  }

  generateBasicToken = () => {
    if (!this.email || !this.password) {
      throw new Error('You must provide an email and password to initialize the API Handler');
    }

    return Buffer.from(`${this.email}:${this.password}`).toString('base64');
  }

  getSpaceId = (platform) => this.spaceIds[platform];

  getPlatformUrl = (platform) => PLATFORM_URL_NAMES[platform];

  async connect() {
    const login = await this.authHandler.post(
      '/profiles/sessions',
      null,
      {
        'Content-Type': 'application/json',
        'Ubi-AppId': this.appId,
        Authorization: `Basic ${this.token}`,
      },
    )
      .then(response => {
        if (response.data.ticket) {
          this.key = response.data.ticket;
          this.sessionId = response.data.sessionId;
          this.uncertainSpaceId = response.data.spaceId;

          this.saveAuthCache();
        } else {
          throw new Error('Failed receive ticket. Please check credentials.');
        }
      })
      .catch((error) => {
        console.log(error);
        throw new Error('Failed to authorize. Check credentials')
      });

    return login;
  }

  async getWithAuth(endpoint, params) {
    if (!this.key) {
      await this.connect();
    }

    const data = await this.gameHandler.get(endpoint, params, {
      Authorization: `Ubi_v1 t=${this.key}`,
      'Ubi-AppId': this.appId,
      'Ubi-Sessionid': this.sessionId,
      Connection: 'keep-alive',
    })
      .then(response => {
        if (response.data) {
          return response.data;
        }

        throw new Error('Failed to receive data from request.');
      })
      .catch((response) => {
        console.log(response);
        throw new Error('Failed to get data');
      });

    return data;
  }

  async getPlayer(player, platform) {
    if (!player || !platform) {
      throw new Error('You must provide a player name and Platform');
    }

    const playerData = await this.getWithAuth('/v2/profiles', {
      nameOnPlatform: player,
      platformType: platform,
    });

    return new Promise((resolve, reject) => {
      if (playerData.profiles) {
        return resolve(new Player(this, playerData.profiles[0]));
      }
      return reject(new Error('Failed'));
    });
  }

  saveAuthCache = () => {
    const authData = {
      time: Date.now(),
      key: this.key,
      sessionId: this.sessionId,
      uncertainSpaceId: this.uncertainSpaceId,
    };

    fs.writeFile(AUTH_CACHE_FILE, JSON.stringify(authData), 'utf8', () => {
      logger.log('debug', 'Cached auth data');
    });
  }

  async loadAuthCache() {
    await fs.readFile(AUTH_CACHE_FILE, 'utf8', (err, data) => {
      if (err) {
        return fs.writeFile(AUTH_CACHE_FILE, '', () => logger.log('info', 'Created Auth Cache'));
      }

      if (data) {
        const authData = JSON.parse(data);

        if (authData.time) {
          this.key = data.key;
          this.sessionId = data.sessionId;
          this.uncertainSpaceId = data.uncertainSpaceId;
          logger.log('debug', 'Loaded auth cache');
        }
      }

    });
  }
}
