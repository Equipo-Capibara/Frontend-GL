import { useState, useEffect, useCallback } from 'react';
import { playersService } from '../services';

/**
 * Hook personalizado para manejar la gestión de jugadores
 * @returns {Object} - Estado y funciones para gestionar jugadores
 */
const usePlayer = () => {
  const [playerId, setPlayerId] = useState(() => playersService.getCurrentPlayerId());
  const [playerName, setPlayerName] = useState(() => playersService.getCurrentPlayerName());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Detectar cambios en localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      setPlayerId(playersService.getCurrentPlayerId());
      setPlayerName(playersService.getCurrentPlayerName());
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Crear un nuevo jugador
  const createPlayer = useCallback(async (name) => {
    if (!name || name.trim() === '') {
      setError('El nombre no puede estar vacío');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const player = await playersService.createPlayer(name);
      if (player && player.id) {
        playersService.savePlayerToLocalStorage(player);
        setPlayerId(player.id);
        setPlayerName(player.name);
        return player;
      } else {
        throw new Error('Respuesta vacía o sin ID de jugador');
      }
    } catch (err) {
      setError('Error al crear jugador: ' + err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Obtener información de un jugador
  const getPlayer = useCallback(
    async (id = playerId) => {
      if (!id) {
        setError('No hay ID de jugador');
        return null;
      }

      setIsLoading(true);
      setError(null);

      try {
        return await playersService.getPlayer(id);
      } catch (err) {
        setError('Error al obtener jugador: ' + err.message);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [playerId]
  );

  // Eliminar los datos del jugador
  const clearPlayer = useCallback(() => {
    playersService.clearPlayerData();
    setPlayerId(null);
    setPlayerName(null);
  }, []);

  return {
    playerId,
    playerName,
    isLoading,
    error,
    createPlayer,
    getPlayer,
    clearPlayer,
  };
};

export default usePlayer;
