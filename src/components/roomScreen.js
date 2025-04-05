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

// Personajes predefinidos
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
    const [isCharacterTaken, setIsCharacterTaken] = useState(false);

    useEffect(() => {
        if (!stompClient || !roomId) return;

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
        if (!stompClient?.connected) return;

        stompClient.subscribe(`/topic/room/${roomId}/join-alert`, (message) => {
            const { username } = JSON.parse(message.body);
            setAlerts(prev => [...prev, `${username} se ha unido a la sala`]);
            setTimeout(() => setAlerts(prev => prev.slice(1)), 3000);
        });

        const handlePlayersUpdate = (data) => {
            const players = Object.values(data.players);
            updateCharacterSlots(players); // o como lo manejes
        };

        stompClient.subscribe("/topic/room/" + roomId + "/character-select", (message) => {
            console.log("🎭 character-select recibido");
            handlePlayersUpdate(JSON.parse(message.body));
        });

        stompClient.subscribe("/topic/room/" + roomId + "/players", (message) => {
            console.log("👥 players recibido");
            handlePlayersUpdate(JSON.parse(message.body));
        });

        stompClient.subscribe("/topic/room/" + roomId + "/confirm", (message) => {
            console.log("Mensaje recibido:", message.body); // Este debería mostrar los mensajes recibidos

        });
    }

    function updateCharacterSlots(players) {
        console.log("Jugadores actuales en la sala:", players);
        setSelectedCharacters(players);
    }

    const nextCharacter = () => {
        setCurrentCharacterIndex((prev) => {
            const newIndex = (prev + 1) % characters.length;
            updateCharacterSelection(newIndex);
            return newIndex;
        });
    };

    const prevCharacter = () => {
        setCurrentCharacterIndex((prev) => {
            const newIndex = (prev - 1 + characters.length) % characters.length;
            updateCharacterSelection(newIndex);
            return newIndex;
        });
    };

    const sendJoinAlert = () => {
        const playerName = localStorage.getItem("playerName") || "JugadorAnónimo";
        const playerId = localStorage.getItem("playerId");

        if (stompClient?.connected && playerId) {
            stompClient.publish({
                destination: `/app/room/${roomId}/join`,
                body: JSON.stringify({ username: playerName, playerId })
            });
        }
    };



    const CharacterCardSelector = ({ character, currentCharacterIndex, onNext, onPrev, player }) => {
        return (
            <div className="player-slot selector-slot">
                {/* Mostramos la tarjeta tal como la ven los demás */}
                <CharacterCard character={character} player={player} />

                {player.characterSelected ? (
                    <span className="ready-label">✅ Listo</span>
                ) : (
                    <div className="navigation-buttons">
                        <button onClick={onPrev}>◀</button>
                        <button onClick={onNext}>▶</button>
                    </div>
                )}
            </div>
        );
    };



    const updateCharacterSelection = (newCharacterIndex) => {
        const selectedChar = characters[newCharacterIndex];
        const playerId = localStorage.getItem("playerId");

        if (!playerId || !stompClient?.connected) return;

        // 🔁 Actualiza tu propio personaje en el estado local
        setSelectedCharacters(prev =>
            prev.map(player =>
                player.id === playerId
                    ? { ...player, character: selectedChar.id }
                    : player
            )
        );

        // 🛰️ Enviar la selección al servidor
        stompClient.publish({
            destination: `/app/room/${roomId}/character-select`,
            body: JSON.stringify({
                playerId: playerId,
                character: selectedChar.id
            })
        });
    };

    // Función para manejar la confirmación de la elección
    const confirmSelection = () => {
        const myId = localStorage.getItem("playerId");
        const myPlayer = selectedCharacters.find(p => p.id === myId);
        if (!myPlayer) return;

        // Verificamos si el personaje ya ha sido seleccionado por otro jugador
        const sameCharacterUsed = selectedCharacters.some(p =>
            p.id !== myId &&
            p.character === myPlayer.character &&
            p.characterSelected
        );

        if (sameCharacterUsed) {
            alert("Este personaje ya fue elegido por otro jugador.");
            setIsCharacterTaken(true); // Deshabilita el botón si el personaje está ocupado
            return;
        }

        setIsCharacterTaken(false); // Habilita el botón si el personaje está disponible

        // Publicamos la selección al servidor a través de WebSocket
        const selectedCharacterId = myPlayer.character; // ID del personaje seleccionado
        stompClient.publish({
            destination: `/api/room/confirmCharacterSelection`, // Dirección en el servidor
            body: JSON.stringify({
                roomCode: roomId,
                playerId: myId,
                characterId: selectedCharacterId
            })
        });

        // Opcionalmente, actualiza el estado local para reflejar que el jugador ha confirmado su elección
        setSelectedCharacters(prev =>
            prev.map(p =>
                p.id === myId ? { ...p, characterSelected: true } : p
            )
        );
    };

// Función para manejar la respuesta del servidor sobre la confirmación del personaje
    const handleCharacterSelectionConfirmation = (message) => {
        console.log("Mensaje recibido:", message);
        const { playerId, characterId, success, allPlayers } = JSON.parse(message.body);
        console.log( allPlayers);
        if (success) {
            // Actualiza todos los jugadores con los nuevos datos
            setSelectedCharacters(allPlayers);
        } else {
            alert("Hubo un problema al seleccionar este personaje. Intenta con otro.");
            setIsCharacterTaken(true); // Deshabilitamos el botón si no es exitoso
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
                    <div key={index} className="alert">{alert}</div>
                ))}
            </div>

            <div className="room-container">
                <h1>Sala #{roomId}</h1>

                {(() => {
                    const playerName = localStorage.getItem("playerName");
                    console.log("selectedCharacters", selectedCharacters);
                    const orderedPlayers = selectedCharacters
                        .filter(p => p && p.name) // aseguramos que no haya undefined
                        .sort((a, b) => {
                            if (a.name === playerName) return -1;
                            if (b.name === playerName) return 1;
                            return 0;
                        });

                    return (
                        <div className="main-layout">
                            <div className="character-selection">
                                {[...Array(4)].map((_, index) => {
                                    const player = selectedCharacters[index]; // puede ser undefined
                                    const isMyCard = player?.id === localStorage.getItem("playerId");

                                    if (player) {
                                        return isMyCard ? (
                                            <CharacterCardSelector
                                                key={player.id}
                                                character={characters.find(char => char.id === Number(player.character))}
                                                currentCharacterIndex={currentCharacterIndex}
                                                onNext={nextCharacter}
                                                onPrev={prevCharacter}
                                                player={`J${index + 1}`}
                                            />
                                        ) : (
                                            <CharacterCard
                                                key={player.id}
                                                character={characters.find(char => char.id === Number(player.character))}
                                                player={`J${index + 1}`}
                                            />
                                        );
                                    } else {
                                        return (
                                            <div key={`empty-${index}`} className="character-card empty-slot">
                                                <p>Esperando jugador...</p>
                                                <span>J{index + 1}</span>
                                            </div>
                                        );
                                    }
                                })}
                            </div>
                        </div>
                    );
                })()}

                <div className="footer">
                    <button className="confirm-button" onClick={confirmSelection} disabled={isCharacterTaken}>Confirmar elección</button>
                    <span className="player-count">Jugadores {selectedCharacters.length}/4</span>

                    <button className="start-button" disabled={selectedCharacters.length < 4}>
                        Iniciar Partida
                    </button>
                </div>
            </div>
        </div>
    );
}
