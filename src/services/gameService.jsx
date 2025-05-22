import websocketService from './websocketService';
import apiService from './apiService';

/**
 * Servicio para manejar acciones del juego vía WebSocket.
 */
class GameService {
  /**
   * Obtiene el estado actual del juego para una sala específica.
   * @param {string} roomCode - Código de la sala.
   * @returns {Promise<Object>} - Objeto con el estado del juego.
   */
  async getGameState(roomCode) {
    try {
      const response = await apiService.get(`/api/game/${roomCode}/state`);
      console.log('📦 Game state recibido:', response);
      return response;
    } catch (error) {
      console.error('Error al obtener estado del juego:', error);
      throw new Error('Respuesta vacía o con error al obtener el estado del juego');
    }
  }

  /**
     * Se suscribe a los cambios del tablero del juego.
     * @param {string} roomCode - Sala a observar.
     * @param {Function} callbacks - Callback que recibe el BoardStateDto.
     * @returns {Promise<string>} - ID de suscripción.
     */
    async subscribeToGame(roomCode, callbacks) {
      const subs = [];

      try {
        // Suscripción a estado del juego
        if (callbacks.onGameStateUpdate) {
          const id = await websocketService.subscribe(
            `/topic/game/${roomCode}/state`,
            callbacks.onGameStateUpdate
          );
          subs.push({ type: 'state', id });
        }

        // Suscripción para movimiento del jugador
        if (callbacks.onPlayerMoved) {
          const id = await websocketService.subscribe(
            `/topic/game/${roomCode}/player-moved`,
            callbacks.onPlayerMoved
          );
          subs.push({ type: 'player-moved', id });
        }

        // Suscripción para construir bloques
        if (callbacks.onBlockBuilt) {
          const id = await websocketService.subscribe(
            `/topic/game/${roomCode}/block-built`,
            callbacks.onBlockBuilt
          );
          subs.push({ type: 'block-built', id });
        }

        // Suscripción para destruir bloques
        if (callbacks.onBlockDestroyed) {
          const id = await websocketService.subscribe(
            `/topic/game/${roomCode}/block-destroyed`,
            callbacks.onBlockDestroyed
          );
          subs.push({ type: 'block-destroyed', id });
        }

        // Suscripción para ganar
        if (callbacks.onGameComplete) {
          const id = await websocketService.subscribe(
            `/topic/game/${roomCode}/complete`,
            callbacks.onGameComplete
          );
          subs.push({ type: 'complete', id });
        }

        return subs;
      } catch (error) {
        console.error('Error al suscribirse a estado del juego:', error);
        throw error;
      }
    }

  /**
   * Mueve al jugador en una dirección específica.
   * @param {string} roomCode - Código de la sala.
   * @param {string} playerId - ID del jugador.
   * @param {string} direction - Dirección del movimiento (w, a, s, d).
   */
  async sendMove(roomCode, playerId, direction) {
    try {
      await websocketService.publish(`/app/game/${roomCode}/move`, { playerId, direction }); //json
    } catch (error) {
      console.error('Error en movimiento del jugador:', error);
      throw new Error('Error al mover al jugador');
    }
  }

  /**
   * Construcción de bloques.
   * @param {string} roomCode - Código de la sala.
   * @param {string} playerId - ID del jugador.
   */
  async sendBuild(roomCode, playerId) {
    try {
      await websocketService.publish(`/app/game/${roomCode}/build`, { playerId });
    } catch (error) {
      console.error('Error al construir bloque:', error);
      throw new Error('Error al construir bloque');
    }
  }

  /**
   * Destruye un bloque.
   * @param {string} roomCode - Código de la sala.
   * @param {string} playerId - ID del jugador.
   */
  async sendDestroy(roomCode, playerId) {
    try {
      await websocketService.publish(`/app/game/${roomCode}/destroy`, { playerId });
    } catch (error) {
      console.error('Error al destruir bloque:', error);
      throw new Error('Error al destruir bloque');
    }
  }
}

const gameService = new GameService();
export default gameService;
