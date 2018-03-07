import Discord from 'discord.js';

import logger from '../core/logger';
import { commandPlayerStats } from './commands/playerCommands';
import {
  commandShowLeaderboard, commandTrackPlayer,
  commandUntrackPlayer,
} from './commands/leaderboardCommands';

class BotController {
  constructor(api) {
    this.client = new Discord.Client();
    this.api = api;
  }

  connect = () => {
    this.client.login(process.env.DISCORD_BOT_TOKEN);

    this.client.on('ready', () => {
      logger.log('info', 'Connected to Discord');
    });
  }

  prepare = () => {
    this.loadListeners();
  }

  loadListeners = () => {
    this.client.on('message', message => {
      if (message.content.match(/^\?r6\s(.*)/)) {
        this.handleCommand(message);
      }
    });
  }

  handleCommand = (message) => {
    const command = message.content.replace('?r6 ', '').split(' ');

    logger.log('info', command);

    switch (command[0]) {
      case 'stats':
        return commandPlayerStats(message, command[1]);
      case 'leaderboard':
        return commandShowLeaderboard(message, command[1]);
      case 'track':
        return commandTrackPlayer(message, command[1]);
      case 'untrack':
        return commandUntrackPlayer(message, command[1]);
      default:
        return null;
    }
  }
}

export default BotController;
