import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import CharacterCard from "./characterCard";
import fondo from "../resources/fondo_home.png";
import stone from "../resources/stone.png";
import brisa from "../resources/brisa.png";
import aqua from "../resources/aqua.png";
import flame from "../resources/flame.png";
import '../styles/roomScreen.css';
import stompClient from "../websocket";

const characters = [
    { id: 1, name: "Flame", color: "#FFAD88", abilities: ["Crea y destruye bloques de fuego en línea recta.", "Lanza fuego a dos cuadros de distancia haciendo daño."], img: flame },
    { id: 2, name: "Aqua", color: "#A0D8F1", abilities: ["Crea y destruye bloques de agua en línea recta.", "Lluvia que aturde a tres cuadros de distancia."], img: aqua },
    { id: 3, name: "Brisa", color: "#DADADA", abilities: ["Crea y destruye bloques de aire en línea recta.", "Empuja a todos cinco cuadros de distancia."], img: brisa },
    { id: 4, name: "Stone", color: "#B4E197", abilities: ["Crea y destruye bloques de tierra en línea recta.", "Obtiene inmunidad a todo por 10 segundos."], img: stone }
];

export default function RoomScreen() {
    const { roomId } = useParams();
    const [currentCharacterIndex, setCurrentCharacterIndex] = useState(0);
    const [selectedCharacters, setSelectedCharacters] = useState([]);
    const [alerts, setAlerts] = useState([]);

    useEffect(() => {
        if (!stompClient || !roomId) return;

        // Verificar si la conexión está lista antes de suscribirse
        const checkConnection = setInterval(() => {
            if (stompClient.connected) {
                console.log("✅ WebSocket conectado, suscribiéndose...");
                subscribeToRoom();
                sendJoinAlert();
                clearInterval(checkConnection);
            }
        }, 500);

        return () => clearInterval(checkConnection);
    }, [stompClient?.connected, roomId]);

    function subscribeToRoom() {
        if (!stompClient || !stompClient.connected) {
            console.error("❌ WebSocket no está conectado, no se puede suscribir.");
            return;
        }

        console.log(`📡 Suscribiéndose a: /topic/room/${roomId}/join-alert`);

        stompClient.subscribe(`/topic/room/${roomId}/join-alert`, (message) => {
            console.log("📩 Mensaje recibido:", message);
            const newCharacter = JSON.parse(message.body);

            setSelectedCharacters(prevCharacters => [...prevCharacters, newCharacter]);
        });
    }

    const nextCharacter = () => {
        setCurrentCharacterIndex((prev) => (prev + 1) % characters.length);
    };

    const prevCharacter = () => {
        setCurrentCharacterIndex((prev) => (prev - 1 + characters.length) % characters.length);
    };

    const selectCharacter = () => {
        const selectedChar = characters[currentCharacterIndex];

        if (selectedCharacters.some(char => char.id === selectedChar.id) || selectedCharacters.length >= 4) {
            return;
        }

        const newSelection = [...selectedCharacters, { ...selectedChar }];
        setSelectedCharacters(newSelection);
        sendCharacterSelection(newSelection);
    };

    const sendJoinAlert = () => {
        if (stompClient?.connected) {
            stompClient.publish({
                destination: `/app/joinRoom/${roomId}`,
                body: JSON.stringify({ message: "Alguien se ha unido a la sala" })
            });
        } else {
            console.error("❌ No se pudo enviar la alerta, WebSocket no está conectado");
        }
    };

    const sendCharacterSelection = (newSelection) => {
        if (stompClient?.connected) {
            stompClient.publish({
                destination: `/app/room/${roomId}/character-select`,
                body: JSON.stringify({ roomId, players: newSelection })
            });
        } else {
            console.error("❌ No se pudo enviar la selección, WebSocket no conectado");
        }
    };

    return (
        <div className="room" style={{
            backgroundImage: `linear-gradient(180deg, rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(${fondo})`,
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            backgroundSize: "cover",
            width: "100%",
            height: "100vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            position: "relative",
        }}>

            <div className="alerts-container">
                {alerts.map((alert, index) => (
                    <div key={index} className="alert">
                        {alert}
                    </div>
                ))}
            </div>

            <div className="room-container">
                <h1>Sala #{roomId}</h1>
                <div className="character-grid">
                    <div className="character-selection">
                        {characters.length > 0 && (
                            <CharacterCard character={characters[currentCharacterIndex]} player="J1" />
                        )}
                        <div className="navigation-buttons">
                            <button onClick={prevCharacter}>{"<"}</button>
                            <button onClick={nextCharacter}>{">"}</button>
                        </div>
                    </div>
                    {selectedCharacters.slice(1, 4).map((char, index) => (
                        <CharacterCard key={char.id} character={char} player={`J${index + 2}`} />
                    ))}
                </div>

                <div className="footer">
                    <button className="confirm-button" onClick={selectCharacter}>Confirmar elección</button>
                    <span className="player-count">Jugadores {selectedCharacters.length}/4</span>
                    <button className="start-button" disabled={selectedCharacters.length < 2}>Iniciar Partida</button>
                </div>
            </div>
        </div>
    );
}
