import apiService from './apiService';

/**
 * Clase para gestionar las operaciones relacionadas con el juego.
 */
class GameService {
  /**
   * Obtiene el estado actual del juego para una sala específica.
   * @param {string} roomCode - Código de la sala.
   * @returns {Promise<Object>} - Objeto con el estado del juego.
   */
  async getGameState(roomCode) {
    try {
      return await apiService.get('/game/state', { params: { roomCode: roomCode } });
    } catch (error) {
      console.error('Error al obtener estado del juego:', error);
      throw new Error('Respuesta vacía o con error al obtener el estado del juego');
    }
  }

  /**
   * Mueve al jugador en una dirección específica.
   * @param {string} roomCode - Código de la sala.
   * @param {string} playerId - ID del jugador.
   * @param {string} direction - Dirección del movimiento (w, a, s, d).
   * @returns {Promise<Object>} - Objeto con el estado actualizado del juego.
   */
  async movePlayer(roomCode, playerId, direction) {
    try {
      return await apiService.post('/game/move', null, {
        params: { roomCode, playerId, direction },
      });
    } catch (error) {
      console.error('Error en movimiento del jugador:', error);
      throw new Error('Error al mover al jugador');
    }
  }

  /**
   * Construye un bloque en una dirección específica.
   * @param {string} roomCode - Código de la sala.
   * @param {string} playerId - ID del jugador.
   * @param {string} direction - Dirección donde construir (opcional).
   * @returns {Promise<Object>} - Objeto con el estado actualizado del juego.
   */
  async buildBlock(roomCode, playerId, direction = null) {
    try {
      const params = { roomCode, playerId };

      if (direction) {
        params.direction = direction;
      }

      return await apiService.post('/game/build', null, { params });
    } catch (error) {
      console.error('Error al construir bloque:', error);
      throw new Error('Error al construir bloque');
    }
  }

  /**
   * Destruye un bloque.
   * @param {string} roomCode - Código de la sala.
   * @param {string} playerId - ID del jugador.
   * @returns {Promise<Object>} - Objeto con el estado actualizado del juego.
   */
  async destroyBlock(roomCode, playerId) {
    try {
      return await apiService.post('/game/destroy', null, {
        params: { roomCode, playerId },
      });
    } catch (error) {
      console.error('Error al destruir bloque:', error);
      throw new Error('Error al destruir bloque');
    }
  }
}

const gameService = new GameService();
export default gameService;
