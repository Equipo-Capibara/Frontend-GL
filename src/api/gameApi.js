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