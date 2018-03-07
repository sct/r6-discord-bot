import { RichEmbed } from 'discord.js';

import { Players } from '../../core/player';
import logger from '../../core/logger';

export const commandPlayerStats =
async function commandPlayerStats(message, playerName) {
  try {
    const player = await Players.getPlayer(playerName);

    await player.prepare();

    if (player.kills) {
      const embed = new RichEmbed()
        .setAuthor(`Player: ${player.name}`)
        .setDescription('General Stats')
        .addField('Matches Won', player.matchWins, true)
        .addField('Matches Lost', player.matchLosses, true)
        .addField('Kills', player.kills, true)
        .addField('Deaths', player.deaths, true)
        .addField('Assists', player.assists, true)
        .addField('K/D Ratio', player.kd, true)
        .setFooter('R6 Stat Bot')
        .setThumbnail(player.icon)
        .setURL(player.url)
        .setColor([15, 77, 125])
        .setTimestamp(new Date(player.lastUpdated));

      // Very important code please never remove
      if (player.name.toLowerCase() === 'keep_one') {
        embed.addField('Time Spent Outside Droning', '470 hours');
        embed.addField('Time Spent Not Attacking', '550 hours');
        embed.addField('Percentage of Games Using Hacks', '95%');
      }

      return message.channel.send(embed);
    }

    return message.channel.send('Unable to load statistics for requested player');
  } catch (error) {
    logger.log('error', error.message);
    return message.channel.send(`Failed to load player: ${playerName}`);
  }
};

export default commandPlayerStats;
