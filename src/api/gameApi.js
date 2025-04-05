const BASE_URL = "http://localhost:8080/game";

export const getGameState = async () => {
    const response = await fetch(`${BASE_URL}/state`);
    return await response.json();
};

export const movePlayer = async (direction) => {
    const response = await fetch(`${BASE_URL}/move?direction=${direction}`, {
        method: "POST",
    });
    return await response.json();
};

// Función para construir un bloque en una dirección específica
export const buildBlock = async (direction) => {
    const response = await fetch(`${BASE_URL}/build?direction=${direction}`, {
        method: "POST",
    });
    return await response.json();
};

// Función para destruir un bloque
export const destroyBlock = async () => {
    const response = await fetch(`${BASE_URL}/destroy`, {
        method: "POST",
    });
    return await response.json();
};


