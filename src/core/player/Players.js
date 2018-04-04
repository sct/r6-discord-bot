import api from '../api';
import { UPLAY } from '../constants/platforms';
import logger from '../logger';

// Time to expire player objects
const PLAYER_EXPIRE = 1000 * 60 * 10;

class Players {
  constructor() {
    this.players = [];
  }

  addPlayer = (player) => this.players.push(player);

  async getPlayer(playerName) {
    let player = this.players.find(p => p.name.toLowerCase() === playerName.toLowerCase());

    if (!player || Date.now() >= player.lastUpdated + PLAYER_EXPIRE) {
      logger.log('debug', 'Player not found or expired. Grabbing from API', { playerName });
      player = await api.getPlayer(playerName, UPLAY);

      this.updatePlayers(player);
    }

    return player;
  }

  async getPlayers(playerNames) {
    const savedPlayers = [];
    const unsavedPlayers = [];

    playerNames.forEach(name => {
      const checkedPlayer = this.checkPlayer(name);

      if (checkedPlayer) {
        savedPlayers.push(checkedPlayer);
      } else {
        unsavedPlayers.push(name);
      }
    });

    if (unsavedPlayers.length > 0) {
      const fetchedPlayers = await api.getPlayers(unsavedPlayers, UPLAY);

      await fetchedPlayers.forEach(player => {
        this.updatePlayers(player);
      });

      const waitPrepared = fetchedPlayers.map(p => p.prepare());

      await Promise.all(waitPrepared);

      return savedPlayers.concat(fetchedPlayers);
    }

    return savedPlayers;
  }

  checkPlayer = (playerName) => {
    const player = this.players.find(p => p.name.toLowerCase() === playerName.toLowerCase());
    if (player) {
      return player;
    }

    return null;
  }

  updatePlayers = (player) => {
    const index = this.players.findIndex(p => p.id === player.id);

    if (index < 0) {
      logger.log('debug', 'Player not found in array.', { player });
      return this.players.push(player);
    }

    this.players[index] = player;

    return player;
  }

  removePlayer = (playerId) => {
    const index = this.players.findIndex(p => p.id === playerId);

    return this.players.splice(index, 1);
  }
}

const players = new Players();

export default players;
