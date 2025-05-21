import { useState, useCallback, useEffect } from 'react';
import { roomsService } from '../services';
import useWebSocketSubscription from './useWebSocketSubscription';

/**
 * Hook personalizado para gestionar la interacción con una sala de juego
 * @param {string} roomCode - Código de la sala
 * @param {string} playerId - ID del jugador
 * @returns {Object} - Estado y funciones para interactuar con la sala
 */
const useGameRoom = (roomCode, playerId) => {
  const [players, setPlayers] = useState([]);
  const [isJoined, setIsJoined] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);

  // Verificar si la sala existe
  const checkRoom = useCallback(async () => {
    if (!roomCode) return false;

    setIsLoading(true);
    setError(null);

    try {
      const exists = await roomsService.checkRoom(roomCode);
      if (!exists) {
        setError('La sala no existe');
      }
      return exists;
    } catch (err) {
      setError('Error al verificar la sala: ' + err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [roomCode]);

  // Unirse a la sala
  const joinRoom = useCallback(
    async (username) => {
      if (!roomCode || !playerId || !username) {
        setError('Faltan datos para unirse a la sala');
        return false;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Primero verificamos que la sala exista
        const roomExists = await checkRoom();
        if (!roomExists) {
          return false;
        }

        // Nos unimos a la sala
        const joined = await roomsService.joinRoom(roomCode, username, playerId);
        if (joined) {
          setIsJoined(true);
        } else {
          setError('No se pudo unir a la sala');
        }
        return joined;
      } catch (err) {
        setError('Error al unirse a la sala: ' + err.message);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [roomCode, playerId, checkRoom]
  );

  // Seleccionar un personaje
  const selectCharacter = useCallback(
    async (characterId) => {
      if (!roomCode || !playerId || !isJoined) {
        setError('No estás unido a la sala');
        return false;
      }

      setIsLoading(true);
      setError(null);

      try {
        const success = await roomsService.selectCharacter(roomCode, playerId, characterId);
        if (!success) {
          setError('No se pudo seleccionar el personaje');
        }
        return success;
      } catch (err) {
        setError('Error al seleccionar personaje: ' + err.message);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [roomCode, playerId, isJoined]
  );

  // Confirmar selección de personaje
  const confirmCharacter = useCallback(
    async (characterId) => {
      if (!roomCode || !playerId || !isJoined) {
        setError('No estás unido a la sala');
        return false;
      }

      setIsLoading(true);
      setError(null);

      try {
        const success = await roomsService.confirmCharacterSelection(roomCode, playerId, characterId);
        if (!success) {
          setError('No se pudo confirmar el personaje');
        }
        return success;
      } catch (err) {
        setError('Error al confirmar personaje: ' + err.message);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [roomCode, playerId, isJoined]
  );

  // Iniciar el juego (solo para el host)
  const startGame = useCallback(async () => {
    if (!roomCode || !isJoined || players.length < 2) {
      setError('No se puede iniciar el juego');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const success = await roomsService.startGame(roomCode, players);
      if (!success) {
        setError('No se pudo iniciar el juego');
      }
      return success;
    } catch (err) {
      setError('Error al iniciar el juego: ' + err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [roomCode, isJoined, players]);

  // Suscripción a actualizaciones de jugadores
  useWebSocketSubscription(
    isJoined ? `/topic/room/${roomCode}/players` : null,
    useCallback((data) => {
      setPlayers(data);
    }, []),
    isJoined
  );

  // Suscripción a inicio de juego
  useWebSocketSubscription(
    isJoined ? `/topic/room/${roomCode}/start` : null,
    useCallback(() => {
      setGameStarted(true);
    }, []),
    isJoined
  );

  return {
    players,
    isJoined,
    isLoading,
    error,
    gameStarted,
    checkRoom,
    joinRoom,
    selectCharacter,
    confirmCharacter,
    startGame,
  };
};

export default useGameRoom;
