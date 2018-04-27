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
        .addField('KDA', player.kda, true)
        .addField('W/L Ratio', player.wl, true)
        .addField('Accuracy', `${player.accuracy}%`, true)
        .addField('Headshots', `${player.headshotAccuracy}%`, true)
        .addField('Suicides', player.suicides, true)
        .addField('Melee Kills', player.meleekills, true)
        .addField('Revives', player.revives, true)
        .setFooter('R6 Stat Bot')
        .setThumbnail(player.icon)
        .setURL(player.url)
        .setColor([15, 77, 125])
        .setTimestamp(new Date(player.lastUpdated));

      const lockedTrollTime = 1524200353000;
      const now = Date.now();

      const addedHours = Math.floor((now - lockedTrollTime) / 1000 / 60 / 60);

      // Very important code please never remove
      if (player.name.toLowerCase() === 'keep_one') {
        embed.addField('Time Spent Outside Droning', `${470 + addedHours} hours`);
        embed.addField('Time Spent Not Attacking', `${550 + (addedHours * 1.5)} hours`);
        embed.addField('Percentage of Games Using Hacks', '93%');
      }

      // This code also very important never remove it
      if (player.name.toLowerCase() === 'zuru.zuru') {
        embed.addField(
          'Number of rounds as Rook where plates were forgotten until after warmup',
          70 + (addedHours * 3),
        );
        embed.addField(
          'Amount of time with shield up as Montagne not contributing anything',
          120 + addedHours,
        );
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
