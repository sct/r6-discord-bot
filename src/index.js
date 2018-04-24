import dotenv from 'dotenv';

import BotController from './bot/BotController';
import api from './core/api';
import db from './core/db';

dotenv.config();

// Configure Database
db.leaderboards.loadDatabase();

// Initialize Bot
const bot = new BotController(api);

bot.connect();
bot.prepare();
