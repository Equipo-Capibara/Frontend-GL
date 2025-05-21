import apiService from './apiService';

/**
 * Clase para gestionar las operaciones relacionadas con los jugadores.
 */
class PlayersService {
  /**
   * Crea un nuevo jugador en el sistema.
   * @param {string} name - Nombre del jugador.
   * @returns {Promise<Object>} - Objeto con la información del jugador creado.
   */
  async createPlayer(name) {
    try {
      return await apiService.post('/api/players', null, { params: { name: name } });
    } catch (error) {
      console.error('Error al crear jugador:', error);
      throw new Error('Hubo un problema al crear el jugador');
    }
  }

  /**
   * Almacena o actualiza localmente la información del jugador.
   * @param {Object} player - Datos del jugador a almacenar.
   */
  savePlayerToLocalStorage(player) {
    if (player && player.id) {
      localStorage.setItem('playerId', player.id);

      if (player.name) {
        localStorage.setItem('playerName', player.name);
      }

      // Notificar cambios en el localStorage
      window.dispatchEvent(new Event('storage'));
    }
  }

  /**
   * Obtiene el ID del jugador actual desde localStorage.
   * @returns {string|null} - ID del jugador o null si no existe.
   */
  getCurrentPlayerId() {
    return localStorage.getItem('playerId');
  }

  /**
   * Obtiene el nombre del jugador actual desde localStorage.
   * @returns {string|null} - Nombre del jugador o null si no existe.
   */
  getCurrentPlayerName() {
    return localStorage.getItem('playerName');
  }

  /**
   * Elimina la información del jugador del localStorage.
   */
  clearPlayerData() {
    localStorage.removeItem('playerId');
    localStorage.removeItem('playerName');
    window.dispatchEvent(new Event('storage'));
  }
}

const playersService = new PlayersService();
export default playersService;
