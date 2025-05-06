const BASE_URL = 'http://localhost:8080/game';

export const getGameState = async (roomCode) => {
  const response = await fetch(`${BASE_URL}/state?roomCode=${roomCode}`);

  // DEBUG: mostrar el status y el contenido
  console.log('getGameState:', response);

  const jsonBoard = await response.json();
  console.log('getGameState raw text:', jsonBoard);

  if (!response.ok || !jsonBoard) {
    throw new Error('Respuesta vacía o con error al obtener el estado del juego');
  }

  return jsonBoard;
};

export const movePlayer = async (roomCode, playerId, direction) => {
  const response = await fetch(`${BASE_URL}/move?roomCode=${roomCode}&playerId=${playerId}&direction=${direction}`, {
    method: 'POST',
  });
  return await response.json();
};

// Función para construir un bloque en una dirección específica
export const buildBlock = async (direction) => {
  const response = await fetch(`${BASE_URL}/build?direction=${direction}`, {
    method: 'POST',
  });
  return await response.json();
};

// Función para destruir un bloque
export const destroyBlock = async () => {
  const response = await fetch(`${BASE_URL}/destroy`, {
    method: 'POST',
  });
  return await response.json();
};
