import Discord, { RichEmbed} from 'discord.js';

import logger from '../core/logger';
import { UPLAY } from '../core/constants/platforms';

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
        this.commandPlayerStats(message, command[1]);
        break;
      default:
        return null;
    }
  }

  async commandPlayerStats(message, playerName) {
    const player = await this.api.getPlayer(playerName, UPLAY);
    await player.prepare();

    const embed = new RichEmbed()
      .setAuthor(`Player: ${player.name}`)
      .setDescription('Latest stats')
      .addField('Matches Won', player.matchWins, true)
      .addField('Matches Lost', player.matchLosses, true)
      .addField('Kills', player.kills, true)
      .addField('Deaths', player.deaths, true)
      .addField('Assists', player.assists, true)
      .setFooter('Powered by a dumb r6 stats bot')
      .setThumbnail(player.icon)
      .setURL(player.url)
      .setColor([15, 77, 125])
      .setTimestamp(new Date());

    message.channel.send(embed);
  }
}

export default BotController;
