import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { websocketService, roomsService, playersService } from '../../services';
import { CharacterCard } from '../../components/common';
import '../../styles/roomScreen.css';

// Personajes predefinidos
const characters = [
  {
    id: 1,
    name: 'Flame',
    color: '#FFAD88',
    abilities: [
      'Crea y destruye bloques de fuego en línea recta.',
      'Lanza fuego a dos cuadros de distancia haciendo daño.',
    ],
    img: '/resources/banner_flame.png',
  },
  {
    id: 2,
    name: 'Aqua',
    color: '#A0D8F1',
    abilities: ['Crea y destruye bloques de agua en línea recta.', 'Lluvia que aturde a tres cuadros de distancia.'],
    img: '/resources/banner_aqua.png',
  },
  {
    id: 3,
    name: 'Brisa',
    color: '#DADADA',
    abilities: ['Crea y destruye bloques de aire en línea recta.', 'Empuja a todos cinco cuadros de distancia.'],
    img: '/resources/banner_brisa.png',
  },
  {
    id: 4,
    name: 'Stone',
    color: '#B4E197',
    abilities: ['Crea y destruye bloques de tierra en línea recta.', 'Obtiene inmunidad a todo por 10 segundos.'],
    img: '/resources/banner_stone.png',
  },
];

export default function RoomScreen() {
  const { roomCode } = useParams();
  const [currentCharacterIndex, setCurrentCharacterIndex] = useState(0);
  const [selectedCharacters, setSelectedCharacters] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [isCharacterTaken, setIsCharacterTaken] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);
  const allPlayersReady = selectedCharacters.length === 4 && selectedCharacters.every((p) => p.characterSelected);

  const hasSubscribed = useRef(false);
  const subscriptions = useRef([]);

  // Imprimir información de debugging
  useEffect(() => {
    console.log('🔍 WebSocket conectado:', websocketService.isConnected);
    console.log('🔍 Player ID:', playersService.getCurrentPlayerId());
    console.log('🔍 Player Name:', playersService.getCurrentPlayerName());
    console.log('🔍 Room ID:', roomCode);
  }, [roomCode]);

  useEffect(() => {
    if (!roomCode || hasSubscribed.current) return;

    const setupRoomSubscriptions = async () => {
      try {
        console.log('🔄 Configurando suscripciones para la sala', roomCode);
        
        // Definimos los callbacks para los diferentes eventos de la sala
        const roomCallbacks = {
          onJoin: (data) => {
            console.log('👋 Evento onJoin recibido:', data);
            const { username } = data;
            setAlerts((prev) => [...prev, `${username} se ha unido a la sala`]);
            setTimeout(() => setAlerts((prev) => prev.slice(1)), 3000);
          },
          onPlayersUpdate: (data) => {
            console.log('👥 Evento onPlayersUpdate recibido:', data);
            const players = Object.values(data.players || data);
            updateCharacterSlots(players);
          },
          onCharacterSelect: (data) => {
            console.log('🎭 Evento character-select recibido:', data);
            const players = Object.values(data.players || data);
            updateCharacterSlots(players);
          },
          onConfirm: (data) => {
            console.log('✅ Evento onConfirm recibido:', data);
            const updatedCharacters = data.get ? data.get('players') : data.players;
            const myId = playersService.getCurrentPlayerId();

            if (updatedCharacters) {
              // Fusionamos el estado anterior para preservar mi "characterSelected"
              setSelectedCharacters((prev) =>
                updatedCharacters.map((player) => {
                  const prevPlayer = prev.find((p) => p.id === player.id);
                  if (player.id === myId && prevPlayer?.characterSelected) {
                    return { ...player, characterSelected: true };
                  }
                  return player;
                })
              );
            }
          },
          onGameStart: (data) => {
            console.log('🚀 Evento onGameStart recibido:', data);
            const { gameState } = data;

            // Guardamos el estado del juego si es necesario
            if (gameState) {
              localStorage.setItem('gameState', JSON.stringify(gameState));
            }

            // Redirigimos a la pantalla de juego
            window.location.href = `/game/${roomCode}`;
          }
        };

        // Suscribimos a los eventos de la sala usando el servicio de salas
        const subs = await roomsService.subscribeToRoom(roomCode, roomCallbacks);
        console.log('📊 Suscripciones creadas:', subs);
        subscriptions.current = subs;
        
        // Enviamos el mensaje de unión a la sala
        await sendJoinAlert();
        
        hasSubscribed.current = true;
      } catch (error) {
        console.error('❌ Error al suscribirse a la sala:', error);
      }
    };

    setupRoomSubscriptions();

    // Limpieza de suscripciones al desmontar
    return () => {
      if (subscriptions.current.length > 0) {
        console.log('🧹 Limpiando suscripciones');
        subscriptions.current.forEach(sub => {
          websocketService.unsubscribe(`/topic/room/${roomCode}/${sub.type}`);
        });
      }
    };
  }, [roomCode]);

  function updateCharacterSlots(players) {
    console.log('🔄 Actualizando slots de jugadores:', players);
    setSelectedCharacters(players);
  }

  const nextCharacter = () => {
    console.log('➡️ Siguiente personaje');
    setCurrentCharacterIndex((prev) => {
      const newIndex = (prev + 1) % characters.length;
      updateCharacterSelection(newIndex);
      return newIndex;
    });
  };

  const prevCharacter = () => {
    console.log('⬅️ Personaje anterior');
    setCurrentCharacterIndex((prev) => {
      const newIndex = (prev - 1 + characters.length) % characters.length;
      updateCharacterSelection(newIndex);
      return newIndex;
    });
  };

  const sendJoinAlert = async () => {
    const playerName = playersService.getCurrentPlayerName();
    const playerId = playersService.getCurrentPlayerId();
    
    console.log('🔄 Enviando alerta de unión:', { playerName, playerId, roomId: roomCode });

    if (playerId) {
      try {
        const result = await roomsService.joinRoom(roomCode, playerName, playerId);
        console.log('✅ Resultado de unirse a la sala:', result);
        return result;
      } catch (error) {
        console.error('❌ Error al enviar alerta de unión:', error);
        return false;
      }
    } else {
      console.error('❌ No hay ID de jugador');
      return false;
    }
  };

  const CharacterCardSelector = ({ character, currentCharacterIndex, onNext, onPrev, player }) => {
    const isReady = player?.characterSelected;

    return (
      <div className="player-slot selector-slot">
        <CharacterCard character={character} player={player} />

        {isReady ? (
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

  const updateCharacterSelection = async (newCharacterIndex) => {
    const selectedChar = characters[newCharacterIndex];
    const playerId = playersService.getCurrentPlayerId();
    
    console.log('🔄 Actualizando selección de personaje:', { newCharacterIndex, selectedChar, playerId });

    if (!playerId) {
      console.error('❌ No hay ID de jugador');
      return;
    }

    // Actualiza tu propio personaje en el estado local
    setSelectedCharacters((prev) =>
      prev.map((player) => (player.id === playerId ? { ...player, character: selectedChar.id } : player))
    );

    try {
      // Usa el servicio de salas para enviar la selección de personaje
      const result = await roomsService.selectCharacter(roomCode, playerId, selectedChar.id);
      console.log('✅ Resultado de seleccionar personaje:', result);
    } catch (error) {
      console.error('❌ Error al actualizar selección de personaje:', error);
    }
  };

  const startGame = async () => {
    try {
      // Usa el servicio de salas para iniciar el juego
      await roomsService.startGame(roomCode, selectedCharacters);
    } catch (error) {
      console.error('Error al iniciar el juego:', error);
    }
  };

  const confirmSelection = async () => {
    const myId = playersService.getCurrentPlayerId();
    const myPlayer = selectedCharacters.find((p) => p.id === myId);

    if (!myPlayer) return;

    const sameCharacterUsed = selectedCharacters.some(
      (p) => p.id !== myId && p.character === myPlayer.character && p.characterSelected
    );

    if (sameCharacterUsed) {
      alert('Este personaje ya fue elegido por otro jugador.');
      setIsCharacterTaken(true);
      return;
    }

    setIsCharacterTaken(false);
    setIsWaiting(true);

    try {
      // Usa el servicio de salas para confirmar la selección
      await roomsService.confirmCharacterSelection(roomCode, myId, myPlayer.character);

      // Actualiza el estado local
      setSelectedCharacters((prev) => prev.map((p) => (p.id === myId ? { ...p, characterSelected: true } : p)));
    } catch (error) {
      console.error('Error al confirmar selección de personaje:', error);
      setIsWaiting(false);
    }
  };

  // Función para manejar la respuesta del servidor sobre la confirmación del personaje
  const handleCharacterSelectionConfirmation = ({ playerId, characterId, success, allPlayers }) => {
    if (success) {
      setSelectedCharacters(allPlayers);
      setIsWaiting(false);
    } else {
      alert('Hubo un problema al seleccionar este personaje. Intenta con otro.');
      setIsCharacterTaken(true);
      setIsWaiting(false);
    }
  };

  return (
    <div
      className="room"
      style={{
        backgroundImage: `linear-gradient(180deg, rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(/resources/fondo_home.png)`,
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        width: '100%',
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
      }}
    >
      <div className="alerts-container">
        {alerts.map((alert, index) => (
          <div key={index} className="alert">
            {alert}
          </div>
        ))}
      </div>

      <div className="room-container">
        <h1>Sala #{roomCode}</h1>

        {(() => {
          const playerName = playersService.getCurrentPlayerName();
          console.log('selectedCharacters', selectedCharacters);
          const orderedPlayers = selectedCharacters
            .filter((p) => p && p.name) // aseguramos que no haya undefined
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
                  const isMyCard = player?.id === playersService.getCurrentPlayerId();

                  if (player) {
                    return isMyCard ? (
                      <CharacterCardSelector
                        key={player.id}
                        character={characters.find((char) => char.id === Number(player.character))}
                        currentCharacterIndex={currentCharacterIndex}
                        onNext={nextCharacter}
                        onPrev={prevCharacter}
                        player={player}
                      />
                    ) : (
                      <div className="player-slot">
                        <CharacterCard
                          character={characters.find((char) => char.id === Number(player.character))}
                          player={player}
                        />
                        {player.characterSelected && <span className="ready-label">✅ Listo</span>}
                      </div>
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
          <button className="confirm-button" onClick={confirmSelection} disabled={isCharacterTaken || isWaiting}>
            {isWaiting ? 'Esperando...' : 'Confirmar elección'}
          </button>
          <span className="player-count">Jugadores {selectedCharacters.length}/4</span>

          <button className="start-button" disabled={!allPlayersReady} onClick={startGame}>
            Iniciar Partida
          </button>
        </div>
      </div>
    </div>
  );
}
