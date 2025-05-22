import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Tile } from '../../components/game';
import { gameService, playersService, websocketService } from '../../services';
import '../../styles/gameBoard.css';

function GameBoard() {
  const navigate = useNavigate();
  console.log("🚀 GameBoard está montando");
  const { roomCode } = useParams();
  const playerId = playersService.getCurrentPlayerId(); // Usa el servicio en lugar de localStorage

  const [board, setBoard] = useState(null);
  const [isMoving, setIsMoving] = useState(false);
  const boardRef = useRef();

  const hasSubscribed = useRef(false);
  const subscriptions = useRef([]);

  useEffect(() => {
    const fetchBoard = async () => {
      try {
        // Usamos el servicio de juego para obtener el estado
        console.log('Este es el roomCode en GameBoard: ', roomCode)
        const data = await gameService.getGameState(roomCode);
        console.log(" ------- Tablero", data)
        console.log("🧩 Board recibido:", data);
        console.log("📐 Dimensiones: width =", data.width, ", height =", data.height);
        console.log("📦 Boxes recibidos:", data.boxes);
        console.log("🧍‍♂️ Characters:", data.characters);
        setBoard(data);
      } catch (error) {
        console.error('Error al obtener estado del juego:', error);
      }
    };

    fetchBoard();
  }, [roomCode]);

  // Suscripción al estado del juego
  useEffect(() => {
    if (!roomCode || !playerId || hasSubscribed.current) return;

    const subscribe = async () => {
      try {
        const callbacks = {
          onGameStateUpdate: (gameState) => {
            console.log('🟢 Estado inicial del juego recibido:', gameState);
            setBoard(gameState);
          },
          onPlayerMoved: (updatedBoard) => {
            console.log('🔄 Movimiento de jugador:', updatedBoard);
            setBoard(updatedBoard);
          },
          onBlockBuilt: (updatedBoard) => {
            console.log('🧱 Bloque construido:', updatedBoard);
            setBoard(updatedBoard);
          },
          onBlockDestroyed: (updatedBoard) => {
            console.log('💥 Bloque destruido:', updatedBoard);
            setBoard(updatedBoard);
          },
          onGameComplete: (gameState) => {
            alert("Ganaron, felicidades");
            navigate("/home");
          }
        };

        const subs = await gameService.subscribeToGame(roomCode, callbacks);
        console.log('📊 Suscripciones creadas en GameBoard:', subs);
        subscriptions.current = subs;
        hasSubscribed.current = true;
      } catch (error) {
          console.error('❌ Error al suscribirse al juego:', error);
      }
    };

    subscribe();

    return () => {
      subscriptions.current.forEach(sub =>
        websocketService.unsubscribe(`/topic/game/${roomCode}/${sub.type}`)
      );
    };
  }, [roomCode, playerId]);

  // Manejo de teclas (movimiento, construir, destruir)
  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();

      if (isMoving) return;

      if (['w', 'a', 's', 'd'].includes(key)) {
        setIsMoving(true);
        gameService.sendMove(roomCode, playerId, key);
        setTimeout(() => setIsMoving(false), 80);
      } else if (key === 'z') {
        gameService.sendBuild(roomCode, playerId);
      } else if (key === 'x') {
        gameService.sendDestroy(roomCode, playerId);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMoving, roomCode, playerId]);


  if (!board || !board.characters) return <p>Cargando...</p>;

  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;
  const tileWidth = screenWidth / board.width;
  const tileHeight = screenHeight / board.height;
  const tileSize = Math.floor(Math.min(tileWidth, tileHeight));


  const constructGridFromBoxes = (boxes, width, height) => {
    console.log("📦 Generando grid desde boxes...");
    const grid = Array.from({ length: width }, (_, x) =>
      Array.from({ length: height }, (_, y) => {
        return null;
      })
    );
    boxes.forEach((box) => {
      if (box.x == null || box.y == null) {
        console.warn("⚠️ Box con coordenadas inválidas:", box);
      }
      grid[box.x][box.y] = box;
    });
    console.log("✅ Grid construido:", grid);
    return grid;

  };


  const transposeGrid = (grid) => {
    const height = grid[0].length;
    const width = grid.length;
    const transposed = [];

    for (let y = 0; y < height; y++) {
      const row = [];
      for (let x = 0; x < width; x++) {
        row.push(grid[x][y]);
      }
      transposed.push(row);
    }

    return transposed;
  };

  const rawGrid = board.grid
    ? board.grid
    : constructGridFromBoxes(board.boxes, board.width, board.height);

  const transposedGrid = transposeGrid(rawGrid);


  const getSpriteForCharacter = (element) => {
    switch (element) {
      case 'Flame':
        return '/resources/flame_character.png';
      case 'Aqua':
        return '/resources/aqua_character.png';
      case 'Brisa':
        return '/resources/brisa_character.png';
      case 'Stone':
        return '/resources/stone_character.png';
      default:
        return '/resources/flame_character.png';
    }
  };

  return (
    <div className="game-wrapper">
      <div
        className="game-board"
        style={{
          width: `${tileSize * board.width}px`,
          height: `${tileSize * board.height}px`,
        }}
        ref={boardRef}
      >
        {transposedGrid.map((row, rowIndex) => (
          <div className="board-row" key={rowIndex}>
            {row.map((cell, cellIndex) => {
              if (!cell) {
                // console.warn(`🚨 Celda vacía en row ${rowIndex}, col ${cellIndex}`);
                return (
                  <Tile
                    key={`empty-${rowIndex}-${cellIndex}`}
                    cell={{ x: cellIndex, y: rowIndex, type: 'EMPTY' }} // fallback para celda vacía
                    tileSize={tileSize}
                  />
                );
              }

              return (
                <Tile
                  key={`${cell.x}-${cell.y}`}
                  cell={cell}
                  tileSize={tileSize}
                />
              );
            })}
          </div>
        ))}

        {board.characters.map((character) => (
          <img
            key={character.playerId}
            src={getSpriteForCharacter(character.element)}
            alt={`Character ${character.playerId}`}
            className="player-sprite"
            style={{
              width: tileSize,
              height: tileSize,
              transform: `translate(${character.x * tileSize}px, ${character.y * tileSize}px)`,
            }}
          />
        ))}
      </div>
    </div>
  );

};

export default GameBoard;
