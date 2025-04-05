import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

const socket = new SockJS("http://localhost:8080/ws");
const stompClient = new Client({
    webSocketFactory: () => socket,
    debug: (str) => console.log(str),
    reconnectDelay: 5000, // Reintenta conectar en caso de fallo
});

stompClient.onConnect = () => {
    console.log("✅ Conectado a WebSocket");
};

stompClient.onStompError = (error) => {
    console.error("❌ Error en WebSocket:", error);
};

// Activar conexión
stompClient.activate();

/**
 * Crea una sala y obtiene el ID de la sala creada.
 * @param {string} hostId - ID del jugador que crea la sala.
 * @param {function} callback - Función que recibe la sala creada.
 */
export function     createRoom(hostId, callback) {
    fetch("http://localhost:8080/api/room/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hostId })
    })
        .then(response => response.json())
        .then(data => {
            console.log("Respuesta del servidor:", data);
            callback(data); // Asegura que pasamos toda la respuesta
        })
        .catch(error => {
            console.error("Error al crear la sala:", error);
            callback(null);
        });
}

export function joinRoom(roomCode, username) {
    if (!stompClient.connected) {
        console.error("🚨 WebSocket no está conectado aún");
        return;
    }

    stompClient.publish({
        destination: `/app/room/${roomCode}/join`,
        body: JSON.stringify({ username })
    });

    console.log(`📤 Enviado: ${username} se unió a la sala ${roomCode}`);
}

export default stompClient;
