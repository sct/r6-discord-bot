import { RichEmbed } from 'discord.js';

import { Leaderboards } from '../../core/leaderboard';
import logger from '../../core/logger';

export const commandShowLeaderboard =
async function commandShowLeaderboard(message, type) {
  try {
    if (!type) {
      return message.channel.send('You must provide a leaderboard type');
    }

    const leaderboard = Leaderboards.getLeaderboard(type);

    logger.log('debug', leaderboard);

    const players = await leaderboard.getLeaderboardPlayers();

    if (players && players.length > 0) {
      const embed = new RichEmbed()
        .setAuthor(`Leaderboard: ${leaderboard.name}`)
        .setDescription(leaderboard.description)
        .setFooter('R6 Stat Bot')
        .setColor([15, 77, 125]);


      players.forEach((player, index) => {
        embed.addField(
          `#${index + 1} ${player.name}`,
          `${leaderboard.keyName}: ${player[leaderboard.key]}`,
          true,
        );
      });

      return message.channel.send(embed);
    }

    return message.channel.send('Unable to load leaderboard');
  } catch (error) {
    logger.log('error', error);
    return message.channel.send('Failed to load leaderboard');
  }
};

export const commandTrackPlayer =
async function commandTrackPlayer(message, playerName) {
  try {
    if (Leaderboards.addTrackedPlayer(playerName)) {
      return message.channel.send(`Now tracking ${playerName}`);
    }

    return message.channel.send(`I am already tracking ${playerName}`);
  } catch (error) {
    logger.log('error', 'error');
    return message.channel.send('Something went wrong. Sorry!');
  }
};

export const commandUntrackPlayer =
async function commandUntrackPlayer(message, playerName) {
  try {
    if (Leaderboards.removeTrackedPlayer(playerName)) {
      return message.channel.send(`No longer tracking ${playerName}`);
    }

    return message.channel.send(`I am not tracking ${playerName}`);
  } catch (error) {
    logger.log('error', 'error');
    return message.channel.send('Something went wrong. Sorry!');
  }
};

export default commandShowLeaderboard;
