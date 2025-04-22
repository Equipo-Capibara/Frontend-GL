const BASE_URL = "http://localhost:8080/game";

export const getGameState = async (roomCode) => {
    const response = await fetch(`${BASE_URL}/state?roomCode=${roomCode}`);

    // DEBUG: mostrar el status y el contenido
    console.log("getGameState status:", response.status);

    const text = await response.text(); // obtené el texto sin parsear
    console.log("getGameState raw text:", text);

    if (!response.ok || !text) {
        throw new Error("Respuesta vacía o con error al obtener el estado del juego");
    }

    return JSON.parse(text); // lo parseás manualmente si tiene contenido
};


export const movePlayer = async (roomCode, playerId, direction) => {
    const response = await fetch(`${BASE_URL}/move?roomCode=${roomCode}&playerId=${playerId}&direction=${direction}`, {
        method: "POST",
    });
    return await response.json();
};

// Función para construir un bloque en una dirección específica
export const buildBlock = async (roomCode, playerId) => {
    const response = await fetch(`${BASE_URL}/build?roomCode=${roomCode}&playerId=${playerId}`, {
        method: "POST",
    });
    return await response.json();
};

// Función para destruir un bloque
export const destroyBlock = async (roomCode, playerId) => {
    const response = await fetch(`${BASE_URL}/destroy?roomCode=${roomCode}&playerId=${playerId}`, {
        method: "POST",
    });
    return await response.json();
};


