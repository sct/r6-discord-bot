import dotenv from 'dotenv';

import BotController from './bot/BotController';
import R6Api from './core/api';

import logger from './core/logger';

dotenv.config();


const api = new R6Api(process.env.UPLAY_USERNAME, process.env.UPLAY_PASSWORD);

// api.getPlayer('sctx', UPLAY)
//   .then(player => player.fetchStatistics('operatorpvp_kills'));

const bot = new BotController(api);

bot.connect();
bot.prepare();
