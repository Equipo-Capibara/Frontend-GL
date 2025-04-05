import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

const socket = new SockJS("http://localhost:8080/ws");
const stompClient = new Client({
    webSocketFactory: () => socket,
    debug: (str) => console.log(str),
    reconnectDelay: 5000,
});

stompClient.onConnect = () => {
    console.log("✅ Conectado a WebSocket");
};

stompClient.onStompError = (error) => {
    console.error("❌ Error en WebSocket:", error);
};

stompClient.activate();

/**
 * Crea una sala y obtiene el ID de la sala creada.
 * @param {string} hostId - ID del jugador que crea la sala.
 * @param {function} callback - Función que recibe la sala creada.
 */
export const createRoom = async (hostId, callback) => {
    try {
        const response = await fetch("http://localhost:8080/api/room/create", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ hostId }) // Envío limpio
        });

        if (!response.ok) {
            throw new Error("No se pudo crear la sala");
        }

        const room = await response.json();
        callback(room);
    } catch (error) {
        console.error("Error al crear la sala:", error);
        callback(null); // Llamada de vuelta con error
    }
};

/**
 * Envía mensaje para unirse a una sala.
 * @param {string} roomCode - Código de la sala.
 * @param {string} username - Nombre del jugador.
 */
export function joinRoom(roomCode, username, playerId) {
    if (!stompClient.connected) {
        console.error("🚨 WebSocket no está conectado aún");
        return;
    }

    stompClient.publish({
        destination: `/app/joinRoom/${roomCode}`,
        body: JSON.stringify({ username, playerId })
    });

    console.log(`📤 Enviado: ${username} (${playerId}) se unió a la sala ${roomCode}`);
}

export default stompClient;
