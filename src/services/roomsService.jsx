import API_CONFIG from '../config/apiConfig';
import websocketService from './websocketService';
import apiService from './apiService';

/**
 * Clase para gestionar las operaciones relacionadas con las salas.
 * Maneja tanto las operaciones REST como las de WebSocket.
 */
class RoomsService {
  /**
   * Crea una nueva sala.
   * @param {string} hostId - ID del jugador que crea la sala.
   * @returns {Promise<Object>} - Objeto con la información de la sala creada.
   */
  async createRoom(hostId) {
    try {
      return await apiService.post('api/rooms', { hostId });
    } catch (error) {
      console.error('Error al crear la sala:', error);
      throw new Error('No se pudo crear la sala');
    }
  }

  /**
   * Verifica si una sala existe.
   * @param {string} roomCode - Código de la sala.
   * @returns {Promise<boolean>} - True si la sala existe, false en caso contrario.
   */
  async checkRoom(roomCode) {
    try {
      await apiService.get(`api/rooms/${roomCode}`);
      return true;
    } catch (error) {
      console.error('Error al verificar la sala:', error);
      return false;
    }
  }

  /**
   * Permite a un jugador unirse a una sala.
   * @param {string} roomCode - Código de la sala.
   * @param {string} username - Nombre del jugador.
   * @param {string} playerId - ID del jugador.
   * @returns {Promise<boolean>} - True si se unió correctamente, false en caso contrario.
   */
  async joinRoom(roomCode, username, playerId) {
    try {
      await websocketService.publish(`/app/joinRoom/${roomCode}`, { username, playerId });
      return true;
    } catch (error) {
      console.error('Error al unirse a la sala:', error);
      return false;
    }
  }

  /**
   * Suscribe a un jugador a las actualizaciones de una sala.
   * @param {string} roomCode - Código de la sala.
   * @param {Object} callbacks - Callbacks para diferentes eventos.
   * @returns {Array} - Array de IDs de suscripción.
   */
  async subscribeToRoom(roomCode, callbacks = {}) {
    const subscriptionIds = [];

    try {
      // Suscripción a avisos de unión a la sala
      if (callbacks.onJoin) {
        const joinSub = await websocketService.subscribe(`/topic/room/${roomCode}/join-alert`, callbacks.onJoin);
        subscriptionIds.push({ type: 'join', id: joinSub });
      }

      // Suscripción a actualizaciones de jugadores
      if (callbacks.onPlayersUpdate) {
        const playersSub = await websocketService.subscribe(
          `/topic/room/${roomCode}/players`,
          callbacks.onPlayersUpdate
        );
        subscriptionIds.push({ type: 'players', id: playersSub });
      }

      // Suscripción a selección de personajes
      if (callbacks.onCharacterSelect) {
        const charSub = await websocketService.subscribe(
          `/topic/room/${roomCode}/character-select`,
          callbacks.onCharacterSelect
        );
        subscriptionIds.push({ type: 'character', id: charSub });
      }

      // Suscripción a confirmación de selección
      if (callbacks.onConfirm) {
        const confirmSub = await websocketService.subscribe(`/topic/room/${roomCode}/confirm`, callbacks.onConfirm);
        subscriptionIds.push({ type: 'confirm', id: confirmSub });
      }

      // Suscripción a inicio de juego
      if (callbacks.onGameStart) {
        const startSub = await websocketService.subscribe(`/topic/room/${roomCode}/start`, callbacks.onGameStart);
        subscriptionIds.push({ type: 'start', id: startSub });
      }

      return subscriptionIds;
    } catch (error) {
      console.error('Error al suscribirse a la sala:', error);
      // Cancelamos todas las suscripciones realizadas
      subscriptionIds.forEach((sub) => {
        const destination = `/topic/room/${roomCode}/${sub.type}`;
        websocketService.unsubscribe(destination);
      });
      throw error;
    }
  }

  /**
   * Envía al servidor la selección de personaje.
   * @param {string} roomCode - Código de la sala.
   * @param {string} playerId - ID del jugador.
   * @param {number} characterId - ID del personaje seleccionado.
   * @returns {Promise<boolean>} - True si la selección se envió correctamente, false en caso contrario.
   */
  async selectCharacter(roomCode, playerId, characterId) {
    try {
      await websocketService.publish(`/app/room/${roomCode}/character-select`, { playerId, character: characterId });
      return true;
    } catch (error) {
      console.error('Error al seleccionar personaje:', error);
      return false;
    }
  }

  /**
   * Confirma la selección de personaje.
   * @param {string} roomCode - Código de la sala.
   * @param {string} playerId - ID del jugador.
   * @param {number} characterId - ID del personaje seleccionado.
   * @returns {Promise<boolean>} - True si la confirmación se envió correctamente, false en caso contrario.
   */
  async confirmCharacterSelection(roomCode, playerId, characterId) {
    try {
      await websocketService.publish(`/app/confirmCharacterSelection`, { roomCode, playerId, characterId });
      return true;
    } catch (error) {
      console.error('Error al confirmar selección de personaje:', error);
      return false;
    }
  }

  /**
   * Inicia el juego en una sala.
   * @param {string} roomCode - Código de la sala.
   * @param {Array} players - Lista de jugadores en la sala.
   * @returns {Promise<boolean>} - True si la solicitud se envió correctamente, false en caso contrario.
   */
  async startGame(roomCode, players) {
    try {
      await websocketService.publish(`/app/room/${roomCode}/start`, { roomId: roomCode, players });
      return true;
    } catch (error) {
      console.error('Error al iniciar el juego:', error);
      return false;
    }
  }
}

const roomsService = new RoomsService();
export default roomsService;
