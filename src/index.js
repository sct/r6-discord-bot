import dotenv from 'dotenv';

import BotController from './bot/BotController';
import api from './core/api';

dotenv.config();

// api.getPlayer('sctx', UPLAY)
//   .then(player => player.fetchStatistics('operatorpvp_kills'));

const bot = new BotController(api);

bot.connect();
bot.prepare();
